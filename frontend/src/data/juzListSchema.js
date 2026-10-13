// JSON-LD for the /juz listing page: CollectionPage + ItemList of all 30 Juz +
// BreadcrumbList, linked by @id to the site-wide WebSite/Organization nodes that
// Home.jsx defines in full. Shared by JuzList.jsx (runtime <Helmet>) and
// scripts/prerender.js (build-time static HTML) so both emit the same graph.
// Same structure as surahListSchema.js.

import { pageSeo } from './pageSeo.js';

const SITE_URL = 'https://alquranhub.org';
const JUZ_COUNT = 30;

export function buildJuzListSchema() {
  const pageUrl = `${SITE_URL}${pageSeo.juzList.path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageSeo.juzList.title,
        description: pageSeo.juzList.description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: 'All 30 Juz (Para) of the Holy Quran',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: JUZ_COUNT,
        itemListElement: Array.from({ length: JUZ_COUNT }, (_, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/juz/${i + 1}`,
          name: `Juz ${i + 1} (Para ${i + 1})`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Juz', item: pageUrl },
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
