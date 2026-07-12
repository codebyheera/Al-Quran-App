import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './VerseOfDay.module.css';

/* ── Icons ─────────────────────────────────────────────────── */
const MoonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
  { value: 'id', label: 'Indonesia' },
  { value: 'fr', label: 'Français' },
];

/* ── Main Component ─────────────────────────────────────────── */
const VerseOfDay = ({ hijriDate }) => {
  const [lang, setLang]               = useState('en');
  const [verseData, setVerseData]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [randomOffset, setRandomOffset] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastKey, setToastKey]       = useState(0);
  const [showTranslit, setShowTranslit] = useState(false);
  const [shareOpen, setShareOpen]     = useState(false);
  const [gregorianDate, setGregorianDate] = useState('');
  const [computedHijri, setComputedHijri] = useState('');

  const toastTimeoutRef = useRef(null);
  const shareRef        = useRef(null);
  const navigate        = useNavigate();

  /* ── Dates ── */
  useEffect(() => {
    const today = new Date();
    setGregorianDate(today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    try {
      const islamicMonths = ["Muharram","Safar","Rabiʻ I","Rabiʻ II","Jumada I","Jumada II","Rajab","Shaʻban","Ramadan","Shawwal","Dhuʻl-Qiʻdah","Dhuʻl-Hijjah"];
      const fmt   = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
      const parts = fmt.formatToParts(today);
      const day   = parts.find(p => p.type === 'day')?.value;
      const mon   = parseInt(parts.find(p => p.type === 'month')?.value, 10);
      const year  = parts.find(p => p.type === 'year')?.value;
      if (day && !isNaN(mon) && year) setComputedHijri(`${day} ${islamicMonths[mon - 1] || mon} ${year}`);
    } catch { setComputedHijri(''); }
  }, []);

  /* ── Fetch verse ── */
  useEffect(() => {
    const fetchVerse = async () => {
      setLoading(true); setError(null);
      try {
        const seed     = new Date().toISOString().split('T')[0].split('-').reduce((a, b) => a + parseInt(b), 0);
        const ayahNum  = ((seed % 6236) + randomOffset) % 6236 + 1;
        const res      = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/editions/quran-uthmani,en.transliteration,en.asad,ur.jalandhry,id.indonesian,fr.hamidullah`);
        const json     = await res.json();
        if (json.code === 200) {
          setVerseData({
            arabic:            json.data[0].text,
            surahName:         json.data[0].surah.englishName,
            surahNumber:       json.data[0].surah.number,
            ayahNumberInSurah: json.data[0].numberInSurah,
            transliteration:   json.data[1].text,
            en: json.data[2].text,
            ur: json.data[3].text,
            id: json.data[4].text,
            fr: json.data[5].text,
          });
        } else { setError('Failed to load verse.'); }
      } catch { setError('Network error loading verse.'); }
      finally  { setLoading(false); }
    };
    fetchVerse();
  }, [randomOffset]);

  /* ── Close share popover on outside click ── */
  useEffect(() => {
    const handler = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Helpers ── */
  const showToast = (msg) => {
    setToastMessage(msg);
    setToastKey(prev => prev + 1);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyAyah = () => {
    if (!verseData) return;
    navigator.clipboard.writeText(`${verseData.arabic}\n\n${verseData[lang]}`);
    showToast('Ayah copied!');
  };

  const handleShareWhatsApp = () => {
    if (!verseData) return;
    const text = `${verseData.arabic}\n\n${verseData[lang]}\n\n— Surah ${verseData.surahName} ${verseData.surahNumber}:${verseData.ayahNumberInSurah}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setShareOpen(false);
  };

  const handleShareX = () => {
    if (!verseData) return;
    const text = `Verse of the Day:\n${verseData[lang]}\n— Surah ${verseData.surahName} ${verseData.surahNumber}:${verseData.ayahNumberInSurah}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setShareOpen(false);
  };

  const handleNewVerse = () => setRandomOffset(Math.floor(Math.random() * 6236));

  const goToSurah = () => { if (verseData) navigate(`/surah/${verseData.surahName}`); };

  const isRtl = lang === 'ur';

  return (
    <div className={styles.container}>

      {/* ── Compact header row ── */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Verse of the Day</h2>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.dateChip}><MoonIcon /> {hijriDate || computedHijri} · {gregorianDate}</span>
        </div>
      </div>

      {/* ── Language dropdown + transliteration toggle row ── */}
      <div className={styles.controlRow}>
        <div className={styles.langSelectWrap}>
          <select
            className={styles.langSelect}
            value={lang}
            onChange={e => setLang(e.target.value)}
            aria-label="Select translation language"
          >
            {LANG_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {lang === 'en' && (
          <button
            className={styles.translitToggle}
            onClick={() => setShowTranslit(v => !v)}
            aria-pressed={showTranslit}
          >
            {showTranslit ? 'Hide' : 'Show'} transliteration
          </button>
        )}
      </div>

      {/* ── Verse card ── */}
      {loading ? (
        <div className={styles.loadingWrap}><div className="spinner" /></div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <div className={styles.card}>
            {/* Clickable surah badge → navigate to surah */}
            <button className={styles.cardBadge} onClick={goToSurah} title={`Read Surah ${verseData.surahName}`}>
              <BookIcon />
              <span>{verseData.surahName} {verseData.surahNumber}:{verseData.ayahNumberInSurah}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <p className={styles.arabicText}>{verseData.arabic}</p>

            {/* Transliteration — hidden by default */}
            {lang === 'en' && showTranslit && verseData.transliteration && (
              <p className={styles.transliteration}>{verseData.transliteration}</p>
            )}

            {/* Translation */}
            <div className={`${styles.translationBox} ${isRtl ? styles.rtl : styles.ltr}`}>
              <p className={styles.translationText}>{isRtl ? verseData[lang] : `"${verseData[lang]}"`}</p>
            </div>
          </div>

          {/* ── Action row: max 3 buttons ── */}
          <div className={styles.actionRow}>

            {/* Share dropdown */}
            <div className={styles.shareWrap} ref={shareRef}>
              <button
                className={styles.actionBtn}
                onClick={() => setShareOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={shareOpen}
                title="Share"
              >
                <ShareIcon /> Share
              </button>
              {shareOpen && (
                <div className={styles.sharePopover}>
                  <button className={styles.shareOption} onClick={handleShareWhatsApp}>
                    <span className={styles.waColor}><WhatsAppIcon /></span> WhatsApp
                  </button>
                  <button className={styles.shareOption} onClick={handleShareX}>
                    <XIcon /> X / Twitter
                  </button>
                </div>
              )}
            </div>

            {/* Copy ayah */}
            <button className={styles.actionBtn} onClick={handleCopyAyah}>
              <CopyIcon /> Copy
            </button>

            {/* New verse */}
            <button className={styles.actionBtn} onClick={handleNewVerse}>
              <RefreshIcon /> New verse
            </button>
          </div>
        </>
      )}

      {/* Toast */}
      {toastMessage && (
        <div key={toastKey} className={styles.toast}>{toastMessage}</div>
      )}
    </div>
  );
};

export default VerseOfDay;
