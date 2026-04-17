import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from './Button';
import { EmberFirefly } from '../ember/EmberFirefly';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'py-6 px-4',
  md: 'py-10 px-6',
  lg: 'py-16 px-8',
};

const iconSizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center animate-fade-in',
        sizeStyles[size],
        className
      )}
    >
      <div className={cn('mb-4', iconSizes[size])}>
        {icon || <EmberFirefly size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} mood="neutral" />}
      </div>

      <h3
        className={cn(
          'font-semibold',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'mt-1.5 max-w-sm',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}
          style={{ color: 'var(--color-textMuted)' }}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={size === 'sm' ? 'xs' : 'sm'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === 'sm' ? 'xs' : 'sm'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
