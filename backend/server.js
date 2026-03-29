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

// ── MongoDB Connection for Vercel Serverless ─────────────────────────────────
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is literally missing in the Vercel Environment Variables.');
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB Atlas (Serverless)');
  } catch (err) {
    if (err.message.includes('IP')) {
      throw new Error(`MongoDB IP Blocked: Tell user to allow 0.0.0.0/0 in MongoDB Atlas. Details: ${err.message}`);
    }
    throw new Error(`MongoDB Connection Failed: ${err.message}`);
  }
};

// Add middleware to ensure DB connection before handling Bookmark routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/bookmarks')) {
    try {
      await connectToDatabase();
    } catch (err) {
      console.error('Fatal DB Error:', err.message);
      return res.status(500).json({ error: err.message, v: '1.1' });
    }
  }
  next();
});

// Only listen locally, Vercel Serverless will use the exported app
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
export default app;
