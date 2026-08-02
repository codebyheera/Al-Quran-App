/**
 * PrayerTimesHub.jsx — /prayer-times
 *
 * Sections (in order):
 *  1. Hero  — geolocation-based live prayer times
 *  2. Top Cities grid — 10 city cards, single shared interval countdown
 *  3. Qibla Direction — compass for detected/default location
 *  4. Quran CTA — link to /surah + lazy VerseOfDay
 *  5. FAQ — general prayer time questions
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CITIES, calcQiblaBearing } from '../data/prayerCities';
import QiblaCompass from '../components/QiblaCompass';
import PrayerFaqSection from '../components/PrayerFaqSection';
import { RevealSection } from '../components/RevealSection';
import api from '../lib/api';
import './PrayerTimesHub.css';
import './SurahList.css';

const VerseOfDay = lazy(() => import('../components/VerseOfDay'));

// ── Prayer list (no Sunrise on hub to keep cards tight) ────────────────────
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// ── Popular Surahs ─────────────────────────────────────────────────────────
const POPULAR_SURAHS = [
  { number: 1,   englishName: "Al-Fatihah", name: "الفاتحة", versesCount: 7, nameTranslation: "The Opening", revelation: "Meccan" },
  { number: 36,  englishName: "Ya-Sin",     name: "يس", versesCount: 83, nameTranslation: "Ya Sin", revelation: "Meccan" },
  { number: 18,  englishName: "Al-Kahf",    name: "الكهف", versesCount: 110, nameTranslation: "The Cave", revelation: "Meccan" },
  { number: 55,  englishName: "Ar-Rahman",  name: "الرحمن", versesCount: 78, nameTranslation: "The Beneficent", revelation: "Medinan" },
  { number: 67,  englishName: "Al-Mulk",    name: "الملك", versesCount: 30, nameTranslation: "The Sovereignty", revelation: "Meccan" },
  { number: 56,  englishName: "Al-Waqi'ah", name: "الواقعة", versesCount: 96, nameTranslation: "The Inevitable", revelation: "Meccan" },
  { number: 2,   englishName: "Al-Baqarah", name: "البقرة", versesCount: 286, nameTranslation: "The Cow", revelation: "Medinan" },
  { number: 19,  englishName: "Maryam",     name: "مريم", versesCount: 98, nameTranslation: "Mary", revelation: "Meccan" },
  { number: 12,  englishName: "Yusuf",      name: "يوسف", versesCount: 111, nameTranslation: "Joseph", revelation: "Meccan" },
  { number: 112, englishName: "Al-Ikhlas",  name: "الإخلاص", versesCount: 4, nameTranslation: "The Sincerity", revelation: "Meccan" },
  { number: 113, englishName: "Al-Falaq",   name: "الفلق", versesCount: 5, nameTranslation: "The Daybreak", revelation: "Meccan" },
  { number: 114, englishName: "An-Nas",     name: "الناس", versesCount: 6, nameTranslation: "Mankind", revelation: "Meccan" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function to12h(timeStr) {
  if (!timeStr) return '—';
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function parseToDate(timeStr) {
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getNextPrayer(timings) {
  if (!timings) return null;
  const now = new Date();
  for (const key of PRAYERS) {
    if (parseToDate(timings[key]) > now) return key;
  }
  return 'Fajr'; // wrap to next day
}

/**
 * Compute countdown to next prayer.
 * now is a Date object (from parent interval — Gap 3 fix).
 */
function computeCountdown(timings, nextKey, now) {
  if (!timings || !nextKey) return null;
  let t = parseToDate(timings[nextKey]);
  if (t <= now) t = new Date(t.getTime() + 86_400_000);
  const diff = t - now;
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  };
}

function fmt2(n) { return String(n).padStart(2, '0'); }

// ── Default location: Lahore (Gap 4) ────────────────────────────────────────
const DEFAULT_CITY = CITIES.find((c) => c.slug === 'lahore');

