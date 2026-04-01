-- Run this in the Supabase SQL Editor to create / recreate the bookmarks table.
-- URL: https://supabase.com/dashboard/project/hjuaeuelhwnjomagnmtx/sql/new

-- 1. Drop and recreate (safe — uses IF NOT EXISTS / IF EXISTS)
DROP TABLE IF EXISTS bookmarks;

CREATE TABLE bookmarks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  post_id     text        NOT NULL,          -- "<surahNumber>:<verseNumber>" e.g. "2:255"
  surah_name  text,
  arabic_text text,
  translation text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate bookmarks per user
  CONSTRAINT bookmarks_user_post_unique UNIQUE (user_id, post_id)
);

-- 2. Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);

-- 3. Disable Row Level Security so the anon key can read/write.
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
