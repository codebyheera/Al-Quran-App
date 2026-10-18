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
import { MemoryRouter } from 'react-router-dom';
import { getSurahSeo } from '../src/data/surahSeo.js';
import { getJuzSeo } from '../src/data/juzSeo.js';
import { pageSeo } from '../src/data/pageSeo.js';
import { buildTasbihSchema } from '../src/data/tasbihFaqs.js';
import { buildSurahListSchema } from '../src/data/surahListSchema.js';
import { buildJuzListSchema } from '../src/data/juzListSchema.js';

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
        // Decode as a stream so multi-byte UTF-8 chars split across chunks stay intact
        res.setEncoding('utf8');
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

function injectMeta(template, { title, description, url, keywords, ogType = 'website', jsonLd, robots }) {
  let html = template;

  html = html.replace(/<title(?:[^>]*)?>[\s\S]*?<\/title>/, `<title data-rh="true">${escapeAttr(title)}</title>`);

  // Optional robots directive (e.g. "noindex, follow" for Privacy Policy).
  // Must be baked into the *static* HTML, not left to client-side Helmet —
  // Google's first-wave crawl reads this pass, so a noindex that only shows
  // up after JS renders risks the page getting indexed before it's ever seen.
  if (robots) {
    if (html.includes('name="robots"')) {
      html = html.replace(/<meta\s+(?:data-rh="true"\s+)?name="robots"[\s\S]*?\/>/, `<meta data-rh="true" name="robots" content="${escapeAttr(robots)}" />`);
    } else {
      html = html.replace('</head>', `  <meta data-rh="true" name="robots" content="${escapeAttr(robots)}" />\n</head>`);
    }
  }

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

  // Optional structured data (e.g. FAQPage) for static (meta-only) pages —
  // needed so it's present in the *initial* HTML rather than only appearing
  // once client-side Helmet runs (see the tasbih FAQ prerendering note below).
  // data-rh="true" matters here: it's the exact attribute react-helmet-async
  // stamps on tags it renders (confirmed against this app's own SSR'd Surah
  // pages' JSON-LD output), which is how it recognizes and REPLACES this tag
  // on hydration instead of leaving it in place and appending a duplicate —
  // without it, TasbihPage.jsx's own <Helmet> FAQ schema showed up as a
  // second, identical FAQPage block alongside this one.
  if (jsonLd) {
    html = html.replace('</head>', `  <script data-rh="true" type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`);
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
    // Drop the template's copy of every meta tag Helmet emits (the full App's
    // <Helmet> also sets keywords, og:site_name, og:image, …), so none is duplicated.
    for (const [, attr, key] of metaHtml.matchAll(/<meta[^>]*?\b(name|property)="([^"]+)"/g)) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`<meta\\s+(?:data-rh="true"\\s+)?${attr}="${escaped}"[^>]*?\\/>\\s*`, 'g'), '');
    }

    html = html.replace('</head>', () => `  ${metaHtml}\n</head>`);
  }

  const scriptHtml = helmet.script.toString();
  if (scriptHtml) {
    html = html.replace('</head>', `  ${scriptHtml}\n</head>`);
  }

  return html;
}

// Surah summaries (number, englishName, nameTranslation, …) from the committed
// src/data/surahs/*.json cache, in Quran order. Exits if any of the 114 are missing,
// so the /surah ItemList can never ship incomplete.
function readCachedSurahList() {
  const list = fs.readdirSync(cacheDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const content = JSON.parse(fs.readFileSync(path.join(cacheDir, f), 'utf-8'));
      return {
        number: content.surahNumber,
        englishName: content.surahName,
        name: content.arabicName,
        nameTranslation: content.nameTranslation,
        versesCount: content.versesCount,
        revelation: content.revelation,
      };
    })
    .sort((a, b) => a.number - b.number);
  if (list.length !== 114) {
    console.error(`❌ Expected 114 cached Surahs in ${cacheDir}, found ${list.length}.`);
    process.exit(1);
  }
  return list;
}

