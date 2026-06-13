import React, { useState, useEffect, useRef } from 'react';
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
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
  const [toastKey, setToastKey] = useState(0);
  const toastTimeoutRef = useRef(null);
  const [gregorianDate, setGregorianDate] = useState('');
  const [computedHijri, setComputedHijri] = useState('');

  useEffect(() => {
    const today = new Date();
    const date = today.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    setGregorianDate(date);
    
    try {
      const islamicMonths = [
        "Muharram", "Safar", "Rabiʻ I", "Rabiʻ II",
        "Jumada I", "Jumada II", "Rajab", "Shaʻban",
        "Ramadan", "Shawwal", "Dhuʻl-Qiʻdah", "Dhuʻl-Hijjah"
      ];
      const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      });
      const parts = formatter.formatToParts(today);
      const day = parts.find(p => p.type === 'day')?.value;
      const monthNum = parseInt(parts.find(p => p.type === 'month')?.value, 10);
      const year = parts.find(p => p.type === 'year')?.value;
      
      if (day && !isNaN(monthNum) && year) {
        const monthName = islamicMonths[monthNum - 1] || monthNum;
        setComputedHijri(`${day} ${monthName} ${year}`);
      } else {
        const fallbackFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        setComputedHijri(fallbackFormatter.format(today).replace(' AH', ''));
      }
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
    setToastKey(prev => prev + 1);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
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
        <div className={styles.loading} style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
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

          <div className={styles.actionRow}>
            <button className={`${styles.actionBtn} ${styles.iconBtn}`} onClick={handleShareWhatsApp} title="Share on WhatsApp" aria-label="Share on WhatsApp">
              <WhatsAppIcon />
            </button>
            <button className={`${styles.actionBtn} ${styles.iconBtn}`} onClick={handleShareX} title="Share on X / Twitter" aria-label="Share on X / Twitter">
              <XIcon />
            </button>
            <button className={styles.actionBtn} onClick={handleCopyAyah}>
              <CopyIcon /> Copy ayah
            </button>
            <button className={styles.actionBtn} onClick={handleCopyLink}>
              <LinkIcon /> Copy link
            </button>
            <Link to={`/surah/${verseData.surahName}`} className={styles.actionBtn} style={{ textDecoration: 'none' }}>
              <BookIcon /> Read {verseData.surahName}
            </Link>
            <button className={styles.actionBtn} onClick={handleNewVerse}>
              <RefreshIcon /> New verse
            </button>
          </div>
        </>
      )}

      {toastMessage && (
        <div key={toastKey} className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VerseOfDay;
