/**
 * components/seo/SurahSchema.jsx
 *
 * JSON-LD for a single Surah page, emitted as ONE @graph so every node links
 * by @id: Organization, WebSite, WebPage, BreadcrumbList, and — only when
 * FAQs are passed — a FAQPage. Organization / WebSite use the same @id values
 * as the homepage (Home.jsx), which holds their full definitions.
 *
 * Pure presentational: receives data as props, never fetches. Rendered via
 * <Helmet>, so scripts/prerender.js bakes it into each Surah's static HTML.
 *
 * Props:
 *   surah: { number, slug, englishName, englishTranslation, arabicName,
 *            verseCount, revelationType, revelationOrder?, juzStart?, juzEnd? }
 *   faqs:  [{ question, answer }] — plain text, exactly as shown on the page
 *   pageTitle / pageDescription — optional; pass the page's own <title> and
 *            meta description so the WebPage node matches them exactly
 */

import { Helmet } from "react-helmet-async";

const SITE_URL = "https://alquranhub.org";
const WEBSITE_ID = `${SITE_URL}/#website`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// 1 → "1st", 2 → "2nd", 3 → "3rd", 11–13 → "th", 87 → "87th", 112 → "112th"
export function toOrdinal(n) {
  const num = Number(n);
  const lastTwo = num % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
}

// Fallback WebPage description, used only when no pageDescription is passed.
function buildDescription(surah) {
  const {
    number, englishName, englishTranslation, verseCount,
    revelationType, revelationOrder, juzStart, juzEnd,
  } = surah;

  const parts = [
    `Surah ${englishName} (${englishTranslation}) is the ${toOrdinal(number)} surah of the Holy Quran`,
  ];
  if (revelationType) parts.push(`a ${revelationType} surah of ${verseCount} verses`);
  else parts.push(`with ${verseCount} verses`);
  if (revelationOrder) parts.push(`${toOrdinal(revelationOrder)} in the traditional order of revelation`);

  let text = `${parts.join(", ")}.`;
  if (juzStart) {
    text += juzEnd && juzEnd !== juzStart
      ? ` It spans Juz ${juzStart} to ${juzEnd}.`
      : ` It is in Juz ${juzStart}.`;
  }
  return text;
}

export function buildSurahSchema({ surah, faqs = [], pageTitle, pageDescription }) {
  const pageUrl = `${SITE_URL}/surah/${surah.slug}`;
  const ids = {
    webpage: `${pageUrl}#webpage`,
    breadcrumb: `${pageUrl}#breadcrumb`,
    faq: `${pageUrl}#faq`,
  };

  const validFaqs = (faqs || []).filter((f) => f?.question && f?.answer);

  const graph = [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Al-Quran Hub",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: "Al-Quran Hub",
      inLanguage: "en",
      publisher: { "@id": ORGANIZATION_ID },
    },
    {
      "@type": "WebPage",
      "@id": ids.webpage,
      url: pageUrl,
      name: pageTitle || `Surah ${surah.englishName} (${surah.englishTranslation}) – Al-Quran Hub`,
      description: pageDescription || buildDescription(surah),
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORGANIZATION_ID },
      breadcrumb: { "@id": ids.breadcrumb },
    },
    {
      "@type": "BreadcrumbList",
      "@id": ids.breadcrumb,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Surahs", item: `${SITE_URL}/surah` },
        { "@type": "ListItem", position: 3, name: surah.englishName, item: pageUrl },
      ],
    },
  ];

  if (validFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": ids.faq,
      isPartOf: { "@id": ids.webpage },
      inLanguage: "en",
      mainEntity: validFaqs.map((item, index) => ({
        "@type": "Question",
        "@id": `${ids.faq}-question-${index + 1}`,
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default function SurahSchema({ surah, faqs, pageTitle, pageDescription }) {
  if (!surah?.number || !surah?.slug) return null;

  // `<` escaped so FAQ text can never close the <script> tag early.
  const json = JSON.stringify(
    buildSurahSchema({ surah, faqs, pageTitle, pageDescription }),
  ).replace(/</g, "\\u003c");

  return (
    <Helmet encodeSpecialCharacters={false}>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
}
