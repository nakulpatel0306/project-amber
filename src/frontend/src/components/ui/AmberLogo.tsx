import { cn } from '../../utils/cn';

interface AmberLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', svg: 32 },
  md: { container: 'w-10 h-10', svg: 40 },
  lg: { container: 'w-12 h-12', svg: 48 },
  xl: { container: 'w-14 h-14', svg: 56 },
};

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

function AmberMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left facet — warm amber into theme accent */}
      <path
        d="M30 6 L4 58 L18 58 L26 42 L32 28 Z"
        fill="var(--color-warning)"
      />

      {/* Right facet — theme accent (darker) */}
      <path
        d="M34 6 L60 58 L46 58 L38 42 L32 28 Z"
        fill="var(--color-accent)"
      />

      {/* Connection diamond — blend of both */}
      <path
        d="M32 22 L27 32 L32 42 L37 32 Z"
        fill="var(--color-warning)"
        opacity={0.5}
      />
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
