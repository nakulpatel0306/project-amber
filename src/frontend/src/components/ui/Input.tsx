import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full rounded-xl border text-sm',
              'transition-[border-color,box-shadow] duration-150 ease-out-strong',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-[var(--color-textMuted)] placeholder:opacity-70',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              'py-2.5',
              error
                ? 'border-[var(--color-error)] focus:[box-shadow:0_0_0_2px_var(--color-error)]'
                : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_var(--color-accent),var(--shadow-glow)]',
              className
            )}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
            {...props}
          />
          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-xl border text-sm resize-none',
            'transition-[border-color,box-shadow] duration-150 ease-out-strong',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder:text-[var(--color-textMuted)] placeholder:opacity-70',
            'px-4 py-3',
            error
              ? 'border-[var(--color-error)] focus:[box-shadow:0_0_0_2px_var(--color-error)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_var(--color-accent),var(--shadow-glow)]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
