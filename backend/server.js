/**
 * server.js — Main Express server entry point (ESM)
 * NOTE: 'dotenv/config' MUST be the very first import so env vars are loaded
 * before any other module (like supabase.js) reads process.env.
 */

import 'dotenv/config'; // ← loads .env BEFORE all other module bodies execute

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
// Rate Limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://alquranhub.org']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:45678', 'https://alquranhub.org']
}));

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
import surahRoutes        from './routes/surah.js';
import juzRoutes          from './routes/juz.js';
import bookmarkRoutes     from './routes/bookmarks.js';
import searchRoutes       from './routes/search.js';
import blogRoutes         from './routes/blogRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

app.use('/api/surah',         surahRoutes);
app.use('/api/juz',           juzRoutes);
app.use('/api/bookmarks',     bookmarkRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/blogs',         blogRoutes);
app.use('/api/notifications', notificationRoutes);

// Health-check
app.get('/', (_req, res) => {
  res.json({ message: 'Quran API is running 🌙' });
});

// Sitemap
import { supabase } from './lib/supabase.js';

app.get('/sitemap.xml', async (_req, res) => {
  const staticPages = [
    { loc: 'https://alquranhub.org/',          changefreq: 'daily',   priority: '1.0' },
    { loc: 'https://alquranhub.org/quran',     changefreq: 'monthly', priority: '0.9' },
    { loc: 'https://alquranhub.org/blog',      changefreq: 'weekly',  priority: '0.8' },
    { loc: 'https://alquranhub.org/about',     changefreq: 'monthly', priority: '0.5' },
    { loc: 'https://alquranhub.org/contact',   changefreq: 'monthly', priority: '0.5' },
  ];

  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('slug, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const staticUrls = staticPages.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    const blogUrls = (blogs || []).map(b => {
      const lastmod = b.created_at ? b.created_at.slice(0, 10) : '';
      return `
  <url>
    <loc>https://alquranhub.org/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${blogUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err.message);
    res.status(500).send('Failed to generate sitemap.');
  }
});

// Listen locally only — Vercel Serverless uses the exported app
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
