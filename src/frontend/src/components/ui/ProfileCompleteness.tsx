import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProfileCompletenessProps {
  completedCount: number;
  totalCount?: number;
  variant?: 'ring' | 'bar' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_CONFIG = {
  sm: { ringSize: 32, strokeWidth: 3, fontSize: 'text-xs', iconSize: 12 },
  md: { ringSize: 48, strokeWidth: 4, fontSize: 'text-sm', iconSize: 16 },
  lg: { ringSize: 64, strokeWidth: 5, fontSize: 'text-base', iconSize: 20 },
};

export function ProfileCompleteness({
  completedCount,
  totalCount = 5,
  variant = 'ring',
  size = 'md',
  showLabel = true,
}: ProfileCompletenessProps) {
  const config = SIZE_CONFIG[size];
  const percentage = Math.min(100, (completedCount / totalCount) * 100);
  const radius = (config.ringSize - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isComplete = completedCount >= totalCount;

  if (variant === 'ring') {
    return (
      <div className="flex items-center gap-2">
        <div className="relative" style={{ width: config.ringSize, height: config.ringSize }}>
          {/* Background circle */}
          <svg
            width={config.ringSize}
            height={config.ringSize}
            className="transform -rotate-90"
          >
            <circle
              cx={config.ringSize / 2}
              cy={config.ringSize / 2}
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={config.strokeWidth}
            />
            <motion.circle
              cx={config.ringSize / 2}
              cy={config.ringSize / 2}
              r={radius}
              fill="none"
              stroke={isComplete ? '#10B981' : 'var(--color-accent)'}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          {/* Center content */}
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            {isComplete ? (
              <CheckCircle2
                style={{ width: config.iconSize, height: config.iconSize, color: '#10B981' }}
              />
            ) : (
              <span
                className={`font-bold ${config.fontSize}`}
                style={{ color: 'var(--color-text)' }}
              >
                {completedCount}
              </span>
            )}
          </div>
        </div>
        {showLabel && (
          <div className="flex flex-col">
            <span
              className={`font-medium ${config.fontSize}`}
              style={{ color: 'var(--color-text)' }}
            >
              {isComplete ? 'Complete' : `${completedCount}/${totalCount}`}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--color-textMuted)' }}
            >
              assessments
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between items-center mb-1.5">
            <span
              className={`font-medium ${config.fontSize}`}
              style={{ color: 'var(--color-text)' }}
            >
              Profile Completeness
            </span>
            <span
              className={`font-semibold ${config.fontSize}`}
              style={{ color: isComplete ? '#10B981' : 'var(--color-accent)' }}
            >
              {completedCount}/{totalCount}
            </span>
          </div>
        )}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: isComplete ? '#10B981' : 'var(--color-accent)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: isComplete ? '#10B981' : 'var(--color-accent)' }}
      />
      <span
        className={config.fontSize}
        style={{ color: 'var(--color-textSecondary)' }}
      >
        {completedCount}/{totalCount}
      </span>
    </div>
  );
}
