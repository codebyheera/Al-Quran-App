import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import './TasbihPage.css';

const DHIKR = [
  { id: 'subhanallah',   arabic: 'سُبْحَانَ اللَّه',          translit: 'SubhanAllah',      meaning: 'Glory be to Allah' },
  { id: 'alhamdulillah', arabic: 'اَلْحَمْدُ لِلَّه',         translit: 'Alhamdulillah',    meaning: 'All praise to Allah' },
  { id: 'allahuakbar',   arabic: 'اَللَّهُ أَكْبَر',          translit: 'Allahu Akbar',     meaning: 'Allah is the Greatest' },
  { id: 'lailaha',       arabic: 'لَا إِلٰهَ إِلَّا اللَّه', translit: 'La ilaha illAllah', meaning: 'There is no god but Allah' },
];

const SUNNAH_STEPS = [
  { id: 'subhanallah',   arabic: 'سُبْحَانَ اللَّه',  translit: 'SubhanAllah',   target: 33 },
  { id: 'alhamdulillah', arabic: 'اَلْحَمْدُ لِلَّه', translit: 'Alhamdulillah', target: 33 },
  { id: 'allahuakbar',   arabic: 'اَللَّهُ أَكْبَر',  translit: 'Allahu Akbar',  target: 34 },
];

const TARGETS = [33, 99, 100];
const CIRC    = 339.3;

function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ── Audio ─────────────────────────────────────────────────────
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playCelebration() {
  try {
    const ctx = getAudioCtx();
    const t   = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.28, t);
    master.connect(ctx.destination);

    const phrase = [
      { freq: 293.66, at: 0.00, dur: 0.30 },
      { freq: 311.13, at: 0.22, dur: 0.28 },
      { freq: 369.99, at: 0.42, dur: 0.30 },
      { freq: 392.00, at: 0.64, dur: 0.30 },
      { freq: 440.00, at: 0.86, dur: 0.35 },
      { freq: 587.33, at: 1.12, dur: 0.90 },
    ];
    phrase.forEach(({ freq, at, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(master);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + at);
      const s = t + at;
      gain.gain.setValueAtTime(0, s);
      gain.gain.linearRampToValueAtTime(1, s + 0.018);
      gain.gain.setValueAtTime(1, s + dur * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      osc.start(s); osc.stop(s + dur + 0.05);
    });
    const harm  = ctx.createOscillator();
    const hGain = ctx.createGain();
    harm.connect(hGain); hGain.connect(master);
    harm.type = 'sine';
    harm.frequency.setValueAtTime(587.33 * 2, t + 1.12);
    hGain.gain.setValueAtTime(0.18, t + 1.12);
    hGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.12 + 0.7);
    harm.start(t + 1.12); harm.stop(t + 1.12 + 0.75);
  } catch (_) {}
}

// ── localStorage helpers ──────────────────────────────────────
function todayKey(id)  { return `tasbih_${id}_${getToday()}`; }
function loadTotal(id) { try { return parseInt(localStorage.getItem(todayKey(id)) || '0', 10); } catch { return 0; } }
function saveTotal(id, n) { try { localStorage.setItem(todayKey(id), String(n)); } catch {} }

function loadLifetime() {
  try { return parseInt(localStorage.getItem('tasbih_lifetime_total') || '0', 10); } catch { return 0; }
}
function addToLifetime() {
  try { const n = loadLifetime() + 1; localStorage.setItem('tasbih_lifetime_total', String(n)); return n; }
  catch { return loadLifetime(); }
}
function subtractFromLifetime() {
  try { const n = Math.max(0, loadLifetime() - 1); localStorage.setItem('tasbih_lifetime_total', String(n)); return n; }
  catch { return loadLifetime(); }
}

