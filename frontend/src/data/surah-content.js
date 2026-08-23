/**
 * data/surah-content.js
 *
 * Unique, hand-written editorial content per Surah — intro paragraphs and an
 * FAQ set — used to give each Surah page substantive, non-duplicate text for
 * search indexing (beyond the Arabic verses + toggleable translation).
 *
 * Keyed by the Surah's canonical slug, i.e. the exact string returned as
 * `surah.surahName` by the API / preloaded data (same value used for
 * prevSurahSlug/nextSurahSlug and the /surah/:slug route — see
 * backend/data/surahMapping.js `englishNamesToIds`).
 *
 * Consumed by <SurahIntro> in pages/SurahView.jsx. A Surah with no entry
 * here simply renders no extra content (current behavior is preserved).
 */

export const surahContent = {
  "At-Tawba": {
    intro: [
      "Surah At Tawba means The Repentance. It is the 9th chapter of the Quran and has 129 verses. It was revealed in Medina after the Battle of Tabuk, near the end of the Prophet Muhammad's ﷺ mission. It is the only Surah in the Quran that does not start with Bismillah Ir Rahman Ir Raheem.",
      "This Surah is also called Al Bara'ah, which means Disassociation. It explains that Muslims are no longer bound by old treaties with the polytheists of Arabia because they broke their promises many times. The Surah also warns strongly against hypocrisy and exposes the hypocrites who lived in Medina.",
      "Surah At Tawba also explains who should receive Zakat in verse 60. It ends with a beautiful description of how caring and kind the Prophet ﷺ was towards the believers, in verses 128 and 129. You can read more Surahs and explore the complete [Quran online free](/) on Al Quran Hub.",
    ],
    faqs: [
      {
        question: "Why does Surah At Tawba not start with Bismillah?",
        answer:
          "Scholars say this Surah continues the message of Surah Al Anfal. It was revealed as a strong warning to those who broke their agreements, so it does not open with the usual words of mercy.",
      },
      {
        question: "What is Surah At Tawba about?",
        answer:
          "It talks about treaties with the polytheists, the hypocrites in Medina, the duty to strive in the way of Allah, and how Zakat should be given.",
      },
      {
        question: "When was Surah At Tawba revealed?",
        answer:
          "It was revealed in Medina in the 9th year after Hijrah, after the Battle of Tabuk.",
      },
      {
        question: "Why is Surah At Tawba also called Al Bara'ah?",
        answer:
          "Al Bara'ah means Disassociation. It shows that Muslims were free from old treaties with polytheists who broke their word again and again.",
      },
      {
        question: "How many verses does Surah At Tawba have?",
        answer: "Surah At Tawba has 129 verses.",
      },
      {
        question: "What does verse 60 say about Zakat?",
        answer:
          "Verse 60 names eight groups of people who can receive Zakat. These include the poor, the needy, those who collect and manage Zakat, new Muslims whose hearts need strengthening, people who need help to become free, those in debt, those striving for Allah, and travelers who need help.",
      },
    ],
  },

  // TODO: add remaining 113 Surahs here, one at a time.
  // Copy the At-Tawba shape above — key = surah.surahName slug (see
  // backend/data/surahMapping.js englishNamesToIds for the exact string),
  // `intro`: 2-3 paragraph strings, `faqs`: array of { question, answer }.
};

export function getSurahContent(slug) {
  if (!slug) return null;
  return surahContent[slug] || null;
}
