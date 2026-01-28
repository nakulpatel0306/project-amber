import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-xl border py-1.5 shadow-soft-lg',
            'animate-scale-in origin-top',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Dropdown Item
export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
  selected = false,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
        'transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:bg-[var(--color-surface)]',
        danger && !disabled && 'text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-900/20'
      )}
      style={{
        color: danger ? 'var(--color-error)' : 'var(--color-text)',
      }}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
      {selected && <Check className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />}
    </button>
  );
}

// Dropdown Divider
export function DropdownDivider() {
  return (
    <div
      className="my-1.5 h-px"
      style={{ backgroundColor: 'var(--color-border)' }}
    />
  );
}

// Dropdown Label
export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
      style={{ color: 'var(--color-textMuted)' }}
    >
      {children}
    </div>
  );
}

// Select Dropdown
export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-4 py-2.5 rounded-xl border text-sm',
          'transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          error
            ? 'border-[var(--color-error)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]',
          isOpen && 'ring-2 ring-[var(--color-accent)]'
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          color: selectedOption ? 'var(--color-text)' : 'var(--color-textMuted)',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          style={{ color: 'var(--color-textMuted)' }}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2 rounded-xl border py-1.5 shadow-soft-lg',
            'animate-scale-in origin-top max-h-60 overflow-auto'
          )}
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                'transition-colors hover:bg-[var(--color-surface)]'
              )}
              style={{ color: 'var(--color-text)' }}
            >
              {option.icon}
              <span className="flex-1">{option.label}</span>
              {option.value === value && (
                <Check className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
