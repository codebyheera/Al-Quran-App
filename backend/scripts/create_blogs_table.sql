-- ============================================================
-- Supabase Migration: Create `blogs` table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.blogs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT,
  content          TEXT,           -- Stores HTML content
  cover_image      TEXT,           -- URL to cover image
  category         TEXT,
  tags             TEXT[],         -- PostgreSQL array of tags
  author           TEXT,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title       TEXT,
  meta_description TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs (slug);

-- 3. Index on published + date for paginated list queries
CREATE INDEX IF NOT EXISTS blogs_published_created_idx
  ON public.blogs (is_published, created_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on the table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (anon + authenticated) can SELECT published blogs only
CREATE POLICY "Public can read published blogs"
  ON public.blogs
  FOR SELECT
  USING (is_published = TRUE);

-- ============================================================
-- Notes
-- ============================================================
-- To manage blog posts (INSERT/UPDATE/DELETE), use the Supabase
-- Dashboard Table Editor or connect via the service_role key
-- from a secure server-side admin panel.
-- The anon/public key used by the Express backend will only
-- ever see rows where is_published = TRUE.
-- ============================================================
