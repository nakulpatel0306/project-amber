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
        viewBox="0 0 32 32"
        fill="none"
        className="text-white"
      >
        {/* Coffee mug body = chat bubble shape */}
        {/* Rounded rectangle mug with chat-bubble tail at bottom-left */}
        <path
          d="M4 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H11l-4 4v-4H8a4 4 0 0 1-4-4V8z"
          fill="white"
          opacity="0.9"
        />
        {/* Mug handle — small arc on the right */}
        <path
          d="M24 10c2.5 0 4 1.5 4 3.5S26.5 17 24 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Steam — single gentle wisp */}
        <path
          d="M12 4c0.5-2 2-3 2-3M16 4c0.5-2.5 2.2-3.5 2.2-3.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
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
