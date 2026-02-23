import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Layers,
  Heart,
  Zap,
  Target,
  Music,
  Compass,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { getArchetypeByName } from '../../lib/archetypes';

interface DashboardGreetingProps {
  firstName: string;
  greeting: string;
  hasCompletedAssessment: boolean;
  topTraits: string[];
  matchesAvailable: number;
  avgMatchScore: number;
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

export function DashboardGreeting({
  firstName,
  greeting,
  hasCompletedAssessment,
  topTraits,
  matchesAvailable,
  avgMatchScore,
}: DashboardGreetingProps) {
  const primaryArchetype = topTraits[0] ? getArchetypeByName(topTraits[0]) : null;
  const ArchetypeIcon = primaryArchetype ? ICON_MAP[primaryArchetype.emoji] || Lightbulb : null;

  if (!hasCompletedAssessment) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 rounded-2xl border"
        style={{
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.03))',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Hey {firstName}, ready to discover your archetype?
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Take the personality assessment to unlock your matches and insights.
            </p>
          </div>
          <Link to="/app/personality">
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              Take Assessment
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-2xl border"
      style={{
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.03))',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-4">
        {ArchetypeIcon && (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)' }}
          >
            <ArchetypeIcon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--color-text)' }}>
            {greeting}, {firstName} — you're {primaryArchetype?.name || 'Unique'}
          </h1>
          {primaryArchetype && (
            <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>
              {primaryArchetype.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {topTraits.slice(0, 3).map((trait) => {
              const archetype = getArchetypeByName(trait);
              return (
                <span
                  key={trait}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(217, 119, 6, 0.12)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {archetype?.name || trait}
                </span>
              );
            })}
            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {matchesAvailable > 0 && `You have ${matchesAvailable} matches`}
              {matchesAvailable > 0 && avgMatchScore > 0 && ` with an average ${avgMatchScore}% fit`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
