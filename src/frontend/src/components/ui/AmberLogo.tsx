import { cn } from '../../utils/cn';

interface AmberLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

const iconSizeMap = {
  sm: 18,
  md: 26,
  lg: 30,
  xl: 34,
};

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function AmberLogo({ size = 'md', variant = 'icon', className }: AmberLogoProps) {
  const iconSize = iconSizeMap[size];

  const iconEl = (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-2xl flex-shrink-0',
        sizeMap[size],
        className
      )}
      style={{
        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
      >
        {/* Coffee cup body - rounded U shape */}
        <path
          d="M8 16c0-1.5 1-2.5 2.5-2.5h15c1.5 0 2.5 1 2.5 2.5v8c0 5-3.5 8-10 8s-10-3-10-8v-8z"
          fill="white"
          opacity="0.92"
        />
        {/* Cup highlight - subtle shine */}
        <path
          d="M11 16c0-0.5 0.3-1 1-1h1.5c0.5 0 0.8 0.3 0.8 0.8v6c0 0.5-0.3 0.7-0.8 0.7H12c-0.7 0-1-0.3-1-0.8V16z"
          fill="white"
          opacity="0.35"
        />
        {/* Cup handle */}
        <path
          d="M28 17.5c2 0 3.5 1.2 3.5 3s-1.5 3-3.5 3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        {/* Steam wisp left */}
        <path
          d="M14 12c0-1.5 1.2-2.5 0.8-4"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        {/* Steam wisp right */}
        <path
          d="M18 11.5c0.3-1.5-0.5-2.5 0.2-4.2"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        {/* Chat bubble */}
        <rect x="21" y="3" width="12" height="8" rx="3.5" fill="white" opacity="0.75" />
        <path d="M24 11l-2 2.5v-2.5" fill="white" opacity="0.75" />
        {/* Chat dots */}
        <circle cx="25" cy="7" r="1" fill="var(--color-accent)" opacity="0.7" />
        <circle cx="27.5" cy="7" r="1" fill="var(--color-accent)" opacity="0.55" />
        <circle cx="30" cy="7" r="1" fill="var(--color-accent)" opacity="0.4" />
        {/* Sparkle */}
        <path
          d="M10 9l0.6-1.5L12 7l-1.4-0.5L10 5l-0.6 1.5L8 7l1.4 0.5z"
          fill="white"
          opacity="0.65"
        />
      </svg>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
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
