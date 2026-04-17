import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, ChevronRight, PartyPopper } from 'lucide-react';

const STREAK_KEY = 'amber-streak';

type StreakGoal = 7 | 14 | 30;

interface StreakData {
  lastActiveDate: string;
  currentStreak: number;
  goal: StreakGoal;
  completedGoals: StreakGoal[];
  /** ISO date when the current goal challenge started */
  goalStartDate: string;
}

function toLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getToday() {
  return toLocalDate(new Date());
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDate(d);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / 86400000);
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const GOAL_LABELS: Record<StreakGoal, string> = {
  7: '7-Day Streak',
  14: '14-Day Streak',
  30: '30-Day Streak',
};

const CELEBRATION_MSG: Record<StreakGoal, string> = {
  7: 'Week warrior! You nailed 7 days straight.',
  14: "Two weeks strong! You're on fire.",
  30: 'Legendary! 30-day streak complete.',
};

function loadData(): StreakData {
  const stored = localStorage.getItem(STREAK_KEY);
  if (stored) {
    const data = JSON.parse(stored) as StreakData;
    if (!data.goal) data.goal = 7;
    if (!data.completedGoals) data.completedGoals = [];
    if (!data.goalStartDate) data.goalStartDate = data.lastActiveDate;
    return data;
  }
  const today = getToday();
  return { lastActiveDate: today, currentStreak: 0, goal: 7, completedGoals: [], goalStartDate: today };
}

function buildWeekDots(data: StreakData) {
  const dots: boolean[] = [];
  const labels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDate(d);
    const daysFromStart = daysBetween(data.goalStartDate, dateStr);

    // A day is active if:
    // 1. It's on or after the goal start date
    // 2. It's within the current streak counting back from the last active date
    const daysFromLastActive = daysBetween(dateStr, data.lastActiveDate);
    const isActive = daysFromStart >= 0 && daysFromLastActive >= 0 && daysFromLastActive < data.currentStreak;

    dots.push(isActive);
    labels.push(WEEK_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
  }

  return { dots, labels };
}

