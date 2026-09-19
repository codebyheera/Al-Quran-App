/**
 * scripts/check-hijri-date.js
 *
 * MANUAL REFERENCE TOOL ONLY — not called by the running backend/frontend.
 *
 * Compares Aladhan's raw calculated Hijri date (what routes/prayerTimes.js
 * would show with HIJRI_ADJUSTMENT=0) against the date Muslim Pro's public
 * islamic-calendar page shows for a given country, and tells you what to set
 * HIJRI_ADJUSTMENT to in .env so the site matches Muslim Pro / Islam360.
 *
 * Why this is a manual script and not a live scrape in production:
 * app.muslimpro.com is not a public API — it's their website's HTML. Having
 * the backend scrape it on every request (or even daily, automatically) would
 * mean depending on a page structure that can change without notice, and
 * would go against their Terms of Service since this app is a competing
 * product. Running this by hand once a month (right around the start of a
 * new Hijri month, when moon-sighting drift is most likely to change) is a
 * one-off, low-volume, informational check — not a production dependency.
 *
 * Usage:
 *   node scripts/check-hijri-date.js [country-slug]
 *
 * Examples:
 *   node scripts/check-hijri-date.js            # defaults to "pakistan"
 *   node scripts/check-hijri-date.js indonesia
 *   node scripts/check-hijri-date.js saudi-arabia
 *
 * Country slug is whatever follows /islamic-calendar/ on muslimpro.com,
 * e.g. https://app.muslimpro.com/islamic-calendar/pakistan
 */

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
  'Rajab', 'Shaban', 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shiftedGregorianDDMMYYYY(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function getAladhanHijri() {
  const url = `https://api.aladhan.com/v1/gToH/${shiftedGregorianDDMMYYYY(0)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Aladhan responded ${resp.status}`);
  const json = await resp.json();
  const h = json.data?.hijri;
  if (!h) throw new Error('Malformed Aladhan response');
  return { day: parseInt(h.day, 10), month: h.month?.number, year: parseInt(h.year, 10), label: `${h.day} ${h.month?.en} ${h.year}` };
}

async function getMuslimProHijri(countrySlug) {
  const url = `https://app.muslimpro.com/islamic-calendar/${countrySlug}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!resp.ok) throw new Error(`Muslim Pro page responded ${resp.status}`);
  const html = await resp.text();

  // The page embeds this data inside a Next.js RSC payload, where it shows up
  // as a JSON *string* — so the quotes around keys/values are themselves
  // backslash-escaped in the raw HTML, e.g.:
  //   {\"country\":\"Pakistan\",\"dates\":[{\"hijri_date\":\"1448-04-06\",\"gregorian_date\":\"2026-09-19\"}, ...]}
  // Match that escaped form, then unescape the captured slice before parsing.
  const match = html.match(/\\"country\\":\\"[^\\]*\\",\\"dates\\":(\[.*?\])(?=,\\"|}\])/);
  if (!match) throw new Error('Could not find the dates JSON block on the Muslim Pro page — their page structure may have changed.');

  let dates;
  try {
    dates = JSON.parse(match[1].replace(/\\"/g, '"'));
  } catch {
    throw new Error('Found a "dates" block but could not parse it as JSON — page structure may have changed.');
  }

  const today = todayISO();
  const entry = dates.find(d => d.gregorian_date === today);
  if (!entry) throw new Error(`No entry for today (${today}) in the Muslim Pro calendar data — it may only cover part of the month.`);

  const [year, month, day] = entry.hijri_date.split('-').map(n => parseInt(n, 10));
  return { day, month, year, label: `${day} ${HIJRI_MONTHS[month - 1] || month} ${year}` };
}

async function main() {
  const countrySlug = process.argv[2] || 'pakistan';

  console.log(`Checking Hijri date for ${todayISO()} — country: ${countrySlug}\n`);

  const [aladhan, muslimPro] = await Promise.allSettled([
    getAladhanHijri(),
    getMuslimProHijri(countrySlug),
  ]);

  if (aladhan.status === 'rejected') {
    console.error('Aladhan lookup failed:', aladhan.reason.message);
  } else {
    console.log(`Aladhan (raw, unadjusted): ${aladhan.value.label}`);
  }

  if (muslimPro.status === 'rejected') {
    console.error(`Muslim Pro (${countrySlug}) lookup failed:`, muslimPro.reason.message);
  } else {
    console.log(`Muslim Pro   (${countrySlug}):       ${muslimPro.value.label}`);
  }

  if (aladhan.status === 'fulfilled' && muslimPro.status === 'fulfilled') {
    const diffDays = muslimPro.value.day - aladhan.value.day;
    // Note: this simple subtraction is only valid when both dates fall in the
    // same Hijri month. Near a month boundary, check the printed labels by eye.
    console.log(`\nSuggested HIJRI_ADJUSTMENT for ${countrySlug}: ${diffDays >= 0 ? '+' : ''}${diffDays}`);
    console.log('(Set this in backend/.env as HIJRI_ADJUSTMENT=<value> and restart the server.)');
    if (aladhan.value.month !== muslimPro.value.month) {
      console.log('\nNote: Aladhan and Muslim Pro are in different Hijri months right now — the day-difference above is not reliable. Compare the two full labels above by eye instead.');
    }
  }
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
