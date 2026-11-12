/**
 * components/StreakWidget.jsx — "Daily Reading Goal" section on Home
 * First section after the hero (see Home.jsx), with the same header
 * pattern (h2 + ghost action) and card look as "Start Reading" etc.
 * Pure localStorage feature (see lib/streakUtils.js) — no backend, no login.
 *
 *   Daily Reading Goal                                        Edit goal
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │ (🔥) N-day streak          ○ ◐ ● ● ○ ○ ◉   [Continue reading →] │
 *   │      x of y min · N to go  M T W T F S S                         │
 *   │      ━━━━━━━━━━━━━━━━      N min this week · Best N days         │
 *   └───────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconFlameFilled, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { getStreakData, setDailyGoal, getRecentDays } from '../lib/streakUtils';
import './StreakWidget.css';

const GOAL_OPTIONS = [5, 10, 15, 20]; // minutes
const DEFAULT_GOAL = 10;
const CELEBRATED_KEY = 'quranStreakCelebrated'; // date the "goal complete" pop last played

/**
 * Goal picker: question + segmented control. Picking a value saves it right
 * away; Cancel only appears when changing an existing goal.
 */
function GoalSetup({ current, isEdit, onSave }) {
  const selected = current || DEFAULT_GOAL;

  // Arrow keys move along the segmented control (radio-group behaviour)
  const onKeyDown = (e, i) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (i + step + GOAL_OPTIONS.length) % GOAL_OPTIONS.length;
    e.currentTarget.parentElement.children[next]?.focus();
  };

  return (
    <div className="streak-card streak-card--setup">
      <div className="streak-top">
        <span className="streak-icon is-lit" aria-hidden="true">
          <IconFlameFilled size={18} />
        </span>
        <div className="streak-info">
          <h3 className="streak-title" id="streak-setup-q">
            {isEdit ? 'Change your daily goal' : 'Build a daily Quran habit'}
          </h3>
          <p className="streak-sub">
            {isEdit
              ? `Currently ${current} min a day`
              : `How long do you want to read each day? ${DEFAULT_GOAL} min is a good start.`}
          </p>
        </div>
      </div>

      <div className="streak-setup-row">
        <span className="streak-seg" role="radiogroup" aria-labelledby="streak-setup-q">
          {GOAL_OPTIONS.map((m, i) => {
            const active = isEdit && m === selected;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={m === selected ? 0 : -1}
                className={`streak-seg-btn ${active ? 'is-active' : ''} ${!isEdit && m === DEFAULT_GOAL ? 'is-suggested' : ''}`}
                onClick={() => onSave(m)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                {m} min
              </button>
            );
          })}
        </span>
      </div>
    </div>
  );
}

