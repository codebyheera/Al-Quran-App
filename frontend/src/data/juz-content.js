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

  21: {
    intro: [
      "Juz 21 is the twenty-first of the Quran's thirty parts. It begins near the end of [Surah Al-Ankabut](/surah/Al-Ankaboot), starting from verse 46, and continues through three complete chapters, [Surah Ar-Rum](/surah/Ar-Room), [Surah Luqman](/surah/Luqman), and [Surah As-Sajdah](/surah/As-Sajda), before closing with the opening thirty verses of [Surah Al-Ahzab](/surah/Al-Ahzaab).",
      "This part of the Quran carries a strong theme of patience and trust in Allah. Surah Al-Ankabut speaks about the trials that come with faith, comparing false reliance on anything besides Allah to the fragile web of a spider. Surah Ar-Rum reflects on the signs of Allah in the heavens, the earth, and human relationships, along with its well known prophecy about the Romans. Surah Luqman shares the timeless advice of a wise father to his son, touching on gratitude, humility, and staying firm in worship. Surah As-Sajdah reminds readers of the Day of Judgment and the reward waiting for those who remain patient. The juz then moves into Surah Al-Ahzab, which begins addressing the early Muslim community during a difficult period in Madinah.",
      "Reading Juz 21 gives a clear picture of how faith is tested and strengthened, moving from the struggles of early believers in Makkah to the new challenges faced by the growing Muslim community in Madinah.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 21?",
        answer:
          "Juz 21 covers five surahs. It starts with the final part of Surah Al-Ankabut, from verse 46 to the end, then includes the complete Surah Ar-Rum, Surah Luqman, and Surah As-Sajdah, and closes with the first thirty verses of Surah Al-Ahzab.",
      },
      {
        question: "Where does Juz 21 start and end in the Quran?",
        answer:
          "Juz 21 begins at verse 46 of Surah Al-Ankabut and ends at verse 30 of Surah Al-Ahzab. It sits roughly around page 404 to 405 in most standard Quran editions, though this can shift slightly depending on the print.",
      },
      {
        question: "What is the main theme of Juz 21?",
        answer:
          "Juz 21 focuses on patience, trust in Allah, and the reward that comes after trials. It moves from the struggles of early believers facing rejection in Makkah to the guidance given to the growing Muslim community in Madinah through Surah Al-Ahzab.",
      },
      {
        question: "What is Surah Luqman about in Juz 21?",
        answer:
          "Surah Luqman shares the advice a wise father gave his son, covering gratitude, humility, avoiding arrogance, and staying firm in prayer. It is one of the most quoted surahs for parenting advice rooted in the Quran.",
      },
      {
        question: "Why is Surah Ar-Rum famous in Juz 21?",
        answer:
          "Surah Ar-Rum is known for its prophecy about the Romans, who were defeated but were foretold to win again within a few years, a prediction that came true. The surah also reflects on Allah's signs in nature and human relationships.",
      },
    ],
  },
};

export function getJuzContent(juzNumber) {
  if (!juzNumber) return null;
  return juzContent[juzNumber] || null;
}
