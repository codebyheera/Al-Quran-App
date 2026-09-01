/**
 * data/juz-content.js
 *
 * Unique, hand-written editorial intro content per Juz — used to give each
 * Juz page substantive, non-duplicate text for search indexing (beyond the
 * Arabic verses + toggleable translation).
 *
 * Keyed by the Juz number (1-30), matching the `:id` route param used by
 * `/juz/:id` in pages/JuzView.jsx.
 *
 * Consumed by <SurahIntro> in pages/JuzView.jsx. A Juz with no entry here
 * simply renders no extra content (current behavior is preserved).
 */

export const juzContent = {
  5: {
    intro: [
      "Juz 5 is entirely made up of one surah, Surah An-Nisa, covering verses 24 to 147. It comes right after the events of the Battle of Uhud, and a lot of what is discussed here connects to that difficult period for the early Muslim community in Madinah.",
      "This part of the Quran covers family life in detail. It explains rules about marriage, the rights of orphans, how inheritance should be divided fairly, and the punishment for adultery. It also talks about treating wives with kindness and warns against following personal desires instead of what is fair and right.",
      "Alongside family matters, Juz 5 also speaks about faith itself. It reminds people to be honest and just even when judging against their own relatives, and it addresses the relationship between Muslims and the People of the Book, urging Muslims not to repeat the mistakes of those before them who twisted their own religion. Toward the end, it also touches on the hypocrites, people who claimed to believe but were not sincere in their hearts, and how their behavior should be recognized. You can read more Juz and explore the complete [Quran online free](/) on Al Quran Hub.",
    ],
    faqs: [
      {
        question: "Which surah and verses does Juz 5 cover?",
        answer:
          "Juz 5 covers Surah An-Nisa from verse 24 to verse 147. It is one of the few Juz sections made up entirely from a single surah.",
      },
      {
        question: "What time period does Juz 5 relate to?",
        answer:
          "This part of the Quran was revealed shortly after the Battle of Uhud, a difficult time for the early Muslim community in Madinah, and many of its rulings connect to the aftermath of that event.",
      },
      {
        question: "What family related topics are discussed in Juz 5?",
        answer:
          "Juz 5 covers rules on marriage, the rights of orphans, fair division of inheritance, the punishment for adultery, and guidance on treating wives with kindness and justice.",
      },
      {
        question: "What does Juz 5 say about the People of the Book?",
        answer:
          "It addresses the relationship between Muslims and the People of the Book, warning Muslims not to repeat the same mistakes of dividing their faith and moving away from the original teachings of their prophets.",
      },
      {
        question: "Who are the hypocrites mentioned in Juz 5?",
        answer:
          "Juz 5 describes people who outwardly claimed to believe but were not sincere in their hearts, and it explains how their behavior and intentions could be recognized by the believers.",
      },
    ],
  },
};

export function getJuzContent(juzNumber) {
  if (!juzNumber) return null;
  return juzContent[juzNumber] || null;
}
