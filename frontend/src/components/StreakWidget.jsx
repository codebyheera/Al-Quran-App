/**
 * components/StreakWidget.jsx — "Daily Quran Reading Streak" strip
 * Lives inside the hero section (see Home.jsx) as one continuous block,
 * divided from the hero content only by a hairline (see StreakWidget.css)
 * — not a separate card/section. Pure localStorage feature (see
 * lib/streakUtils.js) — no backend, no login.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { IconFlameFilled } from '@tabler/icons-react';
import { getStreakData, setDailyGoal } from '../lib/streakUtils';
import './StreakWidget.css';

const GOAL_OPTIONS = [5, 10, 15];

export default function StreakWidget() {
  const [data, setData] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    setData(getStreakData());
  }, []);

  const chooseGoal = useCallback((minutes) => {
    setData(setDailyGoal(minutes));
    setEditingGoal(false);
  }, []);

  if (!data) return null;

  const hasGoal = !!data.dailyGoalMinutes;
  const goalSeconds = (data.dailyGoalMinutes || 0) * 60;
  const goalComplete = goalSeconds > 0 && data.todaySecondsRead >= goalSeconds;
  const minutesRead = Math.floor(data.todaySecondsRead / 60);
  const progressPct = goalSeconds > 0 ? Math.min(100, Math.round((data.todaySecondsRead / goalSeconds) * 100)) : 0;

  // ── State A: no goal yet, or user tapped "Edit Goal" ────────────────
  if (!hasGoal || editingGoal) {
    return (
      <div className="streak-strip">
        <div className="streak-strip-inner streak-strip-setup">
          <div className="streak-strip-fire">
            <IconFlameFilled className="streak-flame-icon" size={22} />
            <span className="streak-strip-text">
              {hasGoal ? 'Change your daily goal —' : 'Start your daily reading streak —'} how much time do you want to read daily?
            </span>
          </div>
          <div className="streak-goal-options">
            {GOAL_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                className={`streak-goal-btn ${m === data.dailyGoalMinutes ? 'active' : ''}`}
                onClick={() => chooseGoal(m)}
              >
                {m} min
              </button>
            ))}
            {hasGoal && (
              <button type="button" className="streak-edit-link" onClick={() => setEditingGoal(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── States B & C: goal is set ────────────────────────────────────────
  return (
    <div className="streak-strip">
      <div className="streak-strip-inner">
        <div className="streak-strip-fire">
          <IconFlameFilled className="streak-flame-icon" size={22} />
          <span className="streak-strip-count">{data.currentStreak}</span>
          <span className="streak-strip-label">day streak</span>
        </div>

        {goalComplete ? (
          <span className="streak-strip-complete">
            <span aria-hidden="true">✅</span> Today&rsquo;s goal complete! Come back tomorrow.
          </span>
        ) : (
          <div className="streak-strip-progress">
            <span className="streak-strip-progress-label">
              Today: {minutesRead}/{data.dailyGoalMinutes} min
            </span>
            <div className="streak-strip-bar">
              <div className="streak-strip-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {!goalComplete && (
          <Link to="/surah" className="streak-strip-btn">
            Continue Reading →
          </Link>
        )}
        <button type="button" className="streak-edit-link" onClick={() => setEditingGoal(true)}>
          Edit Goal
        </button>
      </div>
    </div>
  );
}
