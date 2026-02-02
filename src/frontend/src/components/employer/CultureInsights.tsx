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
  Palette,
  Award,
  Building2,
  AlertCircle,
  Focus,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

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
}

const CULTURE_INFO = {
  openness: {
    label: 'open',
    fullLabel: 'openness to experience',
    shortDesc: 'creativity & curiosity',
    description: 'indicates your preference for candidates who are intellectually curious, creative, and open to new ideas. high scores attract innovative thinkers who thrive with ambiguity.',
    workplaceImpact: 'candidates strong in openness excel in roles requiring creative problem-solving, innovation, and adapting to change.',
    highCandidates: [
      'embrace unconventional approaches',
      'generate innovative solutions',
      'adapt quickly to pivots and changes',
      'bring diverse perspectives',
      'challenge status quo constructively',
    ],
    lowCandidates: [
      'provide stability and consistency',
      'excel at refining existing processes',
      'reliable execution of proven methods',
      'detail-oriented implementation',
      'grounded, practical decision-making',
    ],
    idealFor: ['product innovation', 'R&D teams', 'creative departments', 'strategy roles', 'design teams'],
    candidateTypes: ['innovators', 'creative thinkers', 'early adopters'],
    icon: Lightbulb,
    color: '#8B5CF6',
  },
  conscientiousness: {
    label: 'conscient.',
    fullLabel: 'conscientiousness',
    shortDesc: 'organization & discipline',
    description: 'reflects your preference for organized, dependable, and goal-directed candidates. high scores attract disciplined achievers who deliver consistent results.',
    workplaceImpact: 'conscientiousness is the strongest predictor of job performance in most roles, especially those requiring reliability and attention to detail.',
    highCandidates: [
      'meet deadlines consistently',
      'maintain high quality standards',
      'plan and organize effectively',
      'take ownership of responsibilities',
      'drive projects to completion',
    ],
    lowCandidates: [
      'flexible with changing priorities',
      'comfortable with ambiguity',
      'big-picture thinking',
      'adaptable to shifting goals',
      'creative under pressure',
    ],
    idealFor: ['operations', 'project management', 'finance', 'quality assurance', 'compliance'],
    candidateTypes: ['achievers', 'organizers', 'detail-oriented pros'],
    icon: Target,
    color: '#10B981',
  },
  extraversion: {
    label: 'extrav.',
    fullLabel: 'extraversion',
    shortDesc: 'social energy & assertiveness',
    description: 'indicates your preference for socially energetic and outgoing candidates. high scores attract dynamic team players who thrive in collaborative environments.',
    workplaceImpact: 'extraversion influences team dynamics, communication style, and how candidates engage with colleagues and clients.',
    highCandidates: [
      'energize team discussions',
      'build relationships naturally',
      'present ideas confidently',
      'thrive in collaborative settings',
      'lead meetings effectively',
    ],
    lowCandidates: [
      'deep, focused work',
      'thoughtful analysis before speaking',
      'independent contribution',
      'written communication strength',
      'reflective decision-making',
    ],
    idealFor: ['sales', 'client success', 'team leadership', 'public relations', 'recruiting'],
    candidateTypes: ['communicators', 'collaborators', 'relationship builders'],
    icon: Zap,
    color: '#F59E0B',
  },
  agreeableness: {
    label: 'agree.',
    fullLabel: 'agreeableness',
    shortDesc: 'cooperation & empathy',
    description: 'measures your preference for cooperative, empathetic candidates. high scores attract team players who prioritize harmony and support colleagues.',
    workplaceImpact: 'agreeableness affects team cohesion, conflict resolution, and how candidates handle stakeholder relationships.',
    highCandidates: [
      'foster team harmony',
      'skilled at conflict resolution',
      'supportive of colleagues',
      'empathetic communicators',
      'customer-focused approach',
    ],
    lowCandidates: [
      'objective decision-makers',
      'comfortable with tough calls',
      'direct feedback style',
      'competitive drive',
      'challenge ideas constructively',
    ],
    idealFor: ['customer service', 'HR', 'team support', 'healthcare', 'counseling'],
    candidateTypes: ['team players', 'supporters', 'mediators'],
    icon: Heart,
    color: '#EC4899',
  },
  neuroticism: {
    label: 'stability',
    fullLabel: 'emotional stability',
    shortDesc: 'resilience & composure',
    description: 'reflects your preference for emotionally stable, resilient candidates. high stability scores attract calm performers who handle pressure well.',
    workplaceImpact: 'emotional stability influences how candidates handle stress, criticism, and high-pressure situations.',
    highCandidates: [
      'calm under pressure',
      'resilient through setbacks',
      'consistent performance',
      'steady team presence',
      'rational problem-solving',
    ],
    lowCandidates: [
      'highly attuned to risks',
      'passionate about work',
      'thorough due diligence',
      'motivated by urgency',
      'empathetic to concerns',
    ],
    idealFor: ['crisis management', 'executive roles', 'high-stakes negotiations', 'emergency response'],
    candidateTypes: ['steady performers', 'crisis handlers', 'reliable anchors'],
    icon: Anchor,
    color: '#06B6D4',
  },
};

