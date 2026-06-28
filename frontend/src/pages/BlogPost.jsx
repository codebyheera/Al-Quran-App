/**
 * pages/BlogPost.jsx — /blog/:slug route
 * Full article view with breadcrumb, meta, HTML content, tags, JSON-LD.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import Breadcrumb from '../components/Breadcrumb';
import './BlogPost.css';

/* ── Helpers ──────────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** Estimate reading time (words / 200 wpm) */
function readTime(htmlContent) {
  if (!htmlContent) return 1;
  const text  = htmlContent.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function extractTocAndInjectIds(htmlContent) {
  if (!htmlContent) return { html: '', toc: [], faqs: [] };
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');
  const toc = [];
  const faqs = [];

  headings.forEach((heading, index) => {
    const text = heading.textContent || '';
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `h-${index}`;
    heading.id = id;
    toc.push({ id, text, level: parseInt(heading.tagName[1], 10) });

    if (heading.tagName.toLowerCase() === 'h3' && text.trim().startsWith('Q:')) {
      const question = text.replace(/^Q:\s*/, '').trim();
      let nextEl = heading.nextElementSibling;
      while (nextEl && nextEl.tagName.toLowerCase() !== 'p' && !['h2', 'h3'].includes(nextEl.tagName.toLowerCase())) {
        nextEl = nextEl.nextElementSibling;
      }
      if (nextEl && nextEl.tagName.toLowerCase() === 'p') {
        faqs.push({
          question,
          answer: nextEl.textContent.trim()
        });
      }
    }
  });

  return { html: doc.body.innerHTML, toc, faqs };
}

/* ── Skeleton ─────────────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div className="blog-post page-enter" aria-hidden="true">
      <div className="container post-container">
        <div className="skeleton-block sk-breadcrumb" />
        <div className="skeleton-block sk-badge" style={{ marginTop: '2rem' }} />
        <div className="skeleton-block sk-h1" style={{ marginTop: '1rem' }} />
        <div className="skeleton-block sk-h1 short" />
        <div className="skeleton-block sk-meta" style={{ marginTop: '1rem' }} />
        <div className="skeleton-block sk-cover" style={{ marginTop: '2rem' }} />
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`skeleton-block sk-line ${i % 4 === 3 ? 'short' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Hardcoded Author Card ────────────────────────────────── */
function AuthorCard() {
  return (
    <div className="author-card">
      <img
        className="author-avatar"
        src="https://avatars.githubusercontent.com/codebyheera"
        alt="Muhammad Subhan"
        width={64}
        height={64}
        loading="lazy"
      />
      <div className="author-info">
        <div className="author-name">Muhammad Subhan Naeem</div>
        <div className="author-role">Founder, Al-Quran Hub</div>
        <p className="author-bio">
          Full-stack developer &amp; founder of Al-Quran Hub — a free, ad-free Quran platform built for the global Muslim Ummah.
        </p>
        <p className="author-bio-sub">
          Mern stack developer, Building technology that serves real people.
        </p>
        <div className="author-socials">
          {/* GitHub */}
          <a href="https://github.com/codebyheera" target="_blank" rel="noopener noreferrer"
            className="author-social-btn" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
            </svg>
            GitHub
          </a>
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/in/codebysubhan/" target="_blank" rel="noopener noreferrer"
            className="author-social-btn" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            LinkedIn
          </a>
          {/* Medium */}
          <a href="https://medium.com/@muhammadsubhan189345" target="_blank" rel="noopener noreferrer"
            className="author-social-btn" aria-label="Medium">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
            Medium
          </a>
          {/* About.me */}
          <a href="https://about.me/muhammadsubhannaeem" target="_blank" rel="noopener noreferrer"
            className="author-social-btn" aria-label="About.me">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            About.me
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function BlogPost() {
  const { slug }            = useParams();
  const [blog, setBlog]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setBlog(null);

    api.get(`/api/blogs/${slug}`)
      .then(({ data }) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug]);

  const { html: parsedHtml, toc, faqs } = useMemo(() => {
    return extractTocAndInjectIds(blog?.content);
  }, [blog?.content]);

  /* ── Loading ── */
  if (loading) return <PostSkeleton />;

  /* ── 404 ── */
  if (notFound || !blog) {
    return (
      <div className="blog-post page-enter">
        <Helmet>
          <title>Article Not Found | Al-Quran Hub Blog</title>
        </Helmet>
        <div className="container post-container post-404">
          <div className="post-404-icon">📭</div>
          <h1>Article Not Found</h1>
          <p>This article doesn't exist or hasn't been published yet.</p>
          <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  /* ── JSON-LD Article Schema ── */
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'Article',
    headline:   blog.meta_title   || blog.title,
    description: blog.meta_description || blog.excerpt,
    author: {
      '@type': 'Person',
      name: blog.author || 'Al-Quran Hub',
    },
    publisher: {
      '@type': 'Organization',
      name:    'Al-Quran Hub',
      url:     'https://alquranhub.org',
    },
    datePublished: blog.created_at,
    image:         blog.cover_image || undefined,
    url:           `https://alquranhub.org/blog/${blog.slug}`,
  });

  /* ── FAQ JSON-LD Schema ── */
  let faqJsonLd = null;
  if (faqs && faqs.length > 0) {
    faqJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  const rt = readTime(blog.content);

  return (
    <div className="blog-post page-enter">
      <Helmet>
        <title>{blog.meta_title || blog.title} | Al-Quran Hub Blog</title>
        <meta name="description" content={blog.meta_description || blog.excerpt} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://alquranhub.org/blog/${blog.slug}`} />

        {/* Open Graph */}
        <meta property="og:type"        content="article" />
        <meta property="og:title"       content={blog.meta_title || blog.title} />
        <meta property="og:description" content={blog.meta_description || blog.excerpt} />
        <meta property="og:url"         content={`https://alquranhub.org/blog/${blog.slug}`} />
        {blog.cover_image && (
          <meta property="og:image" content={blog.cover_image} />
        )}
        <meta property="article:published_time" content={blog.created_at} />
        {blog.author && (
          <meta property="article:author" content={blog.author} />
        )}
        {(blog.tags || []).map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* JSON-LD */}
        <script type="application/ld+json">{jsonLd}</script>
        {faqJsonLd && (
          <script type="application/ld+json">{faqJsonLd}</script>
        )}
      </Helmet>

      <div className="container post-container">
        {/* ── Breadcrumb ── */}
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: blog.title, href: `/blog/${blog.slug}` },
        ]} />

        {/* ── Category badge ── */}
        {blog.category && (
          <div className="post-category-badge">{blog.category}</div>
        )}

        {/* ── Title ── */}
        <h1 className="post-title">{blog.title}</h1>

        {/* ── Author / Date / Read time ── */}
        <div className="post-meta">
          {blog.author && (
            <span className="post-meta-author">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
              </svg>
              {blog.author}
            </span>
          )}
          <span className="post-meta-date">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
            </svg>
            {formatDate(blog.created_at)}
          </span>
          <span className="post-meta-readtime">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            {rt} min read
          </span>
        </div>

        {/* ── Cover Image ── */}
        {blog.cover_image && (
          <div className="post-cover">
            <img src={blog.cover_image} alt={blog.title} loading="lazy" />
          </div>
        )}

        {/* ── Table of Contents ── */}
        {toc && toc.length > 0 && (
          <div className="post-toc">
            <h3 className="post-toc-title">Table of Contents</h3>
            <ul className="post-toc-list">
              {toc.map((item) => (
                <li key={item.id} className={`post-toc-item toc-level-${item.level}`}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── HTML Content ── */}
        {parsedHtml && (
          <article
            className="post-content"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        )}

        {/* ── Tags ── */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="post-tags">
            <span className="post-tags-label">Tags:</span>
            {blog.tags.map((tag) => (
              <span key={tag} className="post-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* ── Author Card ── */}
        <AuthorCard />

        {/* ── CTA Banner ── */}
        <div className="post-cta-banner">
          <div className="post-cta-banner-inner">
            <div className="post-cta-banner-left">
              <span className="post-cta-banner-label">★ Free & Non-Profit</span>
              <h3 className="post-cta-banner-title">Read the Quran on Al-Quran Hub</h3>
              <p className="post-cta-banner-desc">
                All 114 Surahs · Arabic text · English &amp; Urdu translations · Authentic recitations.
                Completely free, no ads, no sign-up.
              </p>
            </div>
            <Link to="/" id="post-cta-btn" className="post-cta-banner-btn">
              Read Quran Now
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
