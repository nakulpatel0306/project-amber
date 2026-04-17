import { useState, useRef, useCallback, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const originStyles = {
  top: 'origin-bottom',
  bottom: 'origin-top',
  left: 'origin-right',
  right: 'origin-left',
};

// Track if any tooltip is currently open for instant subsequent display
let globalTooltipOpen = false;

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipIdRef = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    // Skip delay if another tooltip was recently open (Emil: instant subsequent tooltips)
    const actualDelay = globalTooltipOpen ? 0 : delay;
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      globalTooltipOpen = true;
    }, actualDelay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
    // Keep globalTooltipOpen true for a brief window to allow instant transitions
    setTimeout(() => {
      globalTooltipOpen = false;
    }, 150);
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <div aria-describedby={visible ? tooltipIdRef.current : undefined}>
        {children}
      </div>

      {visible && (
        <div
          id={tooltipIdRef.current}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none',
            'transition-[opacity,transform] duration-[125ms] ease-out-strong',
            positionStyles[side],
            originStyles[side],
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-background)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
