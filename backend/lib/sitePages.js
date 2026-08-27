/**
 * lib/sitePages.js — Canonical list of the site's own real pages (ESM)
 *
 * Single source of truth shared by:
 *   - server.js's /sitemap.xml route (SEO — crawlable pages only)
 *   - routes/chat.js (the chatbot's "known site pages" context, so it can
 *     accurately mention or point to real URLs instead of guessing)
 *
 * Keep this in sync with frontend/src/App.jsx's <Route> list — it was
 * previously hand-duplicated inside server.js's sitemap route and had
 * drifted (it listed /quran and /about, neither of which are real routes);
 * consolidating here fixes that.
 */

import { supabase } from './supabase.js';

const BASE_URL = 'https://alquranhub.org';

export const PRAYER_CITY_SLUGS = [
  'lahore', 'karachi', 'islamabad', 'faisalabad', 'rawalpindi',
  'multan', 'peshawar', 'gujranwala', 'sialkot', 'quetta',
];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Pages with a fixed path — includes a couple (search, bookmarks) that are
// left out of the public XML sitemap (personal/empty-by-default for a
// crawler) but are still useful for the chatbot to know about.
const STATIC_PAGES = [
  { path: '/', label: 'Homepage', crawlable: true, changefreq: 'daily', priority: '1.0' },
  { path: '/surah', label: 'Browse all Surahs', crawlable: true, changefreq: 'monthly', priority: '0.9' },
  { path: '/juz', label: 'Browse all Juz (Para)', crawlable: true, changefreq: 'monthly', priority: '0.85' },
  { path: '/tasbih', label: 'Tasbih Counter', crawlable: true, changefreq: 'monthly', priority: '0.8' },
  { path: '/durood-sharif', label: 'Durood Sharif', crawlable: true, changefreq: 'monthly', priority: '0.8' },
  { path: '/prayer-times', label: 'Prayer Times', crawlable: true, changefreq: 'daily', priority: '0.9' },
  { path: '/blog', label: 'Blog', crawlable: true, changefreq: 'weekly', priority: '0.8' },
  { path: '/support', label: 'Support / Donate', crawlable: true, changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', label: 'Contact', crawlable: true, changefreq: 'monthly', priority: '0.5' },
  { path: '/search', label: 'Search the Quran', crawlable: false },
  { path: '/bookmarks', label: 'Your bookmarked verses', crawlable: false },
  ...PRAYER_CITY_SLUGS.map((slug) => ({
    path: `/prayer-times/${slug}`,
    label: `Prayer Times in ${capitalize(slug)}`,
    crawlable: true,
    changefreq: 'daily',
    priority: '0.85',
  })),
];

/**
 * @returns {Promise<Array<{ path, loc, label, crawlable, changefreq?, priority?, lastmod? }>>}
 */
export async function getSitePages() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('slug, title, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const blogPages = (error || !blogs ? [] : blogs).map((b) => ({
    path: `/blog/${b.slug}`,
    label: b.title || b.slug,
    crawlable: true,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: b.created_at ? b.created_at.slice(0, 10) : undefined,
  }));

  return [...STATIC_PAGES, ...blogPages].map((p) => ({ ...p, loc: `${BASE_URL}${p.path}` }));
}
