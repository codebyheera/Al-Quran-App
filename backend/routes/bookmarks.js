/**
 * routes/bookmarks.js — Bookmark CRUD routes using Supabase JS Client (ESM)
 */

import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

function mapRow(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    clientId:    row.client_id,
    surahNumber: row.surah_number,
    surahName:   row.surah_name,
    verseNumber: row.verse_number,
    arabicText:  row.arabic_text,
    translation: row.translation,
    note:        row.note,
    createdAt:   row.created_at,
  };
}

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (error.code === '42P01') return 'The "bookmarks" table does not exist in your Supabase DB. Please run the setup SQL.';
  if (error.code === '42501') return 'Row Level Security (RLS) is blocking the request. Disable RLS or add a policy in Supabase.';
  if (error.message?.includes('fetch failed') || error.message?.includes('missing-url')) return 'Your Vercel environment is missing the SUPABASE_URL and SUPABASE_KEY variables.';
  return `Database Error: ${error.message}`;
}

// GET /api/bookmarks?clientId=xxx
router.get('/', async (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId is required.' });

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET /bookmarks error:', error.message);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
  res.json(data.map(mapRow));
});

// POST /api/bookmarks
router.post('/', async (req, res) => {
  const { clientId, surahNumber, surahName, verseNumber, arabicText, translation, note } = req.body;

  if (!clientId || !surahNumber || !verseNumber) {
    return res.status(400).json({ error: 'clientId, surahNumber, and verseNumber are required.' });
  }

  // Check for duplicate
  const { data: existing, error: checkError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('client_id', clientId)
    .eq('surah_number', surahNumber)
    .eq('verse_number', verseNumber)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ error: getErrorMessage(checkError) });
  }

  if (existing) {
    return res.status(409).json({ error: 'Verse already bookmarked.' });
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      client_id:    clientId,
      surah_number: surahNumber,
      surah_name:   surahName,
      verse_number: verseNumber,
      arabic_text:  arabicText,
      translation:  translation,
      note:         note || ''
    }])
    .select()
    .single();

  if (error) {
    console.error('POST /bookmarks error:', error.message);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
  res.status(201).json(mapRow(data));
});

// PUT /api/bookmarks/:id
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .update({ note: req.body.note })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    console.error('PUT /bookmarks error:', error?.message);
    if (error) return res.status(500).json({ error: getErrorMessage(error) });
    return res.status(404).json({ error: 'Bookmark not found.' });
  }
  res.json(mapRow(data));
});

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res) => {
  const { error, count } = await supabase
    .from('bookmarks')
    .delete({ count: 'exact' })
    .eq('id', req.params.id);

  if (error) {
    console.error('DELETE /bookmarks error:', error.message);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
  if (count === 0) {
    return res.status(404).json({ error: 'Bookmark not found.' });
  }
  res.json({ message: 'Bookmark deleted.', id: req.params.id });
});

export default router;
