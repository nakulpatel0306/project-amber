import { motion } from 'framer-motion';

interface GradientProgressBarProps {
  value: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZE_CONFIG = {
  sm: { height: 6, labelSize: 'text-xs', valueSize: 'text-xs' },
  md: { height: 8, labelSize: 'text-sm', valueSize: 'text-sm' },
  lg: { height: 10, labelSize: 'text-base', valueSize: 'text-base' },
};

export function GradientProgressBar({
  value,
  color = 'var(--color-accent)',
  label,
  showValue = true,
  size = 'md',
  animated = true,
}: GradientProgressBarProps) {
  const config = SIZE_CONFIG[size];
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span
              className={`font-medium ${config.labelSize}`}
              style={{ color: 'var(--color-text)' }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              className={`font-semibold ${config.valueSize}`}
              style={{ color }}
            >
              {Math.round(clampedValue)}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: config.height,
          backgroundColor: 'var(--color-border)',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
          initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
