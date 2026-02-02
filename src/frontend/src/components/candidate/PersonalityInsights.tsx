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
  MessageCircle,
  Focus,
  Palette,
  Award,
  Building2,
  Handshake,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../utils/cn';

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
    label: 'open',
    fullLabel: 'openness to experience',
    shortDesc: 'creativity & curiosity',
    description: 'measures your intellectual curiosity, creativity, and preference for novelty and variety. high scorers tend to be imaginative, open to new experiences, and appreciate art and beauty.',
    workplaceImpact: 'in the workplace, openness influences how you approach problem-solving, adapt to change, and engage with innovative ideas.',
    highTraits: [
      'creative and imaginative thinking',
      'intellectual curiosity and love of learning',
      'appreciation for art, beauty, and aesthetics',
      'comfort with ambiguity and abstract concepts',
      'willingness to try new approaches',
    ],
    lowTraits: [
      'practical and grounded decision-making',
      'preference for proven methods',
      'focus on concrete, tangible outcomes',
      'consistency and predictability',
      'detail-oriented execution',
    ],
    idealRoles: ['product design', 'research & development', 'marketing', 'strategy', 'content creation'],
    cultureMatch: ['innovative startups', 'creative agencies', 'research institutions'],
    icon: Lightbulb,
    color: '#8B5CF6',
  },
  conscientiousness: {
    label: 'conscient.',
    fullLabel: 'conscientiousness',
    shortDesc: 'organization & discipline',
    description: 'reflects your tendency to be organized, dependable, and goal-directed. high scorers are typically disciplined, responsible, and achievement-oriented.',
    workplaceImpact: 'conscientiousness is the strongest personality predictor of job performance across most occupations, according to industrial psychology research.',
    highTraits: [
      'strong organizational skills',
      'reliable and meets deadlines consistently',
      'attention to detail and quality',
      'self-disciplined and motivated',
      'plans ahead and thinks strategically',
    ],
    lowTraits: [
      'flexible and spontaneous approach',
      'comfortable with last-minute changes',
      'big-picture focus over details',
      'adaptable to shifting priorities',
      'creative problem-solving under pressure',
    ],
    idealRoles: ['project management', 'operations', 'finance', 'quality assurance', 'data analysis'],
    cultureMatch: ['structured enterprises', 'regulated industries', 'process-driven organizations'],
    icon: Target,
    color: '#10B981',
  },
  extraversion: {
    label: 'extrav.',
    fullLabel: 'extraversion',
    shortDesc: 'social energy & assertiveness',
    description: 'indicates how much you are energized by social interaction and external stimulation. high scorers are outgoing, talkative, and draw energy from being around others.',
    workplaceImpact: 'extraversion influences your collaboration style, leadership approach, and how you build professional relationships.',
    highTraits: [
      'energized by teamwork and collaboration',
      'natural communicator and presenter',
      'builds rapport easily with others',
      'comfortable leading meetings and discussions',
      'thrives in fast-paced, social environments',
    ],
    lowTraits: [
      'deep, focused work without distractions',
      'thoughtful listener and observer',
      'independent problem-solving',
      'written communication strength',
      'reflective decision-making',
    ],
    idealRoles: ['sales', 'leadership', 'public relations', 'client success', 'team management'],
    cultureMatch: ['collaborative teams', 'client-facing roles', 'high-energy environments'],
    icon: Zap,
    color: '#F59E0B',
  },
  agreeableness: {
    label: 'agree.',
    fullLabel: 'agreeableness',
    shortDesc: 'cooperation & empathy',
    description: 'measures your tendency toward cooperation, trust, and consideration for others. high scorers are typically warm, friendly, and prioritize harmony in relationships.',
    workplaceImpact: 'agreeableness affects team dynamics, conflict resolution, and your approach to negotiation and stakeholder management.',
    highTraits: [
      'builds harmonious team relationships',
      'empathetic and understanding',
      'skilled at conflict resolution',
      'collaborative and supportive colleague',
      'customer and people-focused',
    ],
    lowTraits: [
      'objective and analytical thinking',
      'comfortable with difficult decisions',
      'direct and straightforward feedback',
      'competitive drive for results',
      'challenges ideas constructively',
    ],
    idealRoles: ['human resources', 'customer service', 'healthcare', 'teaching', 'counseling'],
    cultureMatch: ['people-first cultures', 'service industries', 'mission-driven organizations'],
    icon: Heart,
    color: '#EC4899',
  },
  neuroticism: {
    label: 'stability',
    fullLabel: 'emotional stability',
    shortDesc: 'resilience & composure',
    description: 'reflects your emotional resilience and ability to remain calm under pressure. high stability scorers handle stress well and maintain composure in challenging situations.',
    workplaceImpact: 'emotional stability influences how you handle pressure, respond to criticism, and maintain performance during stressful periods.',
    highTraits: [
      'calm under pressure and deadlines',
      'resilient when facing setbacks',
      'consistent performance during stress',
      'rational approach to challenges',
      'steady emotional presence for team',
    ],
    lowTraits: [
      'highly attuned to potential risks',
      'passionate and emotionally invested',
      'detail-conscious and thorough',
      'motivated by urgency and stakes',
      'empathetic to others\' concerns',
    ],
    idealRoles: ['crisis management', 'executive leadership', 'high-stakes negotiations', 'emergency services'],
    cultureMatch: ['fast-paced startups', 'high-pressure industries', 'crisis-responsive organizations'],
    icon: Anchor,
    color: '#06B6D4',
  },
};

