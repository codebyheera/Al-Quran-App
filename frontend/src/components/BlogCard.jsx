import { Link } from 'react-router-dom';
import './BlogCard.css';

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export const CATEGORY_GRADIENTS = {
  Tafsir:      'linear-gradient(135deg, #1a1a3e 0%, #3d2a6e 100%)',
  Hadith:      'linear-gradient(135deg, #0a2018 0%, #1a5c3a 100%)',
  Fiqh:        'linear-gradient(135deg, #1a2a0a 0%, #3a5c1a 100%)',
  Seerah:      'linear-gradient(135deg, #2a1a0a 0%, #6e4a1a 100%)',
  Spirituality:'linear-gradient(135deg, #1a0a2a 0%, #4a1a6e 100%)',
  default:     'linear-gradient(135deg, #0f0f1a 0%, #1a2a4a 100%)',
};

export function categoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;
}

export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || url.includes('/upload/f_auto')) return url;
  // Automatically serve WebP/AVIF, compress quality, and scale down width for cards
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
}

export function SkeletonCard() {
  return (
    <div className="blog-card skeleton-card" aria-hidden="true">
      <div className="blog-card-img skeleton-block" />
      <div className="blog-card-body">
        <div className="skeleton-block sk-badge" />
        <div className="skeleton-block sk-title" />
        <div className="skeleton-block sk-excerpt" />
        <div className="skeleton-block sk-excerpt short" />
        <div className="skeleton-block sk-date" />
      </div>
    </div>
  );
}

export function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.slug}`} className="blog-card" aria-label={blog.title}>
      {/* Cover */}
      <div
        className="blog-card-img"
        style={
          blog.cover_image
            ? { backgroundImage: `url(${optimizeCloudinaryUrl(blog.cover_image)})` }
            : { background: categoryGradient(blog.category) }
        }
      >
        {!blog.cover_image && (
          <span className="blog-card-img-icon">📖</span>
        )}
        {blog.category && (
          <span className="blog-card-category">{blog.category}</span>
        )}
      </div>

      {/* Body */}
      <div className="blog-card-body">
        <h2 className="blog-card-title">{blog.title}</h2>
        {blog.excerpt && (
          <p className="blog-card-excerpt">{blog.excerpt}</p>
        )}
        <div className="blog-card-meta">
          {blog.author && <span className="blog-card-author">by {blog.author}</span>}
          <span className="blog-card-date">{formatDate(blog.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
