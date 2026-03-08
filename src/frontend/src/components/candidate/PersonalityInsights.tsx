import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Target,
  Compass,
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
  Shield,
  Rocket,
  Scale,
  Focus,
  Palette,
  Award,
  Building2,
  Eye,
  Lock,
  GraduationCap,
  MessageCircle,
  Puzzle,
  Battery,
  ChevronDown,
  ChevronUp,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { OceanMindMap } from '../ui/OceanMindMap';
import { GradientProgressBar } from '../ui/GradientProgressBar';
import { ArchetypeCard } from '../ui/ArchetypeCard';
import { ProfileCompleteness } from '../ui/ProfileCompleteness';
import { PersonalitySnapshotCard } from '../ui/PersonalitySnapshotCard';
import { DidYouKnowCard } from '../ui/DidYouKnowCard';
import { PageBanner } from '../ui/PageBanner';
import { getArchetypeByName } from '../../lib/archetypes';
import { calculateCombinedOCEAN, type OCEANScores } from '../../lib/personalityEngine';
import { getFactsForProfile } from '../../data/personalityFacts';

interface PersonalityData {
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;
  top_traits: string[] | null;
  assessment_completed_at: string | null;
  visual_perception_data: Record<string, unknown> | null;
  work_values_data: Record<string, unknown> | null;
  situational_judgment_data: Record<string, unknown> | null;
  cognitive_patterns_data: Record<string, unknown> | null;
}

const OCEAN_INFO = {
  openness: {
    label: 'Openness',
    fullLabel: 'Openness to Experience',
    shortDesc: 'Creativity & Curiosity',
    description: 'Measures your intellectual curiosity, creativity, and preference for novelty and variety.',
    workplaceImpact: 'Influences how you approach problem-solving, adapt to change, and engage with innovative ideas.',
    highTraits: ['Creative and imaginative thinking', 'Intellectual curiosity and love of learning', 'Comfort with ambiguity', 'Willingness to try new approaches'],
    lowTraits: ['Practical and grounded decision-making', 'Preference for proven methods', 'Focus on concrete outcomes', 'Detail-oriented execution'],
    idealRoles: ['Product Design', 'R&D', 'Marketing', 'Strategy', 'Content Creation'],
    cultureMatch: ['Innovative Startups', 'Creative Agencies', 'Research Institutions'],
    icon: Lightbulb,
    color: '#8B5CF6',
    progressColor: 'purple',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    fullLabel: 'Conscientiousness',
    shortDesc: 'Organization & Discipline',
    description: 'Reflects your tendency to be organized, dependable, and goal-directed.',
    workplaceImpact: 'The strongest personality predictor of job performance across most occupations.',
    highTraits: ['Strong organizational skills', 'Reliable and meets deadlines', 'Attention to detail and quality', 'Self-disciplined and motivated'],
    lowTraits: ['Flexible and spontaneous', 'Comfortable with last-minute changes', 'Big-picture focus', 'Adaptable to shifting priorities'],
    idealRoles: ['Project Management', 'Operations', 'Finance', 'QA', 'Data Analysis'],
    cultureMatch: ['Structured Enterprises', 'Regulated Industries', 'Process-Driven Orgs'],
    icon: Target,
    color: '#10B981',
    progressColor: 'green',
  },
  extraversion: {
    label: 'Extraversion',
    fullLabel: 'Extraversion',
    shortDesc: 'Social Energy & Assertiveness',
    description: 'Indicates how much you are energized by social interaction and external stimulation.',
    workplaceImpact: 'Influences your collaboration style, leadership approach, and professional relationships.',
    highTraits: ['Energized by teamwork', 'Natural communicator', 'Builds rapport easily', 'Thrives in fast-paced environments'],
    lowTraits: ['Deep, focused work', 'Thoughtful listener', 'Independent problem-solving', 'Reflective decision-making'],
    idealRoles: ['Sales', 'Leadership', 'Public Relations', 'Client Success', 'Team Management'],
    cultureMatch: ['Collaborative Teams', 'Client-Facing Roles', 'High-Energy Environments'],
    icon: Zap,
    color: '#F59E0B',
    progressColor: 'amber',
  },
  agreeableness: {
    label: 'Agreeableness',
    fullLabel: 'Agreeableness',
    shortDesc: 'Cooperation & Empathy',
    description: 'Measures your tendency toward cooperation, trust, and consideration for others.',
    workplaceImpact: 'Affects team dynamics, conflict resolution, and stakeholder management.',
    highTraits: ['Builds harmonious relationships', 'Empathetic and understanding', 'Skilled at conflict resolution', 'Customer and people-focused'],
    lowTraits: ['Objective and analytical thinking', 'Comfortable with difficult decisions', 'Direct and straightforward', 'Competitive drive'],
    idealRoles: ['Human Resources', 'Customer Service', 'Healthcare', 'Teaching', 'Counseling'],
    cultureMatch: ['People-First Cultures', 'Service Industries', 'Mission-Driven Orgs'],
    icon: Heart,
    color: '#EC4899',
    progressColor: 'pink',
  },
  neuroticism: {
    label: 'Stability',
    fullLabel: 'Emotional Stability',
    shortDesc: 'Resilience & Composure',
    description: 'Reflects your emotional resilience and ability to remain calm under pressure.',
    workplaceImpact: 'Influences how you handle pressure, respond to criticism, and maintain performance.',
    highTraits: ['Calm under pressure', 'Resilient when facing setbacks', 'Consistent performance', 'Steady emotional presence'],
    lowTraits: ['Highly attuned to risks', 'Passionate and emotionally invested', 'Detail-conscious', 'Empathetic to concerns'],
    idealRoles: ['Crisis Management', 'Executive Leadership', 'High-Stakes Negotiations'],
    cultureMatch: ['Fast-Paced Startups', 'High-Pressure Industries'],
    icon: Anchor,
    color: '#06B6D4',
    progressColor: 'cyan',
  },
};

