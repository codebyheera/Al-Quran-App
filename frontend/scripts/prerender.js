import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Extract surah URLs from the structured JSON-LD in index.html
const indexHtmlContent = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
const surahUrls = [];
const regex = /"url":\s*"(https:\/\/[^/]+)(\/surah\/[^"]+)"/g;
let match;
while ((match = regex.exec(indexHtmlContent)) !== null) {
  if (match[2]) surahUrls.push(match[2]);
}

const juzUrls = Array.from({ length: 30 }, (_, i) => `/juz/${i + 1}`);

const routesToPrerender = [
  '/',
  '/surah',
  '/juz',
  '/bookmarks',
  '/search',
  ...surahUrls,
  ...juzUrls
];

async function run() {
  if (!fs.existsSync(distPath)) {
    console.error('dist folder not found. Run npm run build first.');
    process.exit(1);
  }

  // Preserve the original index.html as template
  const templatePath = path.resolve(distPath, 'template.html');
  if (!fs.existsSync(templatePath)) {
    fs.copyFileSync(path.resolve(distPath, 'index.html'), templatePath);
  }

  console.log(`Starting to prerender ${routesToPrerender.length} routes...`);

  const app = express();
  
  app.use('/api', createProxyMiddleware({ 
    target: process.env.VITE_API_URL || 'http://localhost:5000', 
    changeOrigin: true 
  }));

  app.use(express.static(distPath, { index: false })); // don't serve index.html automatically by static
  
  app.get(/.*/, (req, res) => {
    try {
      const html = fs.readFileSync(templatePath, 'utf-8');
      res.send(html);
    } catch (err) {
      console.error("Error sending template:", err.message);
      res.status(500).send("Error reading template");
    }
  });

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`Local server running at ${baseUrl}`);
    
    let browser = null;
    try {
      // Vercel build environment needs the specialized chromium binary
      if (process.env.VERCEL) {
        const chromium = (await import('@sparticuz/chromium')).default;
        const puppeteerCore = (await import('puppeteer-core')).default;
        browser = await puppeteerCore.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else {
        browser = await puppeteer.launch({ 
          headless: 'new', 
          args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
      }
    } catch (launchError) {
      console.warn('⚠️ Could not launch Puppeteer. Prerendering will fallback to SPA shell.', launchError.message);
    }
    
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    for (const route of routesToPrerender) {
      console.log(`Prerendering ${route}...`);
      let html = templateHtml; // Fallback to SPA shell
      
      if (browser) {
        let page;
        try {
          page = await browser.newPage();
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
          html = await page.content();
        } catch (err) {
          console.warn(`Timeout or error while waiting for network idle on ${route}. Saving HTML anyway.`, err.message);
          if (page) {
            html = await page.content().catch(() => templateHtml); // Try to salvage what loaded
          }
        } finally {
          if (page) await page.close().catch(() => {});
        }
      }

      const routeDir = path.join(distPath, route);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(routeDir, 'index.html'), html);
    }

    if (browser) {
      await browser.close().catch(() => {});
    }
    server.close();
    console.log('Prerendering complete!');
  });
}

run().catch(err => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
