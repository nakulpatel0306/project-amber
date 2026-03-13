import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Layers,
  Heart,
  Zap,
  Target,
  Compass,
  Brain,
  Shield,
} from 'lucide-react';
import { determineEmployerArchetype } from '../../data/employerArchetypes';
import { fadeUp } from '../../utils/motion';

interface EmployerArchetypeStripProps {
  culturePreferences: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'The Innovator': Lightbulb,
  'The Optimizer': Layers,
  'The Collaborator': Heart,
  'The Driver': Zap,
  'The Stabilizer': Shield,
  'The Visionary': Compass,
  'The Nurturer': Brain,
  'The Challenger': Target,
};

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function EmployerArchetypeStrip({ culturePreferences }: EmployerArchetypeStripProps) {
  const preferences = {
    openness: culturePreferences.openness,
    conscientiousness: culturePreferences.conscientiousness,
    extraversion: culturePreferences.extraversion,
    agreeableness: culturePreferences.agreeableness,
    neuroticism: 100 - culturePreferences.neuroticism,
  };

  const archetypeScores = {
    innovation: preferences.openness,
    collaboration: (preferences.extraversion + preferences.agreeableness) / 2,
    results: preferences.conscientiousness,
    warmth: preferences.agreeableness,
    growth: (preferences.openness + preferences.conscientiousness) / 2,
    excellence: preferences.conscientiousness,
  };

  const archetypes = determineEmployerArchetype(archetypeScores);
  const primaryArchetype = archetypes.primary;

  const scores = preferences;

  // Operating style derivations
  const decisionStyle = scores.conscientiousness > 65
    ? (scores.openness > 60 ? 'Strategic Analyzer' : 'Methodical Planner')
    : (scores.openness > 60 ? 'Intuitive Explorer' : 'Adaptive Pragmatist');
  const communicationStyle = scores.extraversion > 65
    ? (scores.agreeableness > 60 ? 'Warm Collaborator' : 'Direct Communicator')
    : (scores.agreeableness > 60 ? 'Thoughtful Listener' : 'Focused Contributor');
  const teamDynamic = scores.extraversion > 60
    ? 'Collaborative-First'
    : scores.conscientiousness > 60
      ? 'Structured & Focused'
      : 'Flexible Hybrid';

  const ArchetypeIcon = ICON_MAP[primaryArchetype.name] || Lightbulb;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="py-2">
      {/* Label */}
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
        style={{ color: 'var(--color-textMuted)' }}
      >
        CULTURE ARCHETYPE //
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
        <span style={{ color: 'var(--color-textMuted)' }}> · TEAM DYNAMIC:</span>{' '}
        {teamDynamic}
      </p>

      {/* CTA */}
      <Link
        to="/app/employer/insights"
        className="font-mono text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-accent)' }}
      >
        View Culture Insights →
      </Link>
    </motion.div>
  );
}
