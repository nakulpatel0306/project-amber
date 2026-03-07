import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

const STEPS = [
  'Grinding Fresh Beans...',
  'Heating The Water...',
  'Brewing Your Perfect Cup...',
  'Almost Ready...',
] as const;

const STEP_DURATION = 1800;
const MIN_LOADER_MS = 2500;

export interface CoffeeBrewLoaderProps {
  variant?: 'fullscreen' | 'section' | 'content' | 'inline';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showRotatingMessages?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { dot: 6, gap: 'gap-1', text: 'text-xs' },
  md: { dot: 8, gap: 'gap-1.5', text: 'text-sm' },
  lg: { dot: 10, gap: 'gap-2', text: 'text-base' },
};

const DOT_COLORS = [
  'var(--color-accent)',
  'var(--color-warning)',
  'var(--color-accent)',
  'var(--color-warning)',
];

/**
 * Hook that enforces a minimum display time for loading states.
 * Returns true for at least `minMs` after `loading` first becomes true.
 */
export function useMinLoader(loading: boolean, minMs = MIN_LOADER_MS): boolean {
  const [visible, setVisible] = useState(loading);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (loading) {
      startRef.current = Date.now();
      setVisible(true);
    } else if (visible) {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, minMs - elapsed);
      const timer = setTimeout(() => setVisible(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading, minMs]);

  return visible;
}

export function CoffeeBrewLoader({
  variant = 'section',
  message,
  size = 'md',
  showRotatingMessages: _showRotatingMessages = false,
  className,
}: CoffeeBrewLoaderProps) {
  const [step, setStep] = useState(0);

  const cycling = !message;
  useEffect(() => {
    if (!cycling) return;
    const id = setInterval(() => setStep(prev => (prev + 1) % STEPS.length), STEP_DURATION);
    return () => clearInterval(id);
  }, [cycling]);

  const { dot: dotSize, gap, text: textClass } = sizeConfig[size];
  const raw = message || STEPS[step];
  const displayLabel = raw.replace(/\b\w/g, c => c.toUpperCase());

  const dots = (
    <div className={cn('flex items-center', gap)}>
      {DOT_COLORS.map((color, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            animation: 'dotBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );

  const label = (
    <p
      key={displayLabel}
      className={cn(textClass, 'font-medium')}
      style={{
        color: 'var(--color-textMuted)',
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      {displayLabel}
    </p>
  );

  const wrapperClass = cn(
    'flex items-center justify-center',
    variant === 'fullscreen' && 'fixed inset-0 z-[9998]',
    variant === 'section' && 'py-12 w-full',
    variant === 'content' && 'w-full flex-1 min-h-[400px]',
    variant === 'inline' && 'gap-3',
    className,
  );
  const wrapperStyle =
    variant === 'fullscreen'
      ? { backgroundColor: 'var(--color-background)' }
      : undefined;

  if (variant === 'inline') {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        {dots}
        {label}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="flex flex-col items-center gap-3">
        {dots}
        {label}
      </div>
    </div>
  );
}
