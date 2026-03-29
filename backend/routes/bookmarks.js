/**
 * routes/bookmarks.js — Bookmark CRUD routes (ESM)
 */

import express from 'express';
import { supabase } from '../lib/supabase.js';
const router = express.Router();

function mapToMongoFormat(row) {
  if (!row) return null;
  return {
    _id: row.id,
    clientId: row.client_id,
    surahNumber: row.surah_number,
    surahName: row.surah_name,
    verseNumber: row.verse_number,
    arabicText: row.arabic_text,
    translation: row.translation,
    note: row.note,
    createdAt: row.created_at
  };
}

router.get('/', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId is required.' });

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  res.json(data.map(mapToMongoFormat));
});

router.post('/', async (req, res) => {
  const { clientId, surahNumber, surahName, verseNumber, arabicText, translation, note } = req.body;

  if (!clientId || !surahNumber || !verseNumber) {
    return res.status(400).json({ error: 'clientId, surahNumber, and verseNumber are required.' });
  }

  // Check for duplicate pseudo-unique index (clientId + surahNumber + verseNumber)
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('client_id', clientId)
    .eq('surah_number', surahNumber)
    .eq('verse_number', verseNumber)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Verse already bookmarked.' });
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      client_id: clientId,
      surah_number: surahNumber,
      surah_name: surahName,
      verse_number: verseNumber,
      arabic_text: arabicText,
      translation: translation,
      note: note || ''
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create bookmark.' });
  res.status(201).json(mapToMongoFormat(data));
});

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .update({ note: req.body.note })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Bookmark not found.' });
  res.json(mapToMongoFormat(data));
});

router.delete('/:id', async (req, res) => {
  const { error, count } = await supabase
    .from('bookmarks')
    .delete({ count: 'exact' })
    .eq('id', req.params.id);

  if (error || count === 0) return res.status(404).json({ error: 'Bookmark not found.' });
  res.json({ message: 'Bookmark deleted.', id: req.params.id });
});

export default router;
