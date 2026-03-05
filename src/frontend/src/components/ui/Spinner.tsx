import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';
import { CoffeeBrewLoader } from './CoffeeBrewLoader';

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

// Full page loading — delegates to CoffeeBrewLoader
export function PageLoader() {
  return <CoffeeBrewLoader variant="fullscreen" showRotatingMessages />;
}

// Inline loading — delegates to CoffeeBrewLoader
export function InlineLoader({ text }: { text?: string }) {
  return <CoffeeBrewLoader variant="inline" size="sm" message={text} />;
}
