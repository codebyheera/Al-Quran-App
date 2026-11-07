/**
 * components/SearchSuggestions.jsx — Instant Surah / Ayah / Juz results from
 * lib/searchEngine.js. Shared by the homepage search dropdown and /search.
 *
 * Keyboard focus stays in the search input; the parent tracks `activeIndex`
 * (↑/↓) and the list is linked to it with aria-activedescendant.
 */

import { Link } from 'react-router-dom';
import './SearchSuggestions.css';

function itemText(item) {
  if (item.type === 'ayah') {
    return {
      badge: `${item.surah.number}:${item.ayah}`,
      title: item.label || `${item.surah.englishName}, Ayah ${item.ayah}`,
      meta: item.label ? `${item.surah.englishName} ${item.surah.number}:${item.ayah}` : `Go to Ayah ${item.ayah} of ${item.surah.versesCount}`,
      arabic: item.surah.name,
    };
  }
  if (item.type === 'juz') {
    return { badge: `J${item.juz}`, title: `Juz ${item.juz}`, meta: `Para ${item.juz}`, arabic: null };
  }
  const s = item.surah;
  return {
    badge: String(s.number),
    title: s.englishName,
    meta: `${s.nameTranslation} · ${s.versesCount} verses · ${s.revelation}`,
    arabic: s.name,
  };
}

export default function SearchSuggestions({ id, items, didYouMean, activeIndex = -1, onPick }) {
  if (!items.length) return null;
  return (
    <div className="ss-list">
      {didYouMean && (
        <div className="ss-dym">
          Did you mean&nbsp;
          <Link to={didYouMean.url} className="ss-dym-link" onClick={onPick}>
            Surah {didYouMean.surah.englishName}
          </Link>
          ?
        </div>
      )}
      <ul id={id} role="listbox" aria-label="Search suggestions" className="ss-items">
        {items.map((item, i) => {
          const t = itemText(item);
          return (
            <li key={item.key} id={`${id}-${i}`} role="option" aria-selected={i === activeIndex}>
              <Link
                to={item.url}
                className={`ss-item${i === activeIndex ? ' is-active' : ''}`}
                onClick={onPick}
                tabIndex={-1}
              >
                <span className={`ss-badge ss-badge--${item.type}`}>{t.badge}</span>
                <span className="ss-main">
                  <span className="ss-title">{t.title}</span>
                  <span className="ss-meta">{t.meta}</span>
                </span>
                {t.arabic && <span className="ss-arabic arabic" lang="ar" dir="rtl">{t.arabic}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Keyboard handling for an input that drives SearchSuggestions.
 * Returns true when the key was handled.
 */
export function moveActive(e, count, activeIndex, setActiveIndex) {
  if (!count) return false;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActiveIndex((activeIndex + 1) % count);
    return true;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActiveIndex(activeIndex <= 0 ? count - 1 : activeIndex - 1);
    return true;
  }
  return false;
}
