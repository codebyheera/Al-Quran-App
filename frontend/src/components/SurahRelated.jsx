import { Link } from "react-router-dom";
import "./SurahRelated.css";

export default function SurahRelated({ items = [], title = "Related Surah" }) {
  if (!items.length) return null;

  return (
    <section className="surah-related" aria-label={title}>
      <div className="surah-related__header">
        <h2>{items.length > 1 ? "Related Surahs" : title}</h2>
      </div>
      <div className="surah-related__list">
        {items.map((item) => (
          <Link key={item.slug} to={`/surah/${item.slug}`} className="surah-related__link">
            {item.label}
            <span className="surah-related__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
