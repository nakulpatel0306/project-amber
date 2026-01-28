import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

export function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = iconMap[type];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl shadow-soft-lg border max-w-sm w-full',
        'transition-all duration-200',
        isVisible && !isLeaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      )}
      style={{
        backgroundColor: 'var(--color-backgroundSecondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colorMap[type])} />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </p>
        {message && (
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {message}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
        style={{ color: 'var(--color-textMuted)' }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
