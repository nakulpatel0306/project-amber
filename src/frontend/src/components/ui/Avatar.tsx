import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const iconSizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const initials = fallback
      ? fallback
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeMap[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-medium"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              color: 'var(--color-accentText)',
            }}
          >
            {initials || <User className={iconSizeMap[size]} />}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };

// Avatar Group for showing multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{ src?: string; fallback?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          fallback={avatar.fallback}
          size={size}
          className="ring-2 ring-[var(--color-background)]"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full ring-2 ring-[var(--color-background)]',
            sizeMap[size]
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-textMuted)',
          }}
        >
          <span className="text-xs font-medium">+{remaining}</span>
        </div>
      )}
    </div>
  );
}
