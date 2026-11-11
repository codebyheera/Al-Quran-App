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

  "Az-Zumar": {
    intro: [
      "Surah Az-Zumar is the 39th surah of the Quran. It is a Makki surah with 75 verses. Its name means \"the groups,\" and it comes from the end of the surah, where people are led to Paradise or Hell in separate groups on the Day of Judgment.",
      "The main message of this surah is to worship Allah alone with a sincere heart. It reminds readers that no one else deserves devotion, and it asks them to think about the signs of Allah in the sky, the rain, and the growth of plants. It also compares those who know and those who do not, and it promises that the patient will be rewarded without limit.",
      "One of the most loved verses of the Quran is in this surah. Allah tells those who have wronged themselves not to lose hope in His mercy, because He forgives all sins for those who turn back to Him. The surah ends with a powerful picture of the Day of Judgment, when the trumpet is blown and every group is brought forward.",
      "Surah Az-Zumar is spread across two juz. The first part is in [Juz 23](/juz/23) and the rest is in [Juz 24](/juz/24).",
    ],
    faqs: [
      {
        question: "What is Surah Az-Zumar about?",
        answer:
          "Surah Az-Zumar is about worshipping Allah alone with a sincere heart. It reminds readers of the signs of Allah in creation, compares those who know with those who do not, and ends with a clear picture of how people will be led in groups to Paradise or Hell on the Day of Judgment.",
      },
      {
        question: "What does Az-Zumar mean?",
        answer:
          "Az-Zumar means \"the groups\" or \"the troops.\" The name comes from the last part of the surah, where the disbelievers are driven to Hell in groups and the believers are led to Paradise in groups. It is the 39th surah of the Quran and has 75 verses.",
      },
      {
        question: "What does verse 53 of Surah Az-Zumar say?",
        answer:
          "Verse 53 is one of the most hopeful verses in the Quran. Allah tells those who have wronged themselves not to lose hope in His mercy, and says He forgives all sins for those who turn back to Him. Many people read it when they feel weighed down by their mistakes.",
      },
      {
        question: "Which juz is Surah Az-Zumar in?",
        answer:
          "Surah Az-Zumar is spread across two juz. Verses 1 to 31 are in Juz 23, and verses 32 to 75 are in Juz 24.",
      },
      {
        question: "What are the benefits of reciting Surah Az-Zumar?",
        answer:
          "It is reported in Jami at-Tirmidhi from Aisha (may Allah be pleased with her) that the Prophet (peace be upon him) would not sleep until he had recited Surah Al-Isra and Surah Az-Zumar. Many Muslims follow this example by reading it at night.",
      },
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

  "Adh-Dhaariyat": {
    intro: [
      "Surah Adh-Dhariyat is the 51st surah of the Quran. It is a Makki surah with 60 verses, and its name means the winds that scatter. It opens with Allah swearing by the winds, the clouds heavy with rain, the ships that glide with ease, and the angels who carry out His orders, all to make one point clear: the promise of the Day of Judgment is true.",
      "The surah then describes people who are mindful of Allah. They slept little at night, asked for forgiveness before dawn, and kept a fair share of their wealth for those in need. It asks readers to look at the signs of Allah in the earth and within themselves. It also shares the story of Prophet Ibrahim's honored guests, along with short reminders of what happened to the people of Lut, Firaun, Ad, Thamud, and the people of Nuh.",
      "Near the end comes one of the best known verses of the Quran, where Allah says He created jinn and mankind only to worship Him. This surah is split between [Juz 26](/juz/26) and [Juz 27](/juz/27), and it leaves the reader with a simple reminder that Allah is the one who provides for everyone.",
    ],
    faqs: [
      {
        question: "What is Surah Adh-Dhariyat about?",
        answer:
          "Surah Adh-Dhariyat is about the certainty of the Day of Judgment and the purpose of life. It describes the qualities of people who are mindful of Allah, shares the story of Prophet Ibrahim's guests, and reminds readers of past nations who rejected their prophets. It ends with a clear message that Allah created jinn and mankind to worship Him.",
      },
      {
        question: "What does Adh-Dhariyat mean?",
        answer:
          "Adh-Dhariyat means \"the winds that scatter.\" The name comes from the very first verse, where Allah swears by the winds that spread dust and carry clouds. It is the 51st surah of the Quran.",
      },
      {
        question: "Which verse of Surah Adh-Dhariyat says Allah created mankind to worship Him?",
        answer:
          "It is verse 56, one of the most quoted verses of this surah. In it, Allah says He created jinn and mankind only so that they would worship Him. It is often shared as a short reminder of the purpose of life.",
      },
      {
        question: "What does Surah Adh-Dhariyat say about rizq?",
        answer:
          "Verse 22 says that your provision is in the heaven, along with what you have been promised. Many people read this verse when they feel worried about money or livelihood, since it reminds us that rizq is in Allah's hands. The surah also ends by calling Allah the Provider, the Possessor of strength.",
      },
      {
        question: "How many verses does Surah Adh-Dhariyat have, and which juz is it in?",
        answer:
          "It has 60 verses and is a Makki surah. It is split between two juz. Verses 1 to 30 are in Juz 26, and verses 31 to 60 are in Juz 27.",
      },
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
      "Surah Ash-Sharh is often read alongside [Surah Ad-Duha](/surah/Ad-Dhuhaa), since both were revealed around the same period and carry a similar message of patience and hope.",
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
    related: [
      { label: "Surah Ad-Duha", slug: "Ad-Dhuhaa" },
      { label: "Surah At-Tin", slug: "At-Tin" },
      { label: "Surah Al-Alaq", slug: "Al-Alaq" },
    ],
  },

  "Ad-Dukhaan": {
    intro: [
      "Surah Ad-Dukhan is the 44th chapter of the Quran. It has 59 verses and was revealed in Makkah. Its name means \"The Smoke,\" taken from verses 10 and 11, which warn of a day when the sky will bring a clear smoke that covers the people. It is part of the 25th Juz and is the fifth of the seven surahs that begin with the letters Ha Meem.",
      "The surah opens by saying that the Quran was sent down on a blessed night. Many scholars, including Ibn Kathir, explain that this is Laylat al-Qadr in Ramadan. It then tells the story of Prophet Musa and Pharaoh. Pharaoh was proud and refused the truth, so he and his army were drowned, and they left behind their gardens, springs, and palaces. The Quran says that neither the heaven nor the earth wept for them.",
      "The last part of the surah compares the two endings of the Day of Judgment. It describes the bitter tree of Zaqqum as food for the sinful, and then the peace, gardens, and safety waiting for the righteous. It closes by reminding us that Allah made the Quran easy in the Prophet's ﷺ language so that people may take heed. You can read more Surahs and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What does Surah Ad-Dukhan mean?",
        answer:
          "Ad-Dukhan means \"The Smoke.\" The name comes from verses 10 and 11, which describe a day when the sky will bring a visible smoke that covers the people as a painful punishment.",
      },
      {
        question: "How many verses are in Surah Ad-Dukhan?",
        answer:
          "Surah Ad-Dukhan has 59 verses. It is the 44th surah of the Quran and is found in the 25th Juz.",
      },
      {
        question: "Is Surah Ad-Dukhan a Meccan or Medinan surah?",
        answer:
          "Surah Ad-Dukhan is a Meccan surah. It was revealed in Makkah, when the Prophet ﷺ was calling the Quraysh to believe in one God.",
      },
      {
        question: "What is the blessed night mentioned in Surah Ad-Dukhan?",
        answer:
          "Verse 3 says the Quran was sent down on a blessed night. Most scholars explain that this is Laylat al-Qadr, the Night of Decree in Ramadan, which is also mentioned in Surah Al-Qadr.",
      },
      {
        question: "What story is told in Surah Ad-Dukhan?",
        answer:
          "The surah tells the story of Prophet Musa and Pharaoh. Musa asked Pharaoh to free the Children of Israel, but Pharaoh refused. Allah saved the believers and drowned Pharaoh and his army, who left behind all their wealth and gardens.",
      },
      {
        question: "Is there a special time to recite Surah Ad-Dukhan?",
        answer:
          "Some narrations mention reciting Surah Ad-Dukhan on the night of Friday, but scholars of hadith consider these reports weak. It can be recited at any time, like any other part of the Quran.",
      },
    ],
    related: [
      { label: "Surah Az-Zukhruf", slug: "Az-Zukhruf" },
      { label: "Surah Al-Jathiya", slug: "Al-Jaathiya" },
      { label: "Surah Al-Qadr", slug: "Al-Qadr" },
    ],
  },

  "Al-Qamar": {
    intro: [
      "Surah Al-Qamar is the 54th chapter of the Quran. It has 55 verses and was revealed in Makkah. Its name means \"The Moon.\" The surah begins with the words \"The Hour has come near, and the moon has split.\" Authentic hadith in Sahih al-Bukhari and Sahih Muslim report that the people of Makkah asked the Prophet ﷺ for a sign, and they saw the moon split into two parts. Even so, many of them turned away and called it magic.",
      "The surah then tells, one after another, the stories of nations who rejected their prophets: the people of Nuh, the people of Ad, Thamud, the people of Lut, and the people of Pharaoh. Each story is short and powerful, and each ends with a warning about what happened to those who denied the truth.",
      "Four times in this surah, Allah says: \"And We have certainly made the Quran easy to remember, so is there anyone who will remember?\" This line is an invitation to every reader to learn, recite, and reflect. The surah ends with good news for the righteous, who will be in gardens and rivers, in a seat of honor near the Most Powerful King. You can read more Surahs and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Qamar mean?",
        answer:
          "Al-Qamar means \"The Moon.\" The surah is named after its first verse, which mentions the splitting of the moon as a sign that the Hour is near.",
      },
      {
        question: "How many verses are in Surah Al-Qamar?",
        answer:
          "Surah Al-Qamar has 55 verses. It is the 54th surah of the Quran and is part of the 27th Juz.",
      },
      {
        question: "Is Surah Al-Qamar a Meccan or Medinan surah?",
        answer:
          "Surah Al-Qamar is a Meccan surah. It was revealed in Makkah, where the Quraysh were rejecting the message of the Prophet ﷺ.",
      },
      {
        question: "What is the splitting of the moon in Surah Al-Qamar?",
        answer:
          "The first verse mentions that the moon split. Hadith in Sahih al-Bukhari and Sahih Muslim describe how the people of Makkah asked for a miracle and saw the moon split into two parts during the time of the Prophet ﷺ.",
      },
      {
        question: "Which verse is repeated in Surah Al-Qamar?",
        answer:
          "The verse \"And We have certainly made the Quran easy to remember, so is there anyone who will remember?\" is repeated four times, in verses 17, 22, 32, and 40. It encourages people to read the Quran and take lessons from it.",
      },
      {
        question: "Did the Prophet ﷺ recite Surah Al-Qamar in prayer?",
        answer:
          "Yes. A hadith in Sahih Muslim reports that the Prophet ﷺ used to recite Surah Qaf and Surah Al-Qamar in the Eid prayers.",
      },
    ],
    related: [
      { label: "Surah An-Najm", slug: "An-Najm" },
      { label: "Surah Ar-Rahman", slug: "Ar-Rahmaan" },
      { label: "Surah Qaf", slug: "Qaaf" },
    ],
  },

  "Al-Hashr": {
    intro: [
      "Surah Al-Hashr is the 59th chapter of the Quran. It has 24 verses and was revealed in Madinah. Its name means \"The Gathering\" or \"The Exile.\" It is part of the 28th Juz. The companion Ibn Abbas used to call it Surah Bani an-Nadir, as reported in Sahih al-Bukhari, because it speaks about this tribe.",
      "The Banu an-Nadir were a Jewish tribe living near Madinah who had a treaty with the Muslims. They broke the treaty and plotted against the Prophet ﷺ, so they were made to leave their strong forts around the fourth year after Hijrah. The surah explains that their forts could not protect them from the decree of Allah. It also sets out how the wealth left behind should be shared, and gives a key rule in verse 7: \"Whatever the Messenger gives you, take it, and whatever he forbids you, stay away from it.\"",
      "Verse 9 praises the Ansar of Madinah, who welcomed the Muhajirun and gave them preference over themselves even when they were in need. The surah ends with three of the most beautiful verses in the Quran, verses 22 to 24, which list many of the names of Allah, such as Ar-Rahman, Al-Malik, Al-Quddus, As-Salam, and Al-Khaliq. You can read more Surahs and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Hashr mean?",
        answer:
          "Al-Hashr means \"The Gathering\" or \"The Exile.\" It refers to the gathering and leaving of the Banu an-Nadir tribe from their homes near Madinah.",
      },
      {
        question: "How many verses are in Surah Al-Hashr?",
        answer:
          "Surah Al-Hashr has 24 verses. It is the 59th surah of the Quran and is part of the 28th Juz.",
      },
      {
        question: "Is Surah Al-Hashr a Meccan or Medinan surah?",
        answer:
          "Surah Al-Hashr is a Medinan surah. It was revealed in Madinah after the Banu an-Nadir broke their treaty with the Muslims.",
      },
      {
        question: "What is Surah Al-Hashr about?",
        answer:
          "It talks about the exile of the Banu an-Nadir, how the wealth they left should be divided, the sacrifice of the Ansar, the danger of hypocrisy, and the need to prepare for the Hereafter. It ends with many beautiful names of Allah.",
      },
      {
        question: "Which names of Allah are in the last verses of Surah Al-Hashr?",
        answer:
          "Verses 22 to 24 mention names such as Al-Alim, Ar-Rahman, Ar-Rahim, Al-Malik, Al-Quddus, As-Salam, Al-Mu'min, Al-Muhaymin, Al-Aziz, Al-Jabbar, Al-Mutakabbir, Al-Khaliq, Al-Bari, and Al-Musawwir. Many Muslims memorize these verses.",
      },
      {
        question: "What does Surah Al-Hashr say about the Ansar?",
        answer:
          "Verse 9 praises the Ansar, the Muslims of Madinah, for loving those who migrated to them and putting others before themselves even when they were poor. It says that those who are saved from the greed of their own souls are the successful ones.",
      },
    ],
    related: [
      { label: "Surah Al-Mujadila", slug: "Al-Mujaadila" },
      { label: "Surah Al-Mumtahanah", slug: "Al-Mumtahana" },
      { label: "Surah Al-Hadid", slug: "Al-Hadid" },
    ],
  },

  "Al-Ma'aarij": {
    intro: [
      "Surah Al-Ma'arij is the 70th chapter of the Quran. It has 44 verses and was revealed in Makkah. Its name means \"The Ascending Stairways,\" from verses 3 and 4, which describe Allah as the Lord of the ways of ascent, by which the angels and the Spirit rise up to Him in a day whose length is fifty thousand years. It is part of the 29th Juz and is also known by its opening words, Sa'ala Sa'ilun.",
      "The surah begins with a person who mockingly asked for the punishment to come. It answers that the punishment will surely come and no one can stop it. It then describes the Day of Judgment, when the sky will be like molten metal, the mountains like wool, and no close friend will ask about another. A sinner will even wish to give his children, his spouse, and his family to save himself.",
      "Verses 19 to 21 describe human nature: people are anxious, they panic when harm touches them, and they hold back when good comes to them. Then the surah lists those who are different. They are steady in their prayers, they give a known share of their wealth to the poor, they believe in the Day of Judgment, they guard their chastity, they keep their trusts and promises, and they stand firm in their testimony. These people will be honored in gardens. You can read more Surahs and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Ma'arij mean?",
        answer:
          "Al-Ma'arij means \"The Ascending Stairways\" or \"The Ways of Ascent.\" It refers to the paths through which the angels and the Spirit rise up to Allah.",
      },
      {
        question: "How many verses are in Surah Al-Ma'arij?",
        answer:
          "Surah Al-Ma'arij has 44 verses. It is the 70th surah of the Quran and is part of the 29th Juz.",
      },
      {
        question: "Is Surah Al-Ma'arij a Meccan or Medinan surah?",
        answer:
          "Surah Al-Ma'arij is a Meccan surah. It was revealed in Makkah, at a time when many people mocked the idea of the Day of Judgment.",
      },
      {
        question: "What is the day of fifty thousand years in Surah Al-Ma'arij?",
        answer:
          "Verse 4 says the angels and the Spirit ascend to Allah in a day whose length is fifty thousand years. Many scholars explain that this refers to the Day of Judgment, which will feel very long for the disbelievers, while Allah will make it easy for the believers.",
      },
      {
        question: "What are the qualities of believers in Surah Al-Ma'arij?",
        answer:
          "Verses 22 to 35 describe them as people who are constant in prayer, give a set share of their wealth to the poor and deprived, believe in the Day of Judgment, fear Allah's punishment, guard their chastity, keep their trusts and promises, give true testimony, and protect their prayers.",
      },
    ],
    related: [
      { label: "Surah Al-Haqqah", slug: "Al-Haaqqa" },
      { label: "Surah Nuh", slug: "Nooh" },
      { label: "Surah Al-Muminun", slug: "Al-Muminoon" },
    ],
  },

  "Al-Muzzammil": {
    intro: [
      "Surah Al-Muzzammil is the 73rd chapter of the Quran. It has 20 verses and was revealed in Makkah. Its name means \"The Wrapped One\" and refers to the Prophet Muhammad ﷺ, who was wrapped in his garment. It is one of the earliest surahs revealed, from the first years of the Prophet's ﷺ mission, and it is part of the 29th Juz.",
      "In the opening verses, Allah tells the Prophet ﷺ to stand in prayer at night, for half the night, a little less, or a little more, and to recite the Quran slowly and clearly (tartil). Allah tells him that a heavy word is about to be given to him, meaning the weight of revelation and its message. The surah teaches that worship at night is stronger for the heart and clearer for recitation. It also tells the Prophet ﷺ to be patient with what his opponents say and to leave them in a gracious way.",
      "The last verse, verse 20, is very long and brings a mercy. Allah knows that the believers stood in prayer for long parts of the night, and He made it easier for them: \"So recite what is easy from the Quran.\" Sayyidah Aishah (may Allah be pleased with her) explained in Sahih Muslim that night prayer became voluntary after this. The verse ends with the command to establish prayer, give zakat, and lend Allah a goodly loan. You can read more Surahs and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What does Surah Al-Muzzammil mean?",
        answer:
          "Al-Muzzammil means \"The Wrapped One\" or \"The One Wrapped in Garments.\" It is a gentle way of addressing the Prophet Muhammad ﷺ, who was wrapped in his cloak.",
      },
      {
        question: "How many verses are in Surah Al-Muzzammil?",
        answer:
          "Surah Al-Muzzammil has 20 verses. It is the 73rd surah of the Quran and is part of the 29th Juz.",
      },
      {
        question: "Is Surah Al-Muzzammil a Meccan or Medinan surah?",
        answer:
          "Surah Al-Muzzammil is a Meccan surah and one of the earliest ones revealed. Some scholars say that its last verse was revealed later in Madinah.",
      },
      {
        question: "What is Surah Al-Muzzammil about?",
        answer:
          "The surah prepares the Prophet ﷺ for the mission of carrying the Quran. It tells him to pray at night, recite the Quran slowly, rely on Allah, and stay patient with those who reject him. It ends by making night prayer easier for the believers.",
      },
      {
        question: "What does tartil mean in Surah Al-Muzzammil?",
        answer:
          "Verse 4 says \"and recite the Quran with tartil.\" Tartil means reciting slowly and clearly, giving each letter its right and thinking about the meaning, instead of rushing.",
      },
      {
        question: "Is night prayer (Tahajjud) compulsory according to Surah Al-Muzzammil?",
        answer:
          "At first, the Prophet ﷺ and his companions stood for long parts of the night. Verse 20 then made it lighter. As Aishah (may Allah be pleased with her) explained in Sahih Muslim, night prayer became voluntary for the believers, though it remains a highly rewarded act.",
      },
    ],
    related: [
      { label: "Surah Al-Muddaththir", slug: "Al-Muddaththir" },
      { label: "Surah Al-Alaq", slug: "Al-Alaq" },
      { label: "Surah Al-Ma'arij", slug: "Al-Ma'aarij" },
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