const ADDITIONAL_ASSESSMENTS = [
  {
    id: 'visual-perception',
    name: 'Visual Perception Test',
    description: 'Discover your perceptual style through visual challenges.',
    icon: Eye,
    color: '#8B5CF6',
    duration: '~5 min',
    status: 'available' as const,
    dataField: 'visual_perception_data',
    traits: ['Perceptual style', 'Attention patterns', 'Cognitive flexibility'],
    weight: '10%',
  },
  {
    id: 'work-values',
    name: 'Drive & Motivation',
    description: 'Explore what drives you at work — purpose, growth, recognition, and more.',
    icon: Scale,
    color: '#10B981',
    duration: '~5 min',
    status: 'available' as const,
    dataField: 'work_values_data',
    traits: ['Values', 'Motivation', 'Career goals'],
    weight: '15%',
  },
  {
    id: 'situational-judgment',
    name: 'Social Energy',
    description: 'How do you handle real workplace scenarios? Conflicts, pressure, and feedback.',
    icon: Shield,
    color: '#F59E0B',
    duration: '~5 min',
    status: 'available' as const,
    dataField: 'situational_judgment_data',
    traits: ['Conflict styles', 'Emotions', 'Work behavior'],
    weight: '15%',
  },
  {
    id: 'cognitive-patterns',
    name: 'Cognitive Style',
    description: 'Explore your problem-solving approach, decision-making, and learning preferences.',
    icon: GraduationCap,
    color: '#EC4899',
    duration: '~5 min',
    status: 'available' as const,
    dataField: 'cognitive_patterns_data',
    traits: ['Problem-solving', 'Decisions', 'Learning style'],
    weight: '11%',
  },
];

