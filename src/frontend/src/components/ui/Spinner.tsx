import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', sizeMap[size], className)}
      style={{ color: 'var(--color-accent)' }}
    />
  );
}

// Full page loading spinner
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          loading...
        </p>
      </div>
    </div>
  );
}

// Inline loading spinner with optional text
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      {text && (
        <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          {text}
        </span>
      )}
    </div>
  );
}
