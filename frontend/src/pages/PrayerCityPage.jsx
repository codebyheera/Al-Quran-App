/**
 * PrayerCityPage.jsx — /prayer-times/:city
 *
 * Sections (in order):
 *  1. Breadcrumb + SEO schemas
 *  2. H1 + date / Hijri date
 *  3. 6 Prayer cards (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) with countdown
 *  4. Qibla compass
 *  5. Monthly timetable (lazy-loaded on toggle) + Print
 *  6. Nearby cities
 *  7. Quran CTA
 *  8. FAQ
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import QiblaCompass from '../components/QiblaCompass';
import PrayerFaqSection from '../components/PrayerFaqSection';
import { RevealSection } from '../components/RevealSection';
import { CITY_MAP, CITIES } from '../data/prayerCities';
import api from '../lib/api';
import './PrayerCityPage.css';

// ── Prayers shown on city page (includes Sunrise) ──────────────
const PRAYERS = [
  { key: 'Fajr',    label: 'Fajr',    arabic: 'الفجر',  icon: '🌙' },
  { key: 'Sunrise', label: 'Sunrise', arabic: 'الشروق', icon: '🌅' },
  { key: 'Dhuhr',   label: 'Dhuhr',   arabic: 'الظهر',  icon: '☀️' },
  { key: 'Asr',     label: 'Asr',     arabic: 'العصر',  icon: '🌤️' },
  { key: 'Maghrib', label: 'Maghrib', arabic: 'المغرب', icon: '🌇' },
  { key: 'Isha',    label: 'Isha',    arabic: 'العشاء',  icon: '🌃' },
];

const COUNTDOWN_PRAYERS = PRAYERS.filter((p) => p.key !== 'Sunrise');

// ── Helpers ─────────────────────────────────────────────────────
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

function getNextPrayerKey(timings) {
  const now = new Date();
  for (const { key } of COUNTDOWN_PRAYERS) {
    if (parseToDate(timings[key]) > now) return key;
  }
  return 'Fajr';
}

function computeCountdown(timings, nextKey, now) {
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

function formatGregorianDate(dateObj) {
  if (!dateObj) {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  const { readable } = dateObj.gregorian;
  return readable || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatHijriDate(dateObj) {
  if (!dateObj?.hijri) return '';
  const { hijri } = dateObj;
  return `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} AH`;
}

// ── Monthly timetable row ────────────────────────────────────────
function CalendarRow({ day }) {
  const { date, timings } = day;
  const greg = date?.gregorian?.day || '';
  return (
    <tr>
      <td className="pt-city-cal__day">{greg}</td>
      <td>{to12h(timings.Fajr)}</td>
      <td>{to12h(timings.Sunrise)}</td>
      <td>{to12h(timings.Dhuhr)}</td>
      <td>{to12h(timings.Asr)}</td>
      <td>{to12h(timings.Maghrib)}</td>
      <td>{to12h(timings.Isha)}</td>
    </tr>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function PrayerCityPage() {
  const { city: slug } = useParams();
  const cityData = CITY_MAP.get(slug?.toLowerCase());

  // 404 for unknown slugs
  if (!cityData) return <Navigate to="/prayer-times" replace />;

  const { name, lat, lng, nearby } = cityData;

  // ── State ──────────────────────────────────────────────────────
  const [timings, setTimings]          = useState(null);
  const [dateInfo, setDateInfo]        = useState(null);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(false);

  const [nextKey, setNextKey]          = useState(null);
  const [cd, setCd]                    = useState(null);

  const [calendarOpen, setCalendarOpen]   = useState(false);
  const [calendar, setCalendar]           = useState(null);
  const [calLoading, setCalLoading]       = useState(false);
  const [calError, setCalError]           = useState(false);

  const tableRef = useRef(null);

  // ── Fetch today's timings ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    api.get(`/api/prayer-times/city/${slug}`)
      .then(({ data }) => {
        if (cancelled) return;
        setTimings(data.timings);
        setDateInfo(data.date);
        const nk = getNextPrayerKey(data.timings);
        setNextKey(nk);
        setCd(computeCountdown(data.timings, nk, new Date()));
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  // ── Single countdown interval ──────────────────────────────────
  useEffect(() => {
    if (!timings) return;
    const id = setInterval(() => {
      const now = new Date();
      const nk  = getNextPrayerKey(timings);
      setNextKey(nk);
      setCd(computeCountdown(timings, nk, now));
    }, 1000);
    return () => clearInterval(id);
  }, [timings]);

  // ── Lazy-load monthly calendar when user expands ───────────────
  useEffect(() => {
    if (!calendarOpen || calendar || calLoading) return;
    let cancelled = false;
    setCalLoading(true);
    setCalError(false);

    api.get(`/api/prayer-times/city/${slug}/calendar`)
      .then(({ data }) => {
        if (!cancelled) setCalendar(data.calendar);
      })
      .catch(() => { if (!cancelled) setCalError(true); })
      .finally(() => { if (!cancelled) setCalLoading(false); });

    return () => { cancelled = true; };
  }, [calendarOpen, slug]);

  // ── Print handler ──────────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  // ── Computed values ────────────────────────────────────────────
  const canonicalUrl   = `https://alquranhub.org/prayer-times/${slug}`;
  const pageTitle      = `Prayer Times in ${name} Today | Al-Quran Hub`;
  const metaDesc       = `Accurate ${name} prayer times today — Fajr, Dhuhr, Asr, Maghrib & Isha with Qibla direction. Updated daily, Hanafi method.`;
  const gregorianDate  = formatGregorianDate(dateInfo);
  const hijriDate      = formatHijriDate(dateInfo);

  const nearbyCities = (nearby || [])
    .map((s) => CITY_MAP.get(s))
    .filter(Boolean);

  // ── JSON-LD: WebPage schema ────────────────────────────────────
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: metaDesc,
    url: canonicalUrl,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', url: 'https://alquranhub.org' },
  };

  return (
    <div className="pt-city page-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url"         content={canonicalUrl} />
        <script type="application/ld+json" id="webpage-schema">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      {/* Breadcrumb (also renders BreadcrumbList JSON-LD) */}
      <div className="container pt-city-breadcrumb-wrap no-print">
        <Breadcrumb
          crumbs={[
            { label: 'Home',          href: '/' },
            { label: 'Prayer Times',  href: '/prayer-times' },
            { label: name },
          ]}
        />
      </div>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-city-hero">
        <div className="container">
          <div className="pt-city-hero__inner">
            <div>
              <h1 className="pt-city-hero__title">
                Prayer Times in <span className="text-gold">{name}</span> Today
              </h1>
              <div className="pt-city-hero__dates">
                <span className="pt-city-hero__greg">{gregorianDate}</span>
                {hijriDate && (
                  <span className="pt-city-hero__hijri">
                    <span className="pt-city-hero__hijri-sep">·</span>
                    {hijriDate}
                  </span>
                )}
              </div>
              <p className="pt-city-hero__method">
                📐 University of Islamic Sciences, Karachi &mdash; Hanafi method
              </p>
            </div>

            {/* Next prayer countdown (visible on larger screens) */}
            <div className="pt-city-hero__cd-box no-print">
              <div className="pt-city-hero__cd-label">Next Prayer</div>
              <div className="pt-city-hero__cd-name">{nextKey || '—'}</div>
              <div className="pt-city-hero__cd-time">{nextKey && timings ? to12h(timings[nextKey]) : '—'}</div>
              <div className="pt-city-hero__cd-digits">
                {[{ v: cd ? cd.h : 0, l: 'HRS' }, { v: cd ? cd.m : 0, l: 'MIN' }, { v: cd ? cd.s : 0, l: 'SEC' }].map(({ v, l }, i) => (
                  <div key={l} className="pt-city-hero__cd-unit">
                    {i > 0 && <span className="pt-city-hero__cd-sep">:</span>}
                    <div>
                      <div className="pt-city-hero__cd-num">{!timings ? '--' : fmt2(v)}</div>
                      <div className="pt-city-hero__cd-cap">{l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">

        {/* ── PRAYER CARDS ────────────────────────────────── */}
        <section className="pt-city-prayers home-section print-section">
          <div className="pt-city-prayers__grid">
            {PRAYERS.map(({ key, label, arabic, icon }) => {
              const isNext    = nextKey === key;
              const isSunrise = key === 'Sunrise';
              return (
                <div
                  key={key}
                  className={`pt-city-prayer-card${isNext ? ' is-next' : ''}${isSunrise ? ' is-sunrise' : ''}`}
                >
                  <div className="pt-city-prayer-card__icon">{icon}</div>
                  <div className="pt-city-prayer-card__info">
                    <div className="pt-city-prayer-card__label">
                      {label}
                    </div>
                    <div className="pt-city-prayer-card__time">
                      {timings ? to12h(timings[key]) : '--:--'}
                    </div>
                    {isNext && cd && (
                      <div className="pt-city-prayer-card__cd">
                        {fmt2(cd.h)}h {fmt2(cd.m)}m {fmt2(cd.s)}s
                      </div>
                    )}
                  </div>
                  {isNext && (
                    <span className="pt-city-prayer-card__next-badge">Next</span>
                  )}
                </div>
              );
            })}
          </div>
          {error && !timings && (
            <p className="pt-city-prayers__error">
              ⚠️ Could not load prayer times. Please try refreshing.
            </p>
          )}
        </section>

        {/* ── QIBLA ───────────────────────────────────────── */}
        <RevealSection className="home-section pt-city-qibla no-print">
          <div className="pt-city-qibla__inner">
            <div className="pt-city-qibla__text">
              <h2>Qibla Direction from {name}</h2>
              <p>
                The compass shows the direction of the Qibla from {name} toward
                the Masjid al-Haram in Mecca (21.4225°N, 39.8262°E).
                Calculated using the great-circle bearing formula.
              </p>
            </div>
            <QiblaCompass lat={lat} lng={lng} size={220} />
          </div>
        </RevealSection>

        {/* ── MONTHLY TIMETABLE ────────────────────────────── */}
        <RevealSection className="home-section pt-city-calendar print-section">
          <div className="pt-city-calendar__header">
            <h2>Monthly Prayer Timetable — {name}</h2>
            <div className="pt-city-calendar__actions no-print">
              <button
                type="button"
                className="btn btn-ghost pt-city-cal-toggle"
                onClick={() => setCalendarOpen((v) => !v)}
                aria-expanded={calendarOpen}
              >
                {calendarOpen ? '▲ Hide Timetable' : '▼ Show Monthly Timetable'}
              </button>
              {calendarOpen && calendar && (
                <button
                  type="button"
                  className="btn btn-ghost pt-city-cal-print"
                  onClick={handlePrint}
                  aria-label="Print monthly timetable"
                >
                  🖨️ Print
                </button>
              )}
            </div>
          </div>

          {calendarOpen && (
            <div className="pt-city-calendar__body" ref={tableRef}>
              {calLoading && (
                <div className="pt-city-calendar__loading">
                  <div className="spinner" />
                  <p>Loading monthly timetable…</p>
                </div>
              )}
              {calError && (
                <p className="pt-city-calendar__error">
                  ⚠️ Could not load monthly timetable.
                </p>
              )}
              {!calLoading && !calError && calendar && (
                <>
                  <div className="pt-city-calendar__table-wrap">
                    <table className="pt-city-cal__table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Fajr</th>
                          <th>Sunrise</th>
                          <th>Dhuhr</th>
                          <th>Asr</th>
                          <th>Maghrib</th>
                          <th>Isha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendar.map((day, i) => (
                          <CalendarRow key={i} day={day} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="pt-city-calendar__note">
                    All times are calculated using the University of Islamic Sciences, Karachi method (Hanafi).
                  </p>
                </>
              )}
            </div>
          )}
        </RevealSection>

        {/* ── NEARBY CITIES ───────────────────────────────── */}
        {nearbyCities.length > 0 && (
          <RevealSection className="home-section pt-city-nearby no-print">
            <h2>Nearby Cities</h2>
            <p className="pt-city-nearby__sub">Prayer times for cities close to {name}:</p>
            <div className="pt-city-nearby__grid">
              {nearbyCities.map((c) => (
                <Link
                  key={c.slug}
                  to={`/prayer-times/${c.slug}`}
                  className="pt-city-nearby__card card"
                >
                  <span className="pt-city-nearby__name">{c.name}</span>
                  <span className="pt-city-nearby__cta">View times →</span>
                </Link>
              ))}
            </div>
          </RevealSection>
        )}

        {/* ── QURAN CTA ───────────────────────────────────── */}
        <RevealSection className="home-section no-print">
          <div className="pt-city-quran-cta card">
            <div className="pt-city-quran-cta__icon">📖</div>
            <div>
              <h2>Read Surah Al-Kahf This Friday</h2>
              <p>
                It is a Sunnah to recite Surah Al-Kahf every Friday. Use the
                time between prayers to connect with the Quran — all 114 Surahs
                available free, with Arabic, translation, and audio.
              </p>
              <div className="pt-city-quran-cta__btns">
                <Link to="/surah/Al-Kahf" className="btn btn-primary">
                  Read Surah Al-Kahf →
                </Link>
                <Link to="/surah" className="btn btn-ghost">
                  All Surahs
                </Link>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <RevealSection className="home-section no-print">
          <PrayerFaqSection city={name} />
        </RevealSection>

      </div>
    </div>
  );
}