// <link> tags for a lazy page chunk (and every chunk it statically imports),
// from Vite's build manifest:
//  - its CSS: prerendered pages paint their markup before the JS loads the lazy
//    chunk, so without these the page is unstyled until then — e.g. the
//    breadcrumb chevron SVG flashed at full width.
//  - its JS as modulepreload: main.jsx waits for the landing page's chunk before
//    the first render, so it should download alongside the main bundle rather
//    than after it.
// Files the template already links (the main entry) are skipped. The hrefs match
// what Vite's preloader looks for, so it won't load them a second time.
function lazyPageHeadLinks(manifest, entry, template) {
  const css = new Set();
  const js = new Set();
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key) || !manifest[key]) return;
    seen.add(key);
    js.add(manifest[key].file);
    (manifest[key].css || []).forEach((file) => css.add(file));
    (manifest[key].imports || []).forEach(visit);
  };
  visit(entry);
  if (!seen.has(entry)) {
    console.error(`❌ ${entry} not found in the Vite manifest.`);
    process.exit(1);
  }
  const notInTemplate = (file) => !template.includes(`/${file}"`);
  return [
    ...[...css].filter(notInTemplate).map((file) => `<link rel="stylesheet" crossorigin href="/${file}">`),
    ...[...js].filter(notInTemplate).map((file) => `<link rel="modulepreload" crossorigin href="/${file}">`),
  ].join('\n  ');
}

// Routes written by writeRoute (meta-only, empty #root) — they get their lazy
// page's <link>s once App.jsx's route table is loaded (see linkLazyPages below).
const writtenRoutes = [];

