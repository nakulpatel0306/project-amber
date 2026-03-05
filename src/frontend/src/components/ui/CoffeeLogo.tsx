import { cn } from '../../utils/cn';

interface CoffeeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

const iconSizeMap = {
  sm: 16,
  md: 22,
  lg: 26,
  xl: 30,
};

export function CoffeeLogo({ size = 'md', className }: CoffeeLogoProps) {
  const iconSize = iconSizeMap[size];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-2xl',
        sizeMap[size],
        className
      )}
      style={{
        backgroundColor: 'var(--color-accent)',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        {/* Steam lines */}
        <path d="M17 8c1.5-1 2-2.5 2-4" opacity="0.6" />
        <path d="M12 8c1-1 1.5-2 1.5-3" opacity="0.6" />
        <path d="M7 8c1.5-1 2-2.5 2-4" opacity="0.6" />
        {/* Mug body */}
        <path d="M3 14c0 1.5 0 3 1.5 4.5S7.5 20 10 20s4-.5 5.5-1.5S17 15.5 17 14V10H3v4z" />
        {/* Handle */}
        <path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H17" />
      </svg>
    </div>
  );
}
