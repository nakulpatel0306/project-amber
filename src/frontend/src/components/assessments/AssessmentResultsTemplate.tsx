import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { OceanMindMap } from '../ui/OceanMindMap';
import { GradientProgressBar } from '../ui/GradientProgressBar';

interface DimensionScore {
  key: string;
  label: string;
  value: number;
  color: string;
  progressColor: string;
}

interface AssessmentResultsTemplateProps {
  title: string;
  subtitle: string;
  dimensions: DimensionScore[];
  enhancedMessage: string;
  icon: React.ReactNode;
  accentColor?: string;
  profileUrl?: string;
  matchesUrl?: string;
  profileLabel?: string;
  matchesLabel?: string;
}

const OCEAN_LABELS: Record<string, string> = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Stability',
};

const OCEAN_COLORS: Record<string, string> = {
  openness: '#8B5CF6',
  conscientiousness: '#10B981',
  extraversion: '#F59E0B',
  agreeableness: '#EC4899',
  neuroticism: '#06B6D4',
};

export function AssessmentResultsTemplate({
  title,
  subtitle,
  dimensions,
  enhancedMessage,
  icon,
  accentColor = 'var(--color-accent)',
  profileUrl = '/app/insights',
  matchesUrl = '/app/matches',
  profileLabel = 'View Full Profile',
  matchesLabel = 'Find Matches',
}: AssessmentResultsTemplateProps) {
  const navigate = useNavigate();

  // Build radar chart scores
  const radarScores: Record<string, number> = {};
  for (const d of dimensions) {
    radarScores[d.key] = d.value;
  }

  const sortedDimensions = [...dimensions].sort((a, b) => b.value - a.value);
  const topDimension = sortedDimensions[0];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #8B5CF6)` }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
          >
            {icon}
          </motion.div>
          <motion.h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-sm"
            style={{ color: 'var(--color-textSecondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Top Result Highlight */}
        {topDimension && (
          <motion.div
            className="p-5 rounded-2xl border mb-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>
              Strongest Signal
            </p>
            <p className="text-xl font-bold" style={{ color: topDimension.color }}>
              {topDimension.label}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Score: {Math.round(topDimension.value)}/100
            </p>
          </motion.div>
        )}

        {/* Radar Chart */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="max-w-xs mx-auto">
            <OceanMindMap
              scores={radarScores}
              labels={OCEAN_LABELS}
              colors={OCEAN_COLORS}
              size="sm"
              animated
            />
          </div>
        </motion.div>

        {/* Dimension Breakdown */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            OCEAN Modifiers
          </h2>
          <div className="space-y-3">
            {sortedDimensions.map((dim, i) => (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <GradientProgressBar
                  value={dim.value}
                  label={dim.label}
                  color={dim.progressColor}
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile Enhanced */}
        <motion.div
          className="p-4 rounded-xl mb-6 flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Profile Enhanced
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {enhancedMessage}
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate(profileUrl)}
            leftIcon={<Brain className="w-4 h-4" />}
          >
            {profileLabel}
          </Button>
          <Button
            onClick={() => navigate(matchesUrl)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {matchesLabel}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
