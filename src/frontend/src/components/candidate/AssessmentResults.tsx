import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Users,
  Rocket,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { OceanMindMap } from '../ui/OceanMindMap';
import { GradientProgressBar } from '../ui/GradientProgressBar';
import { ProfileCompleteness } from '../ui/ProfileCompleteness';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../ui/Spinner';
import { getArchetypeByName, determineArchetype } from '../../lib/archetypes';

interface ResultsData {
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  top_traits: string[];
  visual_perception_data: Record<string, unknown> | null;
  work_values_data: Record<string, unknown> | null;
  situational_judgment_data: Record<string, unknown> | null;
  cognitive_patterns_data: Record<string, unknown> | null;
}

const OCEAN_COLORS: Record<string, string> = {
  openness: '#8B5CF6',
  conscientiousness: '#10B981',
  extraversion: '#F59E0B',
  agreeableness: '#EC4899',
  neuroticism: '#06B6D4',
};

const OCEAN_LABELS: Record<string, string> = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Stability',
};

const COLOR_MAP: Record<string, string> = {
  openness: 'purple',
  conscientiousness: 'green',
  extraversion: 'amber',
  agreeableness: 'pink',
  neuroticism: 'cyan',
};

function generateTagline(scores: Record<string, number>): string {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const second = sorted[1][0];

  const taglines: Record<string, Record<string, string>> = {
    openness: {
      conscientiousness: 'A creative strategist who turns bold ideas into structured plans.',
      extraversion: 'An energetic visionary who inspires others with fresh perspectives.',
      agreeableness: 'An empathetic innovator who creates with people in mind.',
      neuroticism: 'A resilient creator who stays grounded while pushing boundaries.',
    },
    conscientiousness: {
      openness: 'A methodical innovator who brings discipline to creativity.',
      extraversion: 'A driven leader who rallies teams toward clear goals.',
      agreeableness: 'A reliable collaborator who keeps teams on track with care.',
      neuroticism: 'A composed achiever who delivers consistently under pressure.',
    },
    extraversion: {
      openness: 'A charismatic explorer who energizes any room they enter.',
      conscientiousness: 'A dynamic executor who leads by example and delivers results.',
      agreeableness: 'A natural connector who builds bridges between people and ideas.',
      neuroticism: 'A resilient communicator who stays positive through challenges.',
    },
    agreeableness: {
      openness: 'A compassionate dreamer who sees the best in people and possibilities.',
      conscientiousness: 'A thoughtful organizer who puts people at the center of every plan.',
      extraversion: 'A warm communicator who creates belonging wherever they go.',
      neuroticism: 'A steady supporter who brings calm and care to every situation.',
    },
    neuroticism: {
      openness: 'A grounded thinker who combines stability with curiosity.',
      conscientiousness: 'A composed professional who thrives under pressure.',
      extraversion: 'A steady presence who leads with calm confidence.',
      agreeableness: 'A reliable anchor who brings peace and support to teams.',
    },
  };

  return taglines[top]?.[second] || 'A unique blend of personality traits that makes you distinctively you.';
}

export function AssessmentResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReveal, setShowReveal] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadResults = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits')
        .eq('user_id', user.id)
        .single();

      if (!candidate || candidate.openness_score === null) {
        navigate('/app/personality');
        return;
      }

      let supplementary: Record<string, unknown> = {
        visual_perception_data: null,
        work_values_data: null,
        situational_judgment_data: null,
        cognitive_patterns_data: null,
      };

      try {
        const { data: supData } = await supabase
          .from('candidates')
          .select('visual_perception_data, work_values_data, situational_judgment_data, cognitive_patterns_data')
          .eq('user_id', user.id)
          .single();
        if (supData) supplementary = supData as Record<string, unknown>;
      } catch {
        // columns may not exist
      }

      setData({
        ...candidate,
        visual_perception_data: (supplementary.visual_perception_data as Record<string, unknown>) ?? null,
        work_values_data: (supplementary.work_values_data as Record<string, unknown>) ?? null,
        situational_judgment_data: (supplementary.situational_judgment_data as Record<string, unknown>) ?? null,
        cognitive_patterns_data: (supplementary.cognitive_patterns_data as Record<string, unknown>) ?? null,
      } as ResultsData);

      setIsLoading(false);

      // Start reveal animation
      setTimeout(() => setShowReveal(false), 2500);
    };

    loadResults();
  }, [user, navigate]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const scores = {
    openness: data.openness_score,
    conscientiousness: data.conscientiousness_score,
    extraversion: data.extraversion_score,
    agreeableness: data.agreeableness_score,
    neuroticism: 100 - data.neuroticism_score,
  };

  const archetype = data.top_traits?.[0]
    ? getArchetypeByName(data.top_traits[0])
    : determineArchetype({
        openness: data.openness_score,
        conscientiousness: data.conscientiousness_score,
        extraversion: data.extraversion_score,
        agreeableness: data.agreeableness_score,
        neuroticism: data.neuroticism_score,
      });

  const archetypeName = archetype?.name || 'The Explorer';
  const tagline = generateTagline(scores);

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const completedAssessments = [
    true,
    !!data.visual_perception_data,
    !!data.work_values_data,
    !!data.situational_judgment_data,
    !!data.cognitive_patterns_data,
  ];
  const completedCount = completedAssessments.filter(Boolean).length;

  // Reveal animation overlay
  if (showReveal) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <motion.div
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {archetypeName}
          </motion.h1>

          <motion.p
            className="text-lg max-w-md mx-auto"
            style={{ color: 'var(--color-textSecondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            {tagline}
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Preparing your results...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)' }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {archetypeName}
          </h1>
          <p className="text-lg max-w-lg mx-auto mb-1" style={{ color: 'var(--color-textSecondary)' }}>
            {tagline}
          </p>
          {archetype && (
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {archetype.description}
            </p>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sortedScores.map(([key, value], i) => (
            <div
              key={key}
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
                #{i + 1} Trait
              </p>
              <p className="text-2xl font-bold mb-1" style={{ color: OCEAN_COLORS[key] }}>
                {value}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-textSecondary)' }}>
                {OCEAN_LABELS[key]}
              </p>
              <div className="mt-2">
                <GradientProgressBar value={value} showValue={false} size="sm" color={COLOR_MAP[key]} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Your OCEAN Profile
          </h2>
          <div className="max-w-sm mx-auto">
            <OceanMindMap
              scores={scores}
              colors={OCEAN_COLORS}
              labels={OCEAN_LABELS}
              animated
            />
          </div>
        </motion.div>

        {/* Profile Completeness */}
        <motion.div
          className="p-6 rounded-2xl border mb-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Rocket className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Profile Progress
          </h2>
          <ProfileCompleteness
            completedCount={completedCount}
            variant="bar"
            assessments={[
              { name: 'Core', completed: true },
              { name: 'Visual', completed: !!data.visual_perception_data },
              { name: 'Values', completed: !!data.work_values_data },
              { name: 'Situational', completed: !!data.situational_judgment_data },
              { name: 'Cognitive', completed: !!data.cognitive_patterns_data },
            ]}
          />
          <p className="text-xs mt-3" style={{ color: 'var(--color-textMuted)' }}>
            Complete more assessments to enhance your personality profile and get better matches.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/app/insights">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Explore Full Insights
            </Button>
          </Link>
          <Link to="/app/matches">
            <Button size="lg" variant="outline" leftIcon={<Users className="w-5 h-5" />}>
              Find Matches
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default AssessmentResults;
