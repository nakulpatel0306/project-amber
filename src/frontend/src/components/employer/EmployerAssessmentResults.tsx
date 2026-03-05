import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { AssessmentResultsTemplate } from '../assessments/AssessmentResultsTemplate';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';

interface CultureScores {
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

export function EmployerAssessmentResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<CultureScores | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!user) {
        navigate('/app/employer/culture-assessment');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employers')
          .select('openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_quiz_completed')
          .eq('user_id', user.id)
          .single();

        if (error || !data || !data.culture_quiz_completed) {
          navigate('/app/employer/culture-assessment');
          return;
        }

        setScores({
          openness: data.openness_preference || 50,
          conscientiousness: data.conscientiousness_preference || 50,
          extraversion: data.extraversion_preference || 50,
          agreeableness: data.agreeableness_preference || 50,
          neuroticism: 100 - (data.neuroticism_preference || 50), // Invert for "Stability"
        });
      } catch (err) {
        console.error('Error fetching results:', err);
        navigate('/app/employer/culture-assessment');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [user, navigate]);

  if (loading) {
    return (
      <CoffeeBrewLoader message="Loading assessment results..." />
    );
  }

  if (!scores) {
    return null;
  }

  const dimensions = Object.entries(DIMENSION_CONFIG).map(([key, config]) => ({
    key,
    label: config.label,
    value: scores[key as keyof CultureScores],
    color: config.color,
    progressColor: config.progressColor,
  }));

  return (
    <AssessmentResultsTemplate
      title="Culture Profile Complete!"
      subtitle="Your ideal candidate profile has been created"
      dimensions={dimensions}
      enhancedMessage="Your culture profile is now active. Start discovering candidates who match your ideal culture fit."
      icon={<Building2 className="w-10 h-10 text-white" />}
      accentColor="#8B5CF6"
      profileUrl="/app/employer/insights"
      matchesUrl="/app/employer/candidates"
      profileLabel="View Insights"
      matchesLabel="Browse Candidates"
    />
  );
}
