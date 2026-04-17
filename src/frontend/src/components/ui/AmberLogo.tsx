import { cn } from '../../utils/cn';

interface AmberLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'full';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', svg: 32 },
  md: { container: 'w-10 h-10', svg: 40 },
  lg: { container: 'w-12 h-12', svg: 48 },
  xl: { container: 'w-14 h-14', svg: 56 },
  '2xl': { container: 'w-20 h-20', svg: 80 },
};

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

/**
 * Amber "A" mark — matches the browser favicon exactly.
 * Two angled strokes (left + right) forming an A, with a diamond spark
 * at the cross-point.
 */
function AmberMark({ size }: { size: number }) {
  const id = `amber-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-left`} x1="16" y1="8" x2="16" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFBF40" />
          <stop offset="100%" stopColor="#E8820C" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="48" y1="8" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#D4700A" />
        </linearGradient>
        <linearGradient id={`${id}-spark`} x1="32" y1="24" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD97A" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>

      {/* Left stroke of A */}
      <path d="M30 6 L4 58 L18 58 L26 42 L32 28 Z" fill={`url(#${id}-left)`} />
      {/* Right stroke of A */}
      <path d="M34 6 L60 58 L46 58 L38 42 L32 28 Z" fill={`url(#${id}-right)`} />
      {/* Center diamond spark */}
      <path d="M32 22 L27 32 L32 42 L37 32 Z" fill={`url(#${id}-spark)`} />
    </svg>
  );
}

export function AmberLogo({ size = 'md', variant = 'icon', className }: AmberLogoProps) {
  const config = sizeMap[size];

  const iconEl = (
    <div
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        config.container,
        className
      )}
    >
      <AmberMark size={config.svg} />
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3">
        {iconEl}
        <span
          className={cn('font-semibold lowercase tracking-wide', textSizeMap[size])}
          style={{ color: 'var(--color-text)' }}
        >
          amber
        </span>
      </div>
    );
  }

  return iconEl;
}
