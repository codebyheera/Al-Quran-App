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
  4: {
    intro: [
      "Juz 4 covers the final part of [Surah Aal-i-Imran](/surah/Aal-i-Imraan), from verse 93 to the end of the surah at verse 200, and then moves into the opening twenty three verses of [Surah An-Nisa](/surah/An-Nisaa).",
      "The section from Surah Aal-i-Imran reflects on the aftermath of the Battle of Uhud, a difficult moment for the early Muslim community in Madinah. It calls believers to unity, patience, and steadfastness, reminding them not to lose hope after setbacks. It also touches on the shared history between Muslims and the People of the Book, pointing out where beliefs align and where they differ, while urging Muslims to hold firmly to their faith.",
      "The juz then opens Surah An-Nisa, which lays out some of the most important guidance on justice within the family. These verses address the fair treatment of orphans, the rights of women, and the rules of inheritance, setting a foundation for a just and caring society.",
      "Juz 4 moves from lessons learned through hardship to practical guidance for building a fair community, connecting faith with everyday responsibility. You can read more Juz and explore the complete [Quran online free](/) on Al Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 4?",
        answer:
          "Juz 4 covers the final part of Surah Aal-i-Imran, from verse 93 to verse 200, and the opening twenty three verses of Surah An-Nisa. It is often known by its opening words, \"Lan Tanaloo.\"",
      },
      {
        question: "Where does Juz 4 start and end in the Quran?",
        answer:
          "Juz 4 begins at Surah Aal-i-Imran, verse 93, and ends at Surah An-Nisa, verse 23. It picks up right where Juz 3 leaves off and continues into the start of the fourth chapter.",
      },
      {
        question: "What is the main theme of Juz 4?",
        answer:
          "Juz 4 reflects on the lessons of the Battle of Uhud and calls believers to patience and unity after hardship. It then shifts into Surah An-Nisa, which focuses on justice within the family, including the rights of orphans, women, and fair inheritance.",
      },
      {
        question: "What does Juz 4 say about orphans and inheritance?",
        answer:
          "The opening verses of Surah An-Nisa in this juz set clear guidance on protecting the wealth of orphans and dividing inheritance fairly among family members. These verses are often referenced when discussing Islamic laws on family and property rights.",
      },
      {
        question: "Why is the Battle of Uhud mentioned in Juz 4?",
        answer:
          "The Battle of Uhud was a difficult experience for the early Muslim community, and Surah Aal-i-Imran uses it as a lesson on the importance of obedience, unity, and not losing hope after a setback. This part of the juz encourages believers to learn from hardship rather than be discouraged by it.",
      },
    ],
  },

  26: {
    intro: [
      "Juz 26 begins with [Surah Al-Ahqaf](/surah/Al-Ahqaf) and continues through four more complete surahs, [Surah Muhammad](/surah/Muhammad), [Surah Al-Fath](/surah/Al-Fath), [Surah Al-Hujurat](/surah/Al-Hujuraat), and [Surah Qaf](/surah/Qaaf), before ending in the first thirty verses of [Surah Adh-Dhaariyat](/surah/Adh-Dhaariyat).",
      "Surah Al-Ahqaf opens with a warning through the story of the people of Ad, reminding readers that strength and power mean nothing without gratitude to Allah. Surah Muhammad, sometimes called Al-Qital, speaks about the struggles faced by the early Muslim community and the difference between those who truly believe and those who only claim to. Surah Al-Fath celebrates the treaty of Hudaybiyyah, describing it as a clear victory even though it did not look like one at the time. Surah Al-Hujurat then shifts to everyday manners, teaching believers how to treat one another with respect, avoid suspicion and backbiting, and build a community based on brotherhood. Surah Qaf turns attention back to the Day of Judgment, describing resurrection and accountability in vivid detail. The juz closes with the opening of Surah Adh-Dhaariyat, which points to the signs of Allah in the natural world and shares the story of Prophet Ibrahim's guests.",
      "Juz 26 moves between hardship, victory, good manners, and the reminder of the hereafter, offering a wide range of lessons for daily life and faith. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 26?",
        answer:
          "Juz 26 includes five complete surahs, Al-Ahqaf, Muhammad, Al-Fath, Al-Hujurat, and Qaf, along with the opening thirty verses of Surah Adh-Dhaariyat.",
      },
      {
        question: "Where does Juz 26 start and end in the Quran?",
        answer:
          "Juz 26 begins at the first verse of Surah Al-Ahqaf and ends at verse 30 of Surah Adh-Dhaariyat. It is one of the fuller juz, covering six different surahs in total.",
      },
      {
        question: "What is the main theme of Juz 26?",
        answer:
          "Juz 26 covers a wide range of topics, including warnings from past nations, the struggles of the early Muslim community, the victory of the Hudaybiyyah treaty, guidance on good manners, and reminders about the Day of Judgment.",
      },
      {
        question: "What is Surah Al-Hujurat about in Juz 26?",
        answer:
          "Surah Al-Hujurat focuses on manners and social conduct among believers. It teaches Muslims to avoid mockery, suspicion, and backbiting, and to treat one another with respect regardless of background, since true honor comes from piety, not status.",
      },
      {
        question: "Why is Surah Muhammad also called Al-Qital?",
        answer:
          "Surah Muhammad is sometimes called Al-Qital, meaning fighting, because it discusses the early battles faced by the Muslim community and draws a clear line between sincere believers and those whose faith was weak or false.",
      },
    ],
  },

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

  3: {
    intro: [
      "Juz 3 begins at verse 253 of [Surah Al-Baqarah](/surah/Al-Baqara) and runs to the end of that surah at verse 286. It then continues into [Surah Aal-i-Imran](/surah/Aal-i-Imraan) up to verse 92. It is known by its opening words, \"Tilka ar-Rusul,\" which means \"Those messengers.\"",
      "This juz contains some of the most loved verses of the Quran. Ayat al-Kursi, verse 255, describes the greatness and knowledge of Allah, and a hadith in Sahih Muslim calls it the greatest verse in the Book of Allah. Verse 256 says there is no compulsion in religion. The juz also shares the debate of Prophet Ibrahim with a proud king, and the story of Ibrahim and the four birds, which shows how Allah gives life to the dead.",
      "A large part of this section teaches about wealth. It compares charity given for Allah to a seed that grows seven ears, each with a hundred grains. It warns against spoiling charity with reminders or hurtful words, and it clearly forbids riba (interest). Verse 282, the longest verse in the Quran, explains how to write down loans. Surah Al-Baqarah then ends with two short verses that, according to Sahih al-Bukhari and Sahih Muslim, are enough for the one who recites them at night.",
      "The opening of Surah Aal-i-Imran speaks about the family of Imran, the birth of Maryam, the prayer of Zakariya, and the miraculous birth of Isa. It invites the People of the Book to a common word: to worship none but Allah. The juz closes with verse 92: \"You will never attain righteousness until you spend from what you love.\" You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 3?",
        answer:
          "Juz 3 includes the last part of Surah Al-Baqarah, from verse 253 to verse 286, and the first 92 verses of Surah Aal-i-Imran. It is known by its opening words, \"Tilka ar-Rusul.\"",
      },
      {
        question: "Where does Juz 3 start and end in the Quran?",
        answer:
          "Juz 3 starts at Surah Al-Baqarah, verse 253, and ends at Surah Aal-i-Imran, verse 92. Juz 4 then begins from verse 93.",
      },
      {
        question: "Is Ayat al-Kursi in Juz 3?",
        answer:
          "Yes. Ayat al-Kursi is verse 255 of Surah Al-Baqarah, which falls near the start of Juz 3. A hadith in Sahih Muslim describes it as the greatest verse of the Quran.",
      },
      {
        question: "What is the main theme of Juz 3?",
        answer:
          "Juz 3 focuses on the oneness and greatness of Allah, the reward of charity, the ban on interest, and fairness in money matters. It then moves into the story of the family of Imran and a call to the People of the Book.",
      },
      {
        question: "What is the longest verse in the Quran?",
        answer:
          "The longest verse is Surah Al-Baqarah, verse 282, known as Ayat ad-Dayn, the verse of debt. It is in Juz 3 and explains how to record loans with witnesses so that no one is treated unfairly.",
      },
    ],
  },

  7: {
    intro: [
      "Juz 7 begins at verse 82 of [Surah Al-Ma'idah](/surah/Al-Maaida) and continues to the end of that surah at verse 120. It then moves into [Surah Al-An'am](/surah/Al-An'aam) up to verse 110. It is known by its opening words, \"Wa Idha Sami'u,\" which means \"And when they hear.\"",
      "The juz opens with a moving picture of sincere people of the Book whose eyes overflow with tears when they hear the Quran and recognize the truth. Surah Al-Ma'idah then gives clear guidance for daily life. It tells believers not to forbid the good things Allah has made lawful, explains the expiation for broken oaths, and gives the final ban on intoxicants and gambling in verses 90 and 91. It also mentions the rules of hunting while in the state of ihram.",
      "Near its end, Surah Al-Ma'idah recalls the miracles of Prophet Isa and the table spread with food sent down from heaven, which gives the surah its name. On the Day of Judgment, Isa will make clear that he only told people to worship Allah, his Lord and theirs.",
      "Surah Al-An'am is a Meccan surah that focuses on the oneness of Allah. It reminds us that the keys of the unseen are with Allah alone, and it shares how Prophet Ibrahim looked at a star, the moon, and the sun, and then turned fully to the Creator of them all. Verses 83 to 86 name eighteen prophets. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 7?",
        answer:
          "Juz 7 includes the last part of Surah Al-Ma'idah, from verse 82 to verse 120, and the first 110 verses of Surah Al-An'am. It is known by its opening words, \"Wa Idha Sami'u.\"",
      },
      {
        question: "Where does Juz 7 start and end in the Quran?",
        answer:
          "Juz 7 starts at Surah Al-Ma'idah, verse 82, and ends at Surah Al-An'am, verse 110.",
      },
      {
        question: "What is the main theme of Juz 7?",
        answer:
          "Juz 7 combines practical rulings from Surah Al-Ma'idah, such as oaths, food, and the ban on alcohol and gambling, with the strong message of tawheed (the oneness of Allah) in Surah Al-An'am.",
      },
      {
        question: "Where is alcohol forbidden in the Quran?",
        answer:
          "The final and clear prohibition of intoxicants and gambling comes in Surah Al-Ma'idah, verses 90 and 91, which are in Juz 7. These verses call them filth from the work of Shaytan and tell believers to avoid them.",
      },
      {
        question: "What is the story of the table spread in Juz 7?",
        answer:
          "In Surah Al-Ma'idah, verses 112 to 115, the disciples of Prophet Isa asked for a table of food to be sent down from heaven. Isa prayed to Allah, and Allah answered, with a warning to anyone who disbelieved after that sign.",
      },
    ],
  },

  8: {
    intro: [
      "Juz 8 begins at verse 111 of [Surah Al-An'am](/surah/Al-An'aam) and continues to the end of that surah at verse 165. It then moves into [Surah Al-A'raf](/surah/Al-A'raaf) up to verse 87. It is known by its opening words, \"Wa Law Annana,\" which means \"And even if We had.\"",
      "The juz opens by saying that even if angels were sent down and the dead spoke to the disbelievers, they would still not believe unless Allah willed. Surah Al-An'am then exposes the false customs of the Arabs of that time, such as made-up rules about crops and cattle and the killing of children. In verses 151 to 153, Allah lists clear commands: do not associate anything with Him, be good to parents, do not kill your children out of fear of poverty, stay away from indecency, and follow His straight path.",
      "Surah Al-An'am ends with the beautiful words in verse 162: \"Say, my prayer, my sacrifice, my living and my dying are for Allah, Lord of the worlds.\"",
      "Surah Al-A'raf opens with the story of Prophet Adam and Iblis, and the prayer of Adam and Hawwa: \"Our Lord, we have wronged ourselves.\" It speaks to all the children of Adam about clothing, modesty, and eating without excess. It describes the people of the heights (Al-A'raf) between Paradise and Hell, and then tells the stories of Nuh, Hud, Salih, Lut, and Shu'ayb. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 8?",
        answer:
          "Juz 8 includes the last part of Surah Al-An'am, from verse 111 to verse 165, and the first 87 verses of Surah Al-A'raf. It is known by its opening words, \"Wa Law Annana.\"",
      },
      {
        question: "Where does Juz 8 start and end in the Quran?",
        answer:
          "Juz 8 starts at Surah Al-An'am, verse 111, and ends at Surah Al-A'raf, verse 87, in the middle of the story of Prophet Shu'ayb.",
      },
      {
        question: "What is the main theme of Juz 8?",
        answer:
          "Juz 8 calls people away from false customs and towards the straight path of Allah. It then reminds humanity of the story of Adam and Iblis and shows what happened to nations who rejected their prophets.",
      },
      {
        question: "Which prophets are mentioned in Juz 8?",
        answer:
          "Surah Al-A'raf in this juz tells the stories of Prophet Adam, Nuh, Hud with the people of Ad, Salih with the people of Thamud, Lut, and Shu'ayb with the people of Madyan.",
      },
      {
        question: "What is the dua of Prophet Adam in Juz 8?",
        answer:
          "In Surah Al-A'raf, verse 23, Adam and Hawwa said: \"Rabbana zalamna anfusana, wa in lam taghfir lana wa tarhamna lanakunanna minal khasirin.\" It means: \"Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy on us, we will surely be among the losers.\"",
      },
    ],
  },

  10: {
    intro: [
      "Juz 10 begins at verse 41 of [Surah Al-Anfal](/surah/Al-Anfaal) and continues to the end of that surah at verse 75. It then moves into [Surah At-Tawbah](/surah/At-Tawba) up to verse 92. It is known by its opening words, \"Wa A'lamu,\" which means \"And know.\"",
      "The opening verses explain how the spoils of war should be shared, and then return to the Battle of Badr, where Allah gave the small Muslim army victory. Believers are told to stand firm, remember Allah often, obey Allah and His Messenger, and not argue with one another, or they will lose their strength. The surah also teaches that if the enemy turns to peace, the Muslims should accept it and trust in Allah. It ends by praising the bond of brotherhood between the Muhajirun and the Ansar.",
      "Surah At-Tawbah is the only surah in the Quran that does not begin with Bismillah. It deals with treaties with the polytheists who broke their word, and mentions the Battle of Hunayn and the moment in the cave when the Prophet ﷺ told Abu Bakr: \"Do not grieve, Allah is with us.\" Verse 60 names the eight groups who may receive zakat.",
      "Much of this part of At-Tawbah speaks about the expedition of Tabuk and exposes the excuses of the hypocrites who stayed behind. The juz closes with those sincere believers who wept because they had nothing to ride on and could not join. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 10?",
        answer:
          "Juz 10 includes the last part of Surah Al-Anfal, from verse 41 to verse 75, and the first 92 verses of Surah At-Tawbah. It is known by its opening words, \"Wa A'lamu.\"",
      },
      {
        question: "Where does Juz 10 start and end in the Quran?",
        answer:
          "Juz 10 starts at Surah Al-Anfal, verse 41, and ends at Surah At-Tawbah, verse 92.",
      },
      {
        question: "What is the main theme of Juz 10?",
        answer:
          "Juz 10 teaches lessons from the Battle of Badr, unity and steadfastness among believers, and honesty in treaties. It also exposes hypocrisy during the expedition of Tabuk.",
      },
      {
        question: "Why does Surah At-Tawbah not start with Bismillah?",
        answer:
          "Surah At-Tawbah, which begins in Juz 10, is the only surah without Bismillah at its start. Many scholars explain that it opens with a strong warning and disassociation from those who broke their treaties, so it does not begin with words of mercy. Others note that it is closely connected to Surah Al-Anfal.",
      },
      {
        question: "Who can receive zakat according to Juz 10?",
        answer:
          "Surah At-Tawbah, verse 60, names eight groups: the poor, the needy, those who collect zakat, those whose hearts are being brought closer to Islam, freeing slaves, people in debt, those striving in the way of Allah, and the stranded traveler.",
      },
    ],
  },

  11: {
    intro: [
      "Juz 11 begins at verse 93 of [Surah At-Tawbah](/surah/At-Tawba) and runs to the end of that surah. It then covers the whole of [Surah Yunus](/surah/Yunus) and ends with the first five verses of [Surah Hud](/surah/Hud). It is known by its opening words, \"Ya'tadhirun,\" which means \"They will make excuses.\"",
      "The rest of Surah At-Tawbah continues to speak about those who stayed behind from Tabuk. It praises the first believers among the Muhajirun and the Ansar, and it tells the story of the Masjid ad-Dirar, a mosque built by hypocrites to cause harm. It also tells how Allah forgave three sincere companions, including Ka'b ibn Malik, after the earth felt narrow for them. The surah ends with two verses describing how deeply the Prophet ﷺ cared for the believers.",
      "Surah Yunus is a Meccan surah about faith and the truth of the Quran. It challenges anyone who doubts the Quran to bring a single surah like it. It recalls Prophet Nuh, and then Musa and Pharaoh, and how Pharaoh declared belief only when he was drowning, which was too late. Allah preserved his body as a sign for later people. The surah also mentions the people of Prophet Yunus, the only town whose faith benefited them when they saw the punishment coming.",
      "The juz closes with the opening of Surah Hud, which says the Quran's verses are made perfect and calls people to seek forgiveness from Allah and turn back to Him. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 11?",
        answer:
          "Juz 11 includes the last part of Surah At-Tawbah from verse 93, the complete Surah Yunus, and the first five verses of Surah Hud. It is known by its opening words, \"Ya'tadhirun.\"",
      },
      {
        question: "Where does Juz 11 start and end in the Quran?",
        answer:
          "Juz 11 starts at Surah At-Tawbah, verse 93, and ends at Surah Hud, verse 5.",
      },
      {
        question: "What is the main theme of Juz 11?",
        answer:
          "Juz 11 contrasts sincere believers with hypocrites, then calls people to believe in the Quran and learn from what happened to Pharaoh and other nations who rejected the truth.",
      },
      {
        question: "Who were the three companions forgiven in Surah At-Tawbah?",
        answer:
          "Verse 118 refers to Ka'b ibn Malik, Murarah ibn ar-Rabi', and Hilal ibn Umayyah, who stayed behind from Tabuk without a valid excuse. They told the truth, were tested for fifty days, and then Allah accepted their repentance. The full story is in Sahih al-Bukhari.",
      },
      {
        question: "What does Surah Yunus say about Pharaoh?",
        answer:
          "Surah Yunus, verses 90 to 92, says that Pharaoh claimed to believe only as he was drowning. His faith was not accepted at that moment, but Allah preserved his body so that it would be a sign for those who came after him.",
      },
    ],
  },

  12: {
    intro: [
      "Juz 12 begins at verse 6 of [Surah Hud](/surah/Hud) and runs to the end of that surah. It then continues into [Surah Yusuf](/surah/Yusuf) up to verse 52. It is known by its opening words, \"Wa Ma Min Dabbah,\" from the verse \"There is no creature on earth except that its provision is upon Allah.\"",
      "Surah Hud tells the stories of many prophets and the nations they were sent to. It describes Prophet Nuh building the ark, the great flood, and the painful moment when his own son refused to board and was drowned. It then tells of Hud and the people of Ad, Salih and the people of Thamud, the angels who visited Ibrahim, the people of Lut, and Shu'ayb and the people of Madyan. Verse 112 tells the Prophet ﷺ: \"So remain on the right course as you have been commanded.\" A report in Sunan at-Tirmidhi says that the Prophet ﷺ said Surah Hud and similar surahs had made his hair grey.",
      "Surah Yusuf is called \"the best of stories\" in its third verse. This juz covers the first part of the story: Yusuf's dream, the jealousy of his brothers, being thrown into the well, being sold in Egypt, the test in the house of Al-Aziz, and his years in prison. It ends when the king's dream is explained and Yusuf's innocence is declared in front of everyone. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 12?",
        answer:
          "Juz 12 includes most of Surah Hud, from verse 6 to verse 123, and the first 52 verses of Surah Yusuf. It is known by its opening words, \"Wa Ma Min Dabbah.\"",
      },
      {
        question: "Where does Juz 12 start and end in the Quran?",
        answer:
          "Juz 12 starts at Surah Hud, verse 6, and ends at Surah Yusuf, verse 52.",
      },
      {
        question: "What is the main theme of Juz 12?",
        answer:
          "Juz 12 teaches patience and steadfastness through the stories of the prophets. Surah Hud shows the fate of nations who rejected their messengers, while Surah Yusuf shows how patience and trust in Allah lead to honor after hardship.",
      },
      {
        question: "What happens to the son of Prophet Nuh in Juz 12?",
        answer:
          "In Surah Hud, verses 42 and 43, Nuh called his son to board the ark, but his son refused and said he would climb a mountain. The waves came between them and he was drowned. Allah then taught Nuh that his son was not of his family in faith, because of his deeds.",
      },
      {
        question: "How much of the story of Yusuf is in Juz 12?",
        answer:
          "Juz 12 covers Surah Yusuf from verse 1 to 52. This includes the dream, the well, the house of Al-Aziz, the prison, and the explanation of the king's dream. The rest of the story continues in Juz 13.",
      },
    ],
  },

  13: {
    intro: [
      "Juz 13 begins at verse 53 of [Surah Yusuf](/surah/Yusuf) and runs to the end of that surah. It then covers the whole of [Surah Ar-Ra'd](/surah/Ar-Ra'd) and [Surah Ibrahim](/surah/Ibrahim). It is known by its opening words, \"Wa Ma Ubarri'u,\" which means \"And I do not acquit.\"",
      "The juz completes the story of Prophet Yusuf. He is put in charge of the storehouses of Egypt, his brothers come asking for food, and he keeps his young brother with him. Prophet Ya'qub grieves until he loses his sight, yet he tells his sons never to lose hope in the mercy of Allah. In the end, Yusuf's shirt brings back his father's sight, the family is reunited, and the dream from his childhood comes true.",
      "Surah Ar-Ra'd, named after thunder, points to the signs of Allah in the sky, the rain, and the earth. It contains two well known verses: \"Allah will not change the condition of a people until they change what is in themselves\" (verse 11), and \"Surely, in the remembrance of Allah do hearts find rest\" (verse 28).",
      "Surah Ibrahim teaches the value of gratitude: \"If you are grateful, I will surely increase you\" (verse 7). It compares a good word to a good tree with firm roots and branches reaching the sky. It ends with the heartfelt prayers of Prophet Ibrahim for Makkah, for his children, and for his parents. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 13?",
        answer:
          "Juz 13 includes the last part of Surah Yusuf from verse 53, the complete Surah Ar-Ra'd, and the complete Surah Ibrahim. It is known by its opening words, \"Wa Ma Ubarri'u.\"",
      },
      {
        question: "Where does Juz 13 start and end in the Quran?",
        answer:
          "Juz 13 starts at Surah Yusuf, verse 53, and ends at the last verse of Surah Ibrahim, verse 52.",
      },
      {
        question: "What is the main theme of Juz 13?",
        answer:
          "Juz 13 is about hope, patience, and gratitude. It completes the story of Yusuf and his family, and then reminds readers of Allah's signs in nature and the blessings that come with being thankful.",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 13?",
        answer:
          "Yes. Surah Ar-Ra'd, verse 15, is a verse of prostration. It says that everyone in the heavens and the earth bows to Allah, willingly or unwillingly.",
      },
      {
        question: "Which duas of Prophet Ibrahim are in Juz 13?",
        answer:
          "Surah Ibrahim, verses 35 to 41, contains the prayers of Ibrahim. They include his prayer for Makkah to be a safe city, his prayer to be kept away from idols, and the well known dua: \"My Lord, make me one who establishes prayer, and from my children too. Our Lord, accept my prayer.\"",
      },
    ],
  },

  14: {
    intro: [
      "Juz 14 covers two complete surahs, [Surah Al-Hijr](/surah/Al-Hijr) and [Surah An-Nahl](/surah/An-Nahl). It begins with the first verse of Al-Hijr and ends with the last verse of An-Nahl. It is known by its opening word, \"Rubama,\" which means \"Perhaps.\"",
      "Surah Al-Hijr is a Meccan surah. Verse 9 carries one of the Quran's great promises: \"Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian.\" The surah tells how Adam was created from clay and how Iblis refused to bow out of pride. It also tells of the angels who visited Ibrahim and Lut, and of the people of Al-Hijr, who carved homes in the mountains but were destroyed for rejecting the truth. It ends with the command to worship Allah until certainty, meaning death, comes.",
      "Surah An-Nahl, named after the bee, is full of reminders of Allah's blessings: rain, cattle, fruits, the sea, and honey that contains healing for people. Verse 90 commands justice, excellence, and giving to relatives, and forbids indecency and wrongdoing. This verse is often recited at the end of the Friday sermon. Verse 125 teaches how to invite people to Allah: with wisdom, good advice, and gentle discussion. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 14?",
        answer:
          "Juz 14 includes two complete surahs, Surah Al-Hijr (99 verses) and Surah An-Nahl (128 verses). It is known by its opening word, \"Rubama.\"",
      },
      {
        question: "Where does Juz 14 start and end in the Quran?",
        answer:
          "Juz 14 starts at Surah Al-Hijr, verse 1, and ends at Surah An-Nahl, verse 128. It is one of the few juz that begin and end exactly with whole surahs.",
      },
      {
        question: "What is the main theme of Juz 14?",
        answer:
          "Juz 14 focuses on the protection of the Quran, the pride of Iblis, and the countless blessings of Allah in nature. It calls people to gratitude, justice, and inviting others to Allah with wisdom.",
      },
      {
        question: "What does the Quran say about honey in Juz 14?",
        answer:
          "Surah An-Nahl, verses 68 and 69, say that Allah inspired the bee to build homes in mountains and trees, and that from its belly comes a drink of different colors in which there is healing for people.",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 14?",
        answer:
          "Yes. Surah An-Nahl, verse 50, is a verse of prostration. It describes how the angels fear their Lord above them and do what they are commanded.",
      },
    ],
  },

  15: {
    intro: [
      "Juz 15 covers the whole of [Surah Al-Isra](/surah/Al-Israa) and the first 74 verses of [Surah Al-Kahf](/surah/Al-Kahf). It is known by its opening words, \"Subhanalladhi,\" which means \"Glory be to the One who.\"",
      "Surah Al-Isra begins with the Night Journey, when Allah took the Prophet ﷺ from Al-Masjid al-Haram in Makkah to Al-Masjid al-Aqsa in one night. The surah then gives a set of clear guidelines for life. Verses 23 and 24 command kindness to parents and teach the dua: \"My Lord, have mercy on them as they raised me when I was small.\" The surah also forbids killing children out of fear of poverty, coming near zina, and cheating in weights. It mentions the times of prayer, the night prayer, and that the Quran is a healing and mercy for the believers.",
      "Surah Al-Kahf opens with the story of the young men of the cave, who held on to their faith and slept for many years by Allah's will. It then tells the story of the man with two gardens, who became proud of his wealth and lost it. The juz ends during the journey of Prophet Musa with Al-Khidr, at the moment the young boy is killed. Reading Surah Al-Kahf on Friday is a well known practice, and a hadith in Sahih Muslim says that whoever memorizes its first ten verses will be protected from the Dajjal. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 15?",
        answer:
          "Juz 15 includes the complete Surah Al-Isra (111 verses) and the first 74 verses of Surah Al-Kahf. It is known by its opening words, \"Subhanalladhi.\"",
      },
      {
        question: "Where does Juz 15 start and end in the Quran?",
        answer:
          "Juz 15 starts at Surah Al-Isra, verse 1, and ends at Surah Al-Kahf, verse 74.",
      },
      {
        question: "What is the main theme of Juz 15?",
        answer:
          "Juz 15 covers the Night Journey, good character and family duties, and the value of the Quran. It then moves to the stories of Surah Al-Kahf, which teach how to protect faith when facing trials.",
      },
      {
        question: "What does Juz 15 say about parents?",
        answer:
          "Surah Al-Isra, verses 23 and 24, command kindness to parents. Believers must not even say \"uff\" to them in old age, should speak to them gently, and should pray: \"My Lord, have mercy on them as they raised me when I was small.\"",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 15?",
        answer:
          "Yes. Surah Al-Isra, verse 109, is a verse of prostration. It describes those given knowledge who fall down on their faces weeping when the Quran is recited, and it increases them in humility.",
      },
    ],
  },

  16: {
    intro: [
      "Juz 16 begins at verse 75 of [Surah Al-Kahf](/surah/Al-Kahf) and runs to the end of that surah. It then covers the whole of [Surah Maryam](/surah/Maryam) and [Surah Taha](/surah/Taa-Haa). It is known by its opening words, \"Qala Alam,\" which means \"He said, did I not.\"",
      "The juz completes the journey of Prophet Musa with Al-Khidr, explaining the wisdom behind the boat, the boy, and the wall. It then tells the story of Dhul-Qarnayn, a righteous ruler who travelled east and west and built a barrier against Ya'juj and Ma'juj. Surah Al-Kahf ends with a reminder that whoever hopes to meet his Lord should do good deeds and worship Allah alone.",
      "Surah Maryam is named after Maryam, the mother of Isa, and is the only surah named after a woman. It tells how Allah gave Zakariya a son, Yahya, in his old age, and how Maryam gave birth to Isa without a father. Baby Isa spoke from the cradle to defend his mother. The surah also mentions Ibrahim, Musa, Ismail, and Idris, and it is full of mercy, with the name Ar-Rahman repeated many times.",
      "Surah Taha tells the story of Prophet Musa in detail: the call at the burning bush, his prayer \"My Lord, expand my chest for me,\" his stand before Pharaoh, the magicians who believed, and the golden calf of As-Samiri. It ends with the story of Adam and the prayer \"My Lord, increase me in knowledge.\" You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 16?",
        answer:
          "Juz 16 includes the last part of Surah Al-Kahf from verse 75, the complete Surah Maryam, and the complete Surah Taha. It is known by its opening words, \"Qala Alam.\"",
      },
      {
        question: "Where does Juz 16 start and end in the Quran?",
        answer:
          "Juz 16 starts at Surah Al-Kahf, verse 75, and ends at the last verse of Surah Taha, verse 135.",
      },
      {
        question: "What is the main theme of Juz 16?",
        answer:
          "Juz 16 shows Allah's wisdom and mercy through the stories of the prophets. It covers Musa and Al-Khidr, Dhul-Qarnayn, the births of Yahya and Isa, and the life of Musa in front of Pharaoh.",
      },
      {
        question: "Is Surah Maryam the only surah named after a woman?",
        answer:
          "Yes. Surah Maryam is the only surah in the Quran named after a woman. Maryam is also the only woman mentioned by name in the Quran.",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 16?",
        answer:
          "Yes. Surah Maryam, verse 58, is a verse of prostration. It describes the prophets who, when the verses of Ar-Rahman were recited to them, fell down in prostration and weeping.",
      },
    ],
  },

  17: {
    intro: [
      "Juz 17 covers two complete surahs, [Surah Al-Anbiya](/surah/Al-Anbiyaa) and [Surah Al-Hajj](/surah/Al-Hajj). It is known by its opening word, \"Iqtaraba,\" from the first verse: \"The time of their account has drawn near to the people, while they turn away in heedlessness.\"",
      "Surah Al-Anbiya means \"The Prophets,\" and it mentions many of them. It tells how Ibrahim broke the idols of his people and how Allah made the fire cool and safe for him. It shares the prayers of the prophets in hard times: Ayyub in his illness, Zakariya asking for a child, and Yunus in the belly of the whale, who said: \"There is no god but You, glory be to You, I was among the wrongdoers.\" Verse 107 describes the Prophet Muhammad ﷺ as a mercy to all the worlds.",
      "Surah Al-Hajj opens with a powerful picture of the earthquake of the Last Hour. It tells how Prophet Ibrahim was commanded to call people to Hajj, and how they would come on foot and on every lean camel from distant paths. It teaches that the meat and blood of sacrifices do not reach Allah, but the taqwa of the believer does. It also contains what many scholars consider the first permission given to Muslims to defend themselves after being wronged. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 17?",
        answer:
          "Juz 17 includes two complete surahs, Surah Al-Anbiya (112 verses) and Surah Al-Hajj (78 verses). It is known by its opening word, \"Iqtaraba.\"",
      },
      {
        question: "Where does Juz 17 start and end in the Quran?",
        answer:
          "Juz 17 starts at Surah Al-Anbiya, verse 1, and ends at the last verse of Surah Al-Hajj, verse 78.",
      },
      {
        question: "What is the main theme of Juz 17?",
        answer:
          "Juz 17 reminds people that the Day of Judgment is near and teaches through the lives and prayers of the prophets. It then explains the meaning of Hajj, sacrifice, and sincere worship.",
      },
      {
        question: "What is the dua of Prophet Yunus in Juz 17?",
        answer:
          "In Surah Al-Anbiya, verse 87, Yunus prayed from the darkness: \"La ilaha illa anta, subhanaka, inni kuntu minaz-zalimin.\" It means: \"There is no god but You, glory be to You, indeed I have been among the wrongdoers.\" Allah answered him and saved him from distress.",
      },
      {
        question: "How many prostration (sajdah) verses are in Juz 17?",
        answer:
          "Surah Al-Hajj has two places of prostration, at verses 18 and 77. The first is agreed upon by scholars. The second is followed by many scholars, though the Hanafi school does not count it as a place of prostration.",
      },
    ],
  },

  18: {
    intro: [
      "Juz 18 covers the whole of [Surah Al-Mu'minun](/surah/Al-Muminoon) and [Surah An-Nur](/surah/An-Noor), and the first 20 verses of [Surah Al-Furqan](/surah/Al-Furqaan). It is known by its opening words, \"Qad Aflaha,\" which means \"Successful indeed.\"",
      "Surah Al-Mu'minun begins by describing the believers who will be successful. They are humble in their prayers, they turn away from useless talk, they pay zakat, they guard their chastity, they keep their trusts and promises, and they protect their prayers. The surah then describes the stages of human creation in the womb and recalls the messages of Nuh, Musa, and other prophets. It ends with the question: \"Did you think that We created you without purpose?\"",
      "Surah An-Nur is a Medinan surah that gives guidance for a clean and safe society. It sets the rules about zina and false accusations, and clears Sayyidah Aishah (may Allah be pleased with her) of the slander that was spread about her. It teaches believers to ask permission before entering homes, to lower their gaze, and to dress modestly. It also contains Ayat an-Nur, verse 35: \"Allah is the Light of the heavens and the earth.\"",
      "The juz closes with the opening of Surah Al-Furqan, which describes the Quran as the criterion between right and wrong and answers the objections of those who rejected the Prophet ﷺ. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 18?",
        answer:
          "Juz 18 includes the complete Surah Al-Mu'minun, the complete Surah An-Nur, and the first 20 verses of Surah Al-Furqan. It is known by its opening words, \"Qad Aflaha.\"",
      },
      {
        question: "Where does Juz 18 start and end in the Quran?",
        answer:
          "Juz 18 starts at Surah Al-Mu'minun, verse 1, and ends at Surah Al-Furqan, verse 20.",
      },
      {
        question: "What is the main theme of Juz 18?",
        answer:
          "Juz 18 describes the qualities of true believers and gives guidance for a pure family and society, including modesty, privacy, and protecting people's honor.",
      },
      {
        question: "What are the qualities of successful believers in Juz 18?",
        answer:
          "Surah Al-Mu'minun, verses 1 to 11, says successful believers are humble in prayer, avoid vain talk, give zakat, guard their chastity, keep their trusts and promises, and carefully protect their prayers. They will inherit Al-Firdaws.",
      },
      {
        question: "What is Ayat an-Nur?",
        answer:
          "Ayat an-Nur is Surah An-Nur, verse 35. It begins \"Allah is the Light of the heavens and the earth\" and compares His light to a lamp inside a glass, lit from a blessed olive tree. It is one of the most reflected upon verses in the Quran.",
      },
    ],
  },

  19: {
    intro: [
      "Juz 19 begins at verse 21 of [Surah Al-Furqan](/surah/Al-Furqaan) and runs to the end of that surah. It then covers the whole of [Surah Ash-Shu'ara](/surah/Ash-Shu'araa) and ends at verse 55 of [Surah An-Naml](/surah/An-Naml). It is known by its opening words, \"Wa Qalalladhina,\" which means \"And those who said.\"",
      "Surah Al-Furqan continues by describing the regret of the wrongdoer on the Day of Judgment, who will bite his hands and wish he had followed the Messenger. The Prophet ﷺ is quoted saying: \"My Lord, my people have abandoned this Quran.\" The surah ends with a beautiful description of Ibad ar-Rahman, the servants of the Most Merciful, who walk humbly, answer the ignorant with peace, pray at night, and spend without waste or stinginess.",
      "Surah Ash-Shu'ara tells the stories of Musa, Ibrahim, Nuh, Hud, Salih, Lut, and Shu'ayb. Each story ends with the same words: \"Indeed in that is a sign, but most of them were not believers. And indeed, your Lord is the Exalted in Might, the Merciful.\" In this surah, the Prophet ﷺ is told to warn his closest relatives.",
      "The juz closes in Surah An-Naml, which tells how Prophet Sulaiman heard an ant warn the other ants, how the hoopoe brought news of the Queen of Sheba, and how her throne was brought before Sulaiman in the blink of an eye. Sulaiman's letter to her begins with Bismillah, the only place where Bismillah appears in the middle of a surah. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 19?",
        answer:
          "Juz 19 includes the last part of Surah Al-Furqan from verse 21, the complete Surah Ash-Shu'ara, and the first 55 verses of Surah An-Naml. It is known by its opening words, \"Wa Qalalladhina.\"",
      },
      {
        question: "Where does Juz 19 start and end in the Quran?",
        answer:
          "Juz 19 starts at Surah Al-Furqan, verse 21, and ends at Surah An-Naml, verse 55.",
      },
      {
        question: "What is the main theme of Juz 19?",
        answer:
          "Juz 19 shows how prophets were rejected by their people and how Allah saved the believers. It also describes the qualities of the true servants of Allah and the wise rule of Prophet Sulaiman.",
      },
      {
        question: "Who are Ibad ar-Rahman in Juz 19?",
        answer:
          "Surah Al-Furqan, verses 63 to 77, describes Ibad ar-Rahman, the servants of the Most Merciful. They walk humbly, reply to ignorant people with peace, pray at night, spend moderately, avoid shirk, murder, and zina, and pray for righteous spouses and children.",
      },
      {
        question: "How many prostration (sajdah) verses are in Juz 19?",
        answer:
          "Juz 19 has two verses of prostration: Surah Al-Furqan, verse 60, and Surah An-Naml, verse 26.",
      },
    ],
  },

  20: {
    intro: [
      "Juz 20 begins at verse 56 of [Surah An-Naml](/surah/An-Naml) and runs to the end of that surah. It then covers the whole of [Surah Al-Qasas](/surah/Al-Qasas) and ends at verse 45 of [Surah Al-Ankabut](/surah/Al-Ankaboot). It is known by its opening words, \"Amman Khalaq,\" which means \"Or who created.\"",
      "The rest of Surah An-Naml asks a series of powerful questions: Who created the heavens and the earth? Who sends rain? Who answers the one in distress when he calls? After each one comes the question: \"Is there any god with Allah?\" The surah also mentions the signs of the Last Day.",
      "Surah Al-Qasas, meaning \"The Stories,\" gives the fullest account of the early life of Prophet Musa. His mother placed him in the river by Allah's command, and he grew up in Pharaoh's own palace. He fled to Madyan, married, and was later called by Allah at the blessed valley. The surah also tells the story of Qarun, a rich man who became arrogant with his wealth and was swallowed by the earth. Verse 56 reminds the Prophet ﷺ that he cannot guide whoever he loves, but Allah guides whom He wills.",
      "The juz ends in Surah Al-Ankabut, which teaches that faith will be tested. It recalls Nuh, Ibrahim, and Lut, and compares those who rely on anything other than Allah to a spider's web, the weakest of homes. Verse 45 says that prayer keeps a person away from immorality and wrongdoing. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 20?",
        answer:
          "Juz 20 includes the last part of Surah An-Naml from verse 56, the complete Surah Al-Qasas, and the first 45 verses of Surah Al-Ankabut. It is known by its opening words, \"Amman Khalaq.\"",
      },
      {
        question: "Where does Juz 20 start and end in the Quran?",
        answer:
          "Juz 20 starts at Surah An-Naml, verse 56, and ends at Surah Al-Ankabut, verse 45.",
      },
      {
        question: "What is the main theme of Juz 20?",
        answer:
          "Juz 20 is about the oneness and power of Allah, the life of Prophet Musa, the danger of arrogance with wealth, and the tests that come with faith.",
      },
      {
        question: "Who was Qarun in Juz 20?",
        answer:
          "Qarun was a man from the people of Musa who was given great treasures. He said his wealth came from his own knowledge and refused to be humble. Surah Al-Qasas, verses 76 to 82, tells how Allah caused the earth to swallow him and his home.",
      },
      {
        question: "What does Juz 20 say about prayer?",
        answer:
          "Surah Al-Ankabut, verse 45, says: \"Establish prayer. Indeed, prayer prevents immorality and wrongdoing, and the remembrance of Allah is greater.\" It shows that sincere prayer shapes a person's whole character.",
      },
    ],
  },

  22: {
    intro: [
      "Juz 22 begins at verse 31 of [Surah Al-Ahzab](/surah/Al-Ahzaab) and runs to the end of that surah. It then covers the whole of [Surah Saba](/surah/Saba) and [Surah Fatir](/surah/Faatir), and ends at verse 27 of [Surah Yasin](/surah/Yaseen). It is known by its opening words, \"Wa Man Yaqnut,\" which means \"And whoever is devoutly obedient.\"",
      "The rest of Surah Al-Ahzab gives guidance to the wives of the Prophet ﷺ and to the whole community. Verse 35 lists ten qualities of believing men and women, such as faith, truthfulness, patience, charity, fasting, and remembering Allah often, and promises both of them forgiveness and a great reward. Verse 40 declares that Muhammad ﷺ is the Messenger of Allah and the Seal of the Prophets. Verse 56 says that Allah and His angels send blessings on the Prophet ﷺ, and tells believers to do the same.",
      "Surah Saba tells of the gifts given to Prophet Dawud and Sulaiman. The mountains and birds glorified Allah with Dawud, and iron was made soft for him. Sulaiman died while leaning on his staff, and the jinn only realized it when a creature of the earth ate through the staff. The surah then tells of the people of Saba, who turned away from gratitude and lost their gardens in a great flood.",
      "Surah Fatir praises Allah as the Creator who made angels with wings. It says that among His servants, only those with knowledge truly fear Him. The juz ends in Surah Yasin with the story of a town that rejected its messengers, and a man who came running from the far end of the city to tell his people to follow them. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 22?",
        answer:
          "Juz 22 includes the last part of Surah Al-Ahzab from verse 31, the complete Surah Saba, the complete Surah Fatir, and the first 27 verses of Surah Yasin. It is known by its opening words, \"Wa Man Yaqnut.\"",
      },
      {
        question: "Where does Juz 22 start and end in the Quran?",
        answer:
          "Juz 22 starts at Surah Al-Ahzab, verse 31, and ends at Surah Yasin, verse 27.",
      },
      {
        question: "What is the main theme of Juz 22?",
        answer:
          "Juz 22 covers the honor of the Prophet ﷺ and his family, the equal reward for believing men and women, gratitude for Allah's blessings, and the result of rejecting the messengers.",
      },
      {
        question: "Which verse tells us to send salawat on the Prophet ﷺ?",
        answer:
          "Surah Al-Ahzab, verse 56, which is in Juz 22, says: \"Indeed, Allah and His angels send blessings upon the Prophet. O you who believe, send blessings upon him and greet him with peace.\"",
      },
      {
        question: "What happened to the people of Saba?",
        answer:
          "Surah Saba, verses 15 to 17, says the people of Saba had two rich gardens on their right and left. When they turned away from thanking Allah, He sent a great flood that destroyed their gardens and left them with bitter fruit and few trees.",
      },
    ],
  },

  24: {
    intro: [
      "Juz 24 begins at verse 32 of [Surah Az-Zumar](/surah/Az-Zumar) and runs to the end of that surah. It then covers the whole of [Surah Ghafir](/surah/Ghafir) and ends at verse 46 of [Surah Fussilat](/surah/Fussilat). It is known by its opening words, \"Fa Man Azlamu,\" which means \"So who is more unjust.\"",
      "This juz contains one of the most hopeful verses in the Quran, Surah Az-Zumar, verse 53: \"Say, O My servants who have wronged themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.\" The surah ends with a scene from the Day of Judgment, when the disbelievers are led to Hell in groups and the righteous are led to Paradise in groups, where the gatekeepers greet them with peace.",
      "Surah Ghafir, also called Surah Al-Mu'min, is the first of seven surahs that begin with Ha Meem. Its name means \"The Forgiver.\" It tells how the angels who carry the Throne pray for forgiveness for the believers. It also tells the story of a believing man from Pharaoh's family who hid his faith and then bravely defended Prophet Musa. Verse 60 contains Allah's promise: \"Call upon Me, I will respond to you.\"",
      "Surah Fussilat describes how the Quran was explained in clear Arabic, and how on the Day of Judgment people's own ears, eyes, and skins will speak against them. Verse 30 gives good news to those who say \"Our Lord is Allah\" and stay firm on it, and verse 34 teaches believers to answer evil with what is better. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 24?",
        answer:
          "Juz 24 includes the last part of Surah Az-Zumar from verse 32, the complete Surah Ghafir, and the first 46 verses of Surah Fussilat. It is known by its opening words, \"Fa Man Azlamu.\"",
      },
      {
        question: "Where does Juz 24 start and end in the Quran?",
        answer:
          "Juz 24 starts at Surah Az-Zumar, verse 32, and ends at Surah Fussilat, verse 46.",
      },
      {
        question: "What is the main theme of Juz 24?",
        answer:
          "Juz 24 is about the mercy and forgiveness of Allah, the power of dua, standing firm in faith, and the scenes of the Day of Judgment.",
      },
      {
        question: "What is the verse about not losing hope in Allah's mercy?",
        answer:
          "Surah Az-Zumar, verse 53, in Juz 24, says: \"O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. He is the Forgiving, the Merciful.\" It invites every person to repent, no matter what they have done.",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 24?",
        answer:
          "Yes. Surah Fussilat has a verse of prostration at verse 38, though some scholars place it at verse 37. For this reason the surah is also known as Ha Meem As-Sajdah.",
      },
    ],
  },

  25: {
    intro: [
      "Juz 25 begins at verse 47 of [Surah Fussilat](/surah/Fussilat) and runs to the end of that surah. It then covers four complete surahs: [Surah Ash-Shura](/surah/Ash-Shura), [Surah Az-Zukhruf](/surah/Az-Zukhruf), [Surah Ad-Dukhan](/surah/Ad-Dukhaan), and [Surah Al-Jathiya](/surah/Al-Jaathiya). It is known by its opening words, \"Ilayhi Yuraddu,\" which means \"To Him is referred.\"",
      "The juz opens by saying that knowledge of the Hour belongs to Allah alone. Surah Fussilat ends with the promise: \"We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth.\"",
      "Surah Ash-Shura means \"The Consultation.\" Verse 38 praises believers who run their affairs by mutual consultation. Verse 11 says \"There is nothing like Him,\" and verse 13 explains that the same religion was given to Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ. Surah Az-Zukhruf warns against being fooled by gold and worldly shine, and teaches the dua for travelling on a ride. Surah Ad-Dukhan says the Quran was sent down on a blessed night and tells of Pharaoh's end. Surah Al-Jathiya describes every nation kneeling on the Day of Judgment, waiting for its record.",
      "All five surahs in this juz begin with the letters Ha Meem, and together they focus on revelation, the oneness of Allah, and the coming Judgment. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 25?",
        answer:
          "Juz 25 includes the last part of Surah Fussilat from verse 47, and the complete Surahs Ash-Shura, Az-Zukhruf, Ad-Dukhan, and Al-Jathiya. It is known by its opening words, \"Ilayhi Yuraddu.\"",
      },
      {
        question: "Where does Juz 25 start and end in the Quran?",
        answer:
          "Juz 25 starts at Surah Fussilat, verse 47, and ends at the last verse of Surah Al-Jathiya, verse 37.",
      },
      {
        question: "What is the main theme of Juz 25?",
        answer:
          "Juz 25 focuses on the truth of revelation, the oneness of Allah, the danger of loving worldly things too much, and the certainty of the Day of Judgment.",
      },
      {
        question: "What is the travel dua mentioned in Juz 25?",
        answer:
          "Surah Az-Zukhruf, verses 13 and 14, teaches: \"Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.\" It means: \"Glory be to the One who has made this subject to us, and we could not have done it ourselves. And to our Lord we will surely return.\" Muslims say it when starting a journey.",
      },
      {
        question: "What does Surah Ash-Shura say about consultation?",
        answer:
          "Surah Ash-Shura, verse 38, describes believers as those who answer their Lord, establish prayer, and conduct their affairs by mutual consultation. This verse is the basis for the Islamic value of shura.",
      },
    ],
  },

  27: {
    intro: [
      "Juz 27 begins at verse 31 of [Surah Adh-Dhariyat](/surah/Adh-Dhaariyat) and runs to the end of that surah. It then covers six complete surahs: [Surah At-Tur](/surah/At-Tur), [Surah An-Najm](/surah/An-Najm), [Surah Al-Qamar](/surah/Al-Qamar), [Surah Ar-Rahman](/surah/Ar-Rahmaan), [Surah Al-Waqi'ah](/surah/Al-Waaqia), and [Surah Al-Hadid](/surah/Al-Hadid). It is known by its opening words, \"Qala Fama Khatbukum,\" which means \"He said, then what is your business.\"",
      "Surah Adh-Dhariyat continues with the angels sent to the people of Lut, and then mentions Pharaoh, Ad, Thamud, and the people of Nuh. Verse 56 explains the purpose of life: \"I did not create the jinn and mankind except to worship Me.\" Surah At-Tur describes the Day of Judgment and the joy of the people of Paradise. Surah An-Najm tells of the Prophet's ﷺ ascension and his vision near the Lote Tree of the farthest boundary, and it teaches that each person will have only what they strive for.",
      "Surah Al-Qamar begins with the splitting of the moon and repeats four times that the Quran has been made easy to remember. Surah Ar-Rahman lists Allah's blessings and asks again and again: \"So which of the favors of your Lord would you deny?\" Surah Al-Waqi'ah divides people into three groups on the Day of Judgment. Surah Al-Hadid speaks about iron, spending in Allah's way, and asks: \"Has the time not come for the hearts of the believers to be humbled by the remembrance of Allah?\"",
      "Juz 27 is one of the most recited parts of the Quran, full of vivid scenes of the Hereafter and reminders of Allah's mercy. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 27?",
        answer:
          "Juz 27 includes the last part of Surah Adh-Dhariyat from verse 31, and the complete Surahs At-Tur, An-Najm, Al-Qamar, Ar-Rahman, Al-Waqi'ah, and Al-Hadid. It is known by its opening words, \"Qala Fama Khatbukum.\"",
      },
      {
        question: "Where does Juz 27 start and end in the Quran?",
        answer:
          "Juz 27 starts at Surah Adh-Dhariyat, verse 31, and ends at the last verse of Surah Al-Hadid, verse 29.",
      },
      {
        question: "What is the main theme of Juz 27?",
        answer:
          "Juz 27 focuses on the purpose of life, the reality of the Day of Judgment, the rewards of Paradise, and gratitude for the countless blessings of Allah.",
      },
      {
        question: "Are Surah Ar-Rahman and Surah Al-Waqi'ah in Juz 27?",
        answer:
          "Yes. Both Surah Ar-Rahman (the 55th surah) and Surah Al-Waqi'ah (the 56th surah) are complete in Juz 27. In Surah Ar-Rahman, the verse \"So which of the favors of your Lord would you deny?\" is repeated 31 times.",
      },
      {
        question: "Is there a prostration (sajdah) verse in Juz 27?",
        answer:
          "Yes. The last verse of Surah An-Najm, verse 62, is a verse of prostration. Sahih al-Bukhari reports that when the Prophet ﷺ recited it in Makkah, he prostrated, and everyone present prostrated with him.",
      },
    ],
  },

  28: {
    intro: [
      "Juz 28 covers nine complete surahs, from [Surah Al-Mujadila](/surah/Al-Mujaadila) to [Surah At-Tahrim](/surah/At-Tahrim). It is known by its opening words, \"Qad Sami Allah,\" which means \"Allah has indeed heard.\" All nine surahs in this juz were revealed in Madinah.",
      "Surah Al-Mujadila begins with a woman, known in the narrations as Khawlah bint Tha'labah, who came to the Prophet ﷺ to complain about her husband, and Allah revealed that He had heard her plea. The surah also teaches manners for gatherings, such as making room for others. [Surah Al-Hashr](/surah/Al-Hashr) speaks about the exile of the Banu an-Nadir, praises the generosity of the Ansar, and ends with many beautiful names of Allah. Surah Al-Mumtahanah explains how to deal with non-Muslims and holds up Prophet Ibrahim as an example.",
      "Surah As-Saff praises believers who stand together like a solid wall, and mentions that Prophet Isa gave good news of a messenger named Ahmad. [Surah Al-Jumu'ah](/surah/Al-Jumu'a) commands believers to hurry to the Friday prayer and leave trade when the call is made. Surah Al-Munafiqun describes the signs of hypocrites, and Surah At-Taghabun reminds people that wealth and children are a test.",
      "Surah At-Talaq sets the rules of divorce with fairness and contains the well known promise: \"Whoever fears Allah, He will make a way out for him and provide for him from where he does not expect.\" Surah At-Tahrim ends the juz by giving examples of women of faith, the wife of Pharaoh and Maryam. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 28?",
        answer:
          "Juz 28 includes nine complete surahs: Al-Mujadila, Al-Hashr, Al-Mumtahanah, As-Saff, Al-Jumu'ah, Al-Munafiqun, At-Taghabun, At-Talaq, and At-Tahrim. It is known by its opening words, \"Qad Sami Allah.\"",
      },
      {
        question: "Where does Juz 28 start and end in the Quran?",
        answer:
          "Juz 28 starts at Surah Al-Mujadila, verse 1, and ends at the last verse of Surah At-Tahrim, verse 12.",
      },
      {
        question: "What is the main theme of Juz 28?",
        answer:
          "Juz 28 gives practical guidance for the Muslim community in Madinah. It covers family matters, Friday prayer, unity, relations with others, the danger of hypocrisy, and trust in Allah.",
      },
      {
        question: "Are all the surahs in Juz 28 Medinan?",
        answer:
          "Yes. All nine surahs in Juz 28 were revealed in Madinah. This is why they focus on laws, community life, and the challenges the Muslims faced after the Hijrah.",
      },
      {
        question: "Which verse in Juz 28 talks about Friday prayer?",
        answer:
          "Surah Al-Jumu'ah, verses 9 and 10, tell believers to hurry to the remembrance of Allah and leave trade when the call to Friday prayer is made. After the prayer, they may go out and seek the bounty of Allah.",
      },
    ],
  },

  30: {
    intro: [
      "Juz 30 is the last of the Quran's thirty parts. It is often called Juz Amma, from its opening words, \"Amma Yatasa'alun,\" which means \"About what are they asking one another?\" It begins with [Surah An-Naba](/surah/An-Naba) and ends with [Surah An-Nas](/surah/An-Naas), covering 37 surahs in total, from surah 78 to surah 114.",
      "Most of the surahs in this juz are short and were revealed in Makkah. They speak about the basics of faith: the oneness of Allah, the Day of Judgment, Paradise and Hell, and good character. They describe the end of the world in powerful images, such as the sun being wrapped up, the stars falling, and the sky splitting open. This juz also contains [Surah Al-Alaq](/surah/Al-Alaq), whose first five verses were the very first revelation given to the Prophet ﷺ in the Cave of Hira.",
      "Because the surahs are short, Juz 30 is usually the first part of the Quran that children and new Muslims memorize, and these surahs are recited in daily prayers around the world. It includes [Surah Al-Ikhlas](/surah/Al-Ikhlaas), which the Prophet ﷺ said is equal to a third of the Quran (Sahih al-Bukhari), and the two surahs of protection, [Surah Al-Falaq](/surah/Al-Falaq) and Surah An-Nas. You can read more Juz and explore the complete [Quran online free](/) on Al-Quran Hub.",
    ],
    faqs: [
      {
        question: "What surahs are included in Juz 30?",
        answer:
          "Juz 30 includes 37 complete surahs, from Surah An-Naba (78) to Surah An-Nas (114). It is known as Juz Amma, from its opening words, \"Amma Yatasa'alun.\"",
      },
      {
        question: "Why is Juz 30 called Juz Amma?",
        answer:
          "It is called Juz Amma because its first surah, An-Naba, begins with the word \"Amma,\" meaning \"About what.\" Each juz is commonly known by its opening words.",
      },
      {
        question: "What is the main theme of Juz 30?",
        answer:
          "Juz 30 focuses on the Day of Judgment, the signs of Allah in creation, the oneness of Allah, and good character, such as caring for orphans and the poor and not being greedy.",
      },
      {
        question: "Why do people memorize Juz 30 first?",
        answer:
          "Juz 30 has many short surahs that are easy to learn and are often recited in daily prayers. That is why it is usually the first juz that children and beginners memorize.",
      },
      {
        question: "How many prostration (sajdah) verses are in Juz 30?",
        answer:
          "Juz 30 has two verses of prostration: Surah Al-Inshiqaq, verse 21, and the last verse of Surah Al-Alaq, verse 19.",
      },
    ],
  },
};

export function getJuzContent(juzNumber) {
  if (!juzNumber) return null;
  return juzContent[juzNumber] || null;
}
