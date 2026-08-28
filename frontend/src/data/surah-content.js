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

  "Ar-Ra'd": {
    intro: [
      "Surah Ar-Ra'd (The Thunder) is the 13th chapter of the Quran, revealed in Makkah before the Prophet Muhammad (peace be upon him) migrated to Madinah. Its name comes from a powerful moment in the surah where thunder itself is described as glorifying and praising Allah, along with the angels who stand in awe of Him. This chapter takes its readers through the wonders of the natural world — the sky held up without visible pillars, the sun and moon moving in perfect order, rivers flowing, and different plants growing side by side from the same soil yet tasting completely different. Each of these is presented as a quiet sign for anyone willing to reflect. You can explore the [full Quran with translation and audio](/) on Al-Quran Hub.",
      "Beyond nature, Surah Ar-Ra'd carries one of the most quoted verses in the Quran, Ayah 11, which reminds us that Allah does not change the condition of a people until they change what is within themselves. It is a verse often turned to for motivation and self-reflection. Later, Ayah 28 offers a different kind of comfort, teaching that hearts find true peace only through the remembrance of Allah. Together, these themes make Ar-Ra'd a chapter about looking outward at creation and inward at the heart — and finding the same truth in both.",
    ],
    faqs: [
      {
        question: "What does Surah Ar-Ra'd mean?",
        answer:
          "Surah Ar-Ra'd means \"The Thunder\" in English. The surah gets its name from a verse that describes thunder praising and glorifying Allah, along with the angels who are in awe of Him.",
      },
      {
        question: "How many verses are in Surah Ar-Ra'd?",
        answer:
          "Surah Ar-Ra'd has 43 verses (ayahs) and is the 13th chapter of the Quran.",
      },
      {
        question: "Is Surah Ar-Ra'd a Makki or Madani surah?",
        answer:
          "Surah Ar-Ra'd is a Makki surah, meaning it was revealed in Makkah before the Prophet Muhammad (peace be upon him) migrated to Madinah.",
      },
      {
        question: "Which Juz is Surah Ar-Ra'd in?",
        answer: "Surah Ar-Ra'd falls in Juz 13 of the Quran.",
      },
      {
        question: "What is the main message of Surah Ar-Ra'd?",
        answer:
          "The surah reflects on the signs of Allah's power found in nature such as the sky, the sun, the moon, and the earth, and connects them to the peace that comes from remembering Allah, as mentioned in Ayah 28.",
      },
      {
        question: "What is special about Ayah 11 of Surah Ar-Ra'd?",
        answer:
          "Ayah 11 is one of the most well-known verses in the Quran. It teaches that Allah does not change the condition of a people until they change what is within themselves, making it a popular verse for reflection and self-improvement.",
      },
    ],
  },

  "Al-Hadid": {
    intro: [
      "Surah Al-Hadid (The Iron) is the 57th chapter of the Quran, revealed in Madinah. It falls in Juz 27 and contains 29 verses. The surah opens by describing how everything in the heavens and the earth glorifies Allah, setting the tone for a chapter about faith, sacrifice, and true wealth. Its name comes from Ayah 25, where iron is mentioned as something Allah sent down with great strength, benefiting people both as a tool and as a symbol of firmness. You can [explore more of the Quran with translation and audio](/) on Al-Quran Hub.",
      "Surah Al-Hadid encourages believers to spend in the way of Allah and reminds them that this worldly life is temporary, compared to a passing rain that brings green growth before it withers away. It also speaks about light being given to the believers on the Day of Judgment, guiding them forward, while highlighting the difference between sincere faith and mere words. Together, these themes make Al-Hadid a chapter about strength, both physical and spiritual, and the lasting reward that comes from true belief.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Hadid mean?",
        answer:
          "Surah Al-Hadid means \"The Iron\" in English. It gets its name from Ayah 25, which mentions iron as something sent down by Allah with great strength and benefit for people.",
      },
      {
        question: "How many verses are in Surah Al-Hadid?",
        answer:
          "Surah Al-Hadid has 29 verses and is the 57th chapter of the Quran.",
      },
      {
        question: "Is Surah Al-Hadid a Makki or Madani surah?",
        answer:
          "Surah Al-Hadid is a Madani surah, meaning it was revealed in Madinah after the Prophet Muhammad's (peace be upon him) migration.",
      },
      {
        question: "Which Juz is Surah Al-Hadid in?",
        answer: "Surah Al-Hadid falls in Juz 27 of the Quran.",
      },
      {
        question: "What is the main message of Surah Al-Hadid?",
        answer:
          "The surah focuses on spending in the way of Allah, the temporary nature of worldly life, and the light given to true believers on the Day of Judgment.",
      },
      {
        question: "Why is iron mentioned in Surah Al-Hadid?",
        answer:
          "Iron is mentioned in Ayah 25 as a blessing from Allah, symbolizing both physical strength and the firmness needed to stand for justice.",
      },
    ],
  },

  "Al-Kahf": {
    intro: [
      "Surah Al-Kahf, meaning \"The Cave,\" is the 18th chapter of the Quran and one of the most beloved surahs among Muslims worldwide. Revealed in Makkah, it contains 110 verses and tells four remarkable stories that carry deep lessons for daily life. The most famous of these is the story of the People of the Cave, a group of young believers who took refuge from a tyrant king and were protected by Allah for over 300 years.",
      "Muslims are strongly encouraged to recite Surah Al-Kahf every Friday. According to authentic hadith, reciting it brings light between the two Fridays and offers protection from the trials of Dajjal, the false messiah who will appear before the Day of Judgment. The surah also covers the stories of two men with gardens, Musa and Khidr, and Dhul Qarnayn, each teaching valuable lessons about faith, humility, and the true nature of worldly life.",
      "Below, you can read the complete text of Surah Al-Kahf with Arabic script and full translation. Listen to the recitation, bookmark your favorite verses, and reflect on the timeless wisdom this surah offers.",
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
