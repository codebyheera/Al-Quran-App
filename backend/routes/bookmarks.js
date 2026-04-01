/**
 * routes/bookmarks.js — Bookmark CRUD routes using Supabase JS Client (ESM)
 *
 * Supabase table schema:
 *   bookmarks (
 *     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id     text NOT NULL,
 *     post_id     text NOT NULL,          -- "<surahNumber>:<verseNumber>"
 *     surah_name  text,
 *     arabic_text text,
 *     translation text,
 *     created_at  timestamptz DEFAULT now()
 *   )
 */

import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Translate a Supabase error code/message into a user-friendly string.
 */
function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (error.code === '42P01')
    return 'The "bookmarks" table does not exist. Please run the setup SQL in Supabase.';
  if (error.code === '42501')
    return 'Row Level Security (RLS) is blocking the request. Disable RLS or add a permissive policy in Supabase.';
  if (error.code === '23505')
    return 'This bookmark already exists (duplicate user_id + post_id).';
  if (
    error.message?.includes('fetch failed') ||
    error.message?.includes('missing-url')
  )
    return 'Server is missing SUPABASE_URL / SUPABASE_KEY environment variables.';
  return `Database error: ${error.message}`;
}

/** Wrap a Supabase promise with a hard timeout to prevent hanging requests. */
const DB_TIMEOUT_MS = 10_000;

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'Database query timed out after 10 s. Check your Supabase project status.'
            )
          ),
        DB_TIMEOUT_MS
      )
    ),
  ]);
}

// ── GET /api/bookmarks?userId=xxx  ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate required query param
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res
        .status(400)
        .json({ error: 'Query parameter "userId" is required.' });
    }

    const { data, error } = await withTimeout(
      supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId.trim())
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('[GET /api/bookmarks] Supabase error:', error);
      return res.status(500).json({ error: getErrorMessage(error) });
    }

    return res.json(data);
  } catch (err) {
    console.error('[GET /api/bookmarks] Unexpected error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ── POST /api/bookmarks  ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { userId, postId, surahName, arabicText, translation } = req.body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return res
        .status(400)
        .json({ error: 'Request body must include a non-empty "userId".' });
    }
    if (!postId || typeof postId !== 'string' || !postId.trim()) {
      return res
        .status(400)
        .json({ error: 'Request body must include a non-empty "postId".' });
    }

    const cleanUserId = userId.trim();
    const cleanPostId = postId.trim();

    // Check for an existing bookmark to avoid duplicates
    const { data: existing, error: checkError } = await withTimeout(
      supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', cleanUserId)
        .eq('post_id', cleanPostId)
        .maybeSingle()
    );

    if (checkError) {
      console.error('[POST /api/bookmarks] Duplicate-check error:', checkError);
      return res.status(500).json({ error: getErrorMessage(checkError) });
    }

    if (existing) {
      return res
        .status(409)
        .json({ error: 'This bookmark already exists for this user.' });
    }

    // Insert the new bookmark with optional display metadata
    const { data, error } = await withTimeout(
      supabase
        .from('bookmarks')
        .insert([
          {
            user_id:     cleanUserId,
            post_id:     cleanPostId,
            surah_name:  surahName  || null,
            arabic_text: arabicText || null,
            translation: translation || null,
          },
        ])
        .select()
        .single()
    );

    if (error) {
      console.error('[POST /api/bookmarks] Insert error:', error);
      return res.status(500).json({ error: getErrorMessage(error) });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/bookmarks] Unexpected error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ── DELETE /api/bookmarks/:id  ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res
        .status(400)
        .json({ error: 'URL parameter "id" is required.' });
    }

    const { error, count } = await withTimeout(
      supabase
        .from('bookmarks')
        .delete({ count: 'exact' })
        .eq('id', id.trim())
    );

    if (error) {
      console.error('[DELETE /api/bookmarks] Supabase error:', error);
      return res.status(500).json({ error: getErrorMessage(error) });
    }

    if (count === 0) {
      return res
        .status(404)
        .json({ error: `No bookmark found with id "${id}".` });
    }

    return res.json({ message: 'Bookmark deleted successfully.', id });
  } catch (err) {
    console.error('[DELETE /api/bookmarks] Unexpected error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ── DELETE /api/bookmarks  (by userId + postId)  ──────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ error: '"userId" and "postId" are required to delete a bookmark.' });
    }

    const { error, count } = await withTimeout(
      supabase
        .from('bookmarks')
        .delete({ count: 'exact' })
        .eq('user_id', userId.trim())
        .eq('post_id', postId.trim())
    );

    if (error) {
      console.error('[DELETE /api/bookmarks] Supabase error:', error);
      return res.status(500).json({ error: getErrorMessage(error) });
    }

    if (count === 0) {
      return res
        .status(404)
        .json({ error: 'No matching bookmark found.' });
    }

    return res.json({ message: 'Bookmark deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/bookmarks] Unexpected error:', err.message);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

export default router;
