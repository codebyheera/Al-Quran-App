import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './VerseOfDay.module.css';

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const VerseOfDay = ({ hijriDate }) => {
  const [lang, setLang] = useState('en');
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [randomOffset, setRandomOffset] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [computedHijri, setComputedHijri] = useState('');

  useEffect(() => {
    const today = new Date();
    const date = today.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    setGregorianDate(date);
    
    try {
      const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      setComputedHijri(hijriFormatter.format(today).replace(' AH', ''));
    } catch (e) {
      setComputedHijri('');
    }
  }, []);

  useEffect(() => {
    const fetchVerse = async () => {
      setLoading(true);
      setError(null);
      try {
        const seed = new Date().toISOString().split('T')[0].split('-').reduce((a, b) => a + parseInt(b), 0);
        const baseIndex = seed % 6236;
        let finalIndex = (baseIndex + randomOffset) % 6236;
        const ayahNumber = finalIndex + 1; // 1 to 6236

        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.transliteration,en.asad,ur.jalandhry,id.indonesian,fr.hamidullah`);
        const json = await res.json();

        if (json.code === 200) {
          setVerseData({
            arabic: json.data[0].text,
            surahName: json.data[0].surah.englishName,
            surahNumber: json.data[0].surah.number,
            ayahNumberInSurah: json.data[0].numberInSurah,
            transliteration: json.data[1].text,
            en: json.data[2].text,
            ur: json.data[3].text,
            id: json.data[4].text,
            fr: json.data[5].text
          });
        } else {
          setError("Failed to load verse.");
        }
      } catch (e) {
        setError("Network error loading verse.");
      } finally {
        setLoading(false);
      }
    };
    fetchVerse();
  }, [randomOffset]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleCopyLink = () => {
    if (!verseData) return;
    const url = `${window.location.origin}/surah/${verseData.surahName}#verse-${verseData.ayahNumberInSurah}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied!');
  };

  const handleCopyAyah = () => {
    if (!verseData) return;
    const text = `${verseData.arabic}\n\n${verseData[lang]}`;
    navigator.clipboard.writeText(text);
    showToast('Ayah copied!');
  };

  const handleShareWhatsApp = () => {
    if (!verseData) return;
    const text = `${verseData.arabic}\n\n${verseData[lang]}\n\n- Surah ${verseData.surahName} ${verseData.surahNumber}:${verseData.ayahNumberInSurah}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareX = () => {
    if (!verseData) return;
    const text = `Verse of the Day:\n${verseData[lang]}\n- Surah ${verseData.surahName} ${verseData.surahNumber}:${verseData.ayahNumberInSurah}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNewVerse = () => {
    const randomNum = Math.floor(Math.random() * 6236);
    setRandomOffset(randomNum);
  };

  const renderTranslation = () => {
    if (!verseData) return null;
    
    if (lang === 'en') {
      return (
        <div className={`${styles.translationBox} ${styles.ltr}`}>
          {verseData.transliteration && (
            <p className={styles.transliteration}>{verseData.transliteration}</p>
          )}
          <p className={styles.translationText}>"{verseData.en}"</p>
        </div>
      );
    } else if (lang === 'ur') {
      return (
        <div className={`${styles.translationBox} ${styles.rtl}`}>
          <p className={styles.translationText}>{verseData.ur}</p>
        </div>
      );
    } else if (lang === 'id') {
      return (
        <div className={`${styles.translationBox} ${styles.ltr}`}>
          <p className={styles.translationText}>"{verseData.id}"</p>
        </div>
      );
    } else if (lang === 'fr') {
      return (
        <div className={`${styles.translationBox} ${styles.ltr}`}>
          <p className={styles.translationText}>"{verseData.fr}"</p>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Verse of the Day</h2>
        <div className={styles.badgeToday}>
          <StarIcon /> Today's ayah
        </div>
      </div>

      <div className={styles.dateRow}>
        <MoonIcon /> {hijriDate || computedHijri} &middot; {gregorianDate}
      </div>

      <div className={styles.langPills}>
        {['en', 'ur', 'id', 'fr'].map(l => (
          <button 
            key={l}
            className={`${styles.pill} ${lang === l ? styles.active : ''}`}
            onClick={() => setLang(l)}
          >
            {l === 'en' ? 'English' : l === 'ur' ? 'اردو' : l === 'id' ? 'Indonesia' : 'Français'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading verse...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardBadge}>
              <BookIcon /> {verseData.surahName} {verseData.surahNumber}:{verseData.ayahNumberInSurah}
            </div>

            <p className={styles.arabicText}>
              {verseData.arabic}
            </p>

            {renderTranslation()}
          </div>

          <div className={styles.shareRow}>
            <button className={styles.actionBtn} onClick={handleShareWhatsApp}>
              <WhatsAppIcon /> WhatsApp
            </button>
            <button className={styles.actionBtn} onClick={handleShareX}>
              <XIcon /> X / Twitter
            </button>
            <button className={styles.actionBtn} onClick={handleCopyAyah}>
              <CopyIcon /> Copy ayah
            </button>
            <button className={styles.actionBtn} onClick={handleCopyLink}>
              <LinkIcon /> Copy link
            </button>
          </div>

          <div className={styles.bottomRow}>
            <Link to={`/surah/${verseData.surahName}`} className={styles.actionBtn} style={{ textDecoration: 'none' }}>
              <BookIcon /> Read {verseData.surahName} &rarr;
            </Link>
            <button className={styles.actionBtn} onClick={handleNewVerse}>
              <RefreshIcon /> New verse
            </button>
          </div>
        </>
      )}

      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VerseOfDay;
