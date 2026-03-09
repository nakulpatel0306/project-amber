import { ArrowRight } from 'lucide-react';

interface TopMatchCardProps {
  name: string;
  subtitle: string;
  score: number;
  avatarUrl?: string | null;
  onDeepDive: () => void;
}

export function TopMatchCard({ name, subtitle, score, avatarUrl, onDeepDive }: TopMatchCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bento-card bento-card-accent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]" onClick={onDeepDive}>
      {/* Section label */}
      <p
        className="text-xs font-medium uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-textMuted)' }}
      >
        Top Match
      </p>

      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            backgroundColor: avatarUrl ? undefined : 'var(--color-surfaceHover)',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
            {name}
          </h4>
          <p className="text-xs truncate" style={{ color: 'var(--color-textMuted)' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Score — large number like BentoMetricCard */}
      <div className="mb-3">
        <span
          className="text-4xl font-extrabold tracking-tight leading-none"
          style={{ color: 'var(--color-text)' }}
        >
          {score}
        </span>
        <span className="text-sm ml-1" style={{ color: 'var(--color-textMuted)' }}>%</span>
      </div>

      {/* Score bar */}
      <div className="metric-bar mb-4">
        <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: 'var(--color-accent)' }} />
      </div>

      {/* CTA */}
      <span
        className="font-mono text-xs font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
        style={{ color: 'var(--color-accent)' }}
      >
        View Deep Dive <ArrowRight className="w-3 h-3" />
      </span>
    </div>
  );
}
