/**
 * scripts/prerender.js — Build-time static HTML generation for SEO.
 *
 * The app is a client-only SPA (Vite + React). Vercel's rewrites serve the
 * same dist/index.html for every route, so crawlers that don't execute JS
 * (or execute it inconsistently) see identical <title>/<meta description>
 * on every page. To fix that, this script writes a real per-route
 * index.html into dist/<route>/index.html with the correct tags already
 * baked in — matching vercel.json's rewrites for /surah/:name and /juz/:num.
 *
 * No headless browser is used: every page's title/description here is either
 * a fully static string (copied verbatim from that page's <Helmet>) or
 * computed from the same live Quran API data the page itself fetches
 * (see src/data/surahSeo.js, shared with SurahView.jsx so the two never drift).
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { getSurahSeo } from '../src/data/surahSeo.js';
import { pageSeo } from '../src/data/pageSeo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const SITE_URL = 'https://alquranhub.org';
const API_BASE = process.env.VITE_API_URL || 'https://api.alquranhub.org';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`Request to ${url} failed with status ${res.statusCode}`));
          return;
        }
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject)
      .on('timeout', function () {
        this.destroy(new Error(`Request to ${url} timed out`));
      });
  });
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectMeta(template, { title, description, url, keywords, ogType = 'website' }) {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);

  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );

  if (keywords) {
    html = html.replace(
      /<meta\s+name="keywords"[\s\S]*?\/>/,
      `<meta name="keywords" content="${escapeAttr(keywords)}" />`
    );
  }

  html = html.replace(
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${escapeAttr(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"[\s\S]*?\/>/,
    `<meta property="og:url" content="${escapeAttr(url)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"[\s\S]*?\/>/,
    `<meta property="og:type" content="${escapeAttr(ogType)}" />`
  );

  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${escapeAttr(url)}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${escapeAttr(url)}" />\n</head>`);
  }

  return html;
}

function writeRoute(template, route, meta) {
  const html = injectMeta(template, { ...meta, url: `${SITE_URL}${route}` });
  const routeDir = path.join(distPath, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
}

// Every entry in pageSeo.js except `home` (the root route isn't a subdirectory —
// it's dist/index.html itself, handled separately in run() below).
const staticPages = Object.values(pageSeo)
  .filter((page) => page.path !== '/')
  .map((page) => ({ route: page.path, ...page }));

async function run() {
  if (!fs.existsSync(distPath)) {
    console.error('dist folder not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

  console.log('Syncing homepage meta with pageSeo.js...');
  const homeHtml = injectMeta(template, { ...pageSeo.home, url: `${SITE_URL}${pageSeo.home.path}` });
  fs.writeFileSync(path.join(distPath, 'index.html'), homeHtml);

  console.log('Prerendering static pages...');
  for (const page of staticPages) {
    writeRoute(template, page.route, page);
  }

  console.log('Prerendering Juz pages (1-30)...');
  for (let juzNum = 1; juzNum <= 30; juzNum++) {
    writeRoute(template, `/juz/${juzNum}`, {
      title: `Juz ${juzNum} – Arabic Recitation & English Translation - Al-Quran Hub`,
      description: `Read and listen to Juz ${juzNum} of the Holy Quran online. Arabic text, English translation, and beautiful recitation available.`,
      ogType: 'article',
    });
  }

  console.log(`Fetching Surah list from ${API_BASE}/api/surah ...`);
  try {
    const surahs = await fetchJson(`${API_BASE}/api/surah`);
    console.log(`Prerendering ${surahs.length} Surah pages...`);
    for (const s of surahs) {
      const seo = getSurahSeo(s.number, {
        surahName: s.englishName,
        nameTranslation: s.nameTranslation,
        arabicName: s.name,
        versesCount: s.versesCount,
        revelation: s.revelation,
      });
      writeRoute(template, `/surah/${s.englishName}`, { ...seo, ogType: 'article' });
    }
  } catch (err) {
    console.warn(`⚠️ Could not fetch Surah list (${err.message}). Skipping per-Surah prerendering — those routes will fall back to the SPA shell.`);
  }

  console.log('Prerendering complete!');
}

run().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
