import { Share2 } from 'lucide-react';
import { RadarChart } from './RadarChart';
import { Button } from './Button';

interface PersonalitySnapshotCardProps {
  archetypeName: string;
  topTraits: string[];
  scores: Record<string, number>;
  tagline?: string;
}

export function PersonalitySnapshotCard({
  archetypeName,
  topTraits,
  scores,
  tagline,
}: PersonalitySnapshotCardProps) {
  const handleShare = async () => {
    const text = `My personality archetype is "${archetypeName}" on Ember! Top traits: ${topTraits.join(', ')}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Ember Personality', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-textMuted)' }}>
            Your Personality Snapshot
          </p>
          <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {archetypeName}
          </h3>
          {tagline && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
              {tagline}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          leftIcon={<Share2 className="w-4 h-4" />}
        >
          Share
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-44 flex-shrink-0">
          <RadarChart scores={scores} size={180} showLabels={false} animated={false} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Top Traits
          </p>
          <div className="flex flex-wrap gap-1.5">
            {topTraits.map((trait, i) => {
              const colors = ['#8B5CF6', '#F59E0B', '#10B981'];
              return (
                <span
                  key={trait}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: `${colors[i % 3]}15`, color: colors[i % 3] }}
                >
                  {trait}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
