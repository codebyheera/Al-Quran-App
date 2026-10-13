/**
 * data/tasbihFaqs.js — FAQ content + schema builder for the Tasbih page.
 *
 * Extracted into its own file (rather than living only inside TasbihPage.jsx)
 * so both the runtime component AND scripts/prerender.js can import the exact
 * same data — same reasoning as pageSeo.js's shared title/description: if the
 * FAQ text only existed inside TasbihPage.jsx, prerender.js (which never
 * mounts that component for static pages — see its Juz/blog/tasbih handling)
 * would have no way to bake the page's JSON-LD (buildTasbihSchema: FAQPage,
 * WebApplication, WebPage, BreadcrumbList) into the static HTML, and it would
 * only reach Google via the slower JS-rendering pass.
 *
 * TODO: the Astaghfirullah answer deliberately avoids citing a specific
 * hadith number/wording — verify the exact reference (likely Sahih
 * al-Bukhari, "more than seventy times a day") with a qualified source
 * before tightening the phrasing or adding a citation, same as the TODOs on
 * DuroodSharifPage.jsx.
 */

export const TASBIH_FAQS = [
  {
    question: 'How many times should I recite SubhanAllah after prayer?',
    answer:
      'The Sunnah is to say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times after each of the five daily prayers — 100 in total (Sahih Muslim 597). Switch to Sunnah Mode above and the counter guides you through this exact sequence automatically.',
  },
  {
    question: 'What is the difference between Normal Mode and Sunnah Mode?',
    answer:
      'Normal Mode counts any single dhikr you pick toward a target you choose — 33, 99, 100, or a custom number. Sunnah Mode walks you through the after-prayer sequence for you: SubhanAllah, then Alhamdulillah, then Allahu Akbar, moving to the next phrase automatically once each count is complete.',
  },
  {
    question: 'Do I need wudu to use a tasbih counter or count dhikr?',
    answer:
      "No. Dhikr — remembering Allah through phrases like SubhanAllah and Alhamdulillah — doesn't require wudu, unlike touching the physical Mushaf or performing salah. You can count dhikr any time, in any state: while walking, commuting, or resting.",
  },
  {
    question: 'How many times a day should I say Astaghfirullah?',
    answer:
      "There's no single fixed number — many Muslims recite it 100 or more times a day as a personal habit of seeking forgiveness. Select Astaghfirullah above, set a target that works for you, and build the habit at your own pace.",
  },
  {
    question: 'Is there a fixed number of times to recite Durood Sharif?',
    answer:
      "There's no fixed count — many Muslims recite it 10, 33, or 100 times daily, especially on Fridays. Visit our dedicated Durood Sharif page for the full Durood-e-Ibrahim text with translation, an audio recitation, and its own counter.",
  },
  {
    question: 'Do I need to download an app to use this tasbih counter?',
    answer:
      'No. This tasbih counter works directly in your browser on any phone, tablet, or computer — no installation required. Your daily counts and streak are saved automatically on your device, so you can close the tab and pick up right where you left off.',
  },
];

const SITE_URL = 'https://alquranhub.org';

// Full JSON-LD @graph for /tasbih: WebPage + WebApplication (the counter itself)
// + FAQPage + BreadcrumbList, linked by @id to the site-wide WebSite/Organization
// nodes that Home.jsx defines in full. The BreadcrumbList lives here rather than
// in <Breadcrumb>, which TasbihPage hides in Focus Mode.
export function buildTasbihSchema(pageUrl, { title, description }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#app` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${pageUrl}#app`,
        name: 'Digital Tasbih Counter',
        url: pageUrl,
        description:
          'Free online tasbih (dhikr) counter with Sunnah Mode for the 33-33-34 after-prayer sequence, custom targets, daily streak tracking and Focus Mode.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Works in any modern web browser.',
        inLanguage: 'en',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Sunnah Mode: SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34',
          'Normal Mode with 33, 99, 100 or custom targets',
          'Daily streak tracking saved on your device',
          'Distraction-free Focus Mode',
          'No app download or sign-up required',
        ],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#tasbih-faq`,
        url: pageUrl,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: TASBIH_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Tasbih', item: pageUrl },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'Al-Quran Hub',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Al-Quran Hub',
        url: `${SITE_URL}/`,
      },
    ],
  };
}
