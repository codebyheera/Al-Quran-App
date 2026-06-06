import { useState } from "react";
import "./SurahFaqSection.css";

export default function SurahFaqSection({
  title = "Frequently Asked Questions",
  items = [],
  surahName,
}) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items.length) return null;

  function toggleItem(index) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section
      className="surah-faq"
      aria-label={surahName ? `${surahName} frequently asked questions` : title}
    >
      <div className="surah-faq__header">
        <h2>{title}</h2>
        {surahName ? (
          <p className="surah-faq__subtitle">
          </p>
        ) : null}
      </div>

      <div className="surah-faq__list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `surah-faq-panel-${index}`;
          const buttonId = `surah-faq-button-${index}`;

          return (
            <article
              key={`${item.question}-${index}`}
              className={`surah-faq__item ${isOpen ? "is-open" : ""}`}
            >
              <h3 className="surah-faq__question">
                <button
                  id={buttonId}
                  type="button"
                  className="surah-faq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(index)}
                >
                  <span className="surah-faq__qmark">Q.</span>
                  <span className="surah-faq__question-text">{item.question}</span>
                  <span className="surah-faq__icon" aria-hidden="true">
                    {isOpen ? "-" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                className="surah-faq__answer-wrap"
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
              >
                <p className="surah-faq__answer">{item.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
