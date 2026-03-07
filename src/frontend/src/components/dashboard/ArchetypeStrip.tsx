import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Layers,
  Heart,
  Zap,
  Target,
  Music,
  Compass,
  Brain,
} from 'lucide-react';
import { getArchetypeByName } from '../../lib/archetypes';
import { fadeUp } from '../../utils/motion';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface ArchetypeStripProps {
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

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function ArchetypeStrip({ personalityScores, topTraits }: ArchetypeStripProps) {
  const primaryArchetype = topTraits[0] ? getArchetypeByName(topTraits[0]) : null;
  if (!primaryArchetype) return null;

  const scores = {
    openness: personalityScores.openness,
    conscientiousness: personalityScores.conscientiousness,
    extraversion: personalityScores.extraversion,
    agreeableness: personalityScores.agreeableness,
    neuroticism: 100 - personalityScores.neuroticism,
  };

  // Operating style derivations (from PersonalityPlayerCard)
  const decisionStyle = scores.conscientiousness > 65
    ? (scores.openness > 60 ? 'Strategic Analyzer' : 'Methodical Planner')
    : (scores.openness > 60 ? 'Intuitive Explorer' : 'Adaptive Pragmatist');
  const communicationStyle = scores.extraversion > 65
    ? (scores.agreeableness > 60 ? 'Warm Collaborator' : 'Direct Communicator')
    : (scores.agreeableness > 60 ? 'Thoughtful Listener' : 'Focused Contributor');
  const problemSolvingStyle = scores.openness > 65
    ? (scores.conscientiousness > 60 ? 'Creative Systematizer' : 'Divergent Thinker')
    : (scores.conscientiousness > 60 ? 'Structured Problem-Solver' : 'Practical Troubleshooter');

  const ArchetypeIcon = ICON_MAP[primaryArchetype.emoji] || Lightbulb;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="py-2">
      {/* Label */}
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
        style={{ color: 'var(--color-textMuted)' }}
      >
        ARCHETYPE //
      </p>

      {/* Archetype name */}
      <h2
        className="font-mono text-2xl font-bold mb-1 flex items-center gap-2"
        style={{ color: 'var(--color-text)' }}
      >
        <ArchetypeIcon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
        {primaryArchetype.name}
      </h2>

      {/* Description */}
      <p
        className="text-sm italic mb-3"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        {titleCase(primaryArchetype.description)}
      </p>

      {/* Divider */}
      <div className="h-px mb-3" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* Operating styles — single monospace line */}
      <p
        className="font-mono text-[11px] mb-3 leading-relaxed"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        <span style={{ color: 'var(--color-textMuted)' }}>DECISION:</span>{' '}
        {decisionStyle}
        <span style={{ color: 'var(--color-textMuted)' }}> · COMMUNICATION:</span>{' '}
        {communicationStyle}
        <span style={{ color: 'var(--color-textMuted)' }}> · PROBLEM-SOLVING:</span>{' '}
        {problemSolvingStyle}
      </p>

      {/* CTA */}
      <Link
        to="/app/insights"
        className="font-mono text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-accent)' }}
      >
        View Insights →
      </Link>
    </motion.div>
  );
}
