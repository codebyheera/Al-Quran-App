/**
 * models/Bookmark.js — Mongoose Bookmark schema
 * Stores user bookmarks with Surah/verse references
 */

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    // Anonymous client identifier (localStorage UUID)
    clientId:     { type: String, required: true, index: true },
    // Optional: link to a registered User
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Surah number (1–114)
    surahNumber:  { type: Number, required: true, min: 1, max: 114 },
    // Surah name for display
    surahName:    { type: String },
    // Verse number within the Surah
    verseNumber:  { type: Number, required: true },
    // Arabic text of the verse
    arabicText:   { type: String },
    // English translation snippet
    translation:  { type: String },
    // Personal note by the user (optional)
    note:         { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks for the same verse per client
bookmarkSchema.index({ clientId: 1, surahNumber: 1, verseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
