/**
 * routes/blogRoutes.js — Blog endpoints (ESM)
 * GET /api/blogs          — paginated published blogs
 * GET /api/blogs/:slug    — single published blog by slug
 */

import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/blogs
 * Query params: ?page=1&limit=10
 * Returns { blogs, total, page, limit, totalPages }
 */
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data: blogs, error, count } = await supabase
      .from('blogs')
      .select(
        'id, title, slug, excerpt, cover_image, category, tags, author, created_at',
        { count: 'exact' }
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      blogs:      blogs || [],
      total:      count  || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Blog list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch blogs.' });
  }
});

/**
 * GET /api/blogs/:slug
 * Returns the full blog post or 404
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    res.json(blog);
  } catch (err) {
    console.error('Blog fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch blog post.' });
  }
});

export default router;
