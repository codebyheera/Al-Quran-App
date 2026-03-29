/**
 * server.js — Main Express server entry point (ESM)
 * NOTE: 'dotenv/config' MUST be the very first import so env vars are loaded
 * before any other module (like supabase.js) reads process.env.
 */

import 'dotenv/config'; // ← loads .env BEFORE all other module bodies execute

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
import surahRoutes    from './routes/surah.js';
import juzRoutes      from './routes/juz.js';
import bookmarkRoutes from './routes/bookmarks.js';
import searchRoutes   from './routes/search.js';

app.use('/api/surah',     surahRoutes);
app.use('/api/juz',       juzRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search',    searchRoutes);

// Health-check
app.get('/', (_req, res) => {
  res.json({ message: 'Quran API is running 🌙' });
});

// Listen locally only — Vercel Serverless uses the exported app
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
