/**
 * components/ReadingToolbar.jsx — Reading controls shared by Surah & Juz pages.
 *
 * Groups: text size (Arabic + translation) · audio language · translations
 * · optional extra slot (e.g. Go to verse). Sizes are shown as a percentage
 * of the default so users can tell what "bigger" means at a glance.
 */

import AudioDropdown from './AudioDropdown';
import {
  ARABIC_FONT_MIN,
  ARABIC_FONT_MAX,
  ARABIC_FONT_STEP,
  getArabicFontDefault,
} from '../hooks/useArabicFontSize';
import './ReadingToolbar.css';

export const TRANSLATION_FONT_MIN = 0.8;
export const TRANSLATION_FONT_MAX = 2.0;
export const TRANSLATION_FONT_STEP = 0.1;
const TRANSLATION_FONT_DEFAULT = 1.0;

const svgProps = {
  viewBox: '0 0 24 24',
  width: 17,
  height: 17,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* Open book on a stand (Quran / Arabic text) */
const BookIcon = () => (
  <svg {...svgProps}>
    <path d="M12 6.5C10.3 5.2 7.8 4.6 4 4.8v11.4c3.8-.2 6.3.4 8 1.7 1.7-1.3 4.2-1.9 8-1.7V4.8c-3.8-.2-6.3.4-8 1.7z" />
    <path d="M12 6.5v11.4" />
    <path d="M7 20.5l5-2.6 5 2.6" />
  </svg>
);

/* Translate (A ↔ script) */
const TranslateIcon = () => (
  <svg {...svgProps}>
    <path d="M3.5 5.5h8" />
    <path d="M7.5 4v1.5" />
    <path d="M10 5.5c-.6 3.4-2.9 6-5.8 7.4" />
    <path d="M5.5 8.5c1 1.8 2.6 3.3 4.6 4.3" />
    <path d="M12.5 20l3.8-9 3.8 9" />
    <path d="M13.8 17h5" />
  </svg>
);

function SizeStepper({ label, icon, value, min, max, onChange, step, base }) {
  const pct = Math.round((value / base) * 100);
  return (
    <div className="rt-stepper" role="group" aria-label={`${label} size`}>
      <span className="rt-stepper-icon" aria-hidden="true">{icon}</span>
      <span className="rt-stepper-label">{label}</span>
      <div className="rt-stepper-ctrl">
        <button
          type="button"
          className="rt-step-btn"
          onClick={() => onChange(-step)}
          disabled={value <= min + 1e-9}
          aria-label={`Decrease ${label} size`}
          title={`Smaller ${label}`}
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className="rt-step-val" aria-live="polite">{pct}%</span>
        <button
          type="button"
          className="rt-step-btn"
          onClick={() => onChange(step)}
          disabled={value >= max - 1e-9}
          aria-label={`Increase ${label} size`}
          title={`Larger ${label}`}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}

function ToggleChip({ label, short, active, onClick }) {
  return (
    <button
      type="button"
      className={`rt-chip ${active ? 'is-on' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      title={active ? `Hide ${label} translation` : `Show ${label} translation`}
    >
      <span className="rt-chip-check" aria-hidden="true">
        {active ? (
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : null}
      </span>
      <span className="rt-chip-label">{label}</span>
      <span className="rt-chip-label-short">{short}</span>
    </button>
  );
}

export default function ReadingToolbar({
  arabicSize,
  onArabicSizeChange,
  translationSize,
  onTranslationSizeChange,
  showEn,
  showUr,
  onToggleEn,
  onToggleUr,
  children,
}) {
  return (
    <div className="rt-bar">
      <div className="rt-group rt-group--size">
        <SizeStepper
          label="Arabic"
          icon={<BookIcon />}
          value={arabicSize}
          min={ARABIC_FONT_MIN}
          max={ARABIC_FONT_MAX}
          step={ARABIC_FONT_STEP}
          base={getArabicFontDefault()}
          onChange={onArabicSizeChange}
        />
        <SizeStepper
          label="Translation"
          icon={<TranslateIcon />}
          value={translationSize}
          min={TRANSLATION_FONT_MIN}
          max={TRANSLATION_FONT_MAX}
          step={TRANSLATION_FONT_STEP}
          base={TRANSLATION_FONT_DEFAULT}
          onChange={onTranslationSizeChange}
        />
      </div>

      <div className="rt-group rt-group--lang">
        <AudioDropdown />
        <div className="rt-chips" role="group" aria-label="Translations">
          <ToggleChip label="English" short="EN" active={showEn} onClick={onToggleEn} />
          <ToggleChip label="Urdu" short="UR" active={showUr} onClick={onToggleUr} />
        </div>
      </div>

      {children && <div className="rt-group rt-group--extra">{children}</div>}
    </div>
  );
}
