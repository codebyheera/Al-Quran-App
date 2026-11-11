/**
 * components/StreakWidget.jsx — "Daily Quran Reading Streak" strip
 * Lives inside the hero section (see Home.jsx) as one continuous block,
 * divided from the hero content only by a hairline (see StreakWidget.css)
 * — not a separate card/section. Pure localStorage feature (see
 * lib/streakUtils.js) — no backend, no login.
 *
 * Two quiet states, both inline text-sized rows:
 *   Setup:    🔥 How long do you want to read daily?  [5|10|15|20] min  Cancel
 *   Goal set: 🔥 N day streak | ━━ x / y min today | Continue reading →
 *             ○○○○○○◉  Best N days | N min this week | Edit goal
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
 * Inline goal picker: one row with a segmented control. Picking a value
 * saves it right away; Cancel only appears when changing an existing goal.
 */
function GoalSetup({ current, isEdit, onSave, onCancel }) {
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
    <div className="streak-setup">
      {/* Line 1: question | options */}
      <div className="streak-mini-line">
        <span className="streak-setup-q" id="streak-setup-q">
          <IconFlameFilled className="streak-setup-flame" size={15} aria-hidden="true" />
          {isEdit ? 'Change your daily goal' : 'How long do you want to read daily?'}
        </span>
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

      {/* Line 2: hint | cancel */}
      <div className="streak-mini-line streak-mini-line--sub">
        <span>
          {isEdit
            ? `Currently ${current} min a day`
            : `Start small — ${DEFAULT_GOAL} min a day works well. You can change it anytime.`}
        </span>
        {isEdit && (
          <>
            <span className="streak-mini-div" aria-hidden="true" />
            <button type="button" className="streak-mini-edit" onClick={onCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function readCelebrated() {
  try { return localStorage.getItem(CELEBRATED_KEY); } catch { return null; }
}


function weekdayLong(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'long' });
}

/** Last 7 days as tiny dots: filled = goal met, half = read a bit, empty = none. */
function WeekDots({ days, celebrate }) {
  return (
    <ol className={`streak-dots ${celebrate ? 'is-celebrating' : ''}`} aria-label="Last 7 days">
      {days.map((d) => {
        const mins = Math.floor(d.seconds / 60);
        const state = d.completed ? 'done' : d.seconds > 0 ? 'partial' : 'empty';
        const label = `${d.isToday ? 'Today' : weekdayLong(d.date)}: ${
          d.completed ? `goal complete (${mins} min)` : d.seconds > 0 ? `${mins} min read` : 'not read'
        }`;
        return (
          <li
            key={d.date}
            className={`streak-dot streak-dot--${state} ${d.isToday ? 'is-today' : ''}`}
            title={label}
            aria-label={label}
          />
        );
      })}
    </ol>
  );
}

export default function StreakWidget() {
  // Read synchronously on the first render (not in an effect) so the strip is
  // part of the very first paint. Rendering null first and inserting the strip
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
  // the strip after finishing today's goal (usually returning from a Surah).
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
      <div className="streak-strip">
        <GoalSetup
          current={data.dailyGoalMinutes}
          isEdit={hasGoal}
          onSave={chooseGoal}
          onCancel={() => setEditingGoal(false)}
        />
      </div>
    );
  }

  // ── States B & C: goal is set ───────────────────────────────────────
  const days = getRecentDays(7, data);
  const weekMinutes = Math.floor(days.reduce((sum, d) => sum + d.seconds, 0) / 60);
  const minutesLeft = Math.max(1, Math.ceil((goalSeconds - data.todaySecondsRead) / 60));
  const goal = data.dailyGoalMinutes;
  const streak = data.currentStreak;

  return (
    <div className="streak-strip">
      <div className={`streak-mini ${goalComplete ? 'is-complete' : ''}`}>
        {/* Line 1: streak | today | CTA */}
        <div className="streak-mini-line">
          <span className={`streak-mini-count ${streak > 0 ? 'is-lit' : ''}`}>
            <IconFlameFilled className="streak-mini-flame" size={15} aria-hidden="true" />
            <span><b>{streak}</b> day streak</span>
          </span>

          <span className="streak-mini-div" aria-hidden="true" />

          <span
            className="streak-mini-today"
            title={goalComplete ? "Today's goal is done" : `${minutesLeft} min to go today`}
          >
            <span
              className="streak-mini-bar"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Today's reading goal"
            >
              <span className="streak-mini-bar-fill" style={{ width: `${progressPct}%` }} />
            </span>
            <span>
              <b>{Math.min(minutesRead, goal)}</b> / {goal} min today
            </span>
            {goalComplete && <IconCheck className="streak-mini-done" size={14} stroke={2.5} aria-label="done" />}
          </span>

          <span className="streak-mini-div streak-mini-div--cta" aria-hidden="true" />

          <Link to="/surah" className="streak-mini-cta">
            {goalComplete ? 'Keep reading' : 'Continue reading'}
            <IconArrowRight size={14} stroke={2} aria-hidden="true" />
          </Link>
        </div>

        {/* Line 2: last 7 days | best | this week | edit */}
        <div className="streak-mini-line streak-mini-line--sub">
          <WeekDots days={days} celebrate={celebrate} />
          {data.longestStreak > 0 && (
            <>
              <span className="streak-mini-div" aria-hidden="true" />
              <span>Best {data.longestStreak} {data.longestStreak === 1 ? 'day' : 'days'}</span>
            </>
          )}
          <span className="streak-mini-div" aria-hidden="true" />
          <span>{weekMinutes} min this week</span>
          <span className="streak-mini-div" aria-hidden="true" />
          <button
            type="button"
            className="streak-mini-edit"
            onClick={() => setEditingGoal(true)}
          >
            Edit goal
          </button>
        </div>
      </div>
    </div>
  );
}