const ENVIRONMENT_INDICATORS = {
  innovation: {
    high: { label: 'innovation-driven', desc: 'you value creative thinking and new approaches' },
    mid: { label: 'balanced innovation', desc: 'you blend innovation with proven methods' },
    low: { label: 'stability-focused', desc: 'you prioritize proven processes and consistency' },
  },
  collaboration: {
    high: { label: 'highly collaborative', desc: 'teamwork and group dynamics are central' },
    mid: { label: 'flexible collaboration', desc: 'mix of team and independent work' },
    low: { label: 'independent focus', desc: 'autonomous work with focused collaboration' },
  },
  pace: {
    high: { label: 'fast-paced', desc: 'dynamic environment with rapid changes' },
    mid: { label: 'balanced pace', desc: 'sustainable rhythm with bursts of intensity' },
    low: { label: 'measured pace', desc: 'steady, thoughtful approach to work' },
  },
};

export function CultureInsights() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cultureData, setCultureData] = useState<CultureData | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<keyof typeof CULTURE_INFO | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Load culture data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('company_name, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values, culture_quiz_completed, updated_at')
        .eq('user_id', user.id)
        .single();

      if (employer) {
        setCultureData(employer as CultureData);

        // Check cooldown (24 hours between assessments)
        if (employer.updated_at) {
          const lastUpdated = new Date(employer.updated_at);
          const timeSince = Date.now() - lastUpdated.getTime();
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

  const hasCompletedAssessment = cultureData?.culture_quiz_completed;

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
            <Building2 className="w-10 h-10" style={{ color: '#8B5CF6' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            define your culture
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            take the culture assessment to define your ideal candidate profile and start matching with compatible talent.
          </p>
          <Link to="/app/employer/culture-assessment">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              start assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const preferences = {
    openness: cultureData?.openness_preference || 0,
    conscientiousness: cultureData?.conscientiousness_preference || 0,
    extraversion: cultureData?.extraversion_preference || 0,
    agreeableness: cultureData?.agreeableness_preference || 0,
    neuroticism: 100 - (cultureData?.neuroticism_preference || 0), // Invert for stability display
  };

  const formatCooldown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const selectedInfo = selectedDimension ? CULTURE_INFO[selectedDimension] : null;
  const selectedScore = selectedDimension ? preferences[selectedDimension] : 0;

  // Calculate derived environment indicators
  const innovationLevel = preferences.openness > 65 ? 'high' : preferences.openness < 35 ? 'low' : 'mid';
  const collaborationLevel = preferences.extraversion > 65 ? 'high' : preferences.extraversion < 35 ? 'low' : 'mid';
  const paceLevel = (preferences.extraversion + preferences.openness) / 2 > 60 ? 'high' : (preferences.extraversion + preferences.openness) / 2 < 40 ? 'low' : 'mid';

  // Find highest priority and development dimensions
  const sortedPrefs = Object.entries(preferences).sort((a, b) => b[1] - a[1]);
  const topPriority = sortedPrefs[0][0] as keyof typeof CULTURE_INFO;
  const flexibleArea = sortedPrefs[sortedPrefs.length - 1][0] as keyof typeof CULTURE_INFO;

  // Mind map positions
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--color-text)' }}
            >
              culture insights
            </h1>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              {cultureData?.company_name ? `${cultureData.company_name}'s ` : 'your '}ideal candidate profile
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
              <Link to="/app/employer/culture-assessment">
                <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
                  retake assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mind Map - 3 columns */}
          <div
            className="lg:col-span-3 p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              ideal candidate map
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
              click any dimension to explore what it means for hiring
            </p>

            {/* SVG Visualization */}
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
                  <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Connection lines */}
                {dimensions.map(({ key, angle, distance }) => {
                  const radian = (angle * Math.PI) / 180;
                  const score = preferences[key];
                  const nodeRadius = 46 + (score / 100) * 12;
                  const endX = centerX + Math.cos(radian) * (distance - nodeRadius);
                  const endY = centerY + Math.sin(radian) * (distance - nodeRadius);
                  const info = CULTURE_INFO[key];
                  const isSelected = selectedDimension === key;
                  const connectorX = centerX + Math.cos(radian) * 85;
                  const connectorY = centerY + Math.sin(radian) * 85;

                  return (
                    <g key={`line-${key}`}>
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
                      <circle
                        cx={connectorX}
                        cy={connectorY}
                        r="6"
                        fill={isSelected ? info.color : 'var(--color-border)'}
                      />
                    </g>
                  );
                })}

                {/* Center circle */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="65"
                  fill="url(#centerGradient)"
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
                  IDEAL
                </text>
                <text
                  x={centerX}
                  y={centerY + 10}
                  textAnchor="middle"
                  fill="var(--color-textMuted)"
                  fontSize="12"
                >
                  candidate
                </text>

                {/* Dimension nodes */}
                {dimensions.map(({ key, angle, distance }) => {
                  const radian = (angle * Math.PI) / 180;
                  const x = centerX + Math.cos(radian) * distance;
                  const y = centerY + Math.sin(radian) * distance;
                  const info = CULTURE_INFO[key];
                  const score = preferences[key];
                  const isSelected = selectedDimension === key;
                  const nodeRadius = 46 + (score / 100) * 12;

                  return (
                    <g
                      key={`node-${key}`}
                      onClick={() => setSelectedDimension(isSelected ? null : key)}
                      className="cursor-pointer"
                      style={{ transition: 'all 0.3s ease' }}
                    >
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
                      <circle
                        cx={x}
                        cy={y}
                        r={nodeRadius}
                        fill={`${info.color}${isSelected ? '30' : '18'}`}
                        stroke={info.color}
                        strokeWidth={isSelected ? 4 : 2.5}
                        className="transition-all duration-300"
                      />
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
                        preference: {selectedScore}/100
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
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>low priority</span>
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>high priority</span>
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
                    hiring impact
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
                    {selectedScore >= 50 ? 'candidates with high scores will' : 'candidates with moderate scores will'}
                  </h3>
                  <ul className="space-y-1.5 mb-4">
                    {(selectedScore >= 50 ? selectedInfo.highCandidates : selectedInfo.lowCandidates).slice(0, 4).map((trait, i) => (
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
                    ideal for roles in
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedInfo.idealFor.map((role, i) => (
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
                    candidate types you'll attract
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInfo.candidateTypes.map((type, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-xs"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}
                      >
                        {type}
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
                  {/* Top priority */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        top priority trait
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: CULTURE_INFO[topPriority].color }}>
                      {CULTURE_INFO[topPriority].label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {CULTURE_INFO[topPriority].shortDesc}
                    </p>
                  </div>

                  {/* Flexible area */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        flexible area
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: CULTURE_INFO[flexibleArea].color }}>
                      {CULTURE_INFO[flexibleArea].label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      more flexibility in this dimension
                    </p>
                  </div>

                  {/* Profile balance */}
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
                      {Math.max(...Object.values(preferences)) - Math.min(...Object.values(preferences)) < 30
                        ? 'well-rounded candidate preferences'
                        : 'strong specific trait priorities'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center mt-4" style={{ color: 'var(--color-textMuted)' }}>
                  click a dimension in the map to explore details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Work Environment */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-6 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Briefcase className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            work environment indicators
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Innovation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  innovation style
                </span>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#8B5CF6' }}>
                  {ENVIRONMENT_INDICATORS.innovation[innovationLevel].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {ENVIRONMENT_INDICATORS.innovation[innovationLevel].desc}
                </p>
              </div>
            </div>

            {/* Collaboration */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  collaboration level
                </span>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#10B981' }}>
                  {ENVIRONMENT_INDICATORS.collaboration[collaborationLevel].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {ENVIRONMENT_INDICATORS.collaboration[collaborationLevel].desc}
                </p>
              </div>
            </div>

            {/* Pace */}
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
                  {ENVIRONMENT_INDICATORS.pace[paceLevel].label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {ENVIRONMENT_INDICATORS.pace[paceLevel].desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Fit Indicators */}
        <div
          className="p-6 rounded-2xl border mt-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <UserCheck className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            candidate fit indicators
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            based on your preferences, you'll match best with candidates who
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: preferences.openness > 60 ? Palette : Shield,
                label: preferences.openness > 60 ? 'innovate freely' : 'execute reliably',
                desc: preferences.openness > 60 ? 'creative problem-solvers' : 'consistent performers',
                color: '#8B5CF6',
              },
              {
                icon: preferences.conscientiousness > 60 ? Target : Compass,
                label: preferences.conscientiousness > 60 ? 'deliver on time' : 'stay flexible',
                desc: preferences.conscientiousness > 60 ? 'deadline-driven achievers' : 'adaptable contributors',
                color: '#10B981',
              },
              {
                icon: preferences.extraversion > 60 ? Users : Focus,
                label: preferences.extraversion > 60 ? 'collaborate openly' : 'focus deeply',
                desc: preferences.extraversion > 60 ? 'team energizers' : 'independent experts',
                color: '#F59E0B',
              },
              {
                icon: preferences.agreeableness > 60 ? Heart : Award,
                label: preferences.agreeableness > 60 ? 'support others' : 'drive results',
                desc: preferences.agreeableness > 60 ? 'team harmonizers' : 'competitive achievers',
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

        {/* Culture Values */}
        {cultureData?.culture_values && cultureData.culture_values.length > 0 && (
          <div
            className="p-6 rounded-2xl border mt-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-lg font-semibold mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              your culture values
            </h2>
            <div className="flex flex-wrap gap-3">
              {cultureData.culture_values.map((value, index) => {
                const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4'];
                const color = colors[index % colors.length];

                return (
                  <span
                    key={value}
                    className="px-4 py-2 rounded-xl font-medium capitalize"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="p-4 rounded-xl border mt-6 flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-textMuted)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              about culture matching
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              this profile is based on the big five (OCEAN) model. research shows personality fit accounts for 15-25% of work performance variance. we use these preferences alongside skills and experience to suggest compatible candidates—never as a sole deciding factor.
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
            ready to find your matches?
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            discover candidates whose personality aligns with your culture
          </p>
          <Link to="/app/employer/candidates">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              browse candidates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CultureInsights;
