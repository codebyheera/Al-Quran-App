/**
 * components/SurahIntro.jsx
 *
 * Reusable wrapper that adds unique, indexable editorial content to a Surah
 * page: intro paragraphs ABOVE the Arabic verses, and an FAQ accordion BELOW
 * them (verses are passed in as `children` and rendered between the two).
 *
 * Also injects FAQPage JSON-LD from the `faqs` prop for content-understanding
 * purposes (Google retired the visible FAQ rich-snippet dropdown in May 2026 —
 * this is valid structured markup, not a bid for that UI).
 *
 * If a Surah has no `intro`/`faqs` content yet, renders only `children` —
 * i.e. current behavior, unchanged.
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import SurahFaqSection from "./SurahFaqSection";
import "./SurahIntro.css";

// Content strings may embed a link as `[anchor text](/path)` — used for
// internal links (e.g. back to the homepage) with keyword-chosen anchor
// text baked right into the editorial copy in surah-content.js.
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function stripLinks(text) {
  return String(text || "").replace(LINK_PATTERN, "$1");
}

function renderWithLinks(text) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    nodes.push(
      href.startsWith("/") ? (
        <Link key={key++} to={href} className="surah-intro__link">
          {label}
        </Link>
      ) : (
        <a
          key={key++}
          href={href}
          className="surah-intro__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ),
    );
    lastIndex = LINK_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function buildFaqSchema(faqs, pageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { "@id": `${pageUrl}#surah-intro-faq` } : {}),
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: stripLinks(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripLinks(item.answer),
      },
    })),
  };
}

export default function SurahIntro({
  intro = [],
  faqs = [],
  surahName,
  pageUrl,
  children,
}) {
  const hasIntro = Array.isArray(intro) && intro.length > 0;
  const hasFaqs = Array.isArray(faqs) && faqs.length > 0;

  if (!hasIntro && !hasFaqs) {
    return <>{children}</>;
  }

  return (
    <>
      {hasFaqs && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(buildFaqSchema(faqs, pageUrl))}
          </script>
        </Helmet>
      )}

      {hasIntro && (
        <section
          className="surah-intro"
          aria-label={surahName ? `About ${surahName}` : "About this Surah"}
        >
          {intro.map((paragraph, index) => (
            <p key={index} className="surah-intro__para">
              {renderWithLinks(paragraph)}
            </p>
          ))}
        </section>
      )}

      {children}

      {hasFaqs && (
        <SurahFaqSection
          title="Frequently Asked Questions"
          surahName={surahName}
          items={faqs.map((item) => ({
            question: stripLinks(item.question),
            answer: renderWithLinks(item.answer),
          }))}
        />
      )}
    </>
  );
}
