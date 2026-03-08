import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]',
      secondary: 'bg-[var(--color-surface)] text-[var(--color-textSecondary)] border border-[var(--color-border)]',
      success: 'bg-[rgba(22,163,74,0.1)] text-[var(--color-success)]',
      warning: 'bg-[rgba(245,158,11,0.1)] text-[var(--color-warning)]',
      error: 'bg-[rgba(220,38,38,0.1)] text-[var(--color-error)]',
      outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-textSecondary)]',
    };

    const sizes = {
      sm: 'text-2xs px-1.5 py-0.5',
      md: 'text-xs px-2 py-0.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

// Status badge with dot indicator
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  offline: { color: 'bg-stone-400', label: 'Offline' },
  away: { color: 'bg-amber-500', label: 'Away' },
  busy: { color: 'bg-red-500', label: 'Busy' },
};

export function StatusBadge({ status, showLabel = false, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full', config.color)} />
      {showLabel && (
        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