export function PersonalityInsights() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<keyof typeof OCEAN_INFO | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [assessmentCooldowns, setAssessmentCooldowns] = useState<Record<string, number | null>>({});
  const [showSnapshotCard, setShowSnapshotCard] = useState(false);
  const showLoader = useMinLoader(isLoading);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits, assessment_completed_at')
        .eq('user_id', user.id)
        .single();

      if (candidate) {
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
        } catch { /* columns may not exist */ }

        setPersonalityData({
          ...candidate,
          visual_perception_data: (supplementary.visual_perception_data as Record<string, unknown>) ?? null,
          work_values_data: (supplementary.work_values_data as Record<string, unknown>) ?? null,
          situational_judgment_data: (supplementary.situational_judgment_data as Record<string, unknown>) ?? null,
          cognitive_patterns_data: (supplementary.cognitive_patterns_data as Record<string, unknown>) ?? null,
        } as PersonalityData);

        // Calculate cooldowns
        const cooldownMs = 7 * 24 * 60 * 60 * 1000;
        const cooldowns: Record<string, number | null> = {};
        const assessmentFields = [
          { id: 'visual-perception', data: supplementary.visual_perception_data },
          { id: 'work-values', data: supplementary.work_values_data },
          { id: 'situational-judgment', data: supplementary.situational_judgment_data },
          { id: 'cognitive-patterns', data: supplementary.cognitive_patterns_data },
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

        if (candidate.assessment_completed_at) {
          const timeSince = Date.now() - new Date(candidate.assessment_completed_at).getTime();
          if (timeSince < cooldownMs) setCooldownRemaining(cooldownMs - timeSince);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  // Cooldown timer
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

  const hasCompletedAssessment = personalityData?.openness_score !== null && personalityData?.openness_score !== undefined;

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading personality insights..." />
    );
  }

  if (!hasCompletedAssessment) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-background)', minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Brain className="w-10 h-10" style={{ color: '#8B5CF6' }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Discover Your Personality</h1>
          <p className="mb-6 max-w-sm mx-auto" style={{ color: 'var(--color-textSecondary)' }}>
            Take the personality assessment to unlock your insights and find jobs that truly fit your style.
          </p>
          <Link to="/app/personality">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>Start Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build combined OCEAN scores
  const coreScores: OCEANScores = {
    openness: personalityData?.openness_score || 0,
    conscientiousness: personalityData?.conscientiousness_score || 0,
    extraversion: personalityData?.extraversion_score || 0,
    agreeableness: personalityData?.agreeableness_score || 0,
    neuroticism: personalityData?.neuroticism_score || 0,
  };

  const vpData = personalityData?.visual_perception_data as Record<string, unknown> | null;
  const wvData = personalityData?.work_values_data as Record<string, unknown> | null;
  const sjData = personalityData?.situational_judgment_data as Record<string, unknown> | null;
  const cpData = personalityData?.cognitive_patterns_data as Record<string, unknown> | null;

  const supplementaryScores: {
    visualPerception?: Partial<Record<keyof OCEANScores, number>>;
    workValues?: OCEANScores;
    situationalJudgment?: OCEANScores;
    cognitivePatterns?: OCEANScores;
  } = {};

  if (vpData?.trait_modifiers) {
    const mods = vpData.trait_modifiers as Record<string, number>;
    supplementaryScores.visualPerception = {
      openness: mods.openness ?? 0,
      conscientiousness: mods.conscientiousness ?? 0,
      extraversion: mods.extraversion ?? 0,
      agreeableness: mods.agreeableness ?? 0,
      neuroticism: mods.neuroticism_inv ? -mods.neuroticism_inv : 0,
    };
  }
  if (wvData?.ocean_scores) supplementaryScores.workValues = wvData.ocean_scores as OCEANScores;
  if (sjData?.ocean_scores) supplementaryScores.situationalJudgment = sjData.ocean_scores as OCEANScores;
  if (cpData?.ocean_scores) supplementaryScores.cognitivePatterns = cpData.ocean_scores as OCEANScores;

  const combinedOcean = calculateCombinedOCEAN(
    coreScores,
    Object.keys(supplementaryScores).length > 0 ? supplementaryScores : undefined
  );

  const scores = {
    openness: combinedOcean.openness,
    conscientiousness: combinedOcean.conscientiousness,
    extraversion: combinedOcean.extraversion,
    agreeableness: combinedOcean.agreeableness,
    neuroticism: 100 - combinedOcean.neuroticism,
  };

  const formatCooldown = (ms: number) => {
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (days > 1) return `${days} days`;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    return `${Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const handleAssessmentClick = (assessmentId: string, isCompleted: boolean, cooldown: number | null | undefined) => {
    if (isCompleted && cooldown !== null && cooldown !== undefined && cooldown > 0) {
      showError('Cooldown Active', `You can retake this in ${Math.ceil(cooldown / (1000 * 60 * 60 * 24))} days`);
      return;
    }
    navigate(`/app/assessments/${assessmentId}`);
  };

  // Completion tracking
  const completedAssessments = [true, !!vpData, !!wvData, !!sjData, !!cpData];
  const completionCount = completedAssessments.filter(Boolean).length;

  // Derived insights
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominantDimension = sortedScores[0][0] as keyof typeof OCEAN_INFO;
  // Decision-making style
  const decisionStyle = scores.conscientiousness > 65
    ? (scores.openness > 60 ? 'Strategic Analyzer' : 'Methodical Planner')
    : (scores.openness > 60 ? 'Intuitive Explorer' : 'Adaptive Pragmatist');

  const communicationStyle = scores.extraversion > 65
    ? (scores.agreeableness > 60 ? 'Warm Collaborator' : 'Direct Communicator')
    : (scores.agreeableness > 60 ? 'Thoughtful Listener' : 'Focused Contributor');

  const problemSolvingStyle = scores.openness > 65
    ? (scores.conscientiousness > 60 ? 'Creative Systematizer' : 'Divergent Thinker')
    : (scores.conscientiousness > 60 ? 'Structured Problem-Solver' : 'Practical Troubleshooter');

  // Energy map
  const energizers: string[] = [];
  const drainers: string[] = [];

  if (scores.openness > 60) { energizers.push('New challenges & ideas'); drainers.push('Repetitive routine tasks'); }
  else { energizers.push('Mastering proven methods'); drainers.push('Constant change & ambiguity'); }
  if (scores.extraversion > 60) { energizers.push('Team brainstorming'); drainers.push('Extended solo work'); }
  else { energizers.push('Deep focused work'); drainers.push('Back-to-back meetings'); }
  if (scores.agreeableness > 60) { energizers.push('Helping others succeed'); drainers.push('Competitive environments'); }
  else { energizers.push('Healthy competition'); drainers.push('Too much consensus-building'); }
  if (scores.conscientiousness > 60) { energizers.push('Clear goals & progress'); drainers.push('Unclear expectations'); }
  else { energizers.push('Flexible schedules'); drainers.push('Rigid processes'); }

  // Personality facts
  const personalityFacts = getFactsForProfile(scores, 4);

  // Archetype name for tagline
  const primaryArchetype = personalityData?.top_traits?.[0] || 'The Explorer';
  // Generate tagline
  const taglineMap: Record<string, string> = {
    openness: 'Creative mind who sees possibilities everywhere',
    conscientiousness: 'Organized achiever who delivers with precision',
    extraversion: 'Dynamic communicator who energizes every room',
    agreeableness: 'Empathetic connector who builds lasting bonds',
    neuroticism: 'Resilient anchor who stays steady under pressure',
  };
  const tagline = taglineMap[dominantDimension] || 'A unique blend of traits that makes you distinctively you';

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto">

        {/* 1. Hero / Profile Header */}
        <PageBanner
          title={primaryArchetype}
          subtitle={tagline}
          icon={Sparkles}
          rightContent={
            <div className="flex items-center gap-3 flex-wrap">
              <ProfileCompleteness completedCount={completionCount} variant="ring" size="sm" showLabel={false} />
              <Button variant="ghost" size="sm" onClick={() => setShowSnapshotCard(!showSnapshotCard)}>
                {showSnapshotCard ? 'Hide Snapshot' : 'Share Profile'}
              </Button>
              {cooldownRemaining && cooldownRemaining > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Retake in {formatCooldown(cooldownRemaining)}</span>
                </div>
              ) : (
                <Link to="/app/personality">
                  <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>Retake</Button>
                </Link>
              )}
            </div>
          }
        />

        {/* Snapshot Card (toggleable) */}
        <AnimatePresence>
          {showSnapshotCard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <PersonalitySnapshotCard
                archetypeName={primaryArchetype}
                topTraits={personalityData?.top_traits?.slice(0, 3) || []}
                scores={scores}
                tagline={tagline}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. OCEAN Radar Chart + Dimension Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <motion.div
            className="lg:col-span-3 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              OCEAN Profile
            </h2>
            {completionCount > 1 && (
              <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                <Sparkles className="w-3 h-3" />
                Enhanced with {completionCount - 1} supplementary assessment{completionCount > 2 ? 's' : ''}
              </p>
            )}
            <OceanMindMap
              scores={scores}
              colors={Object.fromEntries(Object.entries(OCEAN_INFO).map(([k, v]) => [k, v.color]))}
              labels={Object.fromEntries(Object.entries(OCEAN_INFO).map(([k, v]) => [k, v.label]))}
              size="lg"
              animated
              onDimensionClick={(key) => setSelectedDimension(selectedDimension === key ? null : key as keyof typeof OCEAN_INFO)}
              selectedDimension={selectedDimension}
            />
            <p className="text-xs text-center mt-2" style={{ color: 'var(--color-textMuted)' }}>
              Click a dimension to explore details
            </p>
          </motion.div>

          {/* 3. Dimension Breakdown */}
          <motion.div
            className="lg:col-span-2 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {selectedDimension ? (
              <DimensionDetail
                dimension={selectedDimension}
                score={scores[selectedDimension]}
                info={OCEAN_INFO[selectedDimension]}
                onClose={() => setSelectedDimension(null)}
              />
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Layers className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  Dimension Breakdown
                </h2>
                <div className="space-y-4">
                  {(Object.entries(OCEAN_INFO) as [keyof typeof OCEAN_INFO, typeof OCEAN_INFO[keyof typeof OCEAN_INFO]][]).map(([key, info]) => (
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
                              {scores[key]}
                            </span>
                            {expandedDimension === key
                              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
                            }
                          </div>
                        </div>
                      </button>
                      <GradientProgressBar value={scores[key]} showValue={false} size="sm" color={info.color} />
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
                                {(scores[key] >= 50 ? info.highTraits : info.lowTraits).slice(0, 3).map((trait, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: `${info.color}10`, color: info.color }}>
                                    {trait}
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

        {/* 4. Your Archetypes */}
        {personalityData?.top_traits && personalityData.top_traits.length > 0 && (
          <motion.div
            className="p-6 rounded-2xl border mb-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Personality Archetypes
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              Your unique combination shapes how you work, lead, and collaborate
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalityData.top_traits.slice(0, 3).map((trait, index) => {
                const arch = getArchetypeByName(trait);
                const variants: ('primary' | 'secondary' | 'tertiary')[] = ['primary', 'secondary', 'tertiary'];
                return (
                  <ArchetypeCard
                    key={trait}
                    name={trait}
                    description={arch?.description || ''}
                    strengths={arch?.strengths || []}
                    idealEnvironments={arch?.idealEnvironments || []}
                    variant={variants[index]}
                    delay={index * 0.15}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 5. Thinking & Operating Style */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Puzzle className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Thinking & Operating Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Brain, label: 'Decision-Making', value: decisionStyle, color: '#8B5CF6' },
              { icon: MessageCircle, label: 'Communication', value: communicationStyle, color: '#10B981' },
              { icon: Lightbulb, label: 'Problem-Solving', value: problemSolvingStyle, color: '#F59E0B' },
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

        {/* 6. Energy Map */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Battery className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Your Energy Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#10B981' }}>
                <Zap className="w-4 h-4" /> What Energizes You
              </p>
              <div className="space-y-2">
                {energizers.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
                    <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#EF4444' }}>
                <Battery className="w-4 h-4" /> What Drains You
              </p>
              <div className="space-y-2">
                {drainers.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)' }}>
                    <X className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7. Environments You Thrive In */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Environments You Thrive In
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Based on your profile, these are the work environments where you'll do your best work
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: scores.openness > 60 ? Palette : Shield,
                label: scores.openness > 60 ? 'Innovation-Driven' : 'Proven Methods',
                desc: scores.openness > 60 ? 'Values creativity' : 'Values stability',
                color: '#8B5CF6',
              },
              {
                icon: scores.conscientiousness > 60 ? Target : Compass,
                label: scores.conscientiousness > 60 ? 'Goal-Oriented' : 'Flexible Goals',
                desc: scores.conscientiousness > 60 ? 'Clear metrics' : 'Adaptive objectives',
                color: '#10B981',
              },
              {
                icon: scores.extraversion > 60 ? Users : Focus,
                label: scores.extraversion > 60 ? 'Collaborative' : 'Focused Work',
                desc: scores.extraversion > 60 ? 'Team-based' : 'Independent',
                color: '#F59E0B',
              },
              {
                icon: scores.agreeableness > 60 ? Heart : Award,
                label: scores.agreeableness > 60 ? 'People-First' : 'Results-First',
                desc: scores.agreeableness > 60 ? 'Relationships' : 'Outcomes',
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

        {/* 8. Growth Edges */}
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
            Areas where stretching could unlock new opportunities — framed as growth, not weakness
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedScores.slice(-2).map(([key, value]) => {
              const info = OCEAN_INFO[key as keyof typeof OCEAN_INFO];
              const growthTips: Record<string, string> = {
                openness: 'Try experimenting with one new approach per week in your work.',
                conscientiousness: 'Start with small planning habits — even a daily 5-minute review helps.',
                extraversion: 'Practice sharing one idea per meeting, even informally.',
                agreeableness: 'Try active listening exercises to deepen team connections.',
                neuroticism: 'Build a stress toolkit — breathing exercises, journaling, or physical activity.',
              };
              return (
                <div key={key} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <info.icon className="w-4 h-4" style={{ color: info.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{info.fullLabel}</span>
                    <span className="text-xs font-semibold ml-auto" style={{ color: info.color }}>{value}/100</span>
                  </div>
                  <GradientProgressBar value={value} showValue={false} size="sm" color={info.color} />
                  <p className="text-xs mt-2" style={{ color: 'var(--color-textMuted)' }}>
                    {growthTips[key]}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 9. Compatibility Signals */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Compatibility Signals
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-textMuted)' }}>
            What types of teams and companies you'll mesh with best
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Company Size</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {scores.conscientiousness > 65 ? 'Mid-size to Enterprise' : scores.openness > 65 ? 'Startups to Mid-size' : 'Flexible across sizes'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Team Dynamic</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {scores.extraversion > 65 ? 'Collaborative & Social' : scores.extraversion < 35 ? 'Small & Focused' : 'Balanced Teams'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-textMuted)' }}>Management Style</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {scores.conscientiousness > 65 ? 'Structured & Clear' : scores.openness > 65 ? 'Autonomous & Trust-based' : 'Supportive & Flexible'}
              </p>
            </div>
          </div>
          <Link to="/app/matches">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Your Matches
            </Button>
          </Link>
        </motion.div>

        {/* 10. Supplementary Assessments */}
        <motion.div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Rocket className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Enhance Your Profile
          </h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Complete more assessments for a more accurate personality picture
            </p>
            <ProfileCompleteness completedCount={completionCount} variant="ring" size="sm" showLabel={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADDITIONAL_ASSESSMENTS.map(assessment => {
              const AssessmentIcon = assessment.icon;
              const isAvailable = assessment.status === 'available';
              const isCompleted = personalityData
                ? !!(personalityData as unknown as Record<string, unknown>)[assessment.dataField]
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
                    opacity: isAvailable ? 1 : 0.7,
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
                      {!isAvailable && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}>
                          <Lock className="w-3 h-3" />Soon
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
                    {isAvailable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                        onClick={() => handleAssessmentClick(assessment.id, isCompleted, cooldown)}
                      >
                        {isOnCooldown ? `Retake in ${formatCooldown(cooldown!)}` : isCompleted ? 'Retake' : 'Start'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 11. Did You Know? */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <DidYouKnowCard facts={personalityFacts} />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="p-6 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Ready to Find Your Match?</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
            Discover companies whose culture aligns with your personality profile
          </p>
          <Link to="/app/matches">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>View Matches</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Dimension detail panel
function DimensionDetail({
  score,
  info,
  onClose,
}: {
  dimension?: string;
  score: number;
  info: typeof OCEAN_INFO[keyof typeof OCEAN_INFO];
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
            <p className="text-sm" style={{ color: info.color }}>Score: {score}/100</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-background)]">
          <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        </button>
      </div>

      <GradientProgressBar value={score} color={info.color} showValue={false} size="md" />

      <p className="text-sm mt-3 mb-3" style={{ color: 'var(--color-textSecondary)' }}>{info.description}</p>

      <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>Workplace Impact</p>
        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{info.workplaceImpact}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          {score >= 50 ? 'Your Strengths' : 'Your Approach'}
        </h3>
        <ul className="space-y-1.5 mb-4">
          {(score >= 50 ? info.highTraits : info.lowTraits).map((trait, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: info.color }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{trait}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Ideal Roles</h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {info.idealRoles.map((role, i) => (
            <span key={i} className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: `${info.color}15`, color: info.color }}>{role}</span>
          ))}
        </div>

        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Culture Match</h3>
        <div className="flex flex-wrap gap-1.5">
          {info.cultureMatch.map((culture, i) => (
            <span key={i} className="px-2 py-1 rounded-md text-xs" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}>{culture}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PersonalityInsights;
