import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { AssessmentResultsTemplate } from '../assessments/AssessmentResultsTemplate';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';

interface AssessmentData {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

const DIMENSION_CONFIG = {
  openness: { label: 'Openness', color: '#8B5CF6', progressColor: '#8B5CF6' },
  conscientiousness: { label: 'Conscientiousness', color: '#10B981', progressColor: '#10B981' },
  extraversion: { label: 'Extraversion', color: '#F59E0B', progressColor: '#F59E0B' },
  agreeableness: { label: 'Agreeableness', color: '#EC4899', progressColor: '#EC4899' },
  neuroticism: { label: 'Stability', color: '#06B6D4', progressColor: '#06B6D4' },
};

export function AssessmentResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<AssessmentData | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!user) {
        navigate('/app/assessment');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          navigate('/app/assessment');
          return;
        }

        setScores({
          openness: data.openness_score || 50,
          conscientiousness: data.conscientiousness_score || 50,
          extraversion: data.extraversion_score || 50,
          agreeableness: data.agreeableness_score || 50,
          neuroticism: 100 - (data.neuroticism_score || 50), // Invert for "Stability"
        });
      } catch (err) {
        console.error('Error fetching results:', err);
        navigate('/app/assessment');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [user, navigate]);

  if (loading) {
    return (
      <CoffeeBrewLoader message="Loading your results..." />
    );
  }

  if (!scores) {
    return null;
  }

  const dimensions = Object.entries(DIMENSION_CONFIG).map(([key, config]) => ({
    key,
    label: config.label,
    value: scores[key as keyof AssessmentData],
    color: config.color,
    progressColor: config.progressColor,
  }));

  return (
    <AssessmentResultsTemplate
      title="Assessment Complete!"
      subtitle="Your personality profile has been created"
      dimensions={dimensions}
      enhancedMessage="Your OCEAN profile is now active. Employers can discover you based on culture fit."
      icon={<Brain className="w-10 h-10 text-white" />}
      accentColor="#8B5CF6"
      profileUrl="/app/insights"
      matchesUrl="/app/matches"
      profileLabel="View Insights"
      matchesLabel="Find Matches"
    />
  );
}
