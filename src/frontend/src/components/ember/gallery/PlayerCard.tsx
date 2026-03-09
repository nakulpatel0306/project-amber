import { Eye, Coffee, Bookmark, BookmarkCheck, UserPlus, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ConnectionStatus } from '../../../types/connections.types';

interface PlayerCardProps {
  id: string;
  name: string;
  subtitle: string;
  archetype: { name: string; key: string };
  overallScore: number;
  cultureScore: number;
  workStyleScore: number;
  traitScore: number;
  highlightPills: string[];
  avatarUrl?: string | null;
  index?: number;
  isSaved?: boolean;
  isSelected?: boolean;
  showSelect?: boolean;
  connectionStatus?: ConnectionStatus;
  onDeepDive: () => void;
  onBrew: () => void;
  onToggleSave: () => void;
  onToggleSelect?: () => void;
  onConnect?: () => void;
}

export function PlayerCard({
  name, subtitle, archetype, overallScore, cultureScore, workStyleScore,
  traitScore, avatarUrl, isSaved = false,
  isSelected = false, showSelect = false, connectionStatus = 'accepted',
  onDeepDive, onBrew, onToggleSave, onToggleSelect, onConnect,
}: PlayerCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="bento-card card-hover relative overflow-hidden p-0 cursor-pointer group"
      style={{ border: isSelected ? '2px solid var(--color-accent)' : undefined }}
    >
      {/* Select checkbox for compare */}
      {showSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
          className="absolute top-4 left-4 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {isSelected && <span className="text-white text-xs font-bold">&#10003;</span>}
        </button>
      )}

      {/* Card content */}
      <div className="p-5" onClick={onDeepDive}>
        {/* Top row: Avatar + Name/Subtitle + Badge + Bookmark */}
        <div className="flex items-start gap-3 mb-4">
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
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              {name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
              {subtitle}
            </p>
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1.5 -ml-2"
              style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
            >
              {archetype.name}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className="p-1.5 rounded-lg transition-all hover:bg-[var(--color-surfaceHover)] flex-shrink-0"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <Bookmark className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            )}
          </button>
        </div>

        {/* Metric bars — matching dashboard streak bar style */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Culture', score: cultureScore },
            { label: 'Traits', score: traitScore },
            { label: 'Style', score: workStyleScore },
          ].map(({ label, score }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs w-12 flex-shrink-0" style={{ color: 'var(--color-textSecondary)' }}>
                {label}
              </span>
              <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${score}%`, backgroundColor: 'var(--color-accent)' }}
                />
              </div>
              <span className="text-xs font-semibold w-8 text-right tabular-nums" style={{ color: 'var(--color-textSecondary)' }}>
                {score}%
              </span>
            </div>
          ))}
        </div>

        {/* Score divider */}
        <div className="flex items-center gap-3 mb-0">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <span className="font-mono text-lg font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
            {overallScore}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <Button size="xs" variant="ghost" className="flex-1" onClick={onDeepDive}>
          <Eye className="w-3.5 h-3.5 mr-1" />Deep Dive
        </Button>
        {connectionStatus === 'accepted' ? (
          <Button size="xs" className="flex-1" onClick={(e) => { e.stopPropagation(); onBrew(); }}>
            <Coffee className="w-3.5 h-3.5 mr-1" />Let's Brew
          </Button>
        ) : connectionStatus === 'pending_sent' ? (
          <span
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
          >
            <Clock className="w-3 h-3" />Pending
          </span>
        ) : (
          <Button size="xs" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); onConnect?.(); }}>
            <UserPlus className="w-3.5 h-3.5 mr-1" />Connect
          </Button>
        )}
      </div>
    </div>
  );
}
