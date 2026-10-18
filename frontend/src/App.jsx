
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, matchPath } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAudio } from './context/AudioContext';
import { useBookmarks } from './context/BookmarkContext';
import { pageSeo } from './data/pageSeo';
import { getStreakData } from './lib/streakUtils';

// ── Lazy load heavy global components ────────────────────────────────────────
const BottomPlayer        = lazy(() => import('./components/BottomPlayer'));
const SupportPopup        = lazy(() => import('./components/SupportPopup'));
const NotificationBanner  = lazy(() => import('./components/NotificationBanner'));
const ChatWidget          = lazy(() => import('./components/ChatWidget'));
const DaroodReminderToast = lazy(() => import('./components/DaroodReminderToast'));
const LanguagePrompt      = lazy(() => import('./components/LanguagePrompt'));

// ── Home is eagerly loaded (critical first paint) ────────────────────────────
import Home from './pages/Home';

// lazy() that can also be loaded ahead of render: once preload() resolves, the
// page renders synchronously instead of suspending. main.jsx preloads the
// landing page before the first render (and prerender.js before the build-time
// render), and App prefetches common pages when idle, so <PageLoader /> only
// shows for a page that genuinely hasn't downloaded yet.
function lazyWithPreload(factory) {
  let loaded = null;
  let promise = null;
  const load = () => (promise ||= factory().then((mod) => { loaded = mod; return mod; }));
  const LazyPage = lazy(load);
  // Chosen once per mount: switching from LazyPage to the loaded component
  // mid-life (e.g. after an idle prefetch) would remount the page and lose its state.
  const Page = (props) => {
    const [Component] = useState(() => (loaded ? loaded.default : LazyPage));
    return <Component {...props} />;
  };
  Page.preload = load;
  return Page;
}

