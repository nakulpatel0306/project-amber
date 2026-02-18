import { motion } from 'framer-motion';
import { Sparkles, Target, AlertTriangle } from 'lucide-react';

interface ArchetypeCardProps {
  name: string;
  description: string;
  strengths: string[];
  idealEnvironments?: string[];
  idealCandidates?: string[];
  blindspots?: string[];
  isPrimary?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  delay?: number;
}

export function ArchetypeCard({
  name,
  description,
  strengths,
  idealEnvironments,
  idealCandidates,
  blindspots,
  isPrimary = false,
  variant,
  delay = 0,
}: ArchetypeCardProps) {
  const idealItems = idealEnvironments || idealCandidates || [];
  const isHighlighted = isPrimary || variant === 'primary';

  return (
    <motion.div
      className="p-5 rounded-2xl border h-full"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: isHighlighted ? 'var(--color-accent)' : 'var(--color-border)',
        borderWidth: isHighlighted ? 2 : 1,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {isHighlighted && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            Primary
          </span>
        )}
        <h3
          className="font-bold text-lg"
          style={{ color: 'var(--color-text)' }}
        >
          {name}
        </h3>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        {description}
      </p>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Strengths
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {strengths.slice(0, 4).map((strength, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                }}
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal Environments/Candidates */}
      {idealItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {idealCandidates ? 'Ideal Candidates' : 'Ideal For'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idealItems.slice(0, 3).map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: '#8B5CF6',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Blindspots */}
      {blindspots && blindspots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Watch For
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {blindspots.slice(0, 3).map((blindspot, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                }}
              >
                {blindspot}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
