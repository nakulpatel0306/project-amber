import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Tag {
  label: string;
  shade?: 'light' | 'medium' | 'dark';
}

interface BentoMetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  tags?: Tag[];
  onClick?: () => void;
  accentBorder?: boolean;
  loading?: boolean;
}

const tagStyles: Record<string, { bg: string; color: string }> = {
  light: { bg: 'rgba(251, 191, 36, 0.10)', color: '#FBBF24' },
  medium: { bg: 'rgba(245, 158, 11, 0.14)', color: '#F59E0B' },
  dark: { bg: 'rgba(217, 119, 6, 0.16)', color: '#D97706' },
};

export function BentoMetricCard({
  title,
  value,
  subtitle,
  tags,
  onClick,
  accentBorder = false,
  loading = false,
}: BentoMetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bento-card relative overflow-hidden',
        accentBorder && 'bento-card-accent',
        onClick && 'cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {title}
        </p>
        <ArrowUpRight
          className="w-4 h-4 flex-shrink-0"
          style={{ color: 'var(--color-textMuted)', opacity: 0.4 }}
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-10 w-20 rounded-lg" style={{ backgroundColor: 'var(--color-surfaceHover)' }} />
          <div className="h-3 w-40 rounded" style={{ backgroundColor: 'var(--color-surfaceHover)' }} />
          <div className="flex gap-1.5 mt-2">
            <div className="h-5 w-16 rounded-full" style={{ backgroundColor: 'var(--color-surfaceHover)' }} />
            <div className="h-5 w-20 rounded-full" style={{ backgroundColor: 'var(--color-surfaceHover)' }} />
          </div>
        </div>
      ) : (
        <div>
          <p
            className="text-4xl font-extrabold tracking-tight leading-none mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {value}
          </p>
          <p
            className="text-xs mb-3"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {subtitle}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => {
                const style = tagStyles[tag.shade || 'medium'];
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
