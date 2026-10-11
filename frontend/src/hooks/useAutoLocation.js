import { useState, useEffect } from 'react';
import { CITIES } from '../data/prayerCities';

const DEFAULT_CITY = CITIES.find((c) => c.slug === 'lahore');
const CACHE_KEY = 'autoLocation';

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    return c && Number.isFinite(c.lat) && Number.isFinite(c.lng) ? c : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch {}
}

// True only when the visitor already allowed location for this site, so
// calling getCurrentPosition can never pop up a permission prompt.
async function hasGeoPermission() {
  try {
    if (!('geolocation' in navigator) || !navigator.permissions?.query) return false;
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state === 'granted';
  } catch {
    return false;
  }
}

function fromGps() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let city = 'Your Location';
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const json = await r.json();
          city = json.address?.city || json.address?.town || json.address?.village || city;
        } catch {}
        resolve({ lat, lng, city });
      },
      reject,
      { timeout: 7000 }
    );
  });
}

// Approximate city from the visitor's IP — no browser permission prompt.
async function fromIp() {
  const r = await fetch('https://ipwho.is/?fields=success,latitude,longitude,city');
  const json = await r.json();
  if (!json.success || !Number.isFinite(json.latitude)) throw new Error('ip lookup failed');
  return { lat: json.latitude, lng: json.longitude, city: json.city || 'Your Location' };
}

/**
 * Detects the visitor's location in the background while painting instantly
 * with a Lahore fallback — shared by the homepage widget, the /prayer-times
 * hero, and the Qibla compass so all three stay in sync.
 *
 * Never asks for location permission: uses precise GPS only if the visitor
 * already granted it, otherwise an IP-based estimate. Cached per session.
 */
export function useAutoLocation() {
  const [loc, setLoc] = useState(() => {
    const cached = readCache();
    return cached
      ? { coords: { lat: cached.lat, lng: cached.lng, isFallback: false }, city: cached.city }
      : { coords: { lat: DEFAULT_CITY.lat, lng: DEFAULT_CITY.lng, isFallback: true }, city: DEFAULT_CITY.name };
  });

  useEffect(() => {
    if (readCache()) return;
    let cancelled = false;

    (async () => {
      let result = null;
      if (await hasGeoPermission()) {
        try { result = await fromGps(); } catch {}
      }
      if (!result) {
        try { result = await fromIp(); } catch {}
      }
      if (!result || cancelled) return; // stay on the Lahore fallback
      writeCache(result);
      setLoc({ coords: { lat: result.lat, lng: result.lng, isFallback: false }, city: result.city });
    })();

    return () => { cancelled = true; };
  }, []);

  return loc;
}
