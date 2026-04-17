import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Layers,
  Heart,
  Zap,
  Target,
  Music,
  Compass,
  Brain,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getArchetypeByName } from '../../lib/archetypes';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface PersonalityPlayerCardProps {
  personalityScores: PersonalityScores;
  topTraits: string[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  lightbulb: Lightbulb,
  layers: Layers,
  heart: Heart,
  zap: Zap,
  target: Target,
  music: Music,
  compass: Compass,
  brain: Brain,
};

const OCEAN_COLORS = {
  openness: 'var(--color-trait-openness)',
  conscientiousness: 'var(--color-trait-conscientiousness)',
  extraversion: 'var(--color-trait-extraversion)',
  agreeableness: 'var(--color-trait-agreeableness)',
  stability: 'var(--color-trait-stability)',
};

export function PersonalityPlayerCard({ personalityScores, topTraits }: PersonalityPlayerCardProps) {
  const navigate = useNavigate();
  const scores = {
    openness: personalityScores.openness,
    conscientiousness: personalityScores.conscientiousness,
    extraversion: personalityScores.extraversion,
    agreeableness: personalityScores.agreeableness,
    neuroticism: 100 - personalityScores.neuroticism,
  };

  const primaryArchetype = topTraits[0] ? getArchetypeByName(topTraits[0]) : null;
  const ArchetypeIcon = primaryArchetype ? ICON_MAP[primaryArchetype.emoji] || Lightbulb : Lightbulb;

  // Operating style derivations (ported from original dashboard)
  const decisionStyle = scores.conscientiousness > 65
    ? (scores.openness > 60 ? 'Strategic Analyzer' : 'Methodical Planner')
    : (scores.openness > 60 ? 'Intuitive Explorer' : 'Adaptive Pragmatist');
  const communicationStyle = scores.extraversion > 65
    ? (scores.agreeableness > 60 ? 'Warm Collaborator' : 'Direct Communicator')
    : (scores.agreeableness > 60 ? 'Thoughtful Listener' : 'Focused Contributor');
  const problemSolvingStyle = scores.openness > 65
    ? (scores.conscientiousness > 60 ? 'Creative Systematizer' : 'Divergent Thinker')
    : (scores.conscientiousness > 60 ? 'Structured Problem-Solver' : 'Practical Troubleshooter');

  const operatingStyles = [
    { icon: Brain, label: 'Decision', value: decisionStyle, color: 'var(--color-trait-openness)' },
    { icon: MessageCircle, label: 'Communication', value: communicationStyle, color: 'var(--color-trait-conscientiousness)' },
    { icon: Lightbulb, label: 'Problem-Solving', value: problemSolvingStyle, color: 'var(--color-trait-extraversion)' },
  ];

  const oceanBars = [
    { label: 'Openness', value: scores.openness, color: OCEAN_COLORS.openness },
    { label: 'Conscientiousness', value: scores.conscientiousness, color: OCEAN_COLORS.conscientiousness },
    { label: 'Extraversion', value: scores.extraversion, color: OCEAN_COLORS.extraversion },
    { label: 'Agreeableness', value: scores.agreeableness, color: OCEAN_COLORS.agreeableness },
    { label: 'Stability', value: scores.neuroticism, color: OCEAN_COLORS.stability },
  ];

  const goToInsights = () => {
    window.scrollTo(0, 0);
    navigate('/app/insights');
  };

  return (
    <div onClick={goToInsights} className="block">
      <div
        className="relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-amber-lg"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-accent)',
        }}
      >
        <div className="p-5">
          {/* Header: Archetype title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)' }}
            >
              <ArchetypeIcon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {primaryArchetype?.name || 'Your Archetype'}
              </h3>
              {primaryArchetype && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                  {primaryArchetype.description}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* OCEAN Bars */}
          <div className="space-y-2 mb-4">
            {oceanBars.map((bar) => (
              <div key={bar.label} className="flex items-center gap-3">
                <span className="text-xs w-28 flex-shrink-0" style={{ color: 'var(--color-textSecondary)' }}>
                  {bar.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color: bar.color }}>
                  {bar.value}%
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Operating Style */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {operatingStyles.map((style) => (
              <div
                key={style.label}
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: `${style.color}10` }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${style.color}20` }}
                  >
                    <style.icon className="w-3 h-3" style={{ color: style.color }} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-textMuted)' }}>
                    {style.label}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: style.color }}>
                  {style.value}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Strengths */}
          {primaryArchetype && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {primaryArchetype.strengths.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-trait-conscientiousness)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
              View Full Insights
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
