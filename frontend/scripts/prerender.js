/**
 * scripts/prerender.js — Build-time static HTML generation for SEO using ReactDOMServer.
 *
 * This script runs after 'vite build'. It loads the Vite dev server programmatically
 * to execute 'SurahView.jsx' within the real React context tree and generates the full
 * static HTML content inside '#root' for all 114 Surah pages.
 *
 * It uses local JSON files downloaded by 'download-surahs.js' to ensure zero external
 * network dependencies during the build.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
// Import React ecosystem directly — Node.js handles CJS interop natively.
// Only JSX components (which need Vite's transpilation) are loaded via ssrLoadModule.
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { getSurahSeo } from '../src/data/surahSeo.js';
import { pageSeo } from '../src/data/pageSeo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');
const cacheDir = path.resolve(__dirname, '../src/data/surahs');

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

async function fetchJsonWithRetry(url, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      const backoff = delay * Math.pow(2, i);
      console.warn(`[Retry] Fetch failed for ${url}. Retrying in ${backoff}ms... (${err.message})`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
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

  html = html.replace(/<title(?:[^>]*)?>[\s\S]*?<\/title>/, `<title data-rh="true">${escapeAttr(title)}</title>`);

  html = html.replace(
    /<meta\s+(?:data-rh="true"\s+)?name="description"[\s\S]*?\/>/,
    `<meta data-rh="true" name="description" content="${escapeAttr(description)}" />`
  );

  if (keywords) {
    html = html.replace(
      /<meta\s+(?:data-rh="true"\s+)?name="keywords"[\s\S]*?\/>/,
      `<meta data-rh="true" name="keywords" content="${escapeAttr(keywords)}" />`
    );
  }

  html = html.replace(
    /<meta\s+(?:data-rh="true"\s+)?property="og:title"[\s\S]*?\/>/,
    `<meta data-rh="true" property="og:title" content="${escapeAttr(title)}" />`
  );
  html = html.replace(
    /<meta\s+(?:data-rh="true"\s+)?property="og:description"[\s\S]*?\/>/,
    `<meta data-rh="true" property="og:description" content="${escapeAttr(description)}" />`
  );
  html = html.replace(
    /<meta\s+(?:data-rh="true"\s+)?property="og:url"[\s\S]*?\/>/,
    `<meta data-rh="true" property="og:url" content="${escapeAttr(url)}" />`
  );
  html = html.replace(
    /<meta\s+(?:data-rh="true"\s+)?property="og:type"[\s\S]*?\/>/,
    `<meta data-rh="true" property="og:type" content="${escapeAttr(ogType)}" />`
  );

  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link\s+(?:data-rh="true"\s+)?rel="canonical"[\s\S]*?\/>/, `<link data-rh="true" rel="canonical" href="${escapeAttr(url)}" />`);
  } else {
    html = html.replace('</head>', `  <link data-rh="true" rel="canonical" href="${escapeAttr(url)}" />\n</head>`);
  }

  return html;
}

function injectHelmet(template, helmet) {
  let html = template;

  const titleHtml = helmet.title.toString();
  if (titleHtml) {
    html = html.replace(/<title(?:[^>]*)?>[\s\S]*?<\/title>/, titleHtml);
  }

  const linkHtml = helmet.link.toString();
  if (linkHtml) {
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link\s+(?:data-rh="true"\s+)?rel="canonical"[\s\S]*?\/>/g, '');
    }
    html = html.replace('</head>', `  ${linkHtml}\n</head>`);
  }

  const metaHtml = helmet.meta.toString();
  if (metaHtml) {
    html = html.replace(/<meta\s+(?:data-rh="true"\s+)?name="description"[\s\S]*?\/>/g, '');
    html = html.replace(/<meta\s+(?:data-rh="true"\s+)?property="og:title"[\s\S]*?\/>/g, '');
    html = html.replace(/<meta\s+(?:data-rh="true"\s+)?property="og:description"[\s\S]*?\/>/g, '');
    html = html.replace(/<meta\s+(?:data-rh="true"\s+)?property="og:url"[\s\S]*?\/>/g, '');
    html = html.replace(/<meta\s+(?:data-rh="true"\s+)?property="og:type"[\s\S]*?\/>/g, '');
    
    html = html.replace('</head>', `  ${metaHtml}\n</head>`);
  }

  const scriptHtml = helmet.script.toString();
  if (scriptHtml) {
    html = html.replace('</head>', `  ${scriptHtml}\n</head>`);
  }

  return html;
}

function writeRoute(template, route, meta) {
  const html = injectMeta(template, { ...meta, url: `${SITE_URL}${route}` });
  const routeDir = path.join(distPath, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
}

const staticPages = Object.values(pageSeo)
  .filter((page) => page.path !== '/')
  .map((page) => ({ route: page.path, ...page }));

// Stub browser globals for Node SSR execution
if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      innerWidth: 1024,
      location: { href: 'http://localhost/', origin: 'http://localhost', hostname: 'localhost', protocol: 'http:', pathname: '/' },
      addEventListener: () => {},
      removeEventListener: () => {},
      matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
      __PRELOADED_SURAH_DATA__: undefined,
    },
    writable: true,
    configurable: true,
  });
} else {
  // Polyfill missing properties
  globalThis.window.innerWidth = globalThis.window.innerWidth ?? 1024;
  globalThis.window.addEventListener = globalThis.window.addEventListener ?? (() => {});
  globalThis.window.matchMedia = globalThis.window.matchMedia ?? (() => ({ matches: false, addListener: () => {}, removeListener: () => {} }));
  if (!globalThis.window.location) {
    globalThis.window.location = { href: 'http://localhost/', origin: 'http://localhost', hostname: 'localhost', protocol: 'http:', pathname: '/' };
  }
}

if (typeof globalThis.document === 'undefined') {
  Object.defineProperty(globalThis, 'document', {
    value: {
      addEventListener: () => {},
      removeEventListener: () => {},
      getElementById: (id) => null,
      createElement: () => ({ setAttribute: () => {}, style: {} }),
    },
    writable: true,
    configurable: true,
  });
}

Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'node' },
  writable: true,
  configurable: true,
});

// Force-override localStorage & sessionStorage.
// Node.js v22+ ships experimental Web Storage that requires --localstorage-file.
// Without the flag it exists but is broken, so we always replace it with a working stub.
const _localStorageStore = {};
const _localStorageStub = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(_localStorageStore, key) ? _localStorageStore[key] : null; },
  setItem(key, val) { _localStorageStore[key] = String(val); },
  removeItem(key) { delete _localStorageStore[key]; },
  clear() { Object.keys(_localStorageStore).forEach(k => delete _localStorageStore[k]); },
  get length() { return Object.keys(_localStorageStore).length; },
  key(n) { return Object.keys(_localStorageStore)[n] ?? null; },
};
try {
  Object.defineProperty(globalThis, 'localStorage', { value: _localStorageStub, writable: true, configurable: true });
} catch (e) {
  globalThis.localStorage = _localStorageStub;
}
try {
  Object.defineProperty(globalThis, 'sessionStorage', { value: _localStorageStub, writable: true, configurable: true });
} catch (e) {
  globalThis.sessionStorage = _localStorageStub;
}


if (typeof globalThis.Audio === 'undefined') {
  globalThis.Audio = class {
    addEventListener() {}
    removeEventListener() {}
    pause() {}
    play() { return Promise.resolve(); }
  };
}

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

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

  // Programmatic Vite Dev Server to resolve JSX components via SSR transform
  console.log('Starting programmatic Vite Server for JSX SSR transform...');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: path.resolve(__dirname, '..'),
    ssr: {
      // Externalize React ecosystem so Node loads them natively (avoids CJS/ESM issues)
      external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', 'react-helmet-async', 'axios'],
    },
  });

  console.log('Loading JSX page and context components via Vite SSR...');
  // Load contexts — Vite transforms the JSX/CSS imports
  const { ThemeProvider } = await vite.ssrLoadModule('/src/context/ThemeContext.jsx');
  const { BookmarkProvider } = await vite.ssrLoadModule('/src/context/BookmarkContext.jsx');
  const { AudioProvider } = await vite.ssrLoadModule('/src/context/AudioContext.jsx');
  const { QariProvider } = await vite.ssrLoadModule('/src/context/QariContext.jsx');

  // Load page component
  const { default: SurahView } = await vite.ssrLoadModule('/src/pages/SurahView.jsx');

  console.log(`Fetching Surah list from ${API_BASE}/api/surah ...`);
  let surahs = [];
  try {
    surahs = await fetchJsonWithRetry(`${API_BASE}/api/surah`);
  } catch (err) {
    console.warn(`⚠️ Could not fetch Surah list (${err.message}). Falling back to local offline search...`);
    // Read local cache keys if API is unreachable
    if (fs.existsSync(cacheDir)) {
      const files = fs.readdirSync(cacheDir);
      surahs = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const content = JSON.parse(fs.readFileSync(path.join(cacheDir, f), 'utf-8'));
          return {
            number: content.surahNumber,
            englishName: content.surahName,
            name: content.arabicName,
            nameTranslation: content.nameTranslation,
            versesCount: content.versesCount,
            revelation: content.revelation
          };
        })
        .sort((a, b) => a.number - b.number);
    }
  }

  if (surahs.length === 0) {
    console.error('❌ No surahs found locally or via API to prerender.');
    await vite.close();
    process.exit(1);
  }

  console.log(`Prerendering ${surahs.length} Surah pages...`);
  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const cacheFilePath = path.join(cacheDir, `${s.englishName}.json`);

    let fullSurah;
    if (fs.existsSync(cacheFilePath)) {
      fullSurah = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
    } else {
      console.log(`[${i + 1}/114] Cache missing for ${s.englishName}. Fetching details...`);
      try {
        fullSurah = await fetchJsonWithRetry(`${API_BASE}/api/surah/${s.number}?reciter=alafasy`);
        fs.writeFileSync(cacheFilePath, JSON.stringify(fullSurah, null, 2), 'utf-8');
      } catch (err) {
        console.error(`❌ Failed to fetch details for Surah ${s.englishName}: ${err.message}`);
        await vite.close();
        process.exit(1);
      }
    }

    // Set preloaded variables
    fullSurah.preloadedReciter = 'alafasy';
    globalThis.window.__PRELOADED_SURAH_DATA__ = fullSurah;

    // Render using ReactDOMServer
    const helmetContext = {};
    let appHtml = '';
    try {
      appHtml = ReactDOMServer.renderToString(
        React.createElement(MemoryRouter, { initialEntries: [`/surah/${s.englishName}`] },
          React.createElement(HelmetProvider, { context: helmetContext },
            React.createElement(ThemeProvider, null,
              React.createElement(QariProvider, null,
                React.createElement(BookmarkProvider, null,
                  React.createElement(AudioProvider, null,
                    React.createElement(Routes, null,
                      React.createElement(Route, { path: "/surah/:id", element: React.createElement(SurahView) })
                    )
                  )
                )
              )
            )
          )
        )
      );
    } catch (renderErr) {
      console.error(`❌ Failed to SSR render Surah ${s.englishName}:`, renderErr);
      await vite.close();
      process.exit(1);
    }

    // Cleanup globals
    delete globalThis.window.__PRELOADED_SURAH_DATA__;

    const { helmet } = helmetContext;

    // Inject data and markup into #root (replacing the static loading shell)
    let html = template;
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${appHtml}</div>`);

    const preloadedScript = `\n  <script id="preloaded-surah-data" type="application/json">${JSON.stringify(fullSurah)}</script>`;
    html = html.replace('</head>', `  ${preloadedScript}\n</head>`);
    html = injectHelmet(html, helmet);

    // Save output
    const route = `/surah/${s.englishName}`;
    const routeDir = path.join(distPath, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  }

  // Close Vite server
  await vite.close();
  console.log('Vite programmatic server shut down.');

  // Validation Phase
  console.log('Validating generated Surah pages...');
  let validationPassed = true;
  for (const s of surahs) {
    const filePath = path.join(distPath, `surah/${s.englishName}/index.html`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Validation failed: ${filePath} does not exist.`);
      validationPassed = false;
      continue;
    }
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    if (htmlContent.length < 5000) {
      console.error(`❌ Validation failed: ${filePath} is too small (${htmlContent.length} bytes).`);
      validationPassed = false;
      continue;
    }

    // Verify root is not empty
    const rootMatches = htmlContent.match(/<div id="root">([\s\S]*?)<\/div>/);
    if (!rootMatches || !rootMatches[1] || rootMatches[1].trim() === '') {
      console.error(`❌ Validation failed: ${filePath} has an empty #root element.`);
      validationPassed = false;
      continue;
    }

    // Verify root contains Arabic content & no error strings
    const rootContent = rootMatches[1];
    if (rootContent.includes('Failed to load Surah') || rootContent.includes('spinner')) {
      console.error(`❌ Validation failed: ${filePath} contains error fallback or loading spinner.`);
      validationPassed = false;
      continue;
    }

    const arabicRegex = /[\u0600-\u06FF]/;
    if (!arabicRegex.test(rootContent)) {
      console.error(`❌ Validation failed: ${filePath} does not contain Arabic text in #root.`);
      validationPassed = false;
      continue;
    }
  }

  if (!validationPassed) {
    console.error('❌ Build validation FAILED! Broken pages were detected.');
    process.exit(1);
  } else {
    console.log('✅ All 114 Surah pages passed build validation successfully!');
  }

  console.log('Prerendering complete!');
  console.log('🔔 Reminder: After deploying, resubmit the updated sitemap.xml in Google Search Console to update indexes.');
}

run().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
