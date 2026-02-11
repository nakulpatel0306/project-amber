import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Briefcase,
  TrendingUp,
  Shield,
  Rocket,
  Scale,
  Focus,
  Palette,
  Award,
  Building2,
  AlertCircle,
  Eye,
  MessageSquare,
  Lock,
  Beaker,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { getArchetypeByName } from '../../lib/archetypes';

interface PersonalityData {
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;
  top_traits: string[] | null;
  assessment_completed_at: string | null;
}

const OCEAN_INFO = {
  openness: {
    label: 'Open',
    fullLabel: 'Openness to Experience',
    shortDesc: 'Creativity & Curiosity',
    description: 'Measures your intellectual curiosity, creativity, and preference for novelty and variety. High scorers tend to be imaginative, open to new experiences, and appreciate art and beauty.',
    workplaceImpact: 'In the workplace, openness influences how you approach problem-solving, adapt to change, and engage with innovative ideas.',
    highTraits: [
      'Creative and imaginative thinking',
      'Intellectual curiosity and love of learning',
      'Appreciation for art, beauty, and aesthetics',
      'Comfort with ambiguity and abstract concepts',
      'Willingness to try new approaches',
    ],
    lowTraits: [
      'Practical and grounded decision-making',
      'Preference for proven methods',
      'Focus on concrete, tangible outcomes',
      'Consistency and predictability',
      'Detail-oriented execution',
    ],
    idealRoles: ['Product Design', 'Research & Development', 'Marketing', 'Strategy', 'Content Creation'],
    cultureMatch: ['Innovative Startups', 'Creative Agencies', 'Research Institutions'],
    icon: Lightbulb,
    color: '#8B5CF6',
  },
  conscientiousness: {
    label: 'Conscient.',
    fullLabel: 'Conscientiousness',
    shortDesc: 'Organization & Discipline',
    description: 'Reflects your tendency to be organized, dependable, and goal-directed. High scorers are typically disciplined, responsible, and achievement-oriented.',
    workplaceImpact: 'Conscientiousness is the strongest personality predictor of job performance across most occupations, according to industrial psychology research.',
    highTraits: [
      'Strong organizational skills',
      'Reliable and meets deadlines consistently',
      'Attention to detail and quality',
      'Self-disciplined and motivated',
      'Plans ahead and thinks strategically',
    ],
    lowTraits: [
      'Flexible and spontaneous approach',
      'Comfortable with last-minute changes',
      'Big-picture focus over details',
      'Adaptable to shifting priorities',
      'Creative problem-solving under pressure',
    ],
    idealRoles: ['Project Management', 'Operations', 'Finance', 'Quality Assurance', 'Data Analysis'],
    cultureMatch: ['Structured Enterprises', 'Regulated Industries', 'Process-Driven Organizations'],
    icon: Target,
    color: '#10B981',
  },
  extraversion: {
    label: 'Extrav.',
    fullLabel: 'Extraversion',
    shortDesc: 'Social Energy & Assertiveness',
    description: 'Indicates how much you are energized by social interaction and external stimulation. High scorers are outgoing, talkative, and draw energy from being around others.',
    workplaceImpact: 'Extraversion influences your collaboration style, leadership approach, and how you build professional relationships.',
    highTraits: [
      'Energized by teamwork and collaboration',
      'Natural communicator and presenter',
      'Builds rapport easily with others',
      'Comfortable leading meetings and discussions',
      'Thrives in fast-paced, social environments',
    ],
    lowTraits: [
      'Deep, focused work without distractions',
      'Thoughtful listener and observer',
      'Independent problem-solving',
      'Written communication strength',
      'Reflective decision-making',
    ],
    idealRoles: ['Sales', 'Leadership', 'Public Relations', 'Client Success', 'Team Management'],
    cultureMatch: ['Collaborative Teams', 'Client-Facing Roles', 'High-Energy Environments'],
    icon: Zap,
    color: '#F59E0B',
  },
  agreeableness: {
    label: 'Agree.',
    fullLabel: 'Agreeableness',
    shortDesc: 'Cooperation & Empathy',
    description: 'Measures your tendency toward cooperation, trust, and consideration for others. High scorers are typically warm, friendly, and prioritize harmony in relationships.',
    workplaceImpact: 'Agreeableness affects team dynamics, conflict resolution, and your approach to negotiation and stakeholder management.',
    highTraits: [
      'Builds harmonious team relationships',
      'Empathetic and understanding',
      'Skilled at conflict resolution',
      'Collaborative and supportive colleague',
      'Customer and people-focused',
    ],
    lowTraits: [
      'Objective and analytical thinking',
      'Comfortable with difficult decisions',
      'Direct and straightforward feedback',
      'Competitive drive for results',
      'Challenges ideas constructively',
    ],
    idealRoles: ['Human Resources', 'Customer Service', 'Healthcare', 'Teaching', 'Counseling'],
    cultureMatch: ['People-First Cultures', 'Service Industries', 'Mission-Driven Organizations'],
    icon: Heart,
    color: '#EC4899',
  },
  neuroticism: {
    label: 'Stability',
    fullLabel: 'Emotional Stability',
    shortDesc: 'Resilience & Composure',
    description: 'Reflects your emotional resilience and ability to remain calm under pressure. High stability scorers handle stress well and maintain composure in challenging situations.',
    workplaceImpact: 'Emotional stability influences how you handle pressure, respond to criticism, and maintain performance during stressful periods.',
    highTraits: [
      'Calm under pressure and deadlines',
      'Resilient when facing setbacks',
      'Consistent performance during stress',
      'Rational approach to challenges',
      'Steady emotional presence for team',
    ],
    lowTraits: [
      'Highly attuned to potential risks',
      'Passionate and emotionally invested',
      'Detail-conscious and thorough',
      'Motivated by urgency and stakes',
      'Empathetic to others\' concerns',
    ],
    idealRoles: ['Crisis Management', 'Executive Leadership', 'High-Stakes Negotiations', 'Emergency Services'],
    cultureMatch: ['Fast-Paced Startups', 'High-Pressure Industries', 'Crisis-Responsive Organizations'],
    icon: Anchor,
    color: '#06B6D4',
  },
};

