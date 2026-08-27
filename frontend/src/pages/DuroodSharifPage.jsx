import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import SurahIntro from '../components/SurahIntro';
import { pageSeo } from '../data/pageSeo';
import './DuroodSharifPage.css';

const ARABIC =
  'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ';
const TRANSLIT =
  "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammadin kama sallayta 'ala Ibrahima wa 'ala aali Ibrahima innaka Hamidum Majid. Allahumma barik 'ala Muhammadin wa 'ala aali Muhammadin kama barakta 'ala Ibrahima wa 'ala aali Ibrahima innaka Hamidum Majid.";
const TRANSLATION =
  "O Allah, send blessings upon Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim — indeed You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim — indeed You are Praiseworthy and Glorious.";

const PAGE_URL = `https://alquranhub.org${pageSeo.duroodSharif.path}`;

// General, uncontroversial phrasing only — no hadith text is quoted or
// numbered here on purpose. Verify the specific hadith reference/wording
// with a qualified source before this copy goes live.
const INTRO_TEXT =
  "Durood Sharif refers to the special phrases Muslims recite to send blessings and salutations upon Prophet Muhammad ﷺ. The most well-known form is Durood-e-Ibrahim, recited daily within the sitting position (Tashahhud) of the five daily prayers, though it can also be recited at any time as an independent act of worship. Sending Durood is an expression of love, respect, and gratitude toward the Prophet, and Muslims are encouraged to recite it frequently, especially on Fridays. Hadith collections, including Sahih Muslim, report that the Prophet encouraged his followers to send blessings upon him and spoke of the great reward that awaits those who do so regularly. Reciting Durood is also considered a means of drawing closer to Allah, purifying the heart, and following the Prophet's own example, since the Quran describes Allah and His angels as sending blessings upon him. Many Muslims use a simple daily counter, like the one below, to track their recitations and build a consistent habit of remembrance throughout the day.";

// General, non-controversial answers only — review for religious accuracy
// before publishing.
const FAQS = [
  {
    question: 'What is Durood Sharif?',
    answer:
      'Durood Sharif is the act of sending blessings and salutations upon Prophet Muhammad, usually recited in Arabic phrases such as Durood-e-Ibrahim. It is recited during the daily prayers and encouraged at other times too, as an expression of love, respect, and gratitude toward the Prophet.',
  },
  {
    question: 'How many times should I recite Durood?',
    answer:
      'There is no fixed number — many Muslims recite Durood 10, 33, 100, or more times daily as part of their personal dhikr. What matters most is consistency, reciting it regularly, especially after prayers and on Fridays, rather than reaching any particular count.',
  },
  {
    question: 'What are the benefits of reciting Durood?',
    answer:
      'Reciting Durood is considered a source of great reward, a means of drawing closer to Allah, and an expression of love for the Prophet. Hadith sources describe it as bringing blessings, purifying the heart, and helping a person feel spiritually connected throughout the day.',
  },
  {
    question: "Why is reciting Durood important on Friday (Jumu'ah)?",
    answer:
      "Friday holds special significance in Islam, and many hadith encourage Muslims to increase their recitation of Durood on this day in particular. Reciting it frequently on Jumu'ah is seen as an especially rewarding practice and a way to honor the Prophet during the week's most blessed day.",
  },
  {
    question: 'What does Durood-e-Ibrahim mean?',
    answer:
      'Durood-e-Ibrahim is the specific form of Durood recited in the Tashahhud during the daily prayers. It asks Allah to send blessings upon Prophet Muhammad and his family just as He blessed Prophet Ibrahim (Abraham) and his family, linking the two prophets in one supplication.',
  },
];

/* ── Icons — same inline SVGs already used for sharing on VerseOfDay ── */
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// ── localStorage helpers — same today-keyed pattern TasbihPage uses,
// so a day rollover resets the count without any extra bookkeeping. ──
function getToday() {
  return new Date().toISOString().split('T')[0];
}
function todayKey() {
  return `darood_count_${getToday()}`;
}
function loadToday() {
  try { return parseInt(localStorage.getItem(todayKey()) || '0', 10); } catch { return 0; }
}
function saveToday(n) {
  try { localStorage.setItem(todayKey(), String(n)); } catch {}
}
function loadLifetime() {
  try { return parseInt(localStorage.getItem('darood_lifetime_total') || '0', 10); } catch { return 0; }
}
function saveLifetime(n) {
  try { localStorage.setItem('darood_lifetime_total', String(n)); } catch {}
}

