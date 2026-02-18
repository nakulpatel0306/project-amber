import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Target,
  Sparkles,
  Heart,
  Anchor,
  Zap,
  Layers,
  CheckCircle2,
  ArrowRight,
  Clock,
  RotateCcw,
  X,
  Users,
  TrendingUp,
  Building2,
  AlertCircle,
  MessageCircle,
  Shield,
  Rocket,
  Battery,
  Leaf,
  Puzzle,
  ChevronDown,
  ChevronUp,
  Focus,
  Award,
  Palette,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { OceanMindMap } from '../ui/OceanMindMap';
import { GradientProgressBar } from '../ui/GradientProgressBar';
import { ArchetypeCard } from '../ui/ArchetypeCard';
import { ProfileCompleteness } from '../ui/ProfileCompleteness';
import { DidYouKnowCard } from '../ui/DidYouKnowCard';
import { determineEmployerArchetype } from '../../data/employerArchetypes';
import { getFactsForProfile } from '../../data/personalityFacts';
import { calculateCombinedEmployerOCEAN, type OCEANScores } from '../../lib/personalityEngine';

interface CultureData {
  company_name: string | null;
  openness_preference: number | null;
  conscientiousness_preference: number | null;
  extraversion_preference: number | null;
  agreeableness_preference: number | null;
  neuroticism_preference: number | null;
  culture_values: string[] | null;
  culture_quiz_completed: boolean;
  updated_at: string | null;
  team_dynamics_data: Record<string, unknown> | null;
  leadership_style_data: Record<string, unknown> | null;
  growth_philosophy_data: Record<string, unknown> | null;
  work_environment_data: Record<string, unknown> | null;
}

const EMPLOYER_ADDITIONAL_ASSESSMENTS = [
  {
    id: 'team-dynamics',
    name: 'Team Dynamics',
    description: 'Collaboration, communication, and conflict handling style.',
    icon: Users,
    color: '#F59E0B',
    duration: '~5 min',
    dataField: 'team_dynamics_data',
    traits: ['Collaboration', 'Communication', 'Conflict'],
    weight: '12%',
  },
  {
    id: 'leadership-style',
    name: 'Leadership & Management',
    description: 'Management philosophy, feedback culture, and decision authority.',
    icon: Award,
    color: '#8B5CF6',
    duration: '~5 min',
    dataField: 'leadership_style_data',
    traits: ['Management', 'Feedback', 'Authority'],
    weight: '12%',
  },
  {
    id: 'growth-philosophy',
    name: 'Growth & Development',
    description: 'Learning culture, mentorship, and career path philosophy.',
    icon: Rocket,
    color: '#10B981',
    duration: '~5 min',
    dataField: 'growth_philosophy_data',
    traits: ['Learning', 'Mentorship', 'Career paths'],
    weight: '11%',
  },
  {
    id: 'work-environment',
    name: 'Work Environment & Pace',
    description: 'Remote/hybrid preferences, work-life balance, and urgency culture.',
    icon: Building2,
    color: '#06B6D4',
    duration: '~5 min',
    dataField: 'work_environment_data',
    traits: ['Environment', 'Pace', 'Balance'],
    weight: '10%',
  },
];