/** Section wrapper — same header pattern as the other Home sections. */
function StreakSection({ action, children }) {
  return (
    <section className="home-section streak-section" aria-labelledby="streak-heading">
      <div className="flex-between mb-2">
        <h2 id="streak-heading">Daily Reading Goal</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const ghostBtnStyle = { fontSize: '0.85rem' };

function readCelebrated() {
  try { return localStorage.getItem(CELEBRATED_KEY); } catch { return null; }
}

function toDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Last 7 days: a small circle per day with its initial underneath.
 *  filled = goal met, half = read a bit, empty = none. */
function WeekDots({ days, celebrate }) {
  return (
    <ol className={`streak-week ${celebrate ? 'is-celebrating' : ''}`} aria-label="Last 7 days">
      {days.map((d) => {
        const mins = Math.floor(d.seconds / 60);
        const state = d.completed ? 'done' : d.seconds > 0 ? 'partial' : 'empty';
        const date = toDate(d.date);
        const label = `${d.isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'long' })}: ${
          d.completed ? `goal complete (${mins} min)` : d.seconds > 0 ? `${mins} min read` : 'not read'
        }`;
        return (
          <li key={d.date} className={`streak-day ${d.isToday ? 'is-today' : ''}`} title={label} aria-label={label}>
            <span className={`streak-dot streak-dot--${state}`}>
              {d.completed && <IconCheck size={10} stroke={3} aria-hidden="true" />}
            </span>
            <span className="streak-day-letter" aria-hidden="true">
              {date.toLocaleDateString('en', { weekday: 'narrow' })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function StreakWidget() {
  // Read synchronously on the first render (not in an effect) so the card is
  // part of the very first paint. Rendering null first and inserting it
  // after mount pushed everything below the hero down — a 0.18 CLS on mobile.
  // Safe because Home is client-rendered; the build-time snapshot (see
  // scripts/prerender.js) runs this against a stubbed, empty localStorage.
  const [data, setData] = useState(() => getStreakData());
  const [editingGoal, setEditingGoal] = useState(false);

  const chooseGoal = useCallback((minutes) => {
    setData(setDailyGoal(minutes));
    setEditingGoal(false);
  }, []);

  const hasGoal = !!data?.dailyGoalMinutes;
  const goalSeconds = (data?.dailyGoalMinutes || 0) * 60;
  const goalComplete = goalSeconds > 0 && (data?.todaySecondsRead || 0) >= goalSeconds;

  // Play the "goal complete" pop once per day: the first time the user sees
  // the card after finishing today's goal (usually returning from a Surah).
  const [celebrate] = useState(() => goalComplete && readCelebrated() !== data?.todayDate);
  useEffect(() => {
    if (!celebrate) return;
    try { localStorage.setItem(CELEBRATED_KEY, data.todayDate); } catch {}
  }, [celebrate, data?.todayDate]);

  if (!data) return null;
  const minutesRead = Math.floor(data.todaySecondsRead / 60);
  const progressPct = goalSeconds > 0 ? Math.min(100, Math.round((data.todaySecondsRead / goalSeconds) * 100)) : 0;

  // ── State A: no goal yet, or changing it ────────────────────────────
  if (!hasGoal || editingGoal) {
    return (
      <StreakSection
        action={hasGoal && (
          <button type="button" className="btn btn-ghost" style={ghostBtnStyle} onClick={() => setEditingGoal(false)}>
            Cancel
          </button>
        )}
      >
        <GoalSetup
          current={data.dailyGoalMinutes}
          isEdit={hasGoal}
          onSave={chooseGoal}
        />
      </StreakSection>
    );
  }

  // ── States B & C: goal is set ───────────────────────────────────────
  const days = getRecentDays(7, data);
  const weekMinutes = Math.floor(days.reduce((sum, d) => sum + d.seconds, 0) / 60);
  const minutesLeft = Math.max(1, Math.ceil((goalSeconds - data.todaySecondsRead) / 60));
  const goal = data.dailyGoalMinutes;
  const streak = data.currentStreak;

  const title = streak > 0
    ? <><b>{streak}</b>-day streak</>
    : 'Start your streak today';
  const sub = goalComplete
    ? `Today's goal is done — MashaAllah!`
    : `${Math.min(minutesRead, goal)} of ${goal} min read today · ${minutesLeft} min to go`;

  return (
    <StreakSection
      action={
        <button type="button" className="btn btn-ghost" style={ghostBtnStyle} onClick={() => setEditingGoal(true)}>
          Edit goal
        </button>
      }
    >
      <div className={`streak-card ${goalComplete ? 'is-complete' : ''}`}>
        {/* Today: icon | streak + progress */}
        <div className="streak-top">
          <span className={`streak-icon ${streak > 0 || goalComplete ? 'is-lit' : ''}`} aria-hidden="true">
            {goalComplete ? <IconCheck size={18} stroke={2.5} /> : <IconFlameFilled size={18} />}
          </span>
          <div className="streak-info">
            <h3 className="streak-title">{title}</h3>
            <p className="streak-sub">{sub}</p>
            <span
              className="streak-bar"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Today's reading goal"
            >
              <span className="streak-bar-fill" style={{ width: `${progressPct}%` }} />
            </span>
          </div>
        </div>

        {/* This week: dots + totals */}
        <div className="streak-week-block">
          <WeekDots days={days} celebrate={celebrate} />
          <p className="streak-meta">
            <span><b>{weekMinutes}</b> min this week</span>
            {data.longestStreak > 0 && (
              <span>Best <b>{data.longestStreak}</b> {data.longestStreak === 1 ? 'day' : 'days'}</span>
            )}
          </p>
        </div>

        <Link to="/surah" className="btn btn-primary streak-cta">
          {goalComplete ? 'Keep reading' : 'Continue reading'}
          <IconArrowRight size={16} stroke={2} aria-hidden="true" />
        </Link>
      </div>
    </StreakSection>
  );
}
