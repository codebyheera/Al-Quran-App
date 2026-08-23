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
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  // The audio proxy has its own, much more generous limiter below — a single
  // Surah can legitimately need hundreds of ayah audio requests.
  skip: (req) => req.path.startsWith('/api/audio-proxy'),
});

app.use(limiter);

// Audio proxy gets its own generous limiter instead of the general API one.
const audioProxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { message: "Too many audio requests from this IP, please try again shortly" }
});

// The AI chatbot calls a paid LLM per request, so it gets a much stricter
// limiter: 10 messages per hour per IP.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You've reached the chat limit (10 messages per hour). Please try again later." },
});

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
import prayerTimesRoutes  from './routes/prayerTimes.js';
import audioProxyRoutes   from './routes/audioProxy.js';
import chatRoutes         from './routes/chat.js';

app.use('/api/surah',         surahRoutes);
app.use('/api/juz',           juzRoutes);
app.use('/api/bookmarks',     bookmarkRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/blogs',         blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prayer-times',  prayerTimesRoutes);
app.use('/api/audio-proxy',   audioProxyLimiter, audioProxyRoutes);
app.use('/api/chat',          chatLimiter, chatRoutes);

// Health-check
app.get('/', (_req, res) => {
  res.json({ message: 'Quran API is running 🌙' });
});

// Sitemap
import { getSitePages } from './lib/sitePages.js';

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const pages = await getSitePages();

    const urls = pages
      .filter((p) => p.crawlable)
      .map((p) => `
  <url>
    <loc>${p.loc}</loc>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
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
