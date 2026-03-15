/**
 * server.js — Main Express server entry point (ESM)
 * Sets up middleware, routes, and MongoDB connection
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors()); // Simplified as requested
app.use(express.json());

// ── Routes (Importing ESM routes with .js extensions) ─────────────────────────
import surahRoutes from './routes/surah.js';
import juzRoutes from './routes/juz.js';
import bookmarkRoutes from './routes/bookmarks.js';
import searchRoutes from './routes/search.js';

app.use('/api/surah',     surahRoutes);
app.use('/api/juz',       juzRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search',    searchRoutes);

// Health-check
app.get('/', (_req, res) => {
  res.json({ message: 'Quran API is running 🌙' });
});

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connection.on('connected', () => console.log('✅ Connected to MongoDB Atlas'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

// Start Express server first so API works even if DB is slow
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    return;
  }
  
  mongoose
    .connect(process.env.MONGO_URI)
    .catch(err => {
      console.error('❌ Initial MongoDB connection failed:', err.message);
    });
});
