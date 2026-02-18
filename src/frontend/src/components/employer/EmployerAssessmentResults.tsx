import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Users,
  Building2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { OceanMindMap } from '../ui/OceanMindMap';
import { GradientProgressBar } from '../ui/GradientProgressBar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../ui/Spinner';
import { determineEmployerArchetype } from '../../data/employerArchetypes';

interface EmployerData {
  company_name: string | null;
  openness_preference: number;
  conscientiousness_preference: number;
  extraversion_preference: number;
  agreeableness_preference: number;
  neuroticism_preference: number;
  culture_values: string[] | null;
  culture_quiz_completed: boolean;
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

function generateCultureTagline(scores: Record<string, number>): string {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const second = sorted[1][0];

  const taglines: Record<string, Record<string, string>> = {
    openness: {
      conscientiousness: 'A culture that channels creative energy into structured innovation.',
      extraversion: 'A vibrant culture that celebrates bold ideas and open collaboration.',
      agreeableness: 'An empathetic culture that nurtures creativity and human connection.',
      neuroticism: 'A resilient culture that stays grounded while pushing boundaries.',
    },
    conscientiousness: {
      openness: 'A methodical culture that brings discipline to innovation.',
      extraversion: 'A driven culture that rallies teams toward clear, ambitious goals.',
      agreeableness: 'A reliable culture that values people and process equally.',
      neuroticism: 'A composed culture that delivers consistently under any conditions.',
    },
    extraversion: {
      openness: 'A dynamic culture that energizes through exploration and connection.',
      conscientiousness: 'An execution-focused culture that leads by example and energy.',
      agreeableness: 'A warm, connected culture that builds bridges between people and ideas.',
      neuroticism: 'A resilient culture that stays positive and engaged through challenges.',
    },
    agreeableness: {
      openness: 'A compassionate culture that sees the best in people and possibilities.',
      conscientiousness: 'A thoughtful culture that puts people at the center of every decision.',
      extraversion: 'A warm culture that creates belonging and community.',
      neuroticism: 'A supportive culture that brings calm and care to every challenge.',
    },
    neuroticism: {
      openness: 'A grounded culture that combines stability with curiosity.',
      conscientiousness: 'A composed culture that thrives under pressure and uncertainty.',
      extraversion: 'A steady culture that leads with calm confidence.',
      agreeableness: 'A reliable culture that brings peace and support to its teams.',
    },
  };

  return taglines[top]?.[second] || 'A unique culture built on a distinctive blend of values.';
}

export function EmployerAssessmentResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReveal, setShowReveal] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadResults = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('company_name, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values, culture_quiz_completed')
        .eq('user_id', user.id)
        .single();

      if (!employer || !employer.culture_quiz_completed) {
        navigate('/app/employer/culture-assessment');
        return;
      }

      setData(employer as EmployerData);
      setIsLoading(false);
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

  const preferences = {
    openness: data.openness_preference,
    conscientiousness: data.conscientiousness_preference,
    extraversion: data.extraversion_preference,
    agreeableness: data.agreeableness_preference,
    neuroticism: 100 - data.neuroticism_preference,
  };

  const archetypeScores = {
    innovation: data.openness_preference,
    collaboration: (data.extraversion_preference + data.agreeableness_preference) / 2,
    results: data.conscientiousness_preference,
    warmth: data.agreeableness_preference,
    growth: (data.openness_preference + data.conscientiousness_preference) / 2,
    excellence: data.conscientiousness_preference,
  };

  const archetypes = determineEmployerArchetype(archetypeScores);
  const archetypeName = archetypes.primary.name;
  const tagline = generateCultureTagline(preferences);

  const sortedPreferences = Object.entries(preferences).sort((a, b) => b[1] - a[1]).slice(0, 3);

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
            <Building2 className="w-12 h-12 text-white" />
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
              Preparing your culture profile...
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
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {archetypeName}
          </h1>
          <p className="text-lg max-w-lg mx-auto mb-1" style={{ color: 'var(--color-textSecondary)' }}>
            {tagline}
          </p>
          {data.company_name && (
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {data.company_name}
            </p>
          )}
          <p className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
            {archetypes.primary.description}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sortedPreferences.map(([key, value], i) => (
            <div
              key={key}
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
                #{i + 1} Priority
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
            Ideal Candidate OCEAN Profile
          </h2>
          <div className="max-w-sm mx-auto">
            <OceanMindMap
              scores={preferences}
              colors={OCEAN_COLORS}
              labels={OCEAN_LABELS}
              centerLabel="IDEAL"
              centerSubLabel="candidate"
              animated
            />
          </div>
        </motion.div>

        {/* Culture Values */}
        {data.culture_values && data.culture_values.length > 0 && (
          <motion.div
            className="p-6 rounded-2xl border mb-8"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Culture Values
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.culture_values.map((value, index) => (
                <span
                  key={value}
                  className="px-4 py-2 rounded-full text-sm font-medium capitalize"
                  style={{
                    backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-background)',
                    color: index === 0 ? 'white' : 'var(--color-text)',
                  }}
                >
                  {value}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/app/employer/insights">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Explore Full Insights
            </Button>
          </Link>
          <Link to="/app/employer/candidates">
            <Button size="lg" variant="outline" leftIcon={<Users className="w-5 h-5" />}>
              Browse Candidates
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default EmployerAssessmentResults;