const WORK_STYLE_INSIGHTS = {
  collaboration: {
    high: { label: 'Team-Oriented', desc: 'You thrive in collaborative environments and bring out the best in group settings' },
    mid: { label: 'Balanced', desc: 'You adapt well between solo and team work depending on the task' },
    low: { label: 'Independent', desc: 'You do your best work with autonomy and focused solo time' },
  },
  structure: {
    high: { label: 'Structured', desc: 'You excel with clear processes, defined roles, and organized systems' },
    mid: { label: 'Flexible', desc: 'You can work in both structured and fluid environments' },
    low: { label: 'Autonomous', desc: 'You thrive with freedom to define your own approach and processes' },
  },
  pace: {
    high: { label: 'Fast-Paced', desc: 'You\'re energized by dynamic, rapidly-changing environments' },
    mid: { label: 'Rhythmic', desc: 'You balance intensity with sustainable work patterns' },
    low: { label: 'Steady', desc: 'You deliver consistent quality with thoughtful, measured approaches' },
  },
};

const CONSTELLATION_ICONS: Record<string, React.ElementType> = {
  'The Innovator': Lightbulb,
  'The Architect': Layers,
  'The Catalyst': Zap,
  'The Harmonizer': Heart,
  'The Craftsperson': Target,
  'The Explorer': Compass,
  'The Anchor': Anchor,
  'The Strategist': Brain,
};

