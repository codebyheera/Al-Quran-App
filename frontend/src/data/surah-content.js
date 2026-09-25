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

  "Yaseen": {
    intro: [
      "Surah Yaseen is the 36th chapter of the Quran and one of the most frequently recited surahs among Muslims. Revealed in Makkah, it contains 83 verses and is often called the \"heart of the Quran\" because of its powerful message about faith, resurrection, and the signs of Allah's mercy.",
      "Many Muslims recite Surah Yaseen regularly, especially in the morning or evening, and it holds special importance when recited for the sick or for those who have passed away. If you want to explore its rewards in more depth, you can read about the [benefits of reciting Surah Yaseen](/blog/surah-yaseen-benefits) on Al-Quran Hub. The surah reminds readers of the Day of Judgment, tells the story of the messengers sent to a disbelieving town, and reflects deeply on the wonders of creation, from the sun and moon to the cycle of life itself.",
      "Below, you can read the full text of Surah Yaseen with Arabic script and English translation. Listen to the recitation, bookmark the verses that move you, and reflect on the deep wisdom this surah carries.",
    ],
  },

  "Az-Zukhruf": {
    intro: [
      "Surah Az-Zukhruf is the 43rd surah of the Quran, revealed in Makkah, and it has 89 verses. The name \"Zukhruf\" means gold or worldly decoration, and it comes from a part of the surah where the disbelievers of Makkah are corrected for thinking that wealth and material comfort are signs of Allah's approval. The surah explains again and again that the glitter of this world does not last, and true success is only in the Hereafter.",
      "The surah also talks about Prophet Ibrahim (AS) inviting his people to worship one God, the story of Prophet Musa (AS) and Firaun, and a mention of Prophet Isa (AS). Through these stories, it shows that every prophet, in every era, brought the same core message. Near the end, the surah describes the Day of Judgment and reminds people that those who get lost in the shine of this world while forgetting the Hereafter will face the consequences of that choice. You can explore the [full Quran with translation and audio](/) on Al-Quran Hub.",
      "Below, you can read the complete text of Surah Az-Zukhruf with Arabic script and English translation. Listen to the recitation, bookmark the verses that move you, and reflect on the timeless wisdom this surah carries.",
    ],
  },

  "Al-Jaathiya": {
    intro: [
      "One day, every person will stand in front of Allah, and this is the main picture that Surah Al-Jathiya shows us. The surah gets its name from verse 28, where it describes the Day of Judgment, when every nation will be seen kneeling down, waiting to be questioned about what they did in this world. This is the 45th surah of the Quran, revealed in Makkah, and it has 37 verses.",
      "Most of the surah talks about the signs of Allah that are all around us, in the sky, the earth, the change between night and day, and even in our own bodies, asking why people still turn away when the proof is so clear. It also gives a strong warning to people who follow their own desires like a god, choosing what feels good instead of what is right. The surah ends by reminding us that all power and praise belong to Allah alone, in this world and in the next, and that nothing is hidden from His knowledge or His judgment. You can explore the [full Quran with translation and audio](/) on Al-Quran Hub.",
      "Below, you can read the complete text of Surah Al-Jathiya with Arabic script and English translation. Listen to the recitation, bookmark the verses that move you, and reflect on the timeless wisdom this surah carries.",
    ],
    faqs: [
      {
        question: "Where was Surah Al-Jathiya revealed and how many verses does it have?",
        answer:
          "Surah Al-Jathiya is a Makkan surah, meaning it was revealed in Makkah. It has 37 verses in total and is the 45th surah of the Quran.",
      },
      {
        question: "What does the name \"Al-Jathiya\" mean?",
        answer:
          "Al-Jathiya means \"kneeling down.\" It comes from verse 28, which describes how every nation will be seen kneeling on the Day of Judgment while waiting to be questioned about their deeds.",
      },
      {
        question: "What is the main theme of Surah Al-Jathiya?",
        answer:
          "The surah points to the many signs of Allah found in creation, like the sky, the earth, and the human body, and asks why people still deny the truth despite such clear proof.",
      },
      {
        question: "What warning does this surah give about desires?",
        answer:
          "The surah warns against following one's own desires as if they were a god, choosing what feels good over what is actually right, and explains that this kind of thinking leads a person away from guidance.",
      },
      {
        question: "How does Surah Al-Jathiya end?",
        answer:
          "The surah ends by reminding readers that all power and praise belong to Allah alone, both in this life and the next, and that nothing is ever hidden from His knowledge or judgment.",
      },
    ],
  },

  "Al-Ahqaf": {
    intro: [
      "Surah Al-Ahqaf is the 46th surah of the Quran, revealed in Makkah, and it has 35 verses. The name \"Al-Ahqaf\" refers to the sand dunes, a place where the people of Aad used to live, and their story is mentioned in this surah as a warning to those who reject the truth. The surah opens by talking about the creation of the heavens and the earth, and it questions the disbelievers on what proof they have for worshipping anything besides Allah.",
      "A major part of the surah addresses the disbelievers of Makkah directly, reminding them of earlier nations who were destroyed because they denied their prophets, especially the people of Aad who were known for their strength and pride but were still punished for their rejection. The surah also mentions a group of jinn who listened to the Quran and believed in it, showing that guidance reaches those who are willing to listen with an open heart. Toward the end, it advises patience, the same patience shown by the earlier messengers, and reminds that the Day of Judgment will come regardless of how long people delay believing in it. You can explore the [full Quran with translation and audio](/) on Al-Quran Hub.",
      "Below, you can read the complete text of Surah Al-Ahqaf with Arabic script and English translation. Listen to the recitation, bookmark the verses that move you, and reflect on the timeless wisdom this surah carries.",
    ],
  },

  "Al-Waaqia": {
    intro: [
      "Surah Al-Waaqia is the 56th chapter of the Quran. It has 96 verses and was revealed in Makkah. The name means \"The Inevitable,\" pointing to the Day of Judgment, an event that will surely happen. This surah describes what takes place on that day and divides people into three groups: those foremost in faith, the people of the right, and the people of the left. It gives a clear picture of the rewards in Paradise and the punishment in Hell. It also reminds every believer that all provision and sustenance comes from Allah alone. Many Muslims recite this surah every night, following a hadith that connects it with protection from poverty. Read this and other surahs on [Al-Quran Hub](/), with Arabic text, English translation, and audio recitation.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Waaqia mean?",
        answer:
          "Al-Waaqia means \"The Inevitable\" or \"The Event.\" It refers to the Day of Judgment, a day that will certainly come to pass.",
      },
      {
        question: "How many verses are in Surah Al-Waaqia?",
        answer:
          "Surah Al-Waaqia has 96 verses. It is the 56th surah in the Quran and belongs to the 27th Juz.",
      },
      {
        question: "Is Surah Al-Waaqia a Meccan or Medinan surah?",
        answer:
          "Surah Al-Waaqia is a Meccan surah, revealed to Prophet Muhammad (peace be upon him) during his time in Makkah.",
      },
      {
        question: "What is Surah Al-Waaqia about?",
        answer:
          "The surah describes the Day of Judgment in detail. It explains how people will be divided into three groups based on their deeds, and describes the rewards of Paradise along with the punishment of Hell.",
      },
      {
        question: "What are the benefits of reciting Surah Al-Waaqia?",
        answer:
          "Many scholars mention that reciting Surah Al-Waaqia helps a person rely on Allah for provision and sustenance. A hadith reported by Ibn Asakir links its nightly recitation with protection from poverty, though its chain is debated among scholars. Beyond this, the surah strengthens faith in the afterlife and encourages gratitude.",
      },
      {
        question: "When is the best time to recite Surah Al-Waaqia?",
        answer:
          "Many people recite Surah Al-Waaqia after Maghrib or Isha prayer, especially at night. It can be recited at any time of the day.",
      },
    ],
  },

  "Ash-Sharh": {
    intro: [
      "Surah Ash-Sharh, also known as Al-Inshirah, is the 94th surah of the Quran. It is a Makki surah, revealed in Makkah, and has only 8 verses, making it one of the shorter chapters in the Quran.",
      "This surah brings comfort and reassurance to Prophet Muhammad (peace be upon him) during a time of hardship. Allah reminds him that He has opened up his chest, lifted the heavy burden from him, and raised his name in honor. The most well known part of this surah is the promise repeated twice: \"with hardship comes ease.\" This line has given hope to millions of Muslims across generations, reminding them that difficult times never last forever and relief is always close by.",
      "Surah Ash-Sharh is often read alongside Surah Ad-Duha, since both were revealed around the same period and carry a similar message of patience and hope.",
    ],
    faqs: [
      {
        question: "What is Surah Ash-Sharh about?",
        answer:
          "Surah Ash-Sharh is about finding comfort during hard times. It reminds the reader that Allah eases the burdens of those who remain patient, and that no difficulty lasts forever. This message makes it one of the most comforting chapters people turn to when going through tough situations.",
      },
      {
        question: "What are the benefits of reciting Surah Ash-Sharh?",
        answer:
          "Many people recite Surah Ash-Sharh for peace of mind and relief from stress or worry. Since the surah focuses on hope after hardship, it is often read during periods of anxiety, sadness, or when facing a difficult decision. Some also recite it alongside Surah Ad-Duha for added comfort.",
      },
      {
        question: "Why is Surah Ash-Sharh also called Al-Inshirah?",
        answer:
          "The surah is known by two names because both come from its central theme, the opening or expansion of the chest. Ash-Sharh and Al-Inshirah are used interchangeably, and you will find both names in different translations and Quran apps.",
      },
      {
        question: "What does \"with hardship comes ease\" mean in Surah Ash-Sharh?",
        answer:
          "This phrase appears twice in the surah and is considered its most powerful message. It teaches that ease is not just possible after hardship, it is guaranteed to come alongside it. Scholars often explain this as a reminder that struggle and relief are closely connected, not separate events.",
      },
      {
        question: "When is the best time to recite Surah Ash-Sharh?",
        answer:
          "There is no fixed time required for this surah, but many people choose to recite it during moments of stress, before starting something difficult, or as part of their daily Quran reading. Its short length also makes it easy to memorize and recite regularly.",
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