export default function DuroodSharifPage() {
  const [count, setCount] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy link');

  useEffect(() => {
    setCount(loadToday());
    setLifetime(loadLifetime());
  }, []);

  function increment() {
    const next = count + 1;
    setCount(next);
    saveToday(next);

    const nextLifetime = lifetime + 1;
    setLifetime(nextLifetime);
    saveLifetime(nextLifetime);

    if (navigator.vibrate) navigator.vibrate(15);
  }

  function decrement() {
    if (count <= 0) return;
    const next = count - 1;
    setCount(next);
    saveToday(next);

    const nextLifetime = Math.max(0, lifetime - 1);
    setLifetime(nextLifetime);
    saveLifetime(nextLifetime);
  }

  // Reset is destructive (zeroes today's count), so it asks for a quick
  // inline confirmation instead of acting immediately — the site has no
  // modal/dialog component elsewhere for this, so a lightweight inline
  // swap keeps it consistent with the rest of the page's simple controls.
  function confirmReset() {
    setCount(0);
    saveToday(0);
    setConfirmingReset(false);
  }

  function handleShareWhatsApp() {
    const text = `Recite Durood Sharif with me: ${PAGE_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(PAGE_URL);
      setCopyLabel('Copied!');
    } catch {
      setCopyLabel('Copy failed');
    }
    setTimeout(() => setCopyLabel('Copy link'), 2000);
  }

  return (
    <div className="darood-page page-enter">
      <Helmet>
        <title>{pageSeo.duroodSharif.title}</title>
        <meta name="description" content={pageSeo.duroodSharif.description} />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>

      <div className="darood-page-inner">

        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Durood Sharif', href: '/durood-sharif' },
        ]} />

        <h1>Durood <span className="text-gold">Sharif</span></h1>
        <p className="text-muted darood-page-subtitle">
          Durood-e-Ibrahim — recite and count your daily Durood.
        </p>

        {/* TODO: verify hadith reference before publishing */}
        <section className="surah-intro" aria-label="About Durood Sharif">
          <p className="surah-intro__para">{INTRO_TEXT}</p>
        </section>

        <div className="darood-text-card card">
          <p className="darood-text-arabic arabic">{ARABIC}</p>
          <p className="darood-text-translit">{TRANSLIT}</p>
          <p className="darood-text-translation">{TRANSLATION}</p>
        </div>

        <div className="darood-share-row">
          <button type="button" className="darood-share-btn darood-share-whatsapp" onClick={handleShareWhatsApp}>
            <WhatsAppIcon /> Share on WhatsApp
          </button>
          <button type="button" className="darood-share-btn darood-share-copy" onClick={handleCopyLink}>
            <CopyIcon /> {copyLabel}
          </button>
        </div>

        <div className="darood-counter">
          <button
            className="darood-tap"
            onClick={increment}
            aria-label="Count Durood recitation"
          >
            <span className="darood-count-num">{count}</span>
            <span className="darood-tap-hint">TAP TO COUNT</span>
          </button>

          <div className="darood-controls">
            <button className="darood-ctrl" onClick={decrement}>− 1</button>

            {confirmingReset ? (
              <span className="darood-reset-confirm">
                <span className="darood-reset-confirm-text">Reset?</span>
                <button
                  type="button"
                  className="darood-reset-yes"
                  onClick={confirmReset}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="darood-reset-cancel"
                  onClick={() => setConfirmingReset(false)}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                className="darood-ctrl darood-ctrl-reset"
                onClick={() => setConfirmingReset(true)}
              >
                Reset
              </button>
            )}

            <button className="darood-ctrl" onClick={increment}>+ 1</button>
          </div>

          <div className="darood-lifetime-card">
            <div className="lifetime-label">Total Durood Recited</div>
            <div className="lifetime-val">{lifetime.toLocaleString()}</div>
            <div className="lifetime-sub">since you started</div>
          </div>
          <p className="darood-save-note">
            Your count is saved automatically on this device.
          </p>
        </div>

        {/* TODO: verify FAQ answers for religious accuracy before publishing */}
        <SurahIntro faqs={FAQS} surahName="Durood Sharif" pageUrl={PAGE_URL} />

        <section className="darood-related" aria-label="Related features">
          <h2 className="darood-related-title">Continue Your Worship</h2>
          <div className="darood-related-grid">
            <Link to="/tasbih" className="darood-related-card">
              <span className="darood-related-icon" aria-hidden="true">📿</span>
              <span className="darood-related-text">Explore the Tasbih Counter</span>
            </Link>
            <Link to="/surah" className="darood-related-card">
              <span className="darood-related-icon" aria-hidden="true">📖</span>
              <span className="darood-related-text">Read the Quran</span>
            </Link>
            <Link to="/prayer-times" className="darood-related-card">
              <span className="darood-related-icon" aria-hidden="true">🕌</span>
              <span className="darood-related-text">Check Prayer Times</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
