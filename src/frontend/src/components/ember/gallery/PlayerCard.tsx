import { Eye, Coffee, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { avatarGradient, getMatchColor } from '../../../utils/matchHelpers';

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
  onDeepDive: () => void;
  onBrew: () => void;
  onToggleSave: () => void;
  onToggleSelect?: () => void;
}

export function PlayerCard({
  name,
  subtitle,
  archetype,
  overallScore,
  cultureScore,
  workStyleScore,
  traitScore,
  highlightPills,
  avatarUrl,
  index: _index = 0,
  isSaved = false,
  isSelected = false,
  showSelect = false,
  onDeepDive,
  onBrew,
  onToggleSave,
  onToggleSelect,
}: PlayerCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="relative rounded-2xl card-shimmer-hover transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
      }}
    >
      {/* Select checkbox for compare */}
      {showSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
          className="absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {isSelected && <span className="text-white text-xs font-bold">&#10003;</span>}
        </button>
      )}

      {/* Save toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-all hover:bg-black/10"
      >
        {isSaved
          ? <BookmarkCheck className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          : <Bookmark className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        }
      </button>

      <div className="p-5 flex flex-col items-center text-center" onClick={onDeepDive}>
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 overflow-hidden"
          style={{ background: avatarUrl ? undefined : avatarGradient(name) }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{initial}</span>
          )}
        </div>

        {/* Name + subtitle */}
        <h3 className="font-semibold text-sm line-clamp-1 mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
          {name}
        </h3>
        <p className="text-xs line-clamp-1 mb-2" style={{ color: 'var(--color-textSecondary)' }}>
          {subtitle}
        </p>

        {/* Archetype badge */}
        <span className="stat-badge mb-3">
          <Sparkles className="w-2.5 h-2.5" />
          {archetype.name}
        </span>

        {/* Central score ring with inner glow */}
        <div className="inner-glow-ring mb-3">
          <ScoreRing score={overallScore} size={72} strokeWidth={4} fontSize="text-base" />
        </div>

        {/* Metric progress bars */}
        <div className="w-full space-y-1.5 mb-3">
          {[
            { label: 'Culture', score: cultureScore },
            { label: 'Work Style', score: workStyleScore },
            { label: 'Traits', score: traitScore },
          ].map(({ label, score }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[9px] w-14 text-right" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
              <div className="metric-bar flex-1">
                <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: getMatchColor(score) }} />
              </div>
              <span className="text-[9px] font-semibold w-7" style={{ color: getMatchColor(score) }}>{score}%</span>
            </div>
          ))}
        </div>

        {/* Highlight pills */}
        {highlightPills.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {highlightPills.map((pill, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: pill.includes('Culture') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                  color: pill.includes('Culture') ? '#10b981' : '#8b5cf6',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <Button size="xs" variant="ghost" className="flex-1" onClick={onDeepDive}>
          <Eye className="w-3.5 h-3.5 mr-1" />
          Deep Dive
        </Button>
        <Button size="xs" className="flex-1" onClick={(e) => { e.stopPropagation(); onBrew(); }}>
          <Coffee className="w-3.5 h-3.5 mr-1" />
          Let's Brew
        </Button>
      </div>
    </div>
  );
}
