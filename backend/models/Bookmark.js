/**
 * models/Bookmark.js — Mongoose Bookmark schema (ESM)
 */

import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    clientId:     { type: String, required: true, index: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    surahNumber:  { type: Number, required: true, min: 1, max: 114 },
    surahName:    { type: String },
    verseNumber:  { type: Number, required: true },
    arabicText:   { type: String },
    translation:  { type: String },
    note:         { type: String, default: '' },
  },
  { timestamps: true }
);

bookmarkSchema.index({ clientId: 1, surahNumber: 1, verseNumber: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
