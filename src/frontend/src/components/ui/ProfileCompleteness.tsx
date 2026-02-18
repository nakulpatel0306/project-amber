import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProfileCompletenessProps {
  completedCount: number;
  totalCount?: number;
  variant?: 'ring' | 'bar';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  assessments?: { name: string; completed: boolean }[];
}

export function ProfileCompleteness({
  completedCount,
  totalCount = 5,
  variant = 'ring',
  size = 'md',
  showLabel = true,
  assessments,
}: ProfileCompletenessProps) {
  const percentage = Math.round((completedCount / totalCount) * 100);

  if (variant === 'bar') {
    return (
      <div>
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Profile Completeness
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              {percentage}%
            </span>
          </div>
        )}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-accentHover))' }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {assessments && (
          <div className="flex items-center gap-3 mt-2">
            {assessments.map((a, i) => (
              <div key={i} className="flex items-center gap-1">
                <CheckCircle2
                  className="w-3.5 h-3.5"
                  style={{ color: a.completed ? '#10B981' : 'var(--color-border)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: a.completed ? 'var(--color-textSecondary)' : 'var(--color-textMuted)' }}
                >
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Ring variant
  const sizes = { sm: 48, md: 64, lg: 80 };
  const ringSize = sizes[size];
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
  const ringRadius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="transform -rotate-90"
          style={{ width: ringSize, height: ringSize }}
        >
          {/* Background ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold"
            style={{
              color: 'var(--color-text)',
              fontSize: size === 'sm' ? '11px' : size === 'md' ? '14px' : '16px',
            }}
          >
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>
      {showLabel && (
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {percentage}% Complete
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {totalCount - completedCount} assessment{totalCount - completedCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}
    </div>
  );
}
