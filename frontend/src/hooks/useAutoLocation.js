import { useState, useEffect } from 'react';
import { CITIES } from '../data/prayerCities';

const DEFAULT_CITY = CITIES.find((c) => c.slug === 'lahore');

/**
 * Detects the visitor's location in the background while painting instantly
 * with a Lahore fallback — shared by the homepage widget, the /prayer-times
 * hero, and the Qibla compass so all three stay in sync.
 */
export function useAutoLocation() {
  const [coords, setCoords] = useState({ lat: DEFAULT_CITY.lat, lng: DEFAULT_CITY.lng, isFallback: true });
  const [city, setCity] = useState(DEFAULT_CITY.name);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude, isFallback: false });
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then((r) => r.json())
          .then((json) => {
            if (!cancelled) {
              setCity(json.address?.city || json.address?.town || json.address?.village || 'Your Location');
            }
          })
          .catch(() => {});
      },
      () => {}, // denied/timeout — stay on fallback
      { timeout: 7000 }
    );

    return () => { cancelled = true; };
  }, []);

  return { coords, city };
}
