import { motion } from 'framer-motion';
import {
  Lightbulb,
  Layers,
  Zap,
  Heart,
  Target,
  Compass,
  Anchor,
  Brain,
  Sparkles,
  Sprout,
  Flame,
  Mountain,
} from 'lucide-react';

const ARCHETYPE_ICONS: Record<string, React.ElementType> = {
  'The Innovator': Lightbulb,
  'The Architect': Layers,
  'The Catalyst': Zap,
  'The Harmonizer': Heart,
  'The Craftsperson': Target,
  'The Explorer': Compass,
  'The Anchor': Anchor,
  'The Strategist': Brain,
  'The Connector': Heart,
  // Employer archetypes
  'The Greenhouse': Sprout,
  'The Engine Room': Flame,
  'The Frontier': Mountain,
};

interface ArchetypeCardProps {
  name: string;
  description: string;
  strengths: string[];
  idealEnvironments: string[];
  variant?: 'primary' | 'secondary' | 'tertiary';
  color?: string;
  animated?: boolean;
  delay?: number;
  blindspots?: string[];
}

const VARIANT_COLORS: Record<string, string> = {
  primary: '#8B5CF6',
  secondary: '#F59E0B',
  tertiary: '#10B981',
};

const VARIANT_LABELS: Record<string, string> = {
  primary: 'Primary Archetype',
  secondary: 'Secondary Archetype',
  tertiary: 'Tertiary Archetype',
};

export function ArchetypeCard({
  name,
  description,
  strengths,
  idealEnvironments,
  variant = 'primary',
  color,
  animated = true,
  delay = 0,
  blindspots,
}: ArchetypeCardProps) {
  const accentColor = color || VARIANT_COLORS[variant];
  const Icon = ARCHETYPE_ICONS[name] || Sparkles;
  const label = VARIANT_LABELS[variant];

  const content = (
    <div
      className="p-5 rounded-xl h-full"
      style={{
        backgroundColor: 'var(--color-background)',
        border: variant === 'primary'
          ? `2px solid ${accentColor}30`
          : '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {name}
          </p>
          <p className="text-xs font-medium" style={{ color: accentColor }}>
            {label}
          </p>
        </div>
      </div>

      <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
        {description}
      </p>

      <div className="mb-3">
        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
          Key Strengths
        </p>
        <div className="flex flex-wrap gap-1.5">
          {strengths.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-xs"
              style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
          Ideal Environments
        </p>
        <div className="flex flex-wrap gap-1.5">
          {idealEnvironments.map((env, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-xs"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)' }}
            >
              {env}
            </span>
          ))}
        </div>
      </div>

      {blindspots && blindspots.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Growth Areas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {blindspots.map((b, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--color-textMuted)' }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}
