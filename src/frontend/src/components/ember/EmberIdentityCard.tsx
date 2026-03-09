import { Brain, MessageCircle, Lightbulb } from 'lucide-react';
import type { OCEANScores } from '../../lib/compatibilityScoring';

interface EmberIdentityCardProps {
  archetype: { name: string; key: string; description?: string } | null;
  ocean?: OCEANScores | null;
}

function deriveOperatingStyles(ocean: OCEANScores) {
  const o = ocean.openness;
  const c = ocean.conscientiousness;
  const e = ocean.extraversion;
  const a = ocean.agreeableness;

  const decision = c > 65
    ? (o > 60 ? 'Strategic Analyzer' : 'Methodical Planner')
    : (o > 60 ? 'Intuitive Explorer' : 'Adaptive Pragmatist');

  const communication = e > 65
    ? (a > 60 ? 'Warm Collaborator' : 'Direct Communicator')
    : (a > 60 ? 'Thoughtful Listener' : 'Focused Contributor');

  const problemSolving = o > 65
    ? (c > 60 ? 'Creative Systematizer' : 'Divergent Thinker')
    : (c > 60 ? 'Structured Problem-Solver' : 'Practical Troubleshooter');

  return { decision, communication, problemSolving };
}

export function EmberIdentityCard({ archetype, ocean }: EmberIdentityCardProps) {
  const styles = ocean ? deriveOperatingStyles(ocean) : null;

  return (
    <div className="bento-card">
      {/* Section label */}
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
        style={{ color: 'var(--color-textMuted)' }}
      >
        Your Archetype //
      </p>

      {/* Archetype */}
      {archetype && (
        <div className="mb-4">
          <h3
            className="text-lg font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            {archetype.name}
          </h3>
          {archetype.description && (
            <p
              className="text-xs mt-1 leading-relaxed italic"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {archetype.description}
            </p>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* Operating styles */}
      {styles && (
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Operating Style
          </p>
          <div className="space-y-3">
            {[
              { icon: Brain, label: 'Decision', value: styles.decision },
              { icon: MessageCircle, label: 'Communication', value: styles.communication },
              { icon: Lightbulb, label: 'Problem-Solving', value: styles.problemSolving },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                >
                  <Icon className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <span
                    className="text-[10px] uppercase tracking-wide font-medium block"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {label}
                  </span>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-textSecondary)' }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