// ── Lazy load all other pages ─────────────────────────────────────────────────
const SurahList         = lazyWithPreload(() => import('./pages/SurahList'));
const SurahView         = lazyWithPreload(() => import('./pages/SurahView'));
const JuzList           = lazyWithPreload(() => import('./pages/JuzList'));
const JuzView           = lazyWithPreload(() => import('./pages/JuzView'));
const BookmarksPage     = lazyWithPreload(() => import('./pages/BookmarksPage'));
const TasbihPage        = lazyWithPreload(() => import('./pages/TasbihPage'));
const SearchPage        = lazyWithPreload(() => import('./pages/SearchPage'));
const SupportPage       = lazyWithPreload(() => import('./pages/SupportPage'));
const ContactPage       = lazyWithPreload(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazyWithPreload(() => import('./pages/PrivacyPolicyPage'));
const TermsPage         = lazyWithPreload(() => import('./pages/TermsPage'));
const BlogArchive       = lazyWithPreload(() => import('./pages/BlogArchive'));
const BlogPost          = lazyWithPreload(() => import('./pages/BlogPost'));
const PrayerTimesHub    = lazyWithPreload(() => import('./pages/PrayerTimesHub'));
const PrayerCityPage    = lazyWithPreload(() => import('./pages/PrayerCityPage'));
const DuroodSharifPage  = lazyWithPreload(() => import('./pages/DuroodSharifPage'));
const NotFound          = lazyWithPreload(() => import('./pages/NotFound'));

// Lazy routes. `src` is the page's module, which prerender.js looks up in Vite's
// build manifest to <link> its JS + CSS in the route's static HTML.
export const ROUTES = [
  { path: '/surah',                src: 'src/pages/SurahList.jsx',         Page: SurahList },
  { path: '/surah/:id',            src: 'src/pages/SurahView.jsx',         Page: SurahView },
  { path: '/juz',                  src: 'src/pages/JuzList.jsx',           Page: JuzList },
  { path: '/juz/:id',              src: 'src/pages/JuzView.jsx',           Page: JuzView },
  { path: '/bookmarks',            src: 'src/pages/BookmarksPage.jsx',     Page: BookmarksPage },
  { path: '/tasbih',               src: 'src/pages/TasbihPage.jsx',        Page: TasbihPage },
  { path: '/search',               src: 'src/pages/SearchPage.jsx',        Page: SearchPage },
  { path: '/support',              src: 'src/pages/SupportPage.jsx',       Page: SupportPage },
  { path: '/contact',              src: 'src/pages/ContactPage.jsx',       Page: ContactPage },
  { path: '/privacy-policy',       src: 'src/pages/PrivacyPolicyPage.jsx', Page: PrivacyPolicyPage },
  { path: '/terms-and-conditions', src: 'src/pages/TermsPage.jsx',         Page: TermsPage },
  { path: '/blog',                 src: 'src/pages/BlogArchive.jsx',       Page: BlogArchive },
  { path: '/blog/:slug',           src: 'src/pages/BlogPost.jsx',          Page: BlogPost },
  { path: '/prayer-times',         src: 'src/pages/PrayerTimesHub.jsx',    Page: PrayerTimesHub },
  { path: '/prayer-times/:city',   src: 'src/pages/PrayerCityPage.jsx',    Page: PrayerCityPage },
  { path: '/durood-sharif',        src: 'src/pages/DuroodSharifPage.jsx',  Page: DuroodSharifPage },
];

// Route pattern → preload for its lazy page.
export const preloadRoute = Object.fromEntries(ROUTES.map(({ path, Page }) => [path, Page.preload]));

// The lazy route a concrete pathname renders (e.g. /surah/Al-Kahf → '/surah/:id').
export function findRoute(pathname) {
  return ROUTES.find(({ path }) => matchPath(path, pathname));
}

// The preload for the page a pathname renders: undefined for Home (not lazy),
// NotFound's for unknown paths.
export function getRoutePreload(pathname) {
  if (matchPath('/', pathname)) return undefined;
  return findRoute(pathname)?.Page.preload || NotFound.preload;
}

// Prefetched once the browser is idle, so navigating to them from the Navbar
// renders instantly instead of showing <PageLoader />.
const PREFETCH_PAGES = [SurahList, SurahView, JuzList, JuzView, TasbihPage, PrayerTimesHub, BlogArchive, BookmarksPage];

// ── Lightweight loader ───────────────────────────────────────────────────────
// Same spinner as the pages' own loading states, in the active theme's colors;
// fades in after a short delay (see .page-loader) so a quick load shows nothing.
const PageLoader = () => (
  <div className="loading-center page-loader" role="status" aria-label="Loading">
    <div className="spinner" />
  </div>
);

export default function App() {
  const { currentVerse } = useAudio();
  const { toast } = useBookmarks();
  const location = useLocation();
  const canonicalUrl = `https://alquranhub.org${location.pathname === '/' ? '' : location.pathname}`;
  // Static routes' og:title/og:description, from the same pageSeo entry that
  // prerender.js bakes into their HTML.
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const routeSeo = Object.values(pageSeo).find((page) => page.path === normalizedPath);

  // Surah pages are /surah/:id, where :id is usually the canonical name
  // slug (e.g. "At-Tawba") — the backend normalizes numeric ids too.
  const surahPageMatch = location.pathname.match(/^\/surah\/([^/]+)/);
  const currentSurahSlug = surahPageMatch ? decodeURIComponent(surahPageMatch[1]) : null;

  // Runs once per app load (App wraps every route) so the daily reading
  // streak's date rollover — and the "missed the goal, reset streak"
  // check — happens regardless of which page the visitor lands on first.
  useEffect(() => {
    getStreakData();
  }, []);

  // Skipped on Data Saver — prefetching is a nicety, not worth the user's data.
  useEffect(() => {
    if (navigator.connection?.saveData) return;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => PREFETCH_PAGES.forEach((Page) => Page.preload().catch(() => {})));
    return () => cancel(id);
  }, []);

  return (
    <div className={`app-root ${currentVerse ? 'has-player' : ''}`}>
      {/* Site-wide defaults — overridden per-page by each page's own <Helmet> */}
      <Helmet>
        <title>Al-Quran Hub | Read Quran Pak Online Free</title>
        <meta name="keywords" content={pageSeo.home.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://alquranhub.org${location.pathname}`} />
        {/* Declared here so react-helmet-async doesn't strip index.html's
            data-rh og tags on hydration (it removes any data-rh tag no
            <Helmet> claims) — pages can still override og:image per-page */}
        <meta property="og:site_name" content="Al-Quran Hub" />
        <meta property="og:image" content="https://alquranhub.org/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Same reason: without these, static pages whose own <Helmet> has no
            og:title/og:description (e.g. /surah, /juz) lost the prerendered
            ones once JS ran. Pages that set their own still override them. */}
        {routeSeo && <meta property="og:title" content={routeSeo.title} />}
        {routeSeo && <meta property="og:description" content={routeSeo.ogDescription || routeSeo.description} />}
      </Helmet>
      <ScrollToTop />
      {/* Persistent top navigation */}
      <Navbar />

      <main>
        {/* Suspense wraps only the routes — Navbar/Footer load instantly */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            {ROUTES.map(({ path, Page }) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Persistent bottom audio player */}
      <Footer />
      <Suspense fallback={null}>
        <BottomPlayer />
      </Suspense>

      {/* Global Support Popup */}
      <Suspense fallback={null}>
        <SupportPopup />
      </Suspense>

      {/* Floating back-to-top arrow — site-wide, appears past 300px of scroll */}

      {/* First-visit translation language prompt — desktop only, dismissible */}
      <Suspense fallback={null}>
        <LanguagePrompt />
      </Suspense>

      {/* Push notification permission banner */}
      <Suspense fallback={null}>
        <NotificationBanner />
      </Suspense>

      {/* Global AI chat assistant */}
      <Suspense fallback={null}>
        <ChatWidget currentSurahSlug={currentSurahSlug} />
      </Suspense>

      {/* Daily Durood reminder toast — delayed, dismissible, site-wide */}
      <Suspense fallback={null}>
        <DaroodReminderToast />
      </Suspense>
    </div>
  );
}