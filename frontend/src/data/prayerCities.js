/**
 * prayerCities.js — Prayer times city config
 *
 * Structure is intentionally flat so it's easy to extend beyond Pakistan.
 * To add a new city: copy any entry below, update slug/name/lat/lng/nearby.
 *
 * nearby: up to 4 slugs of geographically closest cities (distance-based)
 */

export const CITIES = [
  {
    slug:    'lahore',
    name:    'Lahore',
    arabic:  'لاہور',
    country: 'Pakistan',
    lat:     31.5497,
    lng:     74.3436,
    nearby:  ['gujranwala', 'sialkot', 'faisalabad'],
  },
  {
    slug:    'karachi',
    name:    'Karachi',
    arabic:  'کراچی',
    country: 'Pakistan',
    lat:     24.8607,
    lng:     67.0011,
    nearby:  ['quetta', 'multan', 'peshawar'],
  },
  {
    slug:    'islamabad',
    name:    'Islamabad',
    arabic:  'اسلام آباد',
    country: 'Pakistan',
    lat:     33.6844,
    lng:     73.0479,
    nearby:  ['rawalpindi', 'peshawar', 'gujranwala'],
  },
  {
    slug:    'faisalabad',
    name:    'Faisalabad',
    arabic:  'فیصل آباد',
    country: 'Pakistan',
    lat:     31.4504,
    lng:     73.1350,
    nearby:  ['lahore', 'gujranwala', 'multan'],
  },
  {
    slug:    'rawalpindi',
    name:    'Rawalpindi',
    arabic:  'راولپنڈی',
    country: 'Pakistan',
    lat:     33.5651,
    lng:     73.0169,
    nearby:  ['islamabad', 'peshawar', 'gujranwala'],
  },
  {
    slug:    'multan',
    name:    'Multan',
    arabic:  'ملتان',
    country: 'Pakistan',
    lat:     30.1575,
    lng:     71.5249,
    nearby:  ['faisalabad', 'lahore', 'quetta'],
  },
  {
    slug:    'peshawar',
    name:    'Peshawar',
    arabic:  'پشاور',
    country: 'Pakistan',
    lat:     34.0151,
    lng:     71.5249,
    nearby:  ['rawalpindi', 'islamabad', 'gujranwala'],
  },
  {
    slug:    'gujranwala',
    name:    'Gujranwala',
    arabic:  'گوجرانوالہ',
    country: 'Pakistan',
    lat:     32.1877,
    lng:     74.1945,
    nearby:  ['lahore', 'sialkot', 'faisalabad'],
  },
  {
    slug:    'sialkot',
    name:    'Sialkot',
    arabic:  'سیالکوٹ',
    country: 'Pakistan',
    lat:     32.4945,
    lng:     74.5229,
    nearby:  ['gujranwala', 'lahore', 'rawalpindi'],
  },
  {
    slug:    'quetta',
    name:    'Quetta',
    arabic:  'کوئٹہ',
    country: 'Pakistan',
    lat:     30.1798,
    lng:     66.9750,
    nearby:  ['multan', 'karachi', 'peshawar'],
  },
];

/** Lookup by slug — O(1) via Map */
export const CITY_MAP = new Map(CITIES.map((c) => [c.slug, c]));

/** Kaaba coordinates (Masjid al-Haram, Mecca) */
export const KAABA = { lat: 21.4225, lng: 39.8262 };

/**
 * Calculate Qibla bearing (degrees, 0–360 clockwise from North)
 * from any lat/lng toward the Kaaba using the great-circle forward-bearing formula.
 */
export function calcQiblaBearing(fromLat, fromLng) {
  const toRad = (d) => (d * Math.PI) / 180;

  const φ1 = toRad(fromLat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - fromLng);

  const x = Math.cos(φ2) * Math.sin(Δλ);
  const y =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360; // normalise to 0–360
}
