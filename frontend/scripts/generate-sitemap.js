/**
 * scripts/generate-sitemap.js
 * Runs before `vite build`. Fetches all published blog slugs from the
 * backend API (VITE_API_URL) and appends them to frontend/public/sitemap.xml.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const API_BASE = process.env.VITE_API_URL;

if (!API_BASE) {
  console.warn('⚠️  VITE_API_URL not set — skipping blog URLs in sitemap.');
  process.exit(0);
}

async function fetchAllBlogs() {
  const blogs = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const res = await fetch(`${API_BASE}/api/blogs?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`API responded ${res.status}: ${await res.text()}`);

    const { blogs: batch, totalPages } = await res.json();
    blogs.push(...batch);

    if (page >= totalPages) break;
    page++;
  }

  return blogs;
}

async function main() {
  let blogs = [];
  try {
    blogs = await fetchAllBlogs();
    console.log(`✅ Fetched ${blogs.length} published blog(s) from ${API_BASE}`);
  } catch (err) {
    console.error('❌ Failed to fetch blogs for sitemap:', err.message);
    process.exit(0); // don't break the build — sitemap stays as-is
  }

  if (blogs.length === 0) {
    console.log('ℹ️  No published blogs found — sitemap unchanged.');
    return;
  }

  const blogUrls = blogs.map(b => {
    const lastmod = b.created_at ? b.created_at.slice(0, 10) : '';
    return [
      '  <url>',
      `    <loc>https://alquranhub.org/blog/${b.slug}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
      '    <changefreq>monthly</changefreq>',
      '    <priority>0.8</priority>',
      '  </url>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  let sitemap = readFileSync(SITEMAP_PATH, 'utf-8');

  // Remove previously injected blog URLs so re-runs don't duplicate
  sitemap = sitemap.replace(
    /\n?  <!-- Blog Pages \(auto-generated\) -->[\s\S]*?<!-- End Blog Pages -->\n?/,
    ''
  );

  // Inject before closing </urlset>
  sitemap = sitemap.replace(
    '</urlset>',
    `\n  <!-- Blog Pages (auto-generated) -->\n${blogUrls}\n  <!-- End Blog Pages -->\n</urlset>`
  );

  writeFileSync(SITEMAP_PATH, sitemap, 'utf-8');
  console.log(`✅ sitemap.xml updated with ${blogs.length} blog URL(s).`);
}

main();