function loadStreak() {
  try {
    const last  = localStorage.getItem('tasbih_last_active_date');
    const saved = parseInt(localStorage.getItem('tasbih_streak') || '0', 10);
    if (!last) return 0;
    const today = getToday();
    if (last === today) return saved;
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (last === yest.toISOString().split('T')[0]) return saved;
    return 0;
  } catch { return 0; }
}
function touchStreak() {
  try {
    const today = getToday();
    const last  = localStorage.getItem('tasbih_last_active_date');
    if (last === today) return parseInt(localStorage.getItem('tasbih_streak') || '0', 10);
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const prev = parseInt(localStorage.getItem('tasbih_streak') || '0', 10);
    const next = (last === yest.toISOString().split('T')[0]) ? prev + 1 : 1;
    localStorage.setItem('tasbih_streak', String(next));
    localStorage.setItem('tasbih_last_active_date', today);
    return next;
  } catch { return 0; }
}
function saveSunnahCompletion() {
  try {
    const key  = `sunnah_completions_${getToday()}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(prev + 1));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────
export default function TasbihPage() {
  const [dhikr, setDhikr]           = useState(DHIKR[0]);
  const [count, setCount]           = useState(0);
  const [target, setTarget]         = useState(33);
  const [customVal, setCustomVal]   = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [done, setDone]             = useState(false);
  const [totals, setTotals]         = useState({});

  const [sunnahMode, setSunnahMode]         = useState(false);
  const [sunnahStep, setSunnahStep]         = useState(0);
  const [sunnahStepDone, setSunnahStepDone] = useState(false);
  const [sunnahDone, setSunnahDone]         = useState(false);

  const [streak, setStreak]     = useState(0);
  const [lifetime, setLifetime] = useState(0);

  const [focusMode, setFocusMode] = useState(false);
  const [ringPulse, setRingPulse] = useState(false);

  const incrementRef = useRef();
  const doneTimerRef = useRef();
  const stepTimerRef = useRef();

  const activeDhikr  = sunnahMode ? SUNNAH_STEPS[sunnahStep] : dhikr;
  const activeTarget = sunnahMode ? SUNNAH_STEPS[sunnahStep].target : target;
  const dashOffset   = CIRC - CIRC * Math.min(count / activeTarget, 1);

  // ── Init ──
  useEffect(() => {
    const t = {};
    DHIKR.forEach(d => { t[d.id] = loadTotal(d.id); });
    setTotals(t);
    setStreak(loadStreak());
    setLifetime(loadLifetime());
    return () => {
      clearTimeout(doneTimerRef.current);
      clearTimeout(stepTimerRef.current);
    };
  }, []);

  // ── Reset count on dhikr change (normal mode) ──
  useEffect(() => {
    if (!sunnahMode) { setCount(0); setDone(false); }
  }, [dhikr, sunnahMode]);

  // ── Keyboard shortcut ──
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (e.code === 'Escape') { setFocusMode(false); return; }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        incrementRef.current?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Focus mode — body class + fullscreen ──
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('tasbih-focus');
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.body.classList.remove('tasbih-focus');
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    return () => document.body.classList.remove('tasbih-focus');
  }, [focusMode]);

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setFocusMode(false); };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Core increment ──
  function incrementCount() {
    if (done || sunnahStepDone) return;
    if (navigator.vibrate) navigator.vibrate(15);

    setRingPulse(true);
    setTimeout(() => setRingPulse(false), 120);

    const next = count + 1;
    setCount(next);

    const nextTotal = (totals[activeDhikr.id] || 0) + 1;
    saveTotal(activeDhikr.id, nextTotal);
    setTotals(t => ({ ...t, [activeDhikr.id]: nextTotal }));

    const newLifetime = addToLifetime();
    setLifetime(newLifetime);

    const newStreak = touchStreak();
    if (newStreak !== streak) setStreak(newStreak);

    if (next >= activeTarget) {
      playCelebration();
      if (navigator.vibrate) navigator.vibrate([80, 50, 80, 50, 120]);

      if (sunnahMode) {
        const step = sunnahStep;
        setSunnahStepDone(true);
        stepTimerRef.current = setTimeout(() => {
          setSunnahStepDone(false);
          if (step < 2) {
            setSunnahStep(step + 1);
            setCount(0);
          } else {
            saveSunnahCompletion();
            setSunnahDone(true);
          }
        }, 1500);
      } else {
        setDone(true);
        doneTimerRef.current = setTimeout(() => { setDone(false); setCount(0); }, 2500);
      }
    }
  }

  incrementRef.current = incrementCount;

  function decrement() {
    if (count <= 0 || done || sunnahStepDone) return;
    const next      = count - 1;
    setCount(next);
    const nextTotal = Math.max(0, (totals[activeDhikr.id] || 0) - 1);
    saveTotal(activeDhikr.id, nextTotal);
    setTotals(t => ({ ...t, [activeDhikr.id]: nextTotal }));
    setLifetime(subtractFromLifetime());
  }

  function reset() {
    clearTimeout(doneTimerRef.current);
    clearTimeout(stepTimerRef.current);
    setCount(0); setDone(false); setSunnahStepDone(false);
    if (sunnahMode) { setSunnahStep(0); setSunnahDone(false); }
  }

  function pickTarget(t) {
    if (t === 'custom') { setShowCustom(true); return; }
    setTarget(t); setShowCustom(false); setCount(0); setDone(false);
  }

  function enterSunnahMode() {
    setSunnahMode(true);
    setSunnahStep(0); setSunnahStepDone(false); setSunnahDone(false);
    setCount(0); setDone(false);
  }

  function exitSunnahMode() {
    setSunnahMode(false);
    setSunnahStep(0); setSunnahStepDone(false); setSunnahDone(false);
    setCount(0); setDone(false);
  }

  return (
    <div className={`tasbih-page page-enter${focusMode ? ' focus-mode' : ''}`}>
      <Helmet>
        <title>Digital Tasbih Counter Online | Al-Quran Hub</title>
        <meta name="description" content="Count SubhanAllah, Alhamdulillah, Allahu Akbar and La ilaha illAllah with our free digital tasbih counter. Includes Sunnah Mode (33-33-34), streak tracking, and Focus Mode. No download needed." />
        <meta name="keywords" content="tasbih counter, digital tasbih, dhikr counter, subhanallah counter, tasbih online" />
        <link rel="canonical" href="https://alquranhub.org/tasbih" />
        <meta property="og:title" content="Digital Tasbih Counter Online | Al-Quran Hub" />
        <meta property="og:description" content="Count SubhanAllah, Alhamdulillah, Allahu Akbar and La ilaha illAllah with our free digital tasbih counter. Includes Sunnah Mode (33-33-34), streak tracking, and Focus Mode." />
        <meta property="og:url" content="https://alquranhub.org/tasbih" />
      </Helmet>

      {/* ── Breadcrumb + heading ── */}
      {!focusMode && (
        <div className="container">
          <Breadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Tasbih', href: '/tasbih' },
          ]} />
          <div className="tasbih-page-top">
            <div>
              <h1>Digital <span className="text-gold">Tasbih</span> Counter</h1>
              <p className="text-muted tasbih-page-subtitle">Count your daily dhikr and track your worship.</p>
            </div>
            <button className="tasbih-focus-btn" onClick={() => setFocusMode(true)}>
              ⛶ Focus
            </button>
          </div>
        </div>
      )}

      {/* ── Focus mode exit ── */}
      {focusMode && (
        <button className="tasbih-focus-exit" onClick={() => setFocusMode(false)}>
          ✕ Exit Focus
        </button>
      )}

      <div className="tasbih-page-inner">

        {/* ── Mode toggle ── */}
        <div className="tasbih-mode-toggle">
          <button
            className={`tasbih-mode-btn${!sunnahMode ? ' active' : ''}`}
            onClick={() => { if (sunnahMode) exitSunnahMode(); }}
          >
            Normal Mode
          </button>
          <button
            className={`tasbih-mode-btn${sunnahMode ? ' active' : ''}`}
            onClick={() => { if (!sunnahMode) enterSunnahMode(); }}
          >
            🕌 Sunnah Mode
          </button>
        </div>

        {/* ── Dhikr selector — normal mode only ── */}
        {!sunnahMode && !focusMode && (
          <div className="tasbih-selector-wrap">
            <div className="tasbih-selector">
              {DHIKR.map(d => (
                <button
                  key={d.id}
                  className={`tasbih-pill${dhikr.id === d.id ? ' active' : ''}`}
                  onClick={() => setDhikr(d)}
                >
                  <span className="pill-arabic arabic">{d.arabic}</span>
                  <span className="pill-translit">{d.translit}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Sunnah step indicator ── */}
        {sunnahMode && !sunnahDone && !focusMode && (
          <div className="tasbih-sunnah-progress">
            <p className="sunnah-step-label">
              Step {sunnahStep + 1} of 3 — <strong>{SUNNAH_STEPS[sunnahStep].translit}</strong>
            </p>
            <div className="sunnah-dots">
              {SUNNAH_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`sunnah-dot${i < sunnahStep ? ' done' : i === sunnahStep ? ' current' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Sunnah all-done screen OR counter ── */}
        {sunnahMode && sunnahDone ? (

          <div className="tasbih-sunnah-complete">
            <div className="sunnah-complete-icon">🤲</div>
            <h2 className="sunnah-complete-title">MashAllah!</h2>
            <p className="sunnah-complete-sub">After-prayer dhikr complete</p>
            <div className="sunnah-complete-summary">
              <span>SubhanAllah × 33</span>
              <span>Alhamdulillah × 33</span>
              <span>Allahu Akbar × 34</span>
            </div>
            <button className="btn btn-primary sunnah-restart-btn" onClick={reset}>
              Start Again
            </button>
          </div>

        ) : (

          <div className="tasbih-counter">

            {sunnahStepDone && (
              <p className="tasbih-done-msg">
                {SUNNAH_STEPS[sunnahStep].translit} complete! ✓
              </p>
            )}
            {done && !sunnahMode && (
              <p className="tasbih-done-msg">MashAllah! ✓ {activeTarget} {activeDhikr.translit}</p>
            )}

            {/* Progress ring — clickable */}
            <div
              className={`tasbih-ring-wrap${ringPulse ? ' ring-pulse' : ''}`}
              onClick={incrementCount}
            >
              <svg viewBox="0 0 120 120" className="tasbih-ring-svg">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1a3a22" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="#C9A84C" strokeWidth="10"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div className="tasbih-ring-inner">
                {(done || sunnahStepDone)
                  ? <div className="tasbih-done-icon">🤲</div>
                  : <div className="tasbih-count-num">{count}</div>
                }
                <div className="tasbih-ring-arabic arabic">{activeDhikr.arabic}</div>
                <div className="tasbih-ring-translit">{activeDhikr.translit}</div>
              </div>
            </div>

            {!done && !sunnahStepDone && (
              <>
                <button className="tasbih-tap" onClick={incrementCount} aria-label="Count dhikr">
                  TAP
                </button>
                <p className="tasbih-kb-hint">Press Space or Enter to count</p>
              </>
            )}

            <div className="tasbih-controls">
              <button className="tasbih-ctrl" onClick={decrement}>− 1</button>
              <button className="tasbih-ctrl tasbih-ctrl-reset" onClick={reset}>Reset</button>
              <button className="tasbih-ctrl" onClick={incrementCount}>+ 1</button>
            </div>

            {!sunnahMode && !focusMode && (
              <>
                <div className="tasbih-targets">
                  {TARGETS.map(t => (
                    <button
                      key={t}
                      className={`tasbih-tgt${target === t && !showCustom ? ' active' : ''}`}
                      onClick={() => pickTarget(t)}
                    >{t}</button>
                  ))}
                  <button
                    className={`tasbih-tgt${showCustom ? ' active' : ''}`}
                    onClick={() => pickTarget('custom')}
                  >Custom</button>
                </div>
                {showCustom && (
                  <input
                    className="tasbih-custom-input"
                    type="number" min="1" placeholder="Enter target…"
                    value={customVal}
                    onChange={e => {
                      setCustomVal(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) { setTarget(v); setCount(0); setDone(false); }
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Stats ── */}
        {!focusMode && (
          <div className="tasbih-stats">
            <div className="tasbih-stats-header">
              <p className="tasbih-stats-label">Today's Dhikr</p>
              {streak >= 2 && (
                <span className="tasbih-streak-badge">🔥 {streak} day streak</span>
              )}
            </div>
            <div className="tasbih-stats-grid">
              {DHIKR.map(d => (
                <div key={d.id} className="tasbih-stat-card">
                  <div className="stat-arabic arabic">{d.arabic}</div>
                  <div className="stat-name">{d.translit}</div>
                  <div className="stat-val">{totals[d.id] || 0}</div>
                </div>
              ))}
            </div>
            <div className="tasbih-lifetime-card">
              <div className="lifetime-label">Total Dhikr</div>
              <div className="lifetime-val">{lifetime.toLocaleString()}</div>
              <div className="lifetime-sub">since you started</div>
            </div>
          </div>
        )}

      </div>

      {/* ── SEO Content Section ── */}
      {!focusMode && (
        <div className="tasbih-seo-section">
          <div className="tasbih-seo-inner">
            <h2>What is a Tasbih Counter?</h2>
            <p>A tasbih counter (also called misbaha or tasbeeh) is a tool Muslims use to count dhikr — the remembrance of Allah. Al-Quran Hub&apos;s free digital tasbih counter lets you count SubhanAllah, Alhamdulillah, Allahu Akbar, and La ilaha illAllah from any device, anytime — no download needed.</p>

            <h2>Dhikr After Prayer (Sunnah)</h2>
            <p>The Prophet ﷺ said: &ldquo;Whoever glorifies Allah (says SubhanAllah) after every prayer 33 times, praises Allah (Alhamdulillah) 33 times, and says Allahu Akbar 34 times, that is 100 in total.&rdquo; — Sahih Muslim 597</p>
            <p>Use our Sunnah Mode to automatically guide you through this 33-33-34 sequence after every salah.</p>

            <h2>Benefits of Daily Dhikr</h2>
            <p>Allah says in the Quran: &ldquo;Verily, in the remembrance of Allah do hearts find rest.&rdquo; (Surah Ar-Ra&apos;d 13:28). Regular dhikr brings peace to the heart, earns immense reward, and keeps the tongue moist with the remembrance of Allah throughout the day.</p>

            <h2>How to Use This Tasbih Counter</h2>
            <ul>
              <li>Select your dhikr — SubhanAllah, Alhamdulillah, Allahu Akbar, or La ilaha illAllah</li>
              <li>Set your target — 33, 99, 100, or a custom number</li>
              <li>Tap the counter, click the ring, or press Space/Enter to count</li>
              <li>Your count is saved automatically — come back anytime</li>
              <li>Use Sunnah Mode for guided after-prayer dhikr (33-33-34)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
