import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Coffee,
  Brain,
  Heart,
  Zap,
  Target,
  Eye,
  ChevronRight,
  Lightbulb,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  ArrowRight,
  BarChart3,
  Shield,
  Compass,
  Map,
  Award,
  Star,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { RadarChart } from '../ui/RadarChart';
import { ProfileCompleteness } from '../ui/ProfileCompleteness';
import { EmberFirefly } from './EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import {
  calculateCompatibility,
  type OCEANScores,
} from '../../lib/compatibilityScoring';
import {
  determineArchetype,
  ARCHETYPES,
  type Archetype,
} from '../../lib/archetypes';
import {
  getAllCompatibilityForCandidate,
  type CompatibilityEntry,
} from '../../lib/archetypeCompatibility';
import {
  MatchDetailModal,
  type MatchDetailData,
} from '../matches/MatchDetailModal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CandidateData {
  id: string;
  user_id: string;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  top_traits: string[];
  work_style: string | null;
  headline: string | null;
  location: string | null;
  archetype_name: string | null;
  archetype_key: string | null;
  visual_perception_data: unknown;
  work_values_data: unknown;
  situational_judgment_data: unknown;
  cognitive_patterns_data: unknown;
}

interface RoleData {
  id: string;
  title: string;
  description: string;
  location: string;
  work_style: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_openness_min: number | null;
  required_openness_max: number | null;
  required_conscientiousness_min: number | null;
  required_conscientiousness_max: number | null;
  required_extraversion_min: number | null;
  required_extraversion_max: number | null;
  required_agreeableness_min: number | null;
  required_agreeableness_max: number | null;
  required_neuroticism_min: number | null;
  required_neuroticism_max: number | null;
  employers: {
    id: string;
    company_name: string;
    description: string;
    company_size: string;
    industry: string;
    location: string;
    culture_values: string[];
    openness_preference: number;
    conscientiousness_preference: number;
    extraversion_preference: number;
    agreeableness_preference: number;
    neuroticism_preference: number;
  };
}

interface MatchResult {
  role: RoleData;
  traitMatchScore: number;
  cultureMatchScore: number;
  overallMatchScore: number;
  employerArchetype: { name: string; key: string; description?: string };
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
    workStyleFit: number;
    valuesFit: number;
    roleFit?: number;
  };
  highlightPills: string[];
}

interface EmberInsights {
  ember_message?: string;
  strengths?: string[];
  growth_areas?: string[];
  tips?: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const API_BASE = 'http://127.0.0.1:8000';

function getMatchColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

function generateHighlightPills(match: {
  cultureMatchScore: number;
  traitMatchScore: number;
  breakdown: { workStyleFit: number; valuesFit: number };
}): string[] {
  const pills: string[] = [];
  if (match.cultureMatchScore >= 80) pills.push('Strong Culture Fit');
  if (match.breakdown.valuesFit >= 75) pills.push('Values Aligned');
  if (match.breakdown.workStyleFit >= 85) pills.push('Work Style Match');
  if (match.traitMatchScore >= 80) pills.push('Personality Match');
  return pills.slice(0, 3);
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #d946ef)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
];

function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getBonusColor(bonus: number): string {
  if (bonus >= 5) return '#10b981';
  if (bonus >= 0) return '#f59e0b';
  return '#ef4444';
}

function getBonusBg(bonus: number): string {
  if (bonus >= 5) return 'rgba(16, 185, 129, 0.1)';
  if (bonus >= 0) return 'rgba(245, 158, 11, 0.1)';
  return 'rgba(239, 68, 68, 0.1)';
}

/* ------------------------------------------------------------------ */
/*  ScoreRing                                                          */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 52, label }: { score: number; size?: number; label?: string }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getMatchColor(score);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] leading-tight" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScoreDistribution — SVG histogram                                  */
/* ------------------------------------------------------------------ */

