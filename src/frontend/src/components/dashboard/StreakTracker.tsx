import { useState, useEffect } from 'react';

const STREAK_KEY = 'amber-streak';
const MAX_FILL_DAYS = 7;

interface StreakData {
  lastActiveDate: string;
  currentStreak: number;
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

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [filling, setFilling] = useState(true);
  const [weekDots, setWeekDots] = useState<boolean[]>([]);
  const [weekDayLabels, setWeekDayLabels] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    const today = getToday();
    const yesterday = getYesterday();

    let data: StreakData;

    if (stored) {
      data = JSON.parse(stored);
      if (data.lastActiveDate === today) {
        // Already visited today
      } else if (data.lastActiveDate === yesterday) {
        data.currentStreak += 1;
        data.lastActiveDate = today;
      } else {
        data.currentStreak = 1;
        data.lastActiveDate = today;
      }
    } else {
      data = { lastActiveDate: today, currentStreak: 1 };
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    setStreak(data.currentStreak);

    const dots: boolean[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dots.push(i < data.currentStreak);
      labels.push(WEEK_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
    }
    setWeekDots(dots);
    setWeekDayLabels(labels);

    const timer = setTimeout(() => setFilling(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const fillPercent = Math.min(streak / MAX_FILL_DAYS, 1) * 100;
  const remaining = MAX_FILL_DAYS - Math.min(streak, MAX_FILL_DAYS);

  return (
    <div
      className="bento-card flex flex-col items-center justify-center text-center"
      style={{ minHeight: 200 }}
    >
      {/* Coffee cup — centered via viewBox that accounts for handle */}
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
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        {streak} Day{streak !== 1 ? 's' : ''}
      </p>
      <p className="text-[11px] mt-2 mb-4" style={{ color: 'var(--color-textMuted)' }}>
        {streak >= MAX_FILL_DAYS
          ? 'Full Cup! Keep It Going'
          : `${remaining} More To Fill The Cup`}
      </p>

      {/* Weekly streak */}
      <div className="w-full">
        <p
          className="text-[10px] font-medium uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Weekly Streak
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
