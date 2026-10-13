// JSON-LD for the /surah listing page: CollectionPage + ItemList of all Surahs +
// BreadcrumbList, linked by @id to the site-wide WebSite/Organization nodes that
// Home.jsx defines in full. Shared by SurahList.jsx (runtime <Helmet>) and
// scripts/prerender.js (build-time static HTML) so both emit the same graph.

import { pageSeo } from './pageSeo.js';

const SITE_URL = 'https://alquranhub.org';

export function buildSurahListSchema(surahs) {
  const pageUrl = `${SITE_URL}${pageSeo.surahList.path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageSeo.surahList.title,
        description: pageSeo.surahList.description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: 'All 114 Surahs of the Holy Quran',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: surahs.length,
        itemListElement: surahs.map((s) => ({
          '@type': 'ListItem',
          position: s.number,
          url: `${SITE_URL}/surah/${s.englishName}`,
          name: `Surah ${s.englishName} (${s.nameTranslation})`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Surahs', item: pageUrl },
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