function ScoreDistribution({ matches }: { matches: MatchResult[] }) {
  const buckets = [
    { label: '90-100', min: 90, max: 100, color: '#10b981' },
    { label: '80-89', min: 80, max: 89, color: '#06b6d4' },
    { label: '70-79', min: 70, max: 79, color: '#8b5cf6' },
    { label: '60-69', min: 60, max: 69, color: '#f59e0b' },
    { label: '<60', min: 0, max: 59, color: '#ef4444' },
  ];

  const counts = buckets.map(b => ({
    ...b,
    count: matches.filter(m => m.overallMatchScore >= b.min && m.overallMatchScore <= b.max).length,
  }));

  const maxCount = Math.max(...counts.map(c => c.count), 1);
  const barWidth = 48;
  const barGap = 12;
  const chartHeight = 120;
  const svgWidth = counts.length * (barWidth + barGap) - barGap;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${svgWidth} ${chartHeight + 30}`} className="w-full mx-auto" style={{ maxWidth: `${svgWidth}px` }}>
        <defs>
          {counts.map((b, i) => (
            <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>
        {counts.map((b, i) => {
          const x = i * (barWidth + barGap);
          const barHeight = maxCount > 0 ? (b.count / maxCount) * chartHeight : 0;
          const y = chartHeight - barHeight;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barWidth} height={barHeight}
                rx={4} fill={`url(#bar-grad-${i})`}
              />
              {b.count > 0 && (
                <text
                  x={x + barWidth / 2} y={y - 6}
                  textAnchor="middle" fill={b.color}
                  fontSize="12" fontWeight="700"
                >
                  {b.count}
                </text>
              )}
              <text
                x={x + barWidth / 2} y={chartHeight + 16}
                textAnchor="middle" fill="var(--color-textMuted)"
                fontSize="10"
              >
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CompatibilityCard                                                  */
/* ------------------------------------------------------------------ */

function CompatibilityCard({ employerArchetype, bonus, synergy_note }: CompatibilityEntry & { employerArchetype: string }) {
  const color = getBonusColor(bonus);
  const bg = getBonusBg(bonus);

  return (
    <div
      className="rounded-xl p-4 transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {employerArchetype}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: bg, color }}
        >
          {bonus > 0 ? '+' : ''}{bonus}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
        {synergy_note}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  InsightCard                                                        */
/* ------------------------------------------------------------------ */

function InsightCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{title}</h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function EmberAgent() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [pendingChats, setPendingChats] = useState(0);
  const [archetype, setArchetype] = useState<(Archetype & { confidence: number }) | null>(null);
  const [insights, setInsights] = useState<EmberInsights | null>(null);
  const [modalMatch, setModalMatch] = useState<MatchResult | null>(null);

  /* ---- Load all data ---- */

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch candidate
      const { data: cand, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (candErr || !cand || cand.openness_score === null) {
        setCandidate(null);
        setIsLoading(false);
        return;
      }

      setCandidate(cand);

      const candidateOcean: OCEANScores = {
        openness: cand.openness_score || 50,
        conscientiousness: cand.conscientiousness_score || 50,
        extraversion: cand.extraversion_score || 50,
        agreeableness: cand.agreeableness_score || 50,
        neuroticism: cand.neuroticism_score || 50,
      };

      // Determine archetype
      const arch = determineArchetype(candidateOcean);
      setArchetype(arch);

      // Fetch roles for matching
      const { data: roles } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (roles && roles.length > 0) {
        const matchResults: MatchResult[] = roles.map((role: RoleData) => {
          const employer = role.employers;
          const result = calculateCompatibility({
            candidateOCEAN: candidateOcean,
            employerPreferences: {
              openness: employer.openness_preference || 50,
              conscientiousness: employer.conscientiousness_preference || 50,
              extraversion: employer.extraversion_preference || 50,
              agreeableness: employer.agreeableness_preference || 50,
              neuroticism: employer.neuroticism_preference || 50,
              cultureValues: employer.culture_values || [],
            },
            candidateWorkStyle: cand.work_style || undefined,
            roleWorkStyle: role.work_style || undefined,
            roleRequirements: {
              required_openness_min: role.required_openness_min,
              required_openness_max: role.required_openness_max,
              required_conscientiousness_min: role.required_conscientiousness_min,
              required_conscientiousness_max: role.required_conscientiousness_max,
              required_extraversion_min: role.required_extraversion_min,
              required_extraversion_max: role.required_extraversion_max,
              required_agreeableness_min: role.required_agreeableness_min,
              required_agreeableness_max: role.required_agreeableness_max,
              required_neuroticism_min: role.required_neuroticism_min,
              required_neuroticism_max: role.required_neuroticism_max,
              work_style: role.work_style,
            },
          });

          const employerOcean: OCEANScores = {
            openness: employer.openness_preference || 50,
            conscientiousness: employer.conscientiousness_preference || 50,
            extraversion: employer.extraversion_preference || 50,
            agreeableness: employer.agreeableness_preference || 50,
            neuroticism: employer.neuroticism_preference || 50,
          };
          const empArchetype = determineArchetype(employerOcean);

          return {
            role,
            traitMatchScore: result.traitMatchScore,
            cultureMatchScore: result.cultureMatchScore,
            overallMatchScore: result.overallMatchScore,
            employerArchetype: { name: empArchetype.name, key: empArchetype.key, description: empArchetype.description },
            breakdown: result.breakdown,
            highlightPills: generateHighlightPills({
              cultureMatchScore: result.cultureMatchScore,
              traitMatchScore: result.traitMatchScore,
              breakdown: result.breakdown,
            }),
          };
        });

        matchResults.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
        setMatches(matchResults);
      }

      // Fetch pending coffee chats count
      const { count } = await supabase
        .from('coffee_chats')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', cand.id)
        .eq('status', 'pending');
      setPendingChats(count || 0);

      // Fetch AI insights from backend
      try {
        const res = await fetch(`${API_BASE}/api/ember/candidate-matches/${cand.id}`);
        if (res.ok) {
          const data = await res.json();
          setInsights({
            ember_message: data.ember_message || data.message,
            strengths: data.strengths || [],
            growth_areas: data.growth_areas || [],
            tips: data.tips || data.recommendations || [],
          });
        }
      } catch {
        // Backend unavailable — insights will be null
      }
    } catch (err) {
      console.error('Error loading Ember data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- Coffee chat handler ---- */

  const handleRequestChat = useCallback(async (match: MatchResult) => {
    if (!candidate) return;
    try {
      await supabase.from('coffee_chats').insert({
        candidate_id: candidate.id,
        employer_id: match.role.employers.id,
        role_id: match.role.id,
        initiated_by: 'candidate',
        status: 'pending',
        message: `Interested in ${match.role.title}`,
        role_title: match.role.title,
        match_score: match.overallMatchScore,
      });
      showSuccess('Sent!', 'Coffee chat request sent');
      setPendingChats(prev => prev + 1);
    } catch {
      showError('Error', 'Failed to send request');
    }
  }, [candidate, showSuccess, showError]);

  /* ---- Modal data ---- */

  const buildModalData = useCallback((match: MatchResult): MatchDetailData => {
    if (!candidate) {
      return {
        id: match.role.id,
        name: match.role.employers.company_name,
        subtitle: match.role.title,
        archetype: match.employerArchetype,
        overallScore: match.overallMatchScore,
        traitScore: match.traitMatchScore,
        cultureScore: match.cultureMatchScore,
        workStyleScore: match.breakdown.workStyleFit,
        communicationScore: Math.round((match.breakdown.extraversionFit + match.breakdown.agreeablenessFit) / 2),
      };
    }

    const employer = match.role.employers;
    return {
      id: match.role.id,
      name: employer.company_name,
      subtitle: match.role.title,
      archetype: match.employerArchetype,
      overallScore: match.overallMatchScore,
      traitScore: match.traitMatchScore,
      cultureScore: match.cultureMatchScore,
      workStyleScore: match.breakdown.workStyleFit,
      communicationScore: Math.round((match.breakdown.extraversionFit + match.breakdown.agreeablenessFit) / 2),
      dimensionAnalysis: [
        { name: 'Openness', candidate_score: candidate.openness_score, employer_preference: employer.openness_preference || 50, fit_score: match.breakdown.opennessFit, gap: Math.abs(candidate.openness_score - (employer.openness_preference || 50)), direction: candidate.openness_score > (employer.openness_preference || 50) ? 'above' : candidate.openness_score < (employer.openness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Conscientiousness', candidate_score: candidate.conscientiousness_score, employer_preference: employer.conscientiousness_preference || 50, fit_score: match.breakdown.conscientiousnessFit, gap: Math.abs(candidate.conscientiousness_score - (employer.conscientiousness_preference || 50)), direction: candidate.conscientiousness_score > (employer.conscientiousness_preference || 50) ? 'above' : candidate.conscientiousness_score < (employer.conscientiousness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Extraversion', candidate_score: candidate.extraversion_score, employer_preference: employer.extraversion_preference || 50, fit_score: match.breakdown.extraversionFit, gap: Math.abs(candidate.extraversion_score - (employer.extraversion_preference || 50)), direction: candidate.extraversion_score > (employer.extraversion_preference || 50) ? 'above' : candidate.extraversion_score < (employer.extraversion_preference || 50) ? 'below' : 'aligned' },
        { name: 'Agreeableness', candidate_score: candidate.agreeableness_score, employer_preference: employer.agreeableness_preference || 50, fit_score: match.breakdown.agreeablenessFit, gap: Math.abs(candidate.agreeableness_score - (employer.agreeableness_preference || 50)), direction: candidate.agreeableness_score > (employer.agreeableness_preference || 50) ? 'above' : candidate.agreeableness_score < (employer.agreeableness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Stability', candidate_score: 100 - candidate.neuroticism_score, employer_preference: 100 - (employer.neuroticism_preference || 50), fit_score: match.breakdown.neuroticismFit, gap: Math.abs(candidate.neuroticism_score - (employer.neuroticism_preference || 50)), direction: candidate.neuroticism_score < (employer.neuroticism_preference || 50) ? 'above' : candidate.neuroticism_score > (employer.neuroticism_preference || 50) ? 'below' : 'aligned' },
      ],
    };
  }, [candidate]);

  /* ---- Profile strength ---- */

  const profileStrength = useMemo(() => {
    if (!candidate) return 0;
    let count = 0;
    if (candidate.openness_score !== null) count++; // OCEAN assessment
    if (candidate.headline) count++;
    if (candidate.location) count++;
    if (candidate.work_style) count++;
    if (candidate.visual_perception_data) count++;
    if (candidate.work_values_data) count++;
    if (candidate.situational_judgment_data) count++;
    if (candidate.cognitive_patterns_data) count++;
    return count;
  }, [candidate]);

  /* ---- Derived strengths ---- */

  const strengths = useMemo(() => {
    if (!candidate || !archetype) return [];
    const items: { icon: React.ReactNode; title: string; description: string }[] = [];

    // From archetype strengths
    archetype.strengths.forEach(s => {
      items.push({
        icon: <Award className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
        title: s,
        description: `A core strength of ${archetype.name} archetype`,
      });
    });

    // From high OCEAN scores
    if (candidate.openness_score >= 80) {
      items.push({
        icon: <Lightbulb className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Creative Problem Solving',
        description: 'Your high openness makes you stand out in innovation-focused roles',
      });
    }
    if (candidate.conscientiousness_score >= 80) {
      items.push({
        icon: <Target className="w-4 h-4" style={{ color: '#06b6d4' }} />,
        title: 'Exceptional Reliability',
        description: 'Your high conscientiousness signals strong discipline and follow-through',
      });
    }
    if (candidate.extraversion_score >= 80) {
      items.push({
        icon: <Users className="w-4 h-4" style={{ color: '#10b981' }} />,
        title: 'Natural Leadership',
        description: 'Your high extraversion means you thrive in team and client-facing roles',
      });
    }
    if (candidate.agreeableness_score >= 80) {
      items.push({
        icon: <Heart className="w-4 h-4" style={{ color: '#ec4899' }} />,
        title: 'Team Harmony',
        description: 'Your high agreeableness makes you a valued collaborator and mediator',
      });
    }
    if (candidate.neuroticism_score <= 20) {
      items.push({
        icon: <Shield className="w-4 h-4" style={{ color: '#10b981' }} />,
        title: 'Emotional Resilience',
        description: 'Your exceptional emotional stability helps you thrive under pressure',
      });
    }

    // From backend insights
    if (insights?.strengths) {
      insights.strengths.forEach(s => {
        if (items.length < 6) {
          items.push({
            icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />,
            title: 'AI Insight',
            description: s,
          });
        }
      });
    }

    return items.slice(0, 6);
  }, [candidate, archetype, insights]);

  /* ---- Derived growth opportunities ---- */

  const growthAreas = useMemo(() => {
    if (!candidate || !archetype) return [];
    const items: { icon: React.ReactNode; title: string; description: string; tip: string }[] = [];

    if (candidate.openness_score < 40) {
      items.push({
        icon: <Compass className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Expanding Horizons',
        description: 'Lower openness may limit opportunities in innovation-driven environments',
        tip: 'Try exploring creative side projects or brainstorming sessions to build comfort with new ideas',
      });
    }
    if (candidate.conscientiousness_score < 40) {
      items.push({
        icon: <ClipboardList className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Building Structure',
        description: 'Lower conscientiousness may be a concern for process-heavy roles',
        tip: 'Adopt a task management system and set clear deadlines to demonstrate reliability',
      });
    }
    if (candidate.extraversion_score < 40) {
      items.push({
        icon: <Users className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Expanding Your Network',
        description: 'Lower extraversion may limit visibility in team-oriented cultures',
        tip: 'Start with small networking events or virtual coffee chats to build comfort in social settings',
      });
    }
    if (candidate.agreeableness_score < 40) {
      items.push({
        icon: <Heart className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Collaborative Edge',
        description: 'Lower agreeableness may create friction in harmony-focused teams',
        tip: 'Practice active listening and acknowledge others\' perspectives before presenting your own',
      });
    }
    if (candidate.neuroticism_score >= 70) {
      items.push({
        icon: <Shield className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Stress Management',
        description: 'Higher emotional sensitivity may impact performance in high-pressure environments',
        tip: 'Develop mindfulness or breathing techniques to build resilience during stressful periods',
      });
    }

    // From backend insights
    if (insights?.growth_areas) {
      insights.growth_areas.forEach(g => {
        if (items.length < 4) {
          items.push({
            icon: <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
            title: 'Growth Opportunity',
            description: g,
            tip: 'Focus on targeted development in this area to broaden your match potential',
          });
        }
      });
    }

    return items.slice(0, 4);
  }, [candidate, archetype, insights]);

  /* ---- Compatibility map ---- */

  const compatibilityMap = useMemo(() => {
    if (!archetype) return [];
    return getAllCompatibilityForCandidate(archetype.key);
  }, [archetype]);

  /* ---- Loading ---- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <EmberFirefly size="lg" mood="thinking" animated />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Preparing your insights...
          </p>
        </div>
      </div>
    );
  }

  /* ---- No assessment state ---- */

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Complete Your Assessment First
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Take our personality assessment to unlock Ember insights, discover your archetype, and find your best matches.
          </p>
          <Button onClick={() => navigate('/app/personality')}>Start Assessment</Button>
        </div>
      </div>
    );
  }

  /* ---- Derived values ---- */

  const candidateOcean: OCEANScores = {
    openness: candidate.openness_score,
    conscientiousness: candidate.conscientiousness_score,
    extraversion: candidate.extraversion_score,
    agreeableness: candidate.agreeableness_score,
    neuroticism: candidate.neuroticism_score,
  };

  const avgMatchScore = matches.length > 0
    ? Math.round(matches.reduce((sum, m) => sum + m.overallMatchScore, 0) / matches.length)
    : 0;

  const topMatchScore = matches.length > 0 ? matches[0].overallMatchScore : 0;

  const topMatches = matches.slice(0, 5);

  // Percentile position: what % of matches does the top score beat
  const percentile = matches.length > 1
    ? Math.round((matches.filter(m => m.overallMatchScore < topMatchScore).length / matches.length) * 100)
    : 0;

  /* ---- Render ---- */

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ===== 2a. HERO HEADER ===== */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <EmberFirefly size="xl" mood="happy" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                Ember Insights
              </h1>
              <p className="text-sm mb-3" style={{ color: 'var(--color-textMuted)' }}>
                Your personalized personality matching dashboard powered by AI
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                {archetype && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {archetype.name}
                  </span>
                )}
                {archetype && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
                  >
                    {archetype.confidence}% confidence
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <ProfileCompleteness
              completedCount={profileStrength}
              totalCount={8}
              variant="bar"
              size="sm"
            />
          </div>
        </div>

        {/* ===== 2b. MATCH LANDSCAPE ===== */}
        <Section
          title="Match Landscape"
          icon={<BarChart3 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />}
        >
          {matches.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-textMuted)' }}>
              No matches available yet. Check back once employers post roles!
            </p>
          ) : (
            <>
              {/* Score Distribution Histogram */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-textMuted)' }}>
                  Score Distribution
                </h3>
                <ScoreDistribution matches={matches} />
              </div>

              {/* Key Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>{topMatchScore}%</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Top Match</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{avgMatchScore}%</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Average Score</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{matches.length}</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Total Matches</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: '#f59e0b' }}>{percentile}th</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Top Percentile</div>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ===== 2c. IDEAL ENVIRONMENT PROFILE ===== */}
        <Section
          title="Ideal Environment Profile"
          icon={<Map className="w-5 h-5" style={{ color: '#8b5cf6' }} />}
        >
          {archetype && (
            <div className="space-y-5">
              {/* Archetype header */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{archetype.name}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                  {archetype.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Your Ideal Workplace */}
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Your Ideal Workplace
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                    You thrive in environments like {archetype.idealEnvironments.join(', ').toLowerCase()}.
                    Your strengths in {archetype.strengths.map(s => s.toLowerCase()).join(', ')} make
                    you a natural fit for teams that value these qualities and provide room for them to flourish.
                  </p>

                  {/* Culture Values That Suit You */}
                  <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>
                    Culture Values That Suit You
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ARCHETYPES[archetype.key]?.idealCultures?.map((culture) => (
                      <span
                        key={culture}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                      >
                        {culture}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OCEAN Radar Chart */}
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Your OCEAN Signature
                  </h3>
                  <RadarChart
                    scores={{ ...candidateOcean }}
                    size={260}
                    animated
                  />
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ===== 2d. ARCHETYPE COMPATIBILITY MAP ===== */}
        {archetype && compatibilityMap.length > 0 && (
          <Section
            title="Archetype Compatibility Map"
            icon={<Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />}
          >
            <p className="text-sm mb-4" style={{ color: 'var(--color-textMuted)' }}>
              As <strong style={{ color: 'var(--color-text)' }}>{archetype.name}</strong>, here&apos;s how you match with different company cultures
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {compatibilityMap.map((entry) => (
                <CompatibilityCard
                  key={entry.employerArchetype}
                  employerArchetype={entry.employerArchetype}
                  bonus={entry.bonus}
                  synergy_note={entry.synergy_note}
                  friction_note={entry.friction_note}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ===== 2e. STRENGTHS IN THE JOB MARKET ===== */}
        {strengths.length > 0 && (
          <Section
            title="Strengths in the Job Market"
            icon={<Star className="w-5 h-5" style={{ color: '#10b981' }} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {strengths.map((s, i) => (
                <InsightCard
                  key={i}
                  icon={s.icon}
                  title={s.title}
                  description={s.description}
                  color="#10b981"
                />
              ))}
            </div>
          </Section>
        )}

        {/* ===== 2f. GROWTH OPPORTUNITIES ===== */}
        {growthAreas.length > 0 && (
          <Section
            title="Growth Opportunities"
            icon={<Rocket className="w-5 h-5" style={{ color: '#f59e0b' }} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {growthAreas.map((g, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 transition-all hover:shadow-sm"
                  style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                    >
                      {g.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{g.title}</h4>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-textMuted)' }}>{g.description}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-accent)' }}>{g.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ===== 2g. TOP 5 MATCHES ===== */}
        <Section
          title="Top Matches"
          icon={<Heart className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />}
        >
          {topMatches.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-textMuted)' }}>
              No active roles available yet. Check back soon!
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {topMatches.map((match) => {
                  const companyName = match.role.employers.company_name;
                  return (
                    <div
                      key={match.role.id}
                      className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm cursor-pointer"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                      onClick={() => setModalMatch(match)}
                    >
                      {/* Company avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: avatarGradient(companyName) }}
                      >
                        <span className="text-base font-semibold text-white">
                          {companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                          {companyName}
                        </h3>
                        <p className="text-xs line-clamp-1" style={{ color: 'var(--color-textSecondary)' }}>
                          {match.role.title}
                        </p>
                        {/* Mini score breakdown */}
                        <div className="flex gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                          <span className="flex items-center gap-0.5"><Brain className="w-2.5 h-2.5" style={{ color: 'var(--color-accent)' }} />{match.traitMatchScore}%</span>
                          <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" style={{ color: 'var(--color-warning)' }} />{match.cultureMatchScore}%</span>
                          <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" style={{ color: 'var(--color-success)' }} />{match.breakdown.workStyleFit}%</span>
                        </div>
                      </div>

                      {/* Highlight pills (mobile hidden) */}
                      <div className="hidden md:flex flex-wrap gap-1 max-w-[180px]">
                        {match.highlightPills.map((pill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: pill.includes('Culture') ? `var(--color-success)15` : `var(--color-accent)15`,
                              color: pill.includes('Culture') ? 'var(--color-success)' : 'var(--color-accent)',
                            }}
                          >
                            {pill}
                          </span>
                        ))}
                      </div>

                      {/* Score ring */}
                      <ScoreRing score={match.overallMatchScore} size={44} />

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); setModalMatch(match); }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="xs"
                          onClick={async (e) => { e.stopPropagation(); await handleRequestChat(match); }}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {matches.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate('/app/matches')}
                  >
                    View all {matches.length} matches
                  </Button>
                </div>
              )}
            </>
          )}
        </Section>

        {/* ===== 2h. RECOMMENDED ACTIONS ===== */}
        <Section
          title="Recommended Actions"
          icon={<ClipboardList className="w-5 h-5" style={{ color: 'var(--color-success)' }} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!candidate.headline && (
              <button
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-warning)15` }}>
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Complete your profile</p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Add a headline to improve match accuracy</p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}

            <button
              onClick={() => navigate('/app/assessment')}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-accent)15` }}>
                <Brain className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Take supplementary assessments</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Deepen your personality profile</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
            </button>

            <button
              onClick={() => navigate('/app/matches')}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-success)15` }}>
                <Target className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Explore all matches</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Browse and filter all available roles</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
            </button>

            {pendingChats > 0 && (
              <button
                onClick={() => navigate('/app/chats')}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef3c715' }}>
                  <Coffee className="w-4 h-4" style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Review pending chats</p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>You have {pendingChats} pending coffee chat{pendingChats !== 1 ? 's' : ''}</p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>
        </Section>
      </div>

      {/* Match Detail Modal */}
      {modalMatch && candidate && (
        <MatchDetailModal
          isOpen={!!modalMatch}
          onClose={() => setModalMatch(null)}
          role="candidate"
          matchData={buildModalData(modalMatch)}
          candidateId={candidate.id}
          employerId={modalMatch.role.employers.id}
          roleId={modalMatch.role.id}
          onRequestChat={() => handleRequestChat(modalMatch)}
          onAskEmber={() => {}}
        />
      )}
    </div>
  );
}