export function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState<StreakGoal>(7);
  const [filling, setFilling] = useState(true);
  const [weekDots, setWeekDots] = useState<boolean[]>([]);
  const [weekDayLabels, setWeekDayLabels] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);

  const refresh = useCallback((data: StreakData) => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    setStreak(data.currentStreak);
    setGoal(data.goal);
    setGoalCompleted(data.currentStreak >= data.goal);
    const { dots, labels } = buildWeekDots(data);
    setWeekDots(dots);
    setWeekDayLabels(labels);
  }, []);

  useEffect(() => {
    const data = loadData();
    const today = getToday();
    const yesterday = getYesterday();

    if (data.currentStreak === 0) {
      // Brand new or just reset — first day counts
      data.currentStreak = 1;
      data.lastActiveDate = today;
    } else if (data.lastActiveDate === today) {
      // Already visited today — no change
    } else if (data.lastActiveDate === yesterday) {
      // Consecutive day — increment
      data.currentStreak += 1;
      data.lastActiveDate = today;
    } else {
      // Missed a day — reset to 1, restart the current goal
      data.currentStreak = 1;
      data.lastActiveDate = today;
      data.goalStartDate = today;
    }

    // Check if goal just completed
    if (data.currentStreak >= data.goal && !data.completedGoals.includes(data.goal)) {
      data.completedGoals.push(data.goal);
      setJustCompleted(true);
    }

    refresh(data);

    const timer = setTimeout(() => setFilling(false), 1800);
    return () => clearTimeout(timer);
  }, [refresh]);

  const selectGoal = useCallback((newGoal: StreakGoal) => {
    const data = loadData();
    const today = getToday();
    // Reset streak for the new challenge
    data.goal = newGoal;
    data.currentStreak = 1; // Today is day 1 of the new challenge
    data.lastActiveDate = today;
    data.goalStartDate = today;
    refresh(data);
    setJustCompleted(false);
  }, [refresh]);

  const fillPercent = Math.min(streak / goal, 1) * 100;
  const remaining = goal - Math.min(streak, goal);

  // Determine next available goals
  const nextGoals: StreakGoal[] = [];
  if (goalCompleted) {
    if (goal === 7) { nextGoals.push(14, 30); }
    else if (goal === 14) { nextGoals.push(30); }
  }

  return (
    <div
      className="bento-card flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{ minHeight: 200 }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Sparkle particles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const dist = 50 + Math.random() * 20;
              return (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: ['#f59e0b', '#10B981', '#8B5CF6', '#EC4899'][i % 4], left: '50%', top: '40%' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                />
              );
            })}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
              >
                {goal === 30 ? <Trophy className="w-6 h-6 text-white" /> : <PartyPopper className="w-6 h-6 text-white" />}
              </div>
            </motion.div>

            <motion.p
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--color-text)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {goal === 30 ? 'Legendary!' : 'Congratulations!'}
            </motion.p>
            <motion.p
              className="text-xs mt-1 mb-4 px-4"
              style={{ color: 'var(--color-textMuted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {CELEBRATION_MSG[goal]}
            </motion.p>

            {nextGoals.length > 0 ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {nextGoals.map(g => (
                  <button
                    key={g}
                    onClick={() => selectGoal(g)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
                      border: '1px solid #f59e0b30',
                      color: 'var(--color-text)',
                    }}
                  >
                    Try {g} Days
                    <ChevronRight className="w-3 h-3" style={{ color: '#f59e0b' }} />
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.p
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ color: '#10B981' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                All challenges complete //
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee cup */}
      <svg viewBox="0 0 76 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[76px] h-[68px] ml-4">
        <defs>
          <linearGradient id="coffee-fill" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="40%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <clipPath id="cup-clip">
            <path d="M6 10 L6 52 Q6 60 14 60 L42 60 Q50 60 50 52 L50 10 Z" />
          </clipPath>
        </defs>

        {/* Steam */}
        {!filling && streak > 0 && (
          <g opacity="0.2">
            <path d="M20 8 Q20 3 23 1" stroke="var(--color-textMuted)" strokeWidth="1.2" strokeLinecap="round" fill="none" className="animate-steam-1" />
            <path d="M28 7 Q28 2 31 0" stroke="var(--color-textMuted)" strokeWidth="1.2" strokeLinecap="round" fill="none" className="animate-steam-2" />
            <path d="M36 8 Q36 3 39 1" stroke="var(--color-textMuted)" strokeWidth="1.2" strokeLinecap="round" fill="none" className="animate-steam-3" />
          </g>
        )}

        {/* Cup body */}
        <path
          d="M6 10 L6 52 Q6 60 14 60 L42 60 Q50 60 50 52 L50 10 Z"
          fill="var(--color-surfaceHover)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />

        {/* Coffee liquid */}
        <g clipPath="url(#cup-clip)">
          <rect
            x="6"
            y={60 - (50 * fillPercent / 100)}
            width="44"
            height={50 * fillPercent / 100}
            fill="url(#coffee-fill)"
            className={filling ? 'animate-coffee-pour' : ''}
          />
          {fillPercent > 10 && (
            <ellipse
              cx="28"
              cy={60 - (50 * fillPercent / 100) + 2}
              rx="18"
              ry="2"
              fill="#D97706"
              opacity="0.25"
            />
          )}
        </g>

        {/* Cup rim */}
        <rect x="2" y="6" width="52" height="5" rx="2.5" fill="var(--color-border)" />

        {/* Handle */}
        <path
          d="M54 18 Q66 18 66 32 Q66 46 54 46"
          stroke="var(--color-border)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Streak count */}
      <p
        className="text-2xl font-bold leading-none mt-3"
        style={{ color: 'var(--color-text)' }}
      >
        {streak} Day{streak !== 1 ? 's' : ''}
      </p>

      {/* Goal label */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            background: goalCompleted
              ? 'linear-gradient(135deg, #10B98118, #10B98108)'
              : 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
            border: `1px solid ${goalCompleted ? '#10B98130' : '#f59e0b30'}`,
            color: goalCompleted ? '#10B981' : '#f59e0b',
          }}
        >
          {goalCompleted ? <Trophy className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
          {GOAL_LABELS[goal]}
        </span>
      </div>

      <p className="text-[11px] mt-1.5 mb-3" style={{ color: 'var(--color-textMuted)' }}>
        {goalCompleted
          ? goal === 30
            ? 'You completed every streak!'
            : 'Goal reached! Start a new challenge'
          : `${remaining} more day${remaining !== 1 ? 's' : ''} to fill the cup`}
      </p>

      {/* Persistent next-goal buttons (visible when goal completed but celebration dismissed) */}
      {!justCompleted && goalCompleted && nextGoals.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          {nextGoals.map(g => (
            <button
              key={g}
              onClick={() => selectGoal(g)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
                border: '1px solid #f59e0b30',
                color: 'var(--color-text)',
              }}
            >
              Try {g} Days
              <ChevronRight className="w-3 h-3" style={{ color: '#f59e0b' }} />
            </button>
          ))}
        </div>
      )}

      {/* Weekly streak */}
      <div className="w-full">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1.5"
          style={{ color: 'var(--color-textMuted)' }}
        >
          This Week
        </p>
        <div className="flex items-center gap-1">
          {weekDots.map((active, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  opacity: active ? 1 : 0.3,
                }}
              />
              <span
                className="text-[8px]"
                style={{ color: active ? 'var(--color-accent)' : 'var(--color-textMuted)' }}
              >
                {weekDayLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
