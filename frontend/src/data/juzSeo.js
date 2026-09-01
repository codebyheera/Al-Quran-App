// Hand-written, keyword-researched title/description per Juz.
// Shared by JuzView.jsx (runtime <Helmet>) and scripts/prerender.js (build-time static HTML)
// so prerendered pages always match exactly what the live page renders — single source of truth.

export const juzSeo = {
  5: {
    title: "Juz 5: Read with English Translation - Al-Quran Hub",
    description:
      "Read Juz 5 online with English translation and audio recitation. Covers Surah An-Nisa verses 24 to 147, from marriage to inheritance.",
  },
};

export function getJuzSeo(juzNum) {
  const override = juzSeo[juzNum];
  if (override) return override;
  return {
    title: `Juz ${juzNum} – Arabic Recitation & English Translation - Al-Quran Hub`,
    description: `Read and listen to Juz ${juzNum} of the Holy Quran online. Arabic text, English translation, and beautiful recitation available.`,
  };
}
