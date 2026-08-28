import { useState, useEffect } from 'react';

/**
 * Islamic (Hijri) month names, used with the Umm al-Qura calendar below.
 * Extracted from VerseOfDay's original inline calculation so every consumer
 * (VerseOfDay, TopBar, ...) shares one computation instead of duplicating it.
 */
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʻ I', 'Rabiʻ II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shaʻban', 'Ramadan', 'Shawwal', 'Dhuʻl-Qiʻdah', 'Dhuʻl-Hijjah',
];

/**
 * Computes today's Hijri + Gregorian date client-side (no network call).
 * Runs in an effect rather than at render time so prerendered/static pages
 * don't bake in the build-time date — it's always "today" for the visitor.
 */
export default function useHijriDate() {
  const [hijri, setHijri] = useState('');
  const [gregorianShort, setGregorianShort] = useState('');
  const [gregorianLong, setGregorianLong] = useState('');

  useEffect(() => {
    const today = new Date();
    setGregorianShort(today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setGregorianLong(today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
      const parts = fmt.formatToParts(today);
      const day   = parts.find(p => p.type === 'day')?.value;
      const mon   = parseInt(parts.find(p => p.type === 'month')?.value, 10);
      const year  = parts.find(p => p.type === 'year')?.value;
      if (day && !isNaN(mon) && year) setHijri(`${day} ${HIJRI_MONTHS[mon - 1] || mon} ${year}`);
    } catch { /* Islamic calendar unsupported in this environment — leave blank */ }
  }, []);

  return { hijri, gregorianShort, gregorianLong };
}
