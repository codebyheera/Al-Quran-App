/**
 * pages/BlogArchive.jsx — /blog route
 * Responsive card grid with pagination, skeletons, and empty state.
 */

import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import Breadcrumb from '../components/Breadcrumb';
import { BlogCard, SkeletonCard } from '../components/BlogCard';
import { pageSeo } from '../data/pageSeo';
import './BlogArchive.css';

const LIMIT = 9;



/* ── Main Page ────────────────────────────────────────────── */
export default function BlogArchive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

  const [data, setData]       = useState(null); // { blogs, total, totalPages }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchBlogs = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/blogs', { params: { page, limit: LIMIT } })
      .then(({ data: res }) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load blog posts. Please try again.');
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  function goTo(newPage) {
    setSearchParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="blog-archive page-enter">
      <Helmet>
        <title>{pageSeo.blogArchive.title}</title>
        <meta name="description" content={pageSeo.blogArchive.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.blogArchive.path}`} />
      </Helmet>

      {/* ── Hero Banner ───────────────────────────────────── */}
      <div className="blog-hero">
        <div className="blog-hero-bg" />
        <div className="container blog-hero-content">
          <Breadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
          ]} />
          <h1 className="blog-hero-title">Islamic Knowledge <span>Blog</span></h1>
          <p className="blog-hero-sub">
            Every week, we share articles on Surah benefits, Quranic guidance, and 
            practical Islamic knowledge — written to help you build a deeper 
            connection with the words of Allah.
          </p>
        </div>
      </div>

      {/* ── Grid Section ──────────────────────────────────── */}
      <div className="container blog-body">

        {/* Error */}
        {error && (
          <div className="blog-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchBlogs}>Retry</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className="blog-grid">
            {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data?.blogs.length === 0 && (
          <div className="blog-empty">
            <div className="blog-empty-icon">📚</div>
            <h2>No articles yet</h2>
            <p>Check back soon — new content is on its way, in shaa Allah.</p>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && data?.blogs.length > 0 && (
          <>
            <div className="blog-grid">
              {data.blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="blog-pagination">
                <button
                  id="blog-prev-page"
                  className="btn btn-secondary pagination-btn"
                  disabled={page <= 1}
                  onClick={() => goTo(page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  id="blog-next-page"
                  className="btn btn-secondary pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => goTo(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
