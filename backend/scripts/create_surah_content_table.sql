-- ============================================================
-- Supabase Migration: Create `surah_content` table
-- Run this in the Supabase SQL Editor
--
-- Stores per-Surah editorial content (intro + FAQs). Consumed by:
--   - <SurahIntro> on Surah pages (SEO)
--   - POST /api/chat, the AI chatbot's grounded context (routes/chat.js)
-- ============================================================

-- 1. Create the table (skip if it already exists)
CREATE TABLE IF NOT EXISTS public.surah_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Canonical slug, e.g. "At-Tawba" — see backend/data/surahMapping.js
  -- (englishNamesToIds) for the exact string per Surah.
  surah_slug TEXT NOT NULL UNIQUE,
  intro      TEXT,
  -- [{ "question": "...", "answer": "..." }, ...]
  faqs       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index on slug for fast lookups (mirrors blogs_slug_idx convention)
CREATE INDEX IF NOT EXISTS surah_content_slug_idx ON public.surah_content (surah_slug);

-- 3. Keep updated_at current on every row edit
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS surah_content_set_updated_at ON public.surah_content;
CREATE TRIGGER surah_content_set_updated_at
  BEFORE UPDATE ON public.surah_content
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.surah_content ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (anon + authenticated) can SELECT — this is public
-- editorial content, not user data.
CREATE POLICY "Public can read surah content"
  ON public.surah_content
  FOR SELECT
  USING (true);

-- ============================================================
-- Seed: At-Tawba (mirrors frontend/src/data/surah-content.js —
-- keep these two in sync until the chatbot's DB copy fully replaces
-- the static file as the single source of truth)
-- ============================================================

INSERT INTO public.surah_content (surah_slug, intro, faqs)
VALUES (
  'At-Tawba',
  'Surah At Tawba means The Repentance. It is the 9th chapter of the Quran and has 129 verses. It was revealed in Medina after the Battle of Tabuk, near the end of the Prophet Muhammad''s ﷺ mission. It is the only Surah in the Quran that does not start with Bismillah Ir Rahman Ir Raheem.

This Surah is also called Al Bara''ah, which means Disassociation. It explains that Muslims are no longer bound by old treaties with the polytheists of Arabia because they broke their promises many times. The Surah also warns strongly against hypocrisy and exposes the hypocrites who lived in Medina.

Surah At Tawba also explains who should receive Zakat in verse 60. It ends with a beautiful description of how caring and kind the Prophet ﷺ was towards the believers, in verses 128 and 129.',
  '[
    {"question": "Why does Surah At Tawba not start with Bismillah?", "answer": "Scholars say this Surah continues the message of Surah Al Anfal. It was revealed as a strong warning to those who broke their agreements, so it does not open with the usual words of mercy."},
    {"question": "What is Surah At Tawba about?", "answer": "It talks about treaties with the polytheists, the hypocrites in Medina, the duty to strive in the way of Allah, and how Zakat should be given."},
    {"question": "When was Surah At Tawba revealed?", "answer": "It was revealed in Medina in the 9th year after Hijrah, after the Battle of Tabuk."},
    {"question": "Why is Surah At Tawba also called Al Bara''ah?", "answer": "Al Bara''ah means Disassociation. It shows that Muslims were free from old treaties with polytheists who broke their word again and again."},
    {"question": "How many verses does Surah At Tawba have?", "answer": "Surah At Tawba has 129 verses."},
    {"question": "What does verse 60 say about Zakat?", "answer": "Verse 60 names eight groups of people who can receive Zakat. These include the poor, the needy, those who collect and manage Zakat, new Muslims whose hearts need strengthening, people who need help to become free, those in debt, those striving for Allah, and travelers who need help."}
  ]'::jsonb
)
ON CONFLICT (surah_slug) DO UPDATE
  SET intro = EXCLUDED.intro,
      faqs  = EXCLUDED.faqs;

-- ============================================================
-- Notes
-- ============================================================
-- Populate the remaining 113 Surahs the same way — one INSERT per Surah,
-- keyed by surah_slug = the canonical slug from backend/data/surahMapping.js.
-- The anon/public key used by the Express backend can only ever SELECT —
-- write access (INSERT/UPDATE/DELETE) requires the Supabase Dashboard
-- Table Editor or the service_role key from a secure admin context.
-- ============================================================