// ── Sub-component: single city card in the grid ──────────────────────────────
function CityCard({ city, now }) {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCity() {
      try {
        const { data } = await api.get(`/api/prayer-times/city/${city.slug}`);
        if (!cancelled) setTimings(data.timings);
      } catch (err) {
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}&method=1&school=1`);
          const json = await res.json();
          if (!cancelled) setTimings(json.data.timings);
        } catch (e) {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCity();
    return () => { cancelled = true; };
  }, [city.slug, city.lat, city.lng]);

  const nextKey  = timings ? getNextPrayer(timings) : null;
  // Gap 3: countdown computed from shared `now` prop — no per-card interval
  const cd       = timings && nextKey && now ? computeCountdown(timings, nextKey, now) : null;

  return (
    <Link
      to={`/prayer-times/${city.slug}`}
      className="pt-hub-city-card card"
      aria-label={`Prayer times in ${city.name}`}
    >
      <div className="pt-hub-city-card__top">
        <span className="pt-hub-city-card__name">{city.name}</span>
      </div>

      {loading ? (
        <div className="pt-hub-city-card__skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ) : timings && nextKey ? (
        <>
          <div className="pt-hub-city-card__next-prayer">
            <span className="pt-hub-city-card__prayer-name">{nextKey}</span>
            <span className="pt-hub-city-card__prayer-time">
              {to12h(timings[nextKey])}
            </span>
          </div>
          {cd && (
            <div className="pt-hub-city-card__countdown">
              <span className="pt-hub-city-card__cd-label">in</span>
              <span className="pt-hub-city-card__cd-value">
                {fmt2(cd.h)}:{fmt2(cd.m)}:{fmt2(cd.s)}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="pt-hub-city-card__error">Times unavailable</div>
      )}

      <div className="pt-hub-city-card__arrow">→</div>
    </Link>
  );
}

// ── Hero: user's detected location + live widget ─────────────────────────────
function HeroWidget() {
  const [coords, setCoords]   = useState('fallback'); // Default to fallback for instant load
  const [city, setCity]       = useState(DEFAULT_CITY.name);
  const [timings, setTimings] = useState(null);
  const [nextKey, setNextKey] = useState(null);
  const [cd, setCd]           = useState(null);

  // Geo detect — fetch immediately in background
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode city name
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
          .then((r) => r.json())
          .then((json) => {
            setCity(
              json.address?.city    ||
              json.address?.town    ||
              json.address?.village ||
              DEFAULT_CITY.name
            );
          })
          .catch(() => {});
        setCoords({ lat: latitude, lng: longitude });
      },
      () => {}, // Ignore errors, already on fallback
      { timeout: 7000 }
    );
  }, []);

  // Fetch timings once coords resolved
  useEffect(() => {
    let cancelled = false;
    let interval  = null;

    async function load() {
      try {
        let t;
        if (coords === 'fallback') {
          try {
            const { data } = await api.get('/api/prayer-times/city/lahore');
            t = data.timings;
          } catch (err) {
            const res = await fetch(
              `https://api.aladhan.com/v1/timings?latitude=${DEFAULT_CITY.lat}&longitude=${DEFAULT_CITY.lng}&method=1&school=1`
            );
            const json = await res.json();
            t = json.data.timings;
          }
        } else {
          // Direct Aladhan call for arbitrary coords
          const res = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=1&school=1`
          );
          const json = await res.json();
          t = json.data.timings;
        }
        if (cancelled) return;
        setTimings(t);
        const nk = getNextPrayer(t);
        setNextKey(nk);

        interval = setInterval(() => {
          const now = new Date();
          const newNk = getNextPrayer(t);
          setNextKey(newNk);
          setCd(computeCountdown(t, newNk, now));
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    }
    load();
    return () => { cancelled = true; if (interval) clearInterval(interval); };
  }, [coords]);

  return (
    <div className="pt-hub-hero__widget">
      <div className="pt-hub-hero__location">
        <span className="pt-hub-hero__loc-dot" />
        <span>{city}</span>
      </div>

      {/* Next prayer countdown */}
      <div className="pt-hub-hero__countdown">
        <div className="pt-hub-hero__cd-label">Next: <strong>{nextKey || '—'}</strong> at {nextKey && timings ? to12h(timings[nextKey]) : '—'}</div>
        <div className="pt-hub-hero__cd-digits">
          {[
            { v: cd ? cd.h : 0, l: 'HRS' },
            { v: cd ? cd.m : 0, l: 'MIN' },
            { v: cd ? cd.s : 0, l: 'SEC' },
          ].map(({ v, l }, i) => (
            <div key={l} className="pt-hub-hero__cd-unit">
              {i > 0 && <span className="pt-hub-hero__cd-sep">:</span>}
              <div className="pt-hub-hero__cd-block">
                <span className="pt-hub-hero__cd-num">{!timings ? '--' : fmt2(v)}</span>
                <span className="pt-hub-hero__cd-cap">{l}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 prayer pills */}
      <div className="pt-hub-hero__prayers">
        {PRAYERS.map((key) => (
          <div
            key={key}
            className={`pt-hub-hero__prayer-pill${nextKey === key ? ' active' : ''}`}
          >
            <span className="pt-hub-hero__prayer-key">{key}</span>
            <span className="pt-hub-hero__prayer-val">{timings ? to12h(timings[key]) : '--:--'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page component ──────────────────────────────────────────────────────
export default function PrayerTimesHub() {
  // Gap 3: single shared `now` ticker — all city cards read from this
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Hero-section user coords for Qibla (mirrors HeroWidget logic, lighter)
  const [userCoords, setUserCoords] = useState({
    lat: DEFAULT_CITY.lat,
    lng: DEFAULT_CITY.lng,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 7000 }
    );
  }, []);

  const canonicalUrl = 'https://alquranhub.org/prayer-times';

  return (
    <div className="pt-hub page-enter">
      <Helmet>
        <title>Namaz &amp; Prayer Times in Pakistan | Al-Quran Hub</title>
        <meta
          name="description"
          content="Accurate daily prayer times for 10 Pakistani cities — Fajr, Dhuhr, Asr, Maghrib & Isha. Free Qibla compass, Hanafi method, updated daily."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Namaz &amp; Prayer Times in Pakistan | Al-Quran Hub" />
        <meta property="og:description" content="Accurate daily prayer times for 10 Pakistani cities — Fajr, Dhuhr, Asr, Maghrib & Isha. Free Qibla compass, Hanafi method, updated daily." />
        <meta property="og:url" content={canonicalUrl} />
        {/* WebPage schema */}
        <script type="application/ld+json" id="hub-webpage-schema">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Namaz & Prayer Times in Pakistan | Al-Quran Hub',
          description: 'Accurate daily prayer times for 10 Pakistani cities — Fajr, Dhuhr, Asr, Maghrib & Isha. Free Qibla compass, Hanafi method, updated daily.',
          url: canonicalUrl,
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', url: 'https://alquranhub.org' },
        })}</script>
        {/* BreadcrumbList schema */}
        <script type="application/ld+json" id="hub-breadcrumb-schema">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://alquranhub.org' },
            { '@type': 'ListItem', position: 2, name: 'Prayer Times', item: canonicalUrl },
          ],
        })}</script>
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-hub-hero pattern-bg">
        <div className="pt-hub-hero__bg-orbs" />
        <div className="pt-hub-hero__content">
          <h1 className="pt-hub-hero__title">
            Namaz & Prayer Times in <span className="text-gold">Pakistan</span>
          </h1>
          <p className="pt-hub-hero__sub">
            Accurate daily prayer times for your location — Fajr, Dhuhr, Asr, Maghrib &amp; Isha.
            Hanafi method (University of Islamic Sciences, Karachi).
          </p>
          <HeroWidget />
        </div>
      </section>

      <div className="container">

        {/* ── TOP CITIES GRID ───────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="flex-between mb-2">
            <h2>Prayer Times by City</h2>
          </div>
          <p className="pt-hub-cities-sub">
            Select a city to see full daily schedule, monthly timetable, and Qibla direction.
          </p>
          <div className="pt-hub-cities-grid">
            {CITIES.map((city) => (
              <CityCard key={city.slug} city={city} now={now} />
            ))}
          </div>
        </RevealSection>

        {/* ── QIBLA DIRECTION ──────────────────────────────── */}
        <RevealSection className="home-section pt-hub-qibla-section">
          <div className="pt-hub-qibla-inner">
            <div className="pt-hub-qibla-text">
              <h2>Find Your Qibla</h2>
              <p>
                The compass below shows the Qibla direction from your current location (or Lahore
                by default). It uses the great-circle bearing toward the Masjid al-Haram in Mecca
                (21.4225°N, 39.8262°E).
              </p>
              <p className="pt-hub-qibla-note">
                For a precise reading, face the direction indicated by the gold needle.
              </p>
            </div>
            <div className="pt-hub-qibla-compass">
              <QiblaCompass lat={userCoords.lat} lng={userCoords.lng} size={240} />
            </div>
          </div>
        </RevealSection>

        {/* ── VERSE OF THE DAY ────────────────────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="flex-between mb-2">
            <h2>Verse of the Day</h2>
            <Link to="/surah" className="btn btn-ghost pt-hub-view-all">Read Quran →</Link>
          </div>
          <p className="pt-hub-cities-sub">
            Take a moment to reflect on today's verse before your next prayer.
          </p>
          <div className="pt-hub-vod-wrapper">
            <Suspense fallback={<div className="skeleton-vod" />}>
              <VerseOfDay />
            </Suspense>
          </div>
        </RevealSection>

        {/* ── POPULAR SURAHS ────────────────────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="flex-between mb-2">
            <h2>Popular Surahs</h2>
            <Link to="/surah" className="btn btn-ghost pt-hub-view-all">View All 114 →</Link>
          </div>
          <p className="pt-hub-cities-sub">
            Quick links to the most frequently recited Surahs.
          </p>
          <div className="surah-grid">
            {POPULAR_SURAHS.map(s => (
              <Link key={s.number} to={`/surah/${s.englishName}`} className="surah-card card">
                <div className="surah-number">
                  <span>{s.number}</span>
                </div>
                <div className="surah-info">
                  <span className="surah-english">{s.englishName}</span>
                  <span className="surah-translation text-muted">{s.nameTranslation}</span>
                </div>
                <div className="surah-meta">
                  <span className="arabic surah-arabic-name">{s.name}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                    <span className="badge badge-muted">{s.versesCount} verses</span>
                    <span className={`badge ${s.revelation === 'Meccan' ? 'badge-gold' : 'badge-green'}`}>{s.revelation}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </RevealSection>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <RevealSection className="home-section">
          <PrayerFaqSection />
        </RevealSection>

      </div>
    </div>
  );
}
