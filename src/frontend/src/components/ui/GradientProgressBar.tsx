import { motion } from 'framer-motion';

interface GradientProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const GRADIENTS: Record<string, string> = {
  amber: 'linear-gradient(90deg, #F59E0B, #D97706)',
  purple: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
  green: 'linear-gradient(90deg, #10B981, #059669)',
  pink: 'linear-gradient(90deg, #EC4899, #DB2777)',
  cyan: 'linear-gradient(90deg, #06B6D4, #0891B2)',
};

export function GradientProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'amber',
  showValue = true,
  size = 'md',
}: GradientProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const gradient = GRADIENTS[color] || `linear-gradient(90deg, ${color}, ${color})`;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          <div>
            {label && (
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {label}
              </span>
            )}
            {sublabel && (
              <span
                className="text-xs ml-2"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {sublabel}
              </span>
            )}
          </div>
          {showValue && (
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {Math.round(value)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`${heights[size]} rounded-full overflow-hidden`}
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <motion.div
          className={`${heights[size]} rounded-full`}
          style={{ background: gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}