function writeRoute(template, route, meta) {
  const html = injectMeta(template, { ...meta, url: `${SITE_URL}${route}` });
  const routeDir = path.join(distPath, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  writtenRoutes.push(route);
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

  const manifestPath = path.join(distPath, '.vite', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ dist/.vite/manifest.json not found. Is build.manifest enabled in vite.config.js?');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  // Only needed at build time — don't deploy it.
  fs.rmSync(path.join(distPath, '.vite'), { recursive: true, force: true });

  console.log('Syncing homepage meta with pageSeo.js...');
  const homeHtml = injectMeta(template, { ...pageSeo.home, url: `${SITE_URL}${pageSeo.home.path}` });
  fs.writeFileSync(path.join(distPath, 'index.html'), homeHtml);

  console.log('Prerendering static pages...');
  for (const page of staticPages) {
    // Tasbih is the only static page with an on-page FAQ section (see
    // TasbihPage.jsx + data/tasbihFaqs.js) — bake its schema graph (FAQPage,
    // WebApplication, WebPage, BreadcrumbList) into the static HTML too, same
    // reasoning as everywhere else jsonLd is used here.
    // /surah gets its CollectionPage + ItemList graph (see data/surahListSchema.js),
    // built from the committed Surah cache so it doesn't depend on the API; /juz
    // gets the equivalent graph from data/juzListSchema.js (static, 1-30).
    const jsonLd = page.route === '/tasbih'
      ? buildTasbihSchema(`${SITE_URL}${page.route}`, page)
      : page.route === pageSeo.surahList.path
        ? buildSurahListSchema(readCachedSurahList())
        : page.route === pageSeo.juzList.path
          ? buildJuzListSchema()
          : undefined;
    // Privacy Policy + Terms: dofollow (links still pass value/get crawled)
    // but noindex (legal boilerplate pages shouldn't compete for search
    // rankings) — matches each page's own runtime <Helmet> tag.
    const NOINDEX_ROUTES = new Set(['/privacy-policy', '/terms-and-conditions']);
    const robots = NOINDEX_ROUTES.has(page.route) ? 'noindex, follow' : undefined;
    writeRoute(template, page.route, { ...page, jsonLd, robots });
  }

  console.log('Prerendering Juz pages (1-30)...');
  for (let juzNum = 1; juzNum <= 30; juzNum++) {
    const juzSeoData = getJuzSeo(juzNum);
    writeRoute(template, `/juz/${juzNum}`, {
      title: juzSeoData.title,
      description: juzSeoData.description,
      ogType: 'website',
    });
  }

  // Blog posts previously had NO prerendering at all (unlike Surah/Juz above),
  // so Googlebot's crawl could catch BlogPost.jsx's loading-skeleton Helmet
  // ("Blog Article | Al-Quran Hub" / generic description) or even the raw
  // index.html defaults, before the client-side data fetch + Helmet update
  // finished — this is exactly what showed up as wrong titles/descriptions
  // in Google search results. Meta-only injection (same approach as the Juz
  // pages above, not a full ReactDOMServer render like Surah pages) is enough
  // to fix that: it guarantees the *initial* HTML already has the real
  // per-post title/description, independent of how long the client-side
  // fetch takes.
  console.log('Prerendering blog post pages...');
  try {
    let allBlogs = [];
    let page = 1;
    while (true) {
      const res = await fetchJsonWithRetry(`${API_BASE}/api/blogs?page=${page}&limit=50`);
      allBlogs = allBlogs.concat(res.blogs || []);
      if (page >= (res.totalPages || 1)) break;
      page++;
    }

    console.log(`Found ${allBlogs.length} published blog posts.`);
    let blogPrerenderFailures = 0;
    for (const b of allBlogs) {
      try {
        const full = await fetchJsonWithRetry(`${API_BASE}/api/blogs/${b.slug}`);
        writeRoute(template, `/blog/${full.slug}`, {
          title: `${full.meta_title || full.title} | Al-Quran Hub Blog`,
          description: full.meta_description || full.excerpt || '',
          ogType: 'article',
        });
      } catch (err) {
        blogPrerenderFailures++;
        console.error(`❌ Failed to prerender blog "${b.slug}": ${err.message}`);
      }
    }
    if (blogPrerenderFailures > 0) {
      console.error(`❌ ${blogPrerenderFailures}/${allBlogs.length} blog posts failed to prerender.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Could not fetch blog list from ${API_BASE}/api/blogs: ${err.message}`);
    process.exit(1);
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
  const { default: App, preloadRoute, findRoute } = await vite.ssrLoadModule('/src/App.jsx');

  console.log('Linking lazy page chunks into prerendered routes...');
  for (const route of writtenRoutes) {
    const lazyRoute = findRoute(route);
    if (!lazyRoute) continue;
    const file = path.join(distPath, route, 'index.html');
    const links = lazyPageHeadLinks(manifest, lazyRoute.src, template);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf-8').replace('</head>', () => `  ${links}\n</head>`));
  }

  // Full App (Navbar, page, Footer) at `url`, inside the same provider tree as main.jsx.
  const renderAppAt = (url, helmetContext) => ReactDOMServer.renderToString(
    React.createElement(MemoryRouter, { initialEntries: [url] },
      React.createElement(HelmetProvider, { context: helmetContext },
        React.createElement(ThemeProvider, null,
          React.createElement(QariProvider, null,
            React.createElement(BookmarkProvider, null,
              React.createElement(AudioProvider, null,
                React.createElement(App)
              )
            )
          )
        )
      )
    )
  );

  // Homepage snapshot — the full App shell (Navbar, hero, Footer) rendered at "/"
  // and baked into dist/index.html, so mobile paints the hero from HTML + CSS
  // instead of waiting on the JS bundle (Home was fully client-rendered before,
  // which is what made mobile FCP/LCP slow). main.jsx sees data-prerender=
  // "snapshot" and createRoot()s over it rather than hydrating, since
  // localStorage-driven UI (streak, bookmarks, theme) can't match a build-time
  // render. Lazy components render their Suspense fallbacks here.
  console.log('Prerendering homepage snapshot...');
  {
    const homeHelmetContext = {};
    let homeAppHtml = '';
    try {
      homeAppHtml = renderAppAt('/', homeHelmetContext);
    } catch (renderErr) {
      console.error('❌ Failed to SSR render homepage snapshot:', renderErr);
      await vite.close();
      process.exit(1);
    }
    if (!homeAppHtml.includes('hero-bismillah')) {
      console.error('❌ Homepage snapshot is missing the hero — refusing to ship it.');
      await vite.close();
      process.exit(1);
    }
    const indexPath = path.join(distPath, 'index.html');
    const shellHtml = fs.readFileSync(indexPath, 'utf-8');
    // Empty-root copy for vercel.json's SPA catch-all rewrite — routes without
    // their own prerendered file (e.g. /prayer-times/:city, 404s) must not
    // flash the homepage snapshot or serve it to crawlers.
    fs.writeFileSync(path.join(distPath, 'app-shell.html'), shellHtml);
    // Home's JSON-LD (WebSite/Organization/WebPage/Person) lives in its <Helmet>,
    // so bake those script tags into the initial HTML for crawlers. Title/meta/
    // canonical are already set by injectMeta above. Helmet renders them with
    // data-rh="true", so the client-side Helmet replaces rather than duplicates them.
    const homeScriptHtml = homeHelmetContext.helmet?.script.toString() || '';
    if (!homeScriptHtml.includes('application/ld+json')) {
      console.error('❌ Homepage snapshot is missing its JSON-LD — refusing to ship it.');
      await vite.close();
      process.exit(1);
    }
    const indexHtml = shellHtml
      .replace('</head>', () => `  ${homeScriptHtml}\n</head>`)
      .replace('<div id="root"></div>', () => `<div id="root" data-prerender="snapshot">${homeAppHtml}</div>`);
    fs.writeFileSync(indexPath, indexHtml);
  }

  // /surah snapshot — same approach as the homepage, so the intro text and all
  // 114 Surah links are in the initial HTML. SurahList is lazy, so it's preloaded
  // first (otherwise this render would only contain <PageLoader />), and the
  // Surah list is embedded as #preloaded-surah-list so the client's first render
  // matches without waiting on the API. Title/meta/canonical/JSON-LD were already
  // written into dist/surah/index.html by writeRoute above.
  console.log('Prerendering /surah snapshot...');
  {
    const surahListPath = pageSeo.surahList.path;
    const surahList = readCachedSurahList();
    let surahListHtml = '';
    try {
      await preloadRoute[surahListPath]();
      globalThis.window.__PRELOADED_SURAH_LIST__ = surahList;
      surahListHtml = renderAppAt(surahListPath, {});
    } catch (renderErr) {
      console.error('❌ Failed to SSR render /surah snapshot:', renderErr);
      await vite.close();
      process.exit(1);
    } finally {
      delete globalThis.window.__PRELOADED_SURAH_LIST__;
    }
    const linkCount = (surahListHtml.match(/class="surah-card card"/g) || []).length;
    if (!surahListHtml.includes('sl-intro') || linkCount !== 114) {
      console.error(`❌ /surah snapshot is incomplete (intro: ${surahListHtml.includes('sl-intro')}, Surah cards: ${linkCount}/114) — refusing to ship it.`);
      await vite.close();
      process.exit(1);
    }
    const surahListFile = path.join(distPath, surahListPath, 'index.html');
    // `<` escaped so the embedded JSON can never close its <script> early.
    const preloadedJson = JSON.stringify(surahList).replace(/</g, '\\u003c');
    // (Its lazy page <link>s were added by the linking pass above.)
    const surahListPage = fs.readFileSync(surahListFile, 'utf-8')
      .replace('</head>', () => `  <script id="preloaded-surah-list" type="application/json">${preloadedJson}</script>\n</head>`)
      .replace('<div id="root"></div>', () => `<div id="root" data-prerender="snapshot">${surahListHtml}</div>`);
    if (!surahListPage.includes('data-prerender="snapshot"')) {
      console.error('❌ Could not find an empty #root in dist/surah/index.html.');
      await vite.close();
      process.exit(1);
    }
    fs.writeFileSync(surahListFile, surahListPage);
  }

  // Surah pages are full-App snapshots too (Navbar + SurahView + Footer), so the
  // client's first render matches them — previously only SurahView was rendered,
  // so hydrating the full App mismatched, React threw the markup away and showed
  // <PageLoader /> until the SurahView chunk loaded. SurahView is lazy, so it's
  // preloaded once here (otherwise each render would only contain <PageLoader />).
  await preloadRoute['/surah/:id']();
  const surahViewLinks = lazyPageHeadLinks(manifest, 'src/pages/SurahView.jsx', template);

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
      appHtml = renderAppAt(`/surah/${s.englishName}`, helmetContext);
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
    html = html.replace('<div id="root"></div>', () => `<div id="root" data-prerender="snapshot">${appHtml}</div>`);

    const preloadedScript = `\n  <script id="preloaded-surah-data" type="application/json">${JSON.stringify(fullSurah)}</script>`;
    html = html.replace('</head>', () => `  ${surahViewLinks}\n  ${preloadedScript}\n</head>`);
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

    // Verify #root holds the snapshot (everything from it to </body>)
    const rootMatches = htmlContent.match(/<div id="root" data-prerender="snapshot">([\s\S]*)<\/body>/);
    if (!rootMatches || !rootMatches[1] || rootMatches[1].trim() === '') {
      console.error(`❌ Validation failed: ${filePath} has no #root snapshot.`);
      validationPassed = false;
      continue;
    }

    // Verify root contains every verse & no error/loading fallbacks
    const rootContent = rootMatches[1];
    if (rootContent.includes('Failed to load Surah') || rootContent.includes('class="spinner"') || rootContent.includes('>Loading...<')) {
      console.error(`❌ Validation failed: ${filePath} contains error fallback or loading spinner.`);
      validationPassed = false;
      continue;
    }

    const verseCards = (rootContent.match(/class="verse-card /g) || []).length;
    if (s.versesCount && verseCards !== s.versesCount) {
      console.error(`❌ Validation failed: ${filePath} has ${verseCards}/${s.versesCount} verses.`);
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
