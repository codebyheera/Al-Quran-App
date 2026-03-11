/**
 * server.js — Main Express server entry point
 * Sets up middleware, routes, and MongoDB connection
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/surah',     require('./routes/surah'));
app.use('/api/juz',       require('./routes/juz'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/search',    require('./routes/search'));

// Root health-check
app.get('/', (req, res) => {
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
