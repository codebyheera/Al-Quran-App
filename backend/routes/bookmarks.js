/**
 * routes/bookmarks.js — Bookmark CRUD routes
 * Stores and retrieves user bookmarks using clientId (anonymous)
 */

const express  = require('express');
const router   = express.Router();
const Bookmark = require('../models/Bookmark');

/**
 * GET /api/bookmarks?clientId=xxx
 * Returns all bookmarks for a given client session
 */
router.get('/', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId is required.' });

  try {
    const bookmarks = await Bookmark.find({ clientId }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

/**
 * POST /api/bookmarks
 * Creates a new bookmark. Silently ignores duplicates (same surah+verse).
 * Body: { clientId, surahNumber, surahName, verseNumber, arabicText, translation, note }
 */
router.post('/', async (req, res) => {
  const { clientId, surahNumber, surahName, verseNumber, arabicText, translation, note } = req.body;

  if (!clientId || !surahNumber || !verseNumber) {
    return res.status(400).json({ error: 'clientId, surahNumber, and verseNumber are required.' });
  }

  try {
    const bookmark = await Bookmark.create({
      clientId, surahNumber, surahName, verseNumber, arabicText, translation, note: note || '',
    });
    res.status(201).json(bookmark);
  } catch (err) {
    // Duplicate key error (already bookmarked)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Verse already bookmarked.' });
    }
    res.status(500).json({ error: 'Failed to create bookmark.' });
  }
});

/**
 * PUT /api/bookmarks/:id — Update a bookmark's note
 * Body: { note }
 */
router.put('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { note: req.body.note },
      { new: true }
    );
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

/**
 * DELETE /api/bookmarks/:id — Remove a bookmark by its MongoDB _id
 */
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    res.json({ message: 'Bookmark deleted.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bookmark.' });
  }
});

module.exports = router;
