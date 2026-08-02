/**
 * QiblaCompass.jsx
 *
 * Animated SVG compass showing Qibla direction.
 * Props:
 *   lat  {number} — user/city latitude
 *   lng  {number} — user/city longitude
 *   size {number} — diameter in px (default 220)
 */

import { useMemo, useState, useEffect } from 'react';
import { calcQiblaBearing } from '../data/prayerCities';
import './QiblaCompass.css';

export default function QiblaCompass({ lat, lng, size = 220 }) {
  const bearing = useMemo(() => calcQiblaBearing(lat, lng), [lat, lng]);
  
  // Compass sensor state
  const [heading, setHeading] = useState(null);
  const [needsPermission, setNeedsPermission] = useState(
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  );

  useEffect(() => {
    const handleOrientation = (e) => {
      let h = null;
      if (e.webkitCompassHeading) {
        h = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha !== null) {
        h = 360 - e.alpha;
      } else if (e.alpha !== null) {
        // Fallback for some android devices
        h = 360 - e.alpha;
      }
      
      if (h !== null) {
        setHeading(h);
      }
    };

    if (!needsPermission) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }
  }, [needsPermission]);

  const requestAccess = async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setNeedsPermission(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const R   = size / 2;            // radius of outer circle
  const cx  = R;
  const cy  = R;

  // Cardinal label positions
  const labels = [
    { dir: 'N', angle: 0   },
    { dir: 'E', angle: 90  },
    { dir: 'S', angle: 180 },
    { dir: 'W', angle: 270 },
  ].map(({ dir, angle }) => {
    const rad  = ((angle - 90) * Math.PI) / 180;
    const dist = R * 0.78;
    return {
      dir,
      x: cx + dist * Math.cos(rad),
      y: cy + dist * Math.sin(rad),
    };
  });

  // Tick marks at every 30°
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const inner = R * 0.82;
    const outer = R * 0.93;
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cy + inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cy + outer * Math.sin(angle),
      isMajor: i % 3 === 0,
    };
  });

  return (
    <div className="qibla-compass-wrap" aria-label={`Qibla direction: ${Math.round(bearing)}° from North`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="qibla-compass-svg"
        role="img"
      >
        <g
          className="qibla-compass-dial"
          style={{
            transform: `rotate(${-(heading || 0)}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.1s linear'
          }}
        >
          {/* Outer glow ring */}
          <circle cx={cx} cy={cy} r={R - 2} className="qibla-ring-outer" />

          {/* Inner face */}
          <circle cx={cx} cy={cy} r={R * 0.75} className="qibla-ring-face" />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              className={`qibla-tick ${t.isMajor ? 'qibla-tick-major' : ''}`}
            />
          ))}

          {/* Cardinal labels */}
          {labels.map(({ dir, x, y }) => (
            <text
              key={dir}
              x={x} y={y}
              className={`qibla-cardinal ${dir === 'N' ? 'qibla-cardinal-n' : ''}`}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {dir}
            </text>
          ))}

          {/* ── Needle (rotates to Qibla) ── */}
          <g
            className="qibla-needle-group"
            style={{ transform: `rotate(${bearing}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          >
            {/* North half — gold */}
            <polygon
              points={`${cx},${cy - R * 0.58} ${cx - R * 0.06},${cy} ${cx + R * 0.06},${cy}`}
              className="qibla-needle-north"
            />
            {/* South half — muted */}
            <polygon
              points={`${cx},${cy + R * 0.42} ${cx - R * 0.06},${cy} ${cx + R * 0.06},${cy}`}
              className="qibla-needle-south"
            />
          </g>

          {/* Center pivot dot */}
          <circle cx={cx} cy={cy} r={R * 0.05} className="qibla-pivot" />

          {/* Kaaba icon at needle tip */}
          <g
            className="qibla-kaaba-group"
            style={{ transform: `rotate(${bearing}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          >
            <text
              x={cx}
              y={cy - R * 0.66}
              textAnchor="middle"
              dominantBaseline="middle"
              className="qibla-kaaba-icon"
            >
              🕋
            </text>
          </g>
        </g>
      </svg>

      {/* Degree label */}
      <div className="qibla-degree-label">
        <span className="qibla-degree-value">{Math.round(bearing)}°</span>
        <span className="qibla-degree-caption">from North</span>
      </div>

      {/* Permission Button for iOS */}
      {needsPermission && (
        <button className="btn btn-primary qibla-permission-btn" onClick={requestAccess}>
          Enable Compass
        </button>
      )}
    </div>
  );
}