const WORK_STYLE_INSIGHTS = {
  collaboration: {
    high: { label: 'team-oriented', desc: 'you thrive in collaborative environments and bring out the best in group settings' },
    mid: { label: 'balanced', desc: 'you adapt well between solo and team work depending on the task' },
    low: { label: 'independent', desc: 'you do your best work with autonomy and focused solo time' },
  },
  structure: {
    high: { label: 'structured', desc: 'you excel with clear processes, defined roles, and organized systems' },
    mid: { label: 'flexible', desc: 'you can work in both structured and fluid environments' },
    low: { label: 'autonomous', desc: 'you thrive with freedom to define your own approach and processes' },
  },
  pace: {
    high: { label: 'fast-paced', desc: 'you\'re energized by dynamic, rapidly-changing environments' },
    mid: { label: 'rhythmic', desc: 'you balance intensity with sustainable work patterns' },
    low: { label: 'steady', desc: 'you deliver consistent quality with thoughtful, measured approaches' },
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
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div
          className="max-w-md w-full p-8 rounded-2xl border text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
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
            discover your personality
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            take the personality assessment to unlock your insights and find jobs that truly fit your style.
          </p>
          <Link to="/app/personality">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              start assessment
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
              personality insights
            </h1>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              your OCEAN profile and workplace compatibility analysis
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
                  retake in {formatCooldown(cooldownRemaining)}
                </span>
              </div>
            ) : (
              <Link to="/app/personality">
                <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
                  retake assessment
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
              mind map
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              click any dimension to explore detailed insights
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
                  profile
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
                        score: {selectedScore}/100
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
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>low</span>
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>high</span>
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
                    workplace impact
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
                    {selectedScore >= 50 ? 'your strengths' : 'your approach'}
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
                    ideal roles
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
                    culture match
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
                  quick overview
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
                        strongest dimension
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
                        growth opportunity
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: OCEAN_INFO[growthDimension].color }}>
                      {OCEAN_INFO[growthDimension].label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      developing this area can expand your opportunities
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
                        profile balance
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                      {Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 30
                        ? 'well-balanced across all dimensions'
                        : 'distinctive peaks showing clear strengths'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center mt-4" style={{ color: 'var(--color-textMuted)' }}>
                  click a dimension in the mind map to explore details
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
            work style compatibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Collaboration Style */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  collaboration style
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
                  structure preference
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
                  work pace
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
            culture fit indicators
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            based on your profile, you're likely to thrive in environments with these characteristics
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: scores.openness > 60 ? Palette : Shield,
                label: scores.openness > 60 ? 'innovation-driven' : 'proven methods',
                desc: scores.openness > 60 ? 'values creativity and new ideas' : 'values stability and best practices',
                color: '#8B5CF6',
              },
              {
                icon: scores.conscientiousness > 60 ? Target : Compass,
                label: scores.conscientiousness > 60 ? 'goal-oriented' : 'flexible goals',
                desc: scores.conscientiousness > 60 ? 'clear metrics and milestones' : 'adaptive objectives',
                color: '#10B981',
              },
              {
                icon: scores.extraversion > 60 ? Users : Focus,
                label: scores.extraversion > 60 ? 'collaborative' : 'focused work',
                desc: scores.extraversion > 60 ? 'team-based decision making' : 'independent contribution',
                color: '#F59E0B',
              },
              {
                icon: scores.agreeableness > 60 ? Heart : Award,
                label: scores.agreeableness > 60 ? 'people-first' : 'results-first',
                desc: scores.agreeableness > 60 ? 'emphasizes relationships' : 'emphasizes outcomes',
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

        {/* Trait Constellations */}
        {personalityData?.top_traits && personalityData.top_traits.length > 0 && (
          <div
            className="p-6 rounded-2xl border mt-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              personality archetypes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalityData.top_traits.slice(0, 3).map((trait, index) => {
                const Icon = CONSTELLATION_ICONS[trait] || Sparkles;
                const colors = ['#8B5CF6', '#F59E0B', '#10B981'];
                const labels = ['primary archetype', 'secondary archetype', 'tertiary archetype'];

                return (
                  <div
                    key={trait}
                    className="p-5 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
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
                          className="text-xs"
                          style={{ color: colors[index] }}
                        >
                          {labels[index]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Research-backed disclaimer */}
        <div
          className="p-4 rounded-xl border mt-6 flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-textMuted)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              about this assessment
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              this profile is based on the big five (OCEAN) model, one of the most scientifically validated frameworks in personality psychology. research shows personality accounts for 15-25% of work performance variance. we use this as one factor among many to suggest compatible matches—never as a sole deciding factor.
            </p>
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
            ready to find your match?
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            discover companies whose culture aligns with your personality profile
          </p>
          <Link to="/app/matches">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              view matches
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PersonalityInsights;