const ADDITIONAL_ASSESSMENTS = [
  {
    id: 'visual-perception',
    name: 'Visual Perception Test',
    description: 'Discover your perceptual style through visual challenges. What do you see first in ambiguous images?',
    icon: Eye,
    color: '#8B5CF6',
    duration: '~5 min',
    status: 'available' as const,
    traits: ['Perceptual style', 'Attention patterns', 'Cognitive flexibility'],
  },
  {
    id: 'work-values',
    name: 'Work Values Assessment',
    description: 'Rank and prioritize what matters most to you in a workplace to refine your culture match.',
    icon: Scale,
    color: '#10B981',
    duration: '~8 min',
    status: 'coming_soon' as const,
    traits: ['Value priorities', 'Motivation drivers', 'Deal-breakers'],
  },
  {
    id: 'communication-style',
    name: 'Communication Style Quiz',
    description: 'Understand how you express ideas, give feedback, and collaborate with different personality types.',
    icon: MessageSquare,
    color: '#F59E0B',
    duration: '~6 min',
    status: 'coming_soon' as const,
    traits: ['Expression style', 'Feedback approach', 'Conflict handling'],
  },
  {
    id: 'cognitive-patterns',
    name: 'Cognitive Patterns Assessment',
    description: 'Explore your problem-solving approach, decision-making style, and learning preferences.',
    icon: GraduationCap,
    color: '#EC4899',
    duration: '~10 min',
    status: 'coming_soon' as const,
    traits: ['Problem-solving style', 'Decision framework', 'Learning preference'],
  },
];

