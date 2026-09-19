import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Islamic (Hijri) month names — used only as a client-side fallback if the
 * backend Hijri-date endpoint is unreachable.
 */
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʻ I', 'Rabiʻ II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shaʻban', 'Ramadan', 'Shawwal', 'Dhuʻl-Qiʻdah', 'Dhuʻl-Hijjah',
];

/**
 * Computes today's Gregorian date client-side, and fetches today's Hijri
 * (Islamic) date from the backend (`GET /api/prayer-times/hijri-date`).
 *
 * The Hijri date used to be computed in-browser via
 * `Intl.DateTimeFormat('...islamic-umalqura...')`, which is a pure
 * mathematical calculation. That calculation can run 1-2 days ahead of the
 * date actually announced by regional moon-sighting committees — the same
 * date shown by apps like Muslim Pro / Islam360 — which is why the site
 * used to show a different day (e.g. 8th) than those apps (e.g. 6th).
 *
 * The backend now sources the date from Aladhan's Hijri calendar API using
 * the Hanafi/Pakistan moon-sighting committee method, which tracks the
 * announced date far more closely. If that request fails (offline backend,
 * network hiccup, etc.) this hook falls back to the old client-side
 * calculation so the date chip never goes blank.
 */
export default function useHijriDate() {
  const [hijri, setHijri] = useState('');
  const [gregorianShort, setGregorianShort] = useState('');
  const [gregorianLong, setGregorianLong] = useState('');

  useEffect(() => {
    const today = new Date();
    setGregorianShort(today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setGregorianLong(today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));

    let cancelled = false;

    function fallbackToClientCalculation() {
      try {
        const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
        const parts = fmt.formatToParts(today);
        const day   = parts.find(p => p.type === 'day')?.value;
        const mon   = parseInt(parts.find(p => p.type === 'month')?.value, 10);
        const year  = parts.find(p => p.type === 'year')?.value;
        if (day && !isNaN(mon) && year) setHijri(`${day} ${HIJRI_MONTHS[mon - 1] || mon} ${year}`);
      } catch { /* Islamic calendar unsupported in this environment — leave blank */ }
    }

    api.get('/api/prayer-times/hijri-date')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.formatted) {
          setHijri(data.formatted);
        } else {
          fallbackToClientCalculation();
        }
      })
      .catch(() => {
        if (!cancelled) fallbackToClientCalculation();
      });

    return () => { cancelled = true; };
  }, []);

  return { hijri, gregorianShort, gregorianLong };
}
