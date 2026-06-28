import { useState, useEffect, useRef } from 'react';

const PRAYERS = [
  { key: 'Fajr',    arabic: 'الفجر' },
  { key: 'Dhuhr',   arabic: 'الظهر' },
  { key: 'Asr',     arabic: 'العصر' },
  { key: 'Maghrib', arabic: 'المغرب' },
  { key: 'Isha',    arabic: 'العشاء' },
];

const METHODS = [
  { id: 'hanafi',   label: 'Hanafi',    method: 1, school: 1 },
  { id: 'maliki',   label: 'Maliki',    method: 3, school: 0 },
  { id: 'shafi',    label: "Shafi'i",   method: 3, school: 0 },
  { id: 'deobandi', label: 'Deobandi',  method: 1, school: 1 },
];

// ── Pure helpers ────────────────────────────────────────────

function to12h(timeStr) {
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function parseTimeToDate(timeStr) {
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getNextPrayerKey(timings) {
  const now = new Date();
  for (const p of PRAYERS) {
    if (parseTimeToDate(timings[p.key]) > now) return p.key;
  }
  return 'Fajr';
}

function getCountdownParts(timings, nextKey) {
  const now = new Date();
  let t = parseTimeToDate(timings[nextKey]);
  if (t <= now) t = new Date(t.getTime() + 86400000);
  const diff = t - now;
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

// ── localStorage helpers ─────────────────────────────────────

function getSavedMethod() {
  try {
    const saved = localStorage.getItem('prayer_method');
    return METHODS.find((m) => m.id === saved) || METHODS[0];
  } catch {
    return METHODS[0];
  }
}

function cacheKey(loc, method, school) {
  const date = new Date().toISOString().slice(0, 10);
  return `pt_${date}_${loc}_${method}_${school}`;
}

function readCache(loc, method, school) {
  try {
    const raw = localStorage.getItem(cacheKey(loc, method, school));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(loc, method, school, timings) {
  try {
    localStorage.setItem(cacheKey(loc, method, school), JSON.stringify(timings));
  } catch {}
}

// ── Component ────────────────────────────────────────────────

export default function PrayerTimes() {
  const [timings, setTimings]               = useState(null);
  const [city, setCity]                     = useState('Karachi');
  const [coords, setCoords]                 = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [nextKey, setNextKey]               = useState(null);
  const [countdownParts, setCountdownParts] = useState({ h: 0, m: 0, s: 0 });
  const [method, setMethod]                 = useState(getSavedMethod);
  const [asrTooltip, setAsrTooltip]         = useState(false);

  const hasLoadedRef = useRef(false);

  // ── Effect 1: one-time geo detection ──────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!('geolocation' in navigator)) {
      setCoords('fallback');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
          .then((r) => r.json())
          .then((json) => {
            if (!cancelled)
              setCity(
                json.address?.city    ||
                json.address?.town    ||
                json.address?.village ||
                'Your Location'
              );
          })
          .catch(() => {});
        setCoords({ lat: latitude, lng: longitude });
      },
      () => { if (!cancelled) setCoords('fallback'); },
      { timeout: 6000 }
    );

    return () => { cancelled = true; };
  }, []);

  // ── Effect 2: fetch timings whenever coords or method changes
  useEffect(() => {
    if (coords === null) return;

    let cancelled = false;
    let timer     = null;

    async function load() {
      if (!hasLoadedRef.current) setLoading(true);
      setError(false);

      try {
        const loc    = coords === 'fallback'
          ? 'karachi'
          : `${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}`;
        const cached = readCache(loc, method.method, method.school);

        let t;
        if (cached) {
          t = cached;
        } else if (coords === 'fallback') {
          const res = await fetch(
            `https://api.aladhan.com/v1/timingsByCity?city=Karachi&country=Pakistan&method=${method.method}&school=${method.school}&tune=0,0,0,0,0,0,0,0,0`
          );
          if (!res.ok) throw new Error('fetch failed');
          ({ data: { timings: t } } = await res.json());
          writeCache('karachi', method.method, method.school, t);
        } else {
          const res = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=${method.method}&school=${method.school}&tune=0,0,0,0,0,0,0,0,0`
          );
          if (!res.ok) throw new Error('fetch failed');
          ({ data: { timings: t } } = await res.json());
          writeCache(loc, method.method, method.school, t);
        }

        if (cancelled) return;
        hasLoadedRef.current = true;
        setTimings(t);

        const nk = getNextPrayerKey(t);
        setNextKey(nk);
        setCountdownParts(getCountdownParts(t, nk));
        timer = setInterval(() => {
          const newNk = getNextPrayerKey(t);
          setNextKey(newNk);
          setCountdownParts(getCountdownParts(t, newNk));
        }, 1000);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [coords, method]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectMethod(m) {
    try { localStorage.setItem('prayer_method', m.id); } catch {}
    setMethod(m);
  }

  // ── Render ────────────────────────────────────────────────

  if (loading && !timings) {
    return <div className="prayer-loading"><div className="spinner" /></div>;
  }

  if (error && !timings) {
    return (
      <p className="prayer-error">
        Prayer times unavailable — please try again later.
      </p>
    );
  }

  const { h, m: min, s } = countdownParts;

  return (
    <div className="prayer-widget">

      {/* ── Header: heading + pill, then method pills below ── */}
      <div className="prayer-header">
        <div className="prayer-header-top">
          <h2 className="prayer-heading">Prayer Times</h2>
          <span className="prayer-location-pill">
            <span className="prayer-loc-dot" aria-hidden="true" />
            <span className="prayer-loc-city">{city}</span>
          </span>
        </div>
        <div className="prayer-method-selector">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`prayer-method-pill${method.id === m.id ? ' prayer-method-pill-active' : ''}`}
              onClick={() => selectMethod(m)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: countdown left | cards right ────────────── */}
      <div className="prayer-body">

        {/* Left: countdown box only — height determines card height */}
        <div className="prayer-body-left">
          {nextKey && timings && (
            <div className="prayer-countdown-box">
              <span className="prayer-cd-label">Next Prayer</span>
              <span className="prayer-cd-name">{nextKey}</span>
              <span className="prayer-cd-time">{to12h(timings[nextKey])}</span>
              <div className="prayer-clock">
                <div className="prayer-clock-unit">
                  <span className="prayer-clock-digit">{String(h).padStart(2, '0')}</span>
                  <span className="prayer-clock-cap">HRS</span>
                </div>
                <span className="prayer-clock-sep">:</span>
                <div className="prayer-clock-unit">
                  <span className="prayer-clock-digit">{String(min).padStart(2, '0')}</span>
                  <span className="prayer-clock-cap">MIN</span>
                </div>
                <span className="prayer-clock-sep">:</span>
                <div className="prayer-clock-unit">
                  <span className="prayer-clock-digit">{String(s).padStart(2, '0')}</span>
                  <span className="prayer-clock-cap">SEC</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: 5 prayer cards — fill same height as left */}
        <div className="prayer-body-right">
          <div className="prayer-cards-row">
            {PRAYERS.map((p) => {
              const [tp, ap] = timings
                ? to12h(timings[p.key]).split(' ')
                : ['—', ''];
              return (
                <div
                  key={p.key}
                  className={`prayer-card${nextKey === p.key ? ' prayer-card-active' : ''}`}
                >
                  <span className="prayer-name">
                    {p.key}
                    {p.key === 'Asr' && (
                      <span
                        className="prayer-asr-info"
                        onMouseEnter={() => setAsrTooltip(true)}
                        onMouseLeave={() => setAsrTooltip(false)}
                        onClick={() => setAsrTooltip((v) => !v)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setAsrTooltip((v) => !v)}
                        aria-label="Asr time varies by madhab"
                      >
                        ⓘ
                        {asrTooltip && (
                          <span className="prayer-tooltip" role="tooltip">
                            Asr time varies by madhab — Hanafi calculates later,
                            Shafi&#x2019;i earlier.
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  <span className="prayer-time">{tp}</span>
                  <span className="prayer-ampm">{ap}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