export function PersonalityInsights() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<keyof typeof OCEAN_INFO | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Load personality data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits, assessment_completed_at')
        .eq('user_id', user.id)
        .single();

      if (candidate) {
        setPersonalityData(candidate as PersonalityData);

        // Check cooldown
        if (candidate.assessment_completed_at) {
          const lastCompleted = new Date(candidate.assessment_completed_at);
          const timeSince = Date.now() - lastCompleted.getTime();
          const cooldownMs = 24 * 60 * 60 * 1000;

          if (timeSince < cooldownMs) {
            setCooldownRemaining(cooldownMs - timeSince);
          }
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const hasCompletedAssessment = personalityData?.openness_score !== null && personalityData?.openness_score !== undefined;

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return (
      <div
        className="flex-1 flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: 'var(--color-background)', minHeight: 'calc(100vh - 80px)' }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <Brain className="w-10 h-10" style={{ color: '#8B5CF6' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            Discover Your Personality
          </h1>
          <p
            className="mb-6 max-w-sm mx-auto"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Take the personality assessment to unlock your insights and find jobs that truly fit your style.
          </p>
          <Link to="/app/personality">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const scores = {
    openness: personalityData?.openness_score || 0,
    conscientiousness: personalityData?.conscientiousness_score || 0,
    extraversion: personalityData?.extraversion_score || 0,
    agreeableness: personalityData?.agreeableness_score || 0,
    neuroticism: 100 - (personalityData?.neuroticism_score || 0), // Invert for stability
  };

  const formatCooldown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const selectedInfo = selectedDimension ? OCEAN_INFO[selectedDimension] : null;
  const selectedScore = selectedDimension ? scores[selectedDimension] : 0;

  // Calculate derived insights
  const collaborationStyle = scores.extraversion > 65 ? 'high' : scores.extraversion < 35 ? 'low' : 'mid';
  const structurePreference = scores.conscientiousness > 65 ? 'high' : scores.conscientiousness < 35 ? 'low' : 'mid';
  const pacePreference = (scores.extraversion + scores.openness) / 2 > 60 ? 'high' : (scores.extraversion + scores.openness) / 2 < 40 ? 'low' : 'mid';

  // Find dominant and growth dimensions
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominantDimension = sortedScores[0][0] as keyof typeof OCEAN_INFO;
  const growthDimension = sortedScores[sortedScores.length - 1][0] as keyof typeof OCEAN_INFO;

  // Brain node positions (center point for brain, then 5 dimensions around it)
  const dimensions = [
    { key: 'openness' as const, angle: -90, distance: 150 },
    { key: 'conscientiousness' as const, angle: -18, distance: 150 },
    { key: 'extraversion' as const, angle: 54, distance: 150 },
    { key: 'agreeableness' as const, angle: 126, distance: 150 },
    { key: 'neuroticism' as const, angle: 198, distance: 150 },
  ];

  const centerX = 290;
  const centerY = 220;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with cooldown timer */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--color-text)' }}
            >
              Personality Insights
            </h1>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Your OCEAN Profile and Workplace Compatibility Analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {cooldownRemaining && cooldownRemaining > 0 ? (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <Clock className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  Retake in {formatCooldown(cooldownRemaining)}
                </span>
              </div>
            ) : (
              <Link to="/app/personality">
                <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
                  Retake Assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mind Map Visualization - 3 columns */}
          <div
            className="lg:col-span-3 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Mind Map
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              Click any dimension to explore detailed insights
            </p>

            {/* Brain SVG Visualization */}
            <div className="relative">
              <svg viewBox="0 0 580 440" className="w-full mx-auto" style={{ maxWidth: '600px' }}>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Connection lines FIRST (behind everything) */}
                {dimensions.map(({ key, angle, distance }) => {
                  const radian = (angle * Math.PI) / 180;
                  const score = scores[key];
                  const nodeRadius = 46 + (score / 100) * 12;

                  // End point stops at the edge of the node circle
                  const endX = centerX + Math.cos(radian) * (distance - nodeRadius);
                  const endY = centerY + Math.sin(radian) * (distance - nodeRadius);
                  const info = OCEAN_INFO[key];
                  const isSelected = selectedDimension === key;

                  // Connector point (just outside center circle)
                  const connectorX = centerX + Math.cos(radian) * 85;
                  const connectorY = centerY + Math.sin(radian) * 85;

                  return (
                    <g key={`line-${key}`}>
                      {/* Line from connector to node edge */}
                      <line
                        x1={connectorX}
                        y1={connectorY}
                        x2={endX}
                        y2={endY}
                        stroke={isSelected ? info.color : 'var(--color-border)'}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={isSelected ? 'none' : '6 3'}
                        opacity={isSelected ? 1 : 0.5}
                      />

                      {/* Connector dot */}
                      <circle
                        cx={connectorX}
                        cy={connectorY}
                        r="6"
                        fill={isSelected ? info.color : 'var(--color-border)'}
                      />
                    </g>
                  );
                })}

                {/* Central brain icon area */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="65"
                  fill="url(#brainGradient)"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize="14"
                  fontWeight="600"
                >
                  OCEAN
                </text>
                <text
                  x={centerX}
                  y={centerY + 10}
                  textAnchor="middle"
                  fill="var(--color-textMuted)"
                  fontSize="12"
                >
                  Profile
                </text>

                {/* Dimension nodes (on top) */}
                {dimensions.map(({ key, angle, distance }) => {
                  const radian = (angle * Math.PI) / 180;
                  const x = centerX + Math.cos(radian) * distance;
                  const y = centerY + Math.sin(radian) * distance;
                  const info = OCEAN_INFO[key];
                  const score = scores[key];
                  const isSelected = selectedDimension === key;
                  const nodeRadius = 46 + (score / 100) * 12;

                  return (
                    <g
                      key={`node-${key}`}
                      onClick={() => setSelectedDimension(isSelected ? null : key)}
                      className="cursor-pointer"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      {/* Glow effect for selected */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={nodeRadius + 8}
                          fill="none"
                          stroke={info.color}
                          strokeWidth="3"
                          opacity="0.4"
                          filter="url(#glow)"
                        />
                      )}

                      {/* Background circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={nodeRadius}
                        fill={`${info.color}${isSelected ? '30' : '18'}`}
                        stroke={info.color}
                        strokeWidth={isSelected ? 4 : 2.5}
                        className="transition-all duration-300"
                      />

                      {/* Score text */}
                      <text
                        x={x}
                        y={y - 2}
                        textAnchor="middle"
                        fill={info.color}
                        fontSize="22"
                        fontWeight="bold"
                      >
                        {score}
                      </text>

                      {/* Dimension label */}
                      <text
                        x={x}
                        y={y + 16}
                        textAnchor="middle"
                        fill="var(--color-textSecondary)"
                        fontSize="11"
                        fontWeight="500"
                      >
                        {info.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Side Panel - 2 columns */}
          <div
            className="lg:col-span-2 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {selectedInfo ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedInfo.color}20` }}
                    >
                      <selectedInfo.icon className="w-6 h-6" style={{ color: selectedInfo.color }} />
                    </div>
                    <div>
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {selectedInfo.fullLabel}
                      </h2>
                      <p className="text-sm" style={{ color: selectedInfo.color }}>
                        Score: {selectedScore}/100
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDimension(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-background)]"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                  </button>
                </div>

                {/* Score bar */}
                <div className="mb-4">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${selectedScore}%`,
                        backgroundColor: selectedInfo.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Low</span>
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>High</span>
                  </div>
                </div>

                <p
                  className="text-sm mb-4"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  {selectedInfo.description}
                </p>

                <div
                  className="p-3 rounded-lg mb-4"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Workplace Impact
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    {selectedInfo.workplaceImpact}
                  </p>
                </div>

                <div className="flex-1 overflow-auto">
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {selectedScore >= 50 ? 'Your Strengths' : 'Your Approach'}
                  </h3>
                  <ul className="space-y-1.5 mb-4">
                    {(selectedScore >= 50 ? selectedInfo.highTraits : selectedInfo.lowTraits).slice(0, 4).map((trait, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: selectedInfo.color }} />
                        <span style={{ color: 'var(--color-textSecondary)' }}>{trait}</span>
                      </li>
                    ))}
                  </ul>

                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Ideal Roles
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedInfo.idealRoles.map((role, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-xs"
                        style={{ backgroundColor: `${selectedInfo.color}15`, color: selectedInfo.color }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Culture Match
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInfo.cultureMatch.map((culture, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-xs"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}
                      >
                        {culture}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <h2
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  <Compass className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  Quick Overview
                </h2>

                <div className="space-y-4 flex-1">
                  {/* Dominant dimension */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Strongest Dimension
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: OCEAN_INFO[dominantDimension].color }}>
                      {OCEAN_INFO[dominantDimension].label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {OCEAN_INFO[dominantDimension].shortDesc}
                    </p>
                  </div>

                  {/* Growth area */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Growth Opportunity
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: OCEAN_INFO[growthDimension].color }}>
                      {OCEAN_INFO[growthDimension].label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      Developing this area can expand your opportunities
                    </p>
                  </div>

                  {/* Overall balance */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Profile Balance
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      {Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 30
                        ? 'Well-balanced across all dimensions'
                        : 'Distinctive peaks showing clear strengths'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center mt-4" style={{ color: 'var(--color-textMuted)' }}>
                  Click a dimension in the mind map to explore details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Work Style Compatibility */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-6 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Briefcase className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Work Style Compatibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Collaboration Style */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Collaboration Style
                </span>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#8B5CF6' }}>
                  {WORK_STYLE_INSIGHTS.collaboration[collaborationStyle].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {WORK_STYLE_INSIGHTS.collaboration[collaborationStyle].desc}
                </p>
              </div>
            </div>

            {/* Structure Preference */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Structure Preference
                </span>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#10B981' }}>
                  {WORK_STYLE_INSIGHTS.structure[structurePreference].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {WORK_STYLE_INSIGHTS.structure[structurePreference].desc}
                </p>
              </div>
            </div>

            {/* Pace Preference */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Work Pace
                </span>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#F59E0B' }}>
                  {WORK_STYLE_INSIGHTS.pace[pacePreference].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {WORK_STYLE_INSIGHTS.pace[pacePreference].desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Culture Fit Indicators */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Culture Fit Indicators
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Based on your profile, you're likely to thrive in environments with these characteristics
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: scores.openness > 60 ? Palette : Shield,
                label: scores.openness > 60 ? 'Innovation-Driven' : 'Proven Methods',
                desc: scores.openness > 60 ? 'Values creativity and new ideas' : 'Values stability and best practices',
                color: '#8B5CF6',
              },
              {
                icon: scores.conscientiousness > 60 ? Target : Compass,
                label: scores.conscientiousness > 60 ? 'Goal-Oriented' : 'Flexible Goals',
                desc: scores.conscientiousness > 60 ? 'Clear metrics and milestones' : 'Adaptive objectives',
                color: '#10B981',
              },
              {
                icon: scores.extraversion > 60 ? Users : Focus,
                label: scores.extraversion > 60 ? 'Collaborative' : 'Focused Work',
                desc: scores.extraversion > 60 ? 'Team-based decision making' : 'Independent contribution',
                color: '#F59E0B',
              },
              {
                icon: scores.agreeableness > 60 ? Heart : Award,
                label: scores.agreeableness > 60 ? 'People-First' : 'Results-First',
                desc: scores.agreeableness > 60 ? 'Emphasizes relationships' : 'Emphasizes outcomes',
                color: '#EC4899',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  {item.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Archetypes - Enhanced */}
        {personalityData?.top_traits && personalityData.top_traits.length > 0 && (
          <div
            className="p-6 rounded-2xl border mt-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-lg font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Personality Archetypes
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              Your unique combination of archetypes shapes how you work, lead, and collaborate
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalityData.top_traits.slice(0, 3).map((trait, index) => {
                const Icon = CONSTELLATION_ICONS[trait] || Sparkles;
                const colors = ['#8B5CF6', '#F59E0B', '#10B981'];
                const labels = ['Primary Archetype', 'Secondary Archetype', 'Tertiary Archetype'];
                const archetype = getArchetypeByName(trait);

                return (
                  <div
                    key={trait}
                    className="p-5 rounded-xl"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: index === 0 ? `2px solid ${colors[index]}30` : '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${colors[index]}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: colors[index] }} />
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {trait}
                        </p>
                        <p
                          className="text-xs font-medium"
                          style={{ color: colors[index] }}
                        >
                          {labels[index]}
                        </p>
                      </div>
                    </div>
                    {archetype && (
                      <>
                        <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                          {archetype.description}
                        </p>
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                            Key Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {archetype.strengths.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-xs"
                                style={{ backgroundColor: `${colors[index]}12`, color: colors[index] }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                            Ideal Environments
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {archetype.idealEnvironments.map((env, i) => (
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Why This Assessment */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Beaker className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Why the OCEAN Assessment?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            The science behind your personality profile
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              >
                <GraduationCap className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </div>
              <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                Scientific Foundation
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                The Big Five (OCEAN) model has over 40 years of peer-reviewed research and is the most scientifically validated framework in personality psychology.
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <Briefcase className="w-5 h-5" style={{ color: '#10B981' }} />
              </div>
              <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                Workplace Relevance
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Research shows personality accounts for 15-25% of work performance variance. Conscientiousness is the single strongest personality predictor of job success.
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Users className="w-5 h-5" style={{ color: '#F59E0B' }} />
              </div>
              <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                Culture Matching
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                OCEAN dimensions map naturally to team dynamics, leadership styles, and organizational culture. We use this as one factor among many for compatible matches.
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              This is your base assessment. Your personality profile becomes more accurate and nuanced as you complete additional assessments below. You can retake any assessment every 24 hours.
            </p>
          </div>
        </div>

        {/* Enhance Your Profile - Additional Assessments */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Rocket className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Enhance Your Profile
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Take additional assessments to build a more complete and accurate personality picture
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADDITIONAL_ASSESSMENTS.map(assessment => {
              const AssessmentIcon = assessment.icon;
              const isAvailable = assessment.status === 'available';

              return (
                <div
                  key={assessment.id}
                  className="p-5 rounded-xl flex gap-4 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    border: isAvailable ? `1px solid ${assessment.color}40` : '1px solid var(--color-border)',
                    opacity: isAvailable ? 1 : 0.7,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${assessment.color}15` }}
                  >
                    <AssessmentIcon className="w-6 h-6" style={{ color: assessment.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                        {assessment.name}
                      </h3>
                      {!isAvailable && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
                        >
                          <Lock className="w-3 h-3" />
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-textMuted)' }}>
                      {assessment.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {assessment.traits.map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ backgroundColor: `${assessment.color}10`, color: assessment.color }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--color-textMuted)' }}>
                        {assessment.duration}
                      </span>
                    </div>
                    {isAvailable && (
                      <Link to={`/app/assessments/${assessment.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                        >
                          Start Assessment
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          className="mt-6 p-6 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Ready to Find Your Match?
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Discover companies whose culture aligns with your personality profile
          </p>
          <Link to="/app/matches">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              View Matches
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PersonalityInsights;