const DIMENSION_INFO: Record<string, {
  label: string;
  fullLabel: string;
  shortDesc: string;
  description: string;
  workplaceImpact: string;
  highCandidates: string[];
  lowCandidates: string[];
  idealFor: string[];
  candidateTypes: string[];
  icon: React.ElementType;
  color: string;
  progressColor: string;
}> = {
  openness: {
    label: 'Openness',
    fullLabel: 'Openness to Experience',
    shortDesc: 'Creativity & curiosity',
    description: 'Your preference for candidates who are intellectually curious, creative, and open to new ideas. High scores attract innovative thinkers who thrive with ambiguity.',
    workplaceImpact: 'Candidates strong in openness excel in roles requiring creative problem-solving, innovation, and adapting to change.',
    highCandidates: [
      'Embrace unconventional approaches',
      'Generate innovative solutions',
      'Adapt quickly to pivots and changes',
      'Bring diverse perspectives',
    ],
    lowCandidates: [
      'Provide stability and consistency',
      'Excel at refining existing processes',
      'Reliable execution of proven methods',
      'Detail-oriented implementation',
    ],
    idealFor: ['Product innovation', 'R&D teams', 'Creative departments', 'Strategy roles', 'Design teams'],
    candidateTypes: ['Innovators', 'Creative thinkers', 'Early adopters'],
    icon: Lightbulb,
    color: '#8B5CF6',
    progressColor: 'purple',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    fullLabel: 'Conscientiousness',
    shortDesc: 'Organization & discipline',
    description: 'Your preference for organized, dependable, and goal-directed candidates. High scores attract disciplined achievers who deliver consistent results.',
    workplaceImpact: 'Conscientiousness is the strongest predictor of job performance in most roles, especially those requiring reliability and attention to detail.',
    highCandidates: [
      'Meet deadlines consistently',
      'Maintain high quality standards',
      'Plan and organize effectively',
      'Take ownership of responsibilities',
    ],
    lowCandidates: [
      'Flexible with changing priorities',
      'Comfortable with ambiguity',
      'Big-picture thinking',
      'Adaptable to shifting goals',
    ],
    idealFor: ['Operations', 'Project management', 'Finance', 'Quality assurance', 'Compliance'],
    candidateTypes: ['Achievers', 'Organizers', 'Detail-oriented pros'],
    icon: Target,
    color: '#10B981',
    progressColor: 'green',
  },
  extraversion: {
    label: 'Extraversion',
    fullLabel: 'Extraversion',
    shortDesc: 'Social energy & assertiveness',
    description: 'Your preference for socially energetic and outgoing candidates. High scores attract dynamic team players who thrive in collaborative environments.',
    workplaceImpact: 'Extraversion influences team dynamics, communication style, and how candidates engage with colleagues and clients.',
    highCandidates: [
      'Energize team discussions',
      'Build relationships naturally',
      'Present ideas confidently',
      'Thrive in collaborative settings',
    ],
    lowCandidates: [
      'Deep, focused work',
      'Thoughtful analysis before speaking',
      'Independent contribution',
      'Written communication strength',
    ],
    idealFor: ['Sales', 'Client success', 'Team leadership', 'Public relations', 'Recruiting'],
    candidateTypes: ['Communicators', 'Collaborators', 'Relationship builders'],
    icon: Zap,
    color: '#F59E0B',
    progressColor: 'amber',
  },
  agreeableness: {
    label: 'Agreeableness',
    fullLabel: 'Agreeableness',
    shortDesc: 'Cooperation & empathy',
    description: 'Your preference for cooperative, empathetic candidates. High scores attract team players who prioritize harmony and support colleagues.',
    workplaceImpact: 'Agreeableness affects team cohesion, conflict resolution, and how candidates handle stakeholder relationships.',
    highCandidates: [
      'Foster team harmony',
      'Skilled at conflict resolution',
      'Supportive of colleagues',
      'Empathetic communicators',
    ],
    lowCandidates: [
      'Objective decision-makers',
      'Comfortable with tough calls',
      'Direct feedback style',
      'Competitive drive',
    ],
    idealFor: ['Customer service', 'HR', 'Team support', 'Healthcare', 'Counseling'],
    candidateTypes: ['Team players', 'Supporters', 'Mediators'],
    icon: Heart,
    color: '#EC4899',
    progressColor: 'pink',
  },
  neuroticism: {
    label: 'Stability',
    fullLabel: 'Emotional Stability',
    shortDesc: 'Resilience & composure',
    description: 'Your preference for emotionally stable, resilient candidates. High stability scores attract calm performers who handle pressure well.',
    workplaceImpact: 'Emotional stability influences how candidates handle stress, criticism, and high-pressure situations.',
    highCandidates: [
      'Calm under pressure',
      'Resilient through setbacks',
      'Consistent performance',
      'Steady team presence',
    ],
    lowCandidates: [
      'Highly attuned to risks',
      'Passionate about work',
      'Thorough due diligence',
      'Motivated by urgency',
    ],
    idealFor: ['Crisis management', 'Executive roles', 'High-stakes negotiations', 'Emergency response'],
    candidateTypes: ['Steady performers', 'Crisis handlers', 'Reliable anchors'],
    icon: Anchor,
    color: '#06B6D4',
    progressColor: 'cyan',
  },
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

export function CultureInsights() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cultureData, setCultureData] = useState<CultureData | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [assessmentCooldowns, setAssessmentCooldowns] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('company_name, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values, culture_quiz_completed, updated_at')
        .eq('user_id', user.id)
        .single();

      if (employer) {
        let supplementary: Record<string, unknown> = {
          team_dynamics_data: null,
          leadership_style_data: null,
          growth_philosophy_data: null,
          work_environment_data: null,
        };

        try {
          const { data: supData } = await supabase
            .from('employers')
            .select('team_dynamics_data, leadership_style_data, growth_philosophy_data, work_environment_data')
            .eq('user_id', user.id)
            .single();
          if (supData) supplementary = supData as Record<string, unknown>;
        } catch { /* columns may not exist yet */ }

        setCultureData({
          ...employer,
          team_dynamics_data: (supplementary.team_dynamics_data as Record<string, unknown>) ?? null,
          leadership_style_data: (supplementary.leadership_style_data as Record<string, unknown>) ?? null,
          growth_philosophy_data: (supplementary.growth_philosophy_data as Record<string, unknown>) ?? null,
          work_environment_data: (supplementary.work_environment_data as Record<string, unknown>) ?? null,
        } as CultureData);

        // Calculate assessment cooldowns (7-day cooldown)
        const cooldownMs = 7 * 24 * 60 * 60 * 1000;
        const cooldowns: Record<string, number | null> = {};
        const assessmentFields = [
          { id: 'team-dynamics', data: supplementary.team_dynamics_data },
          { id: 'leadership-style', data: supplementary.leadership_style_data },
          { id: 'growth-philosophy', data: supplementary.growth_philosophy_data },
          { id: 'work-environment', data: supplementary.work_environment_data },
        ];
        for (const { id, data } of assessmentFields) {
          const completedAt = (data as Record<string, unknown> | null)?.completed_at as string | undefined;
          if (completedAt) {
            const timeSince = Date.now() - new Date(completedAt).getTime();
            cooldowns[id] = timeSince < cooldownMs ? cooldownMs - timeSince : null;
          } else {
            cooldowns[id] = null;
          }
        }
        setAssessmentCooldowns(cooldowns);

        if (employer.updated_at) {
          const lastUpdated = new Date(employer.updated_at);
          const timeSince = Date.now() - lastUpdated.getTime();
          const coreCooldownMs = 24 * 60 * 60 * 1000;

          if (timeSince < coreCooldownMs) {
            setCooldownRemaining(coreCooldownMs - timeSince);
          }
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  useEffect(() => {
    const hasAnyCooldown = cooldownRemaining !== null || Object.values(assessmentCooldowns).some(v => v !== null && v > 0);
    if (!hasAnyCooldown) return;

    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev === null || prev <= 1000) return null;
        return prev - 1000;
      });
      setAssessmentCooldowns(prev => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          if (updated[key] !== null && updated[key]! > 0) {
            updated[key] = updated[key]! <= 1000 ? null : updated[key]! - 1000;
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining, assessmentCooldowns]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cultureData?.culture_quiz_completed) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-background)', minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Building2 className="w-10 h-10" style={{ color: '#8B5CF6' }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Define Your Culture
          </h1>
          <p className="mb-6 max-w-sm mx-auto" style={{ color: 'var(--color-textSecondary)' }}>
            Take the culture assessment to define your ideal candidate profile and start matching with compatible talent.
          </p>
          <Link to="/app/employer/culture-assessment">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build combined OCEAN scores from core + supplementary assessments
  const coreScores: OCEANScores = {
    openness: cultureData?.openness_preference || 0,
    conscientiousness: cultureData?.conscientiousness_preference || 0,
    extraversion: cultureData?.extraversion_preference || 0,
    agreeableness: cultureData?.agreeableness_preference || 0,
    neuroticism: cultureData?.neuroticism_preference || 0,
  };

  const tdData = cultureData?.team_dynamics_data as Record<string, unknown> | null;
  const lsData = cultureData?.leadership_style_data as Record<string, unknown> | null;
  const gpData = cultureData?.growth_philosophy_data as Record<string, unknown> | null;
  const weData = cultureData?.work_environment_data as Record<string, unknown> | null;

  const supplementaryScores: {
    teamDynamics?: OCEANScores;
    leadershipStyle?: OCEANScores;
    growthPhilosophy?: OCEANScores;
    workEnvironment?: OCEANScores;
  } = {};

  if (tdData?.ocean_scores) supplementaryScores.teamDynamics = tdData.ocean_scores as OCEANScores;
  if (lsData?.ocean_scores) supplementaryScores.leadershipStyle = lsData.ocean_scores as OCEANScores;
  if (gpData?.ocean_scores) supplementaryScores.growthPhilosophy = gpData.ocean_scores as OCEANScores;
  if (weData?.ocean_scores) supplementaryScores.workEnvironment = weData.ocean_scores as OCEANScores;

  const combinedOcean = calculateCombinedEmployerOCEAN(
    coreScores,
    Object.keys(supplementaryScores).length > 0 ? supplementaryScores : undefined
  );

  const completedAssessments = [true, !!tdData, !!lsData, !!gpData, !!weData];
  const completionCount = completedAssessments.filter(Boolean).length;

  const preferences = {
    openness: combinedOcean.openness,
    conscientiousness: combinedOcean.conscientiousness,
    extraversion: combinedOcean.extraversion,
    agreeableness: combinedOcean.agreeableness,
    neuroticism: 100 - combinedOcean.neuroticism,
  };

  const handleAssessmentClick = (assessmentId: string, isCompleted: boolean, cooldown: number | null | undefined) => {
    if (isCompleted && cooldown !== null && cooldown !== undefined && cooldown > 0) {
      showError('Cooldown Active', `You can retake this in ${Math.ceil(cooldown / (1000 * 60 * 60 * 24))} days`);
      return;
    }
    navigate(`/app/employer/assessments/${assessmentId}`);
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
  const tagline = generateCultureTagline(preferences);

  const formatCooldown = (ms: number) => {
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (days > 1) return `${days} days`;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    return `${Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const sortedPrefs = Object.entries(preferences).sort((a, b) => b[1] - a[1]);
  // Derive operating style
  const decisionStyle = preferences.openness > 60 && preferences.conscientiousness > 60
    ? 'Data-Informed Innovation'
    : preferences.openness > 60
    ? 'Intuition-Led'
    : preferences.conscientiousness > 60
    ? 'Data-Driven'
    : 'Balanced Analysis';

  const communicationStyle = preferences.extraversion > 60 && preferences.agreeableness > 60
    ? 'Open & Supportive'
    : preferences.extraversion > 60
    ? 'Direct & Energetic'
    : preferences.agreeableness > 60
    ? 'Thoughtful & Caring'
    : 'Balanced Dialogue';

  const teamDynamic = preferences.extraversion > 60
    ? 'Collaborative-First'
    : preferences.conscientiousness > 60
    ? 'Structured & Focused'
    : 'Flexible Hybrid';

  // Energy map: what attracts vs repels talent
  const attractors: string[] = [];
  const repellers: string[] = [];

  if (preferences.openness > 60) { attractors.push('Creative freedom & innovation time'); repellers.push('Rigid, top-down processes'); }
  else { attractors.push('Clear, proven methodologies'); repellers.push('Constant experimentation & pivots'); }
  if (preferences.extraversion > 60) { attractors.push('Collaborative team culture'); repellers.push('Isolated, siloed workflows'); }
  else { attractors.push('Deep work & focused time'); repellers.push('Constant meetings & interruptions'); }
  if (preferences.agreeableness > 60) { attractors.push('Supportive, people-first values'); repellers.push('Cutthroat competitive dynamics'); }
  else { attractors.push('Healthy competition & meritocracy'); repellers.push('Excessive consensus-seeking'); }
  if (preferences.conscientiousness > 60) { attractors.push('Clear goals & accountability'); repellers.push('Ambiguous expectations'); }
  else { attractors.push('Flexible deadlines & autonomy'); repellers.push('Micromanagement & rigid timelines'); }

  // Culture strengths & gaps
  const cultureStrengths: { icon: React.ElementType; label: string; desc: string; color: string }[] = [];
  const cultureGaps: { icon: React.ElementType; label: string; desc: string; color: string }[] = [];

  if (preferences.openness >= 65) cultureStrengths.push({ icon: Lightbulb, label: 'Innovation-First', desc: 'Your culture prizes creative thinking and new approaches', color: '#8B5CF6' });
  else if (preferences.openness <= 35) cultureGaps.push({ icon: Lightbulb, label: 'Innovation Opportunities', desc: 'Consider creating space for creative experimentation', color: '#8B5CF6' });

  if (preferences.conscientiousness >= 65) cultureStrengths.push({ icon: Target, label: 'Results-Driven', desc: 'Clear accountability and high performance standards', color: '#10B981' });
  else if (preferences.conscientiousness <= 35) cultureGaps.push({ icon: Target, label: 'Structure Opportunities', desc: 'Adding clearer goals could boost team performance', color: '#10B981' });

  if (preferences.extraversion >= 65) cultureStrengths.push({ icon: Users, label: 'Highly Collaborative', desc: 'Strong team dynamics and open communication', color: '#F59E0B' });
  else if (preferences.extraversion <= 35) cultureGaps.push({ icon: Users, label: 'Collaboration Opportunities', desc: 'More team interaction could enhance outcomes', color: '#F59E0B' });

  if (preferences.agreeableness >= 65) cultureStrengths.push({ icon: Heart, label: 'People-First', desc: 'Empathy and support are core to your culture', color: '#EC4899' });
  else if (preferences.agreeableness <= 35) cultureGaps.push({ icon: Heart, label: 'Empathy Opportunities', desc: 'More emphasis on interpersonal warmth could improve retention', color: '#EC4899' });

  if (preferences.neuroticism >= 65) cultureStrengths.push({ icon: Shield, label: 'Resilient & Steady', desc: 'Calm under pressure with consistent performance', color: '#06B6D4' });
  else if (preferences.neuroticism <= 35) cultureGaps.push({ icon: Shield, label: 'Resilience Opportunities', desc: 'Building stress-management practices could help', color: '#06B6D4' });

  // Compatibility signals
  const idealCompanySize = preferences.openness > 60 && preferences.extraversion < 50
    ? 'Small to mid-size teams'
    : preferences.conscientiousness > 60
    ? 'Mid to large organizations'
    : 'Flexible team sizes';

  const idealCandidateType = sortedPrefs[0][0] === 'openness'
    ? 'Creative visionaries and problem-solvers'
    : sortedPrefs[0][0] === 'conscientiousness'
    ? 'Disciplined achievers and organizers'
    : sortedPrefs[0][0] === 'extraversion'
    ? 'Energetic collaborators and communicators'
    : sortedPrefs[0][0] === 'agreeableness'
    ? 'Empathetic team players and mediators'
    : 'Steady performers and resilient anchors';

  // Personality facts (reuse for employer context)
  const personalityFacts = getFactsForProfile(preferences, 4);

  const handleDimensionClick = (key: string) => {
    setSelectedDimension(prev => prev === key ? null : key);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto">

        {/* 1. Hero / Profile Header */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)' }}
            >
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                {archetypes.primary.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{tagline}</p>
              {cultureData?.company_name && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>{cultureData.company_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ProfileCompleteness completedCount={completionCount} variant="ring" size="sm" showLabel={false} />
            {cooldownRemaining && cooldownRemaining > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Retake in {formatCooldown(cooldownRemaining)}</span>
              </div>
            ) : (
              <Link to="/app/employer/culture-assessment">
                <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>Retake</Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* 2. OCEAN Mind Map + Dimension Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <motion.div
            className="lg:col-span-2 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Ideal Candidate Profile
            </h2>
            {completionCount > 1 && (
              <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                <Sparkles className="w-3 h-3" />
                Enhanced with {completionCount - 1} supplementary assessment{completionCount > 2 ? 's' : ''}
              </p>
            )}
            <OceanMindMap
              scores={preferences}
              colors={Object.fromEntries(Object.entries(DIMENSION_INFO).map(([k, v]) => [k, v.color]))}
              labels={Object.fromEntries(Object.entries(DIMENSION_INFO).map(([k, v]) => [k, v.label]))}
              centerLabel="IDEAL"
              centerSubLabel="candidate"
              animated
              onDimensionClick={handleDimensionClick}
              selectedDimension={selectedDimension}
            />
            <p className="text-xs text-center mt-2" style={{ color: 'var(--color-textMuted)' }}>
              Click a dimension to explore details
            </p>
          </motion.div>

          {/* Dimension Breakdown / Detail */}
          <motion.div
            className="lg:col-span-3 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {selectedDimension && DIMENSION_INFO[selectedDimension] ? (
              <DimensionDetail
                dimension={selectedDimension}
                score={preferences[selectedDimension as keyof typeof preferences]}
                info={DIMENSION_INFO[selectedDimension]}
                onClose={() => setSelectedDimension(null)}
              />
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Layers className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  Preference Breakdown
                </h2>
                <div className="space-y-4">
                  {(Object.entries(DIMENSION_INFO) as [string, typeof DIMENSION_INFO[string]][]).map(([key, info]) => (
                    <div key={key}>
                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedDimension(expandedDimension === key ? null : key)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <info.icon className="w-4 h-4" style={{ color: info.color }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                              {info.fullLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: info.color }}>
                              {preferences[key as keyof typeof preferences]}
                            </span>
                            {expandedDimension === key
                              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                            }
                          </div>
                        </div>
                      </button>
                      <GradientProgressBar value={preferences[key as keyof typeof preferences]} showValue={false} size="sm" color={info.progressColor} />
                      <AnimatePresence>
                        {expandedDimension === key && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 pb-1">
                              <p className="text-xs mb-2" style={{ color: 'var(--color-textMuted)' }}>
                                {info.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {info.candidateTypes.map((type, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: `${info.color}10`, color: info.color }}>
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 3. Culture Archetypes */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Your Culture Archetypes
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Your unique combination shapes how you attract, retain, and develop talent
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ArchetypeCard
              name={archetypes.primary.name}
              description={archetypes.primary.description}
              strengths={archetypes.primary.strengths}
              idealEnvironments={archetypes.primary.idealCandidates}
              blindspots={archetypes.primary.blindspots}
              variant="primary"
              delay={0.1}
            />
            <ArchetypeCard
              name={archetypes.secondary.name}
              description={archetypes.secondary.description}
              strengths={archetypes.secondary.strengths}
              idealEnvironments={archetypes.secondary.idealCandidates}
              blindspots={archetypes.secondary.blindspots}
              variant="secondary"
              delay={0.2}
            />
            <ArchetypeCard
              name={archetypes.tertiary.name}
              description={archetypes.tertiary.description}
              strengths={archetypes.tertiary.strengths}
              idealEnvironments={archetypes.tertiary.idealCandidates}
              blindspots={archetypes.tertiary.blindspots}
              variant="tertiary"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* 4. Operating Style */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Puzzle className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Operating Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Brain, label: 'Decision Making', value: decisionStyle, color: '#8B5CF6' },
              { icon: MessageCircle, label: 'Communication', value: communicationStyle, color: '#10B981' },
              { icon: Users, label: 'Team Dynamic', value: teamDynamic, color: '#F59E0B' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</span>
                </div>
                <p className="font-semibold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. Hiring Energy Map */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Battery className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Hiring Energy Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#10B981' }}>
                <Zap className="w-4 h-4" /> What Attracts Talent
              </p>
              <div className="space-y-2">
                {attractors.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
                    <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#EF4444' }}>
                <Battery className="w-4 h-4" /> What May Repel Talent
              </p>
              <div className="space-y-2">
                {repellers.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)' }}>
                    <X className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6. Culture Environment */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            The Environment You Create
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Based on your culture profile, here's the work environment candidates can expect
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: preferences.openness > 60 ? Palette : Shield,
                label: preferences.openness > 60 ? 'Innovation-Driven' : 'Stability-Focused',
                desc: preferences.openness > 60 ? 'Encourages creativity' : 'Values consistency',
                color: '#8B5CF6',
              },
              {
                icon: preferences.conscientiousness > 60 ? Target : Compass,
                label: preferences.conscientiousness > 60 ? 'Goal-Oriented' : 'Flexible Goals',
                desc: preferences.conscientiousness > 60 ? 'Clear metrics' : 'Adaptive objectives',
                color: '#10B981',
              },
              {
                icon: preferences.extraversion > 60 ? Users : Focus,
                label: preferences.extraversion > 60 ? 'Team-Centric' : 'Focus-Centric',
                desc: preferences.extraversion > 60 ? 'Collaborative work' : 'Independent work',
                color: '#F59E0B',
              },
              {
                icon: preferences.agreeableness > 60 ? Heart : Award,
                label: preferences.agreeableness > 60 ? 'People-First' : 'Results-First',
                desc: preferences.agreeableness > 60 ? 'Relationships matter' : 'Outcomes matter',
                color: '#EC4899',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 7. Growth Edges */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Leaf className="w-5 h-5" style={{ color: '#10B981' }} />
            Growth Edges
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Areas where evolving your culture could attract a broader, stronger talent pool
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPrefs.slice(-2).map(([key, value]) => {
              const info = DIMENSION_INFO[key];
              const growthTips: Record<string, string> = {
                openness: 'Host innovation days or hackathons to encourage creative thinking in your teams.',
                conscientiousness: 'Introduce light project management rituals to bring clarity without rigidity.',
                extraversion: 'Create more cross-team touchpoints — standups, social events, or collaboration channels.',
                agreeableness: 'Invest in conflict resolution training and psychological safety workshops.',
                neuroticism: 'Build resilience programs — mindfulness resources, wellness days, or manager training.',
              };
              return (
                <div key={key} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <info.icon className="w-4 h-4" style={{ color: info.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{info.fullLabel}</span>
                    <span className="text-xs font-semibold ml-auto" style={{ color: info.color }}>{value}/100</span>
                  </div>
                  <GradientProgressBar value={value} showValue={false} size="sm" color={info.progressColor} />
                  <p className="text-xs mt-2" style={{ color: 'var(--color-textMuted)' }}>
                    {growthTips[key]}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 8. Culture Strengths & Growth Areas */}
        {(cultureStrengths.length > 0 || cultureGaps.length > 0) && (
          <motion.div
            className="p-6 rounded-2xl border mb-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Culture Strengths & Growth Areas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cultureStrengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#10B981' }}>
                    Strengths
                  </p>
                  <div className="space-y-3">
                    {cultureStrengths.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cultureGaps.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#F59E0B' }}>
                    Growth Areas
                  </p>
                  <div className="space-y-3">
                    {cultureGaps.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 9. Compatibility Signals */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Rocket className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Compatibility Signals
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-textMuted)' }}>
            What types of candidates you'll mesh with best
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Ideal Team Size</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{idealCompanySize}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Ideal Candidates</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{idealCandidateType}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Work Pace</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {(preferences.extraversion + preferences.openness) / 2 > 60
                  ? 'Fast-paced & dynamic'
                  : (preferences.extraversion + preferences.openness) / 2 < 40
                  ? 'Measured & thoughtful'
                  : 'Balanced rhythm'}
              </p>
            </div>
          </div>
          <Link to="/app/employer/candidates">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Browse Candidates
            </Button>
          </Link>
        </motion.div>

        {/* 10. Culture Values */}
        {cultureData?.culture_values && cultureData.culture_values.length > 0 && (
          <motion.div
            className="p-6 rounded-2xl border mb-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Culture Values
            </h2>
            <div className="flex flex-wrap gap-3">
              {cultureData.culture_values.map((value, index) => {
                const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4'];
                const color = colors[index % colors.length];

                return (
                  <span
                    key={value}
                    className="px-4 py-2 rounded-xl font-medium capitalize"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 11. Enhance Your Culture Profile — Supplementary Assessments */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Rocket className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Enhance Your Culture Profile
          </h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Complete more assessments for a more nuanced culture profile and better candidate matches
            </p>
            <ProfileCompleteness completedCount={completionCount} variant="ring" size="sm" showLabel={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMPLOYER_ADDITIONAL_ASSESSMENTS.map(assessment => {
              const AssessmentIcon = assessment.icon;
              const isCompleted = cultureData
                ? !!(cultureData as unknown as Record<string, unknown>)[assessment.dataField]
                : false;
              const cooldown = assessmentCooldowns[assessment.id];
              const isOnCooldown = isCompleted && cooldown !== null && cooldown !== undefined && cooldown > 0;

              return (
                <div
                  key={assessment.id}
                  className="p-5 rounded-xl flex gap-4 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    border: isCompleted ? `1px solid ${assessment.color}60` : `1px solid ${assessment.color}40`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: `${assessment.color}15` }}>
                    <AssessmentIcon className="w-6 h-6" style={{ color: assessment.color }} />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{assessment.name}</h3>
                      {isCompleted && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>Done</span>}
                      {isOnCooldown && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: `${assessment.color}10`, color: assessment.color }}>
                          <Clock className="w-3 h-3" />{formatCooldown(cooldown!)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-textMuted)' }}>{assessment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {assessment.traits.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: `${assessment.color}10`, color: assessment.color }}>{t}</span>
                        ))}
                      </div>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--color-textMuted)' }}>{assessment.duration}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                      onClick={() => handleAssessmentClick(assessment.id, isCompleted, cooldown)}
                    >
                      {isOnCooldown ? `Retake in ${formatCooldown(cooldown!)}` : isCompleted ? 'Retake' : 'Start'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 12. Did You Know? */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DidYouKnowCard facts={personalityFacts} />
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="p-4 rounded-xl border mb-6 flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-textMuted)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              About Culture Matching
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              This profile is based on the Big Five (OCEAN) model. Research shows personality fit accounts for 15-25% of work performance variance. We use these preferences alongside skills and experience to suggest compatible candidates — never as a sole deciding factor.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="p-6 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Ready to Find Your Matches?</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
            Discover candidates whose personality aligns with your culture
          </p>
          <Link to="/app/employer/candidates">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>Browse Candidates</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Dimension detail panel (shown when a mind map bubble is clicked)
function DimensionDetail({
  score,
  info,
  onClose,
}: {
  dimension?: string;
  score: number;
  info: typeof DIMENSION_INFO[string];
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${info.color}20` }}>
            <info.icon className="w-6 h-6" style={{ color: info.color }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{info.fullLabel}</h2>
            <p className="text-sm" style={{ color: info.color }}>Preference: {score}/100</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-background)]">
          <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        </button>
      </div>

      <GradientProgressBar value={score} color={info.progressColor} showValue={false} size="md" />

      <p className="text-sm mt-3 mb-3" style={{ color: 'var(--color-textSecondary)' }}>{info.description}</p>

      <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>Hiring Impact</p>
        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{info.workplaceImpact}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Candidates You Attract
        </h3>
        <ul className="space-y-1.5 mb-4">
          {(score >= 50 ? info.highCandidates : info.lowCandidates).map((trait, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: info.color }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{trait}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Ideal Roles</h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {info.idealFor.map((role, i) => (
            <span key={i} className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: `${info.color}15`, color: info.color }}>{role}</span>
          ))}
        </div>

        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Candidate Types</h3>
        <div className="flex flex-wrap gap-1.5">
          {info.candidateTypes.map((type, i) => (
            <span key={i} className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}>{type}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CultureInsights;
