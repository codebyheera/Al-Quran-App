// Hand-written, keyword-researched title/description for every static (non-Surah) route.
// Shared by each page's <Helmet> (runtime) and scripts/prerender.js (build-time static HTML)
// so the two can never drift — edit here once and both consumers pick it up automatically.

export const pageSeo = {
  home: {
    path: '/',
    title: 'Al-Quran Hub | Read Quran Pak Online Free',
    description:
      'Read Quran Pak online for free with daily prayer times, Verse of the Day, and Islamic blog. Access all 114 Surahs and 30 Juz with beautiful recitation on Al-Quran Hub.',
    keywords: 'quran pak, read quran online, quran online, al quran',
  },
  surahList: {
    path: '/surah',
    title: 'Surahs of the Quran – Read & Listen Online Free',
    description:
      'Access all Surahs of the Holy Quran online. Read in Arabic, listen to authentic recitations, and explore each Ayah easily.',
  },
  juzList: {
    path: '/juz',
    title: 'Holy Quran Juz – Arabic Recitation Online',
    description: 'Read and listen to the complete Quran Juz online. Perfect for recitation, learning, and spiritual growth.',
  },
  bookmarks: {
    path: '/bookmarks',
    title: 'Quran Bookmarks – Save & Read Quran Online',
    description:
      'Keep track of your Quran bookmarks online. Read Surahs, listen to recitations, and explore saved Ayahs easily.',
  },
  tasbih: {
    path: '/tasbih',
    title: 'Digital Tasbih Counter Online | Al-Quran Hub',
    description:
      'Count SubhanAllah, Alhamdulillah, Allahu Akbar and La ilaha illAllah with our free digital tasbih counter. Includes Sunnah Mode (33-33-34), streak tracking, and Focus Mode. No download needed.',
    keywords: 'tasbih counter, digital tasbih, dhikr counter, subhanallah counter, tasbih online',
    ogDescription:
      'Count SubhanAllah, Alhamdulillah, Allahu Akbar and La ilaha illAllah with our free digital tasbih counter. Includes Sunnah Mode (33-33-34), streak tracking, and Focus Mode.',
  },
  search: {
    path: '/search',
    title: 'Search the Holy Quran – Al-Quran Hub',
    description:
      'Search for any word or phrase in the Holy Quran English translation. Find Ayahs and Surahs easily with our fast search.',
  },
  support: {
    path: '/support',
    title: 'Support Al-Quran Hub | Help Keep Quran Free for Everyone',
    description: 'Support Al-Quran Hub with a donation. Help us keep the Holy Quran free and accessible online for Muslims worldwide.',
    keywords: 'Quran, Al-Quran Hub, donate, support, sadaqah, Islamic app, free Quran online, sadaqah jariyah, Muslim community',
  },
  blogArchive: {
    path: '/blog',
    title: 'Islamic Blog – Quran, Hadith & Spirituality | Al-Quran Hub',
    description: 'Explore Surah benefits, Tafsir, and Islamic guides written to deepen your connection with the Quran. Free, ad-free.',
  },
};
