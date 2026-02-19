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
  ChevronDown,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  ArrowRight,
  Briefcase,
  PlusCircle,
  BarChart3,
  Shield,
  Map,
  Award,
  Star,
  AlertTriangle,
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
  type Archetype,
} from '../../lib/archetypes';
import {
  getAllCompatibilityForEmployer,
} from '../../lib/archetypeCompatibility';
import {
  MatchDetailModal,
  type MatchDetailData,
} from '../matches/MatchDetailModal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EmployerData {
  id: string;
  user_id: string;
  company_name: string;
  openness_preference: number;
  conscientiousness_preference: number;
  extraversion_preference: number;
  agreeableness_preference: number;
  neuroticism_preference: number;
  culture_values: string[];
  description: string;
  industry: string;
  company_size: string;
  location: string;
  logo_url: string | null;
}

interface RoleOption {
  id: string;
  title: string;
  work_style: string | null;
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
}

interface CandidateResult {
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  workStyle: string;
  archetype: { name: string; key: string; description?: string; strengths: string[] };
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  workStyleFit: number;
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
  };
  candidateOcean: OCEANScores;
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

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getMatchColor(score);

  return (
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
  );
}

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScoreDistribution — SVG histogram                                  */
/* ------------------------------------------------------------------ */

function ScoreDistribution({ candidates }: { candidates: CandidateResult[] }) {
  const buckets = [
    { label: '90-100', min: 90, max: 100, color: '#10b981' },
    { label: '80-89', min: 80, max: 89, color: '#06b6d4' },
    { label: '70-79', min: 70, max: 79, color: '#8b5cf6' },
    { label: '60-69', min: 60, max: 69, color: '#f59e0b' },
    { label: '<60', min: 0, max: 59, color: '#ef4444' },
  ];

  const counts = buckets.map(b => ({
    ...b,
    count: candidates.filter(c => c.overallScore >= b.min && c.overallScore <= b.max).length,
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
            <linearGradient key={i} id={`emp-bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
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
                rx={4} fill={`url(#emp-bar-grad-${i})`}
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
/*  ArchetypeDistribution — Horizontal bar chart                       */
/* ------------------------------------------------------------------ */

function ArchetypeDistribution({ candidates }: { candidates: CandidateResult[] }) {
  const archetypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      const name = c.archetype.name;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [candidates]);

  const maxCount = Math.max(...archetypeCounts.map(a => a.count), 1);

  const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#ef4444', '#6366f1', '#14b8a6'];

  return (
    <div className="space-y-2">
      {archetypeCounts.map((item, i) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="text-xs w-28 truncate text-right" style={{ color: 'var(--color-textSecondary)' }}>
            {item.name}
          </span>
          <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: colors[i % colors.length],
                opacity: 0.8,
              }}
            />
          </div>
          <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--color-text)' }}>
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CompatibilityCard                                                  */
/* ------------------------------------------------------------------ */

function CompatibilityCard({ candidateArchetype, bonus, synergy_note }: { candidateArchetype: string; bonus: number; synergy_note: string; friction_note: string }) {
  const color = getBonusColor(bonus);
  const bg = getBonusBg(bonus);

  return (
    <div
      className="rounded-xl p-4 transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {candidateArchetype}
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-background)' }}>
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

export function EmberEmployerPage() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [rawCandidates, setRawCandidates] = useState<any[]>([]);
  const [pendingChats, setPendingChats] = useState(0);
  const [archetype, setArchetype] = useState<(Archetype & { confidence: number }) | null>(null);
  const [insights, setInsights] = useState<EmberInsights | null>(null);
  const [modalCandidate, setModalCandidate] = useState<CandidateResult | null>(null);

  /* ---- Load all data ---- */

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch employer
      const { data: emp } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!emp) {
        setIsLoading(false);
        return;
      }
      setEmployer(emp);

      const employerOcean: OCEANScores = {
        openness: emp.openness_preference || 50,
        conscientiousness: emp.conscientiousness_preference || 50,
        extraversion: emp.extraversion_preference || 50,
        agreeableness: emp.agreeableness_preference || 50,
        neuroticism: emp.neuroticism_preference || 50,
      };

      // Determine culture archetype
      const arch = determineArchetype(employerOcean);
      setArchetype(arch);

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('roles')
        .select('id, title, work_style, required_openness_min, required_openness_max, required_conscientiousness_min, required_conscientiousness_max, required_extraversion_min, required_extraversion_max, required_agreeableness_min, required_agreeableness_max, required_neuroticism_min, required_neuroticism_max')
        .eq('employer_id', emp.id);

      if (rolesData && rolesData.length > 0) {
        setRoles(rolesData);
      }

      // Fetch all candidates with completed assessments
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*, profiles!inner(full_name, email)')
        .not('openness_score', 'is', null);

      if (candidatesData && candidatesData.length > 0) {
        setRawCandidates(candidatesData);
        scoreCandidates(candidatesData, emp, null);
      }

      // Fetch pending coffee chats count
      const { count } = await supabase
        .from('coffee_chats')
        .select('*', { count: 'exact', head: true })
        .eq('employer_id', emp.id)
        .eq('status', 'pending');
      setPendingChats(count || 0);

      // Fetch AI insights
      try {
        const res = await fetch(`${API_BASE}/api/ember/employer-matches/${emp.id}`);
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
        // Backend unavailable
      }
    } catch (err) {
      console.error('Error loading Ember employer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- Score candidates ---- */

  const scoreCandidates = useCallback((
    candidatesData: any[],
    emp: EmployerData,
    role: RoleOption | null,
  ) => {
    const employerOcean: OCEANScores = {
      openness: emp.openness_preference || 50,
      conscientiousness: emp.conscientiousness_preference || 50,
      extraversion: emp.extraversion_preference || 50,
      agreeableness: emp.agreeableness_preference || 50,
      neuroticism: emp.neuroticism_preference || 50,
    };

    const results: CandidateResult[] = candidatesData.map((c: any) => {
      const candidateOcean: OCEANScores = {
        openness: c.openness_score || 50,
        conscientiousness: c.conscientiousness_score || 50,
        extraversion: c.extraversion_score || 50,
        agreeableness: c.agreeableness_score || 50,
        neuroticism: c.neuroticism_score || 50,
      };

      const compatInput: any = {
        candidateOCEAN: candidateOcean,
        employerPreferences: {
          ...employerOcean,
          cultureValues: emp.culture_values || [],
        },
        candidateWorkStyle: c.work_style || undefined,
      };

      if (role) {
        compatInput.roleWorkStyle = role.work_style || undefined;
        compatInput.roleRequirements = {
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
        };
      }

      const result = calculateCompatibility(compatInput);
      const arch = determineArchetype(candidateOcean);

      return {
        candidateId: c.id,
        name: c.profiles?.full_name || 'Unknown',
        headline: c.headline || arch.name,
        location: c.location || '',
        workStyle: c.work_style || '',
        archetype: { name: arch.name, key: arch.key, description: arch.description, strengths: arch.strengths },
        overallScore: result.overallMatchScore,
        traitScore: result.traitMatchScore,
        cultureScore: result.cultureMatchScore,
        workStyleFit: result.breakdown.workStyleFit,
        breakdown: {
          opennessFit: result.breakdown.opennessFit,
          conscientiousnessFit: result.breakdown.conscientiousnessFit,
          extraversionFit: result.breakdown.extraversionFit,
          agreeablenessFit: result.breakdown.agreeablenessFit,
          neuroticismFit: result.breakdown.neuroticismFit,
        },
        candidateOcean,
      };
    });

    results.sort((a, b) => b.overallScore - a.overallScore);
    setCandidates(results);
  }, []);

  /* ---- Role change ---- */

  const handleRoleChange = useCallback((roleId: string | null) => {
    setSelectedRoleId(roleId);
    if (!employer || rawCandidates.length === 0) return;
    const role = roleId ? roles.find(r => r.id === roleId) || null : null;
    scoreCandidates(rawCandidates, employer, role);
  }, [employer, rawCandidates, roles, scoreCandidates]);

  /* ---- Invite to chat ---- */

  const handleInviteChat = useCallback(async (candidate: CandidateResult) => {
    if (!employer) return;
    try {
      const insertData: any = {
        candidate_id: candidate.candidateId,
        employer_id: employer.id,
        initiated_by: 'employer',
        status: 'pending',
        match_score: candidate.overallScore,
      };
      if (selectedRoleId) {
        const role = roles.find(r => r.id === selectedRoleId);
        if (role) {
          insertData.role_id = selectedRoleId;
          insertData.role_title = role.title;
        }
      }
      await supabase.from('coffee_chats').insert(insertData);
      showSuccess('Sent!', 'Coffee chat invitation sent');
      setPendingChats(prev => prev + 1);
    } catch {
      showError('Error', 'Failed to send invitation');
    }
  }, [employer, selectedRoleId, roles, showSuccess, showError]);

  /* ---- Modal data ---- */

  const buildModalData = useCallback((c: CandidateResult): MatchDetailData => {
    if (!employer) {
      return {
        id: c.candidateId,
        name: c.name,
        subtitle: c.headline,
        archetype: c.archetype,
        overallScore: c.overallScore,
        traitScore: c.traitScore,
        cultureScore: c.cultureScore,
        workStyleScore: c.workStyleFit,
        communicationScore: Math.round((c.breakdown.extraversionFit + c.breakdown.agreeablenessFit) / 2),
      };
    }

    return {
      id: c.candidateId,
      name: c.name,
      subtitle: c.headline,
      archetype: c.archetype,
      overallScore: c.overallScore,
      traitScore: c.traitScore,
      cultureScore: c.cultureScore,
      workStyleScore: c.workStyleFit,
      communicationScore: Math.round((c.breakdown.extraversionFit + c.breakdown.agreeablenessFit) / 2),
      dimensionAnalysis: [
        { name: 'Openness', candidate_score: c.candidateOcean.openness, employer_preference: employer.openness_preference || 50, fit_score: c.breakdown.opennessFit, gap: Math.abs(c.candidateOcean.openness - (employer.openness_preference || 50)), direction: c.candidateOcean.openness > (employer.openness_preference || 50) ? 'above' : c.candidateOcean.openness < (employer.openness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Conscientiousness', candidate_score: c.candidateOcean.conscientiousness, employer_preference: employer.conscientiousness_preference || 50, fit_score: c.breakdown.conscientiousnessFit, gap: Math.abs(c.candidateOcean.conscientiousness - (employer.conscientiousness_preference || 50)), direction: c.candidateOcean.conscientiousness > (employer.conscientiousness_preference || 50) ? 'above' : c.candidateOcean.conscientiousness < (employer.conscientiousness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Extraversion', candidate_score: c.candidateOcean.extraversion, employer_preference: employer.extraversion_preference || 50, fit_score: c.breakdown.extraversionFit, gap: Math.abs(c.candidateOcean.extraversion - (employer.extraversion_preference || 50)), direction: c.candidateOcean.extraversion > (employer.extraversion_preference || 50) ? 'above' : c.candidateOcean.extraversion < (employer.extraversion_preference || 50) ? 'below' : 'aligned' },
        { name: 'Agreeableness', candidate_score: c.candidateOcean.agreeableness, employer_preference: employer.agreeableness_preference || 50, fit_score: c.breakdown.agreeablenessFit, gap: Math.abs(c.candidateOcean.agreeableness - (employer.agreeableness_preference || 50)), direction: c.candidateOcean.agreeableness > (employer.agreeableness_preference || 50) ? 'above' : c.candidateOcean.agreeableness < (employer.agreeableness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Stability', candidate_score: 100 - c.candidateOcean.neuroticism, employer_preference: 100 - (employer.neuroticism_preference || 50), fit_score: c.breakdown.neuroticismFit, gap: Math.abs(c.candidateOcean.neuroticism - (employer.neuroticism_preference || 50)), direction: c.candidateOcean.neuroticism < (employer.neuroticism_preference || 50) ? 'above' : c.candidateOcean.neuroticism > (employer.neuroticism_preference || 50) ? 'below' : 'aligned' },
      ],
    };
  }, [employer]);

  /* ---- Profile strength ---- */

  const profileStrength = useMemo(() => {
    if (!employer) return 0;
    let count = 0;
    if (employer.culture_values && employer.culture_values.length > 0) count++;
    if (employer.openness_preference) count++; // OCEAN prefs set
    if (employer.description) count++;
    if (employer.industry) count++;
    if (employer.company_size) count++;
    if (employer.location) count++;
    if (roles.length > 0) count++; // at least 1 role posted
    if (employer.logo_url) count++;
    return count;
  }, [employer, roles]);

  /* ---- Compatibility map ---- */

  const compatibilityMap = useMemo(() => {
    if (!archetype) return [];
    return getAllCompatibilityForEmployer(archetype.name);
  }, [archetype]);

  /* ---- Culture Strengths ---- */

  const cultureStrengths = useMemo(() => {
    if (!employer || !archetype) return [];
    const items: { icon: React.ReactNode; title: string; description: string }[] = [];

    // From archetype strengths
    archetype.strengths.forEach(s => {
      items.push({
        icon: <Award className="w-4 h-4" style={{ color: '#10b981' }} />,
        title: s,
        description: `A key strength of your ${archetype.name} culture`,
      });
    });

    // From high OCEAN preferences
    if ((employer.openness_preference || 50) >= 70) {
      items.push({
        icon: <Lightbulb className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Innovation-Friendly',
        description: 'Your culture attracts creative, open-minded personalities who thrive on new ideas',
      });
    }
    if ((employer.conscientiousness_preference || 50) >= 70) {
      items.push({
        icon: <Target className="w-4 h-4" style={{ color: '#06b6d4' }} />,
        title: 'Quality-Driven',
        description: 'Your high standards attract detail-oriented, disciplined candidates',
      });
    }
    if ((employer.extraversion_preference || 50) >= 75) {
      items.push({
        icon: <Users className="w-4 h-4" style={{ color: '#10b981' }} />,
        title: 'Collaborative Environment',
        description: 'Your culture energizes social, team-oriented personalities',
      });
    }
    if ((employer.agreeableness_preference || 50) >= 70) {
      items.push({
        icon: <Heart className="w-4 h-4" style={{ color: '#ec4899' }} />,
        title: 'Supportive Culture',
        description: 'Your emphasis on empathy and cooperation creates a welcoming environment',
      });
    }
    if ((employer.neuroticism_preference || 50) <= 30) {
      items.push({
        icon: <Shield className="w-4 h-4" style={{ color: '#10b981' }} />,
        title: 'Calm & Stable',
        description: 'Your preference for emotional stability creates a low-stress environment',
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
  }, [employer, archetype, insights]);

  /* ---- Culture Blind Spots ---- */

  const blindSpots = useMemo(() => {
    if (!employer || !archetype || compatibilityMap.length === 0) return [];
    const items: { icon: React.ReactNode; title: string; description: string }[] = [];

    // From lowest compatibility entries
    const lowestEntries = compatibilityMap.filter(e => e.bonus <= -4).slice(-3);
    lowestEntries.forEach(entry => {
      items.push({
        icon: <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: `${entry.candidateArchetype} Friction`,
        description: `May struggle to attract ${entry.candidateArchetype.toLowerCase()} personalities. ${entry.friction_note}`,
      });
    });

    // From extreme OCEAN preferences
    if ((employer.openness_preference || 50) >= 85) {
      items.push({
        icon: <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Very High Innovation Bar',
        description: 'Extremely high openness preference may exclude reliable, process-oriented candidates',
      });
    }
    if ((employer.extraversion_preference || 50) >= 85) {
      items.push({
        icon: <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Extroversion-Heavy Culture',
        description: 'May unintentionally exclude talented introverts who prefer deep, focused work',
      });
    }
    if ((employer.agreeableness_preference || 50) <= 30) {
      items.push({
        icon: <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
        title: 'Low Agreeableness Preference',
        description: 'Competitive culture may deter harmony-seeking candidates who value collaboration',
      });
    }

    // From backend insights
    if (insights?.growth_areas) {
      insights.growth_areas.forEach(g => {
        if (items.length < 4) {
          items.push({
            icon: <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
            title: 'Blind Spot',
            description: g,
          });
        }
      });
    }

    return items.slice(0, 4);
  }, [employer, archetype, compatibilityMap, insights]);

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

  /* ---- No employer setup ---- */

  if (!employer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Complete Your Setup
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Set up your employer profile and take the culture quiz to unlock Ember insights.
          </p>
          <Button onClick={() => navigate('/app/employer/culture')}>Take Culture Quiz</Button>
        </div>
      </div>
    );
  }

  /* ---- Derived values ---- */

  const employerOcean: OCEANScores = {
    openness: employer.openness_preference || 50,
    conscientiousness: employer.conscientiousness_preference || 50,
    extraversion: employer.extraversion_preference || 50,
    agreeableness: employer.agreeableness_preference || 50,
    neuroticism: employer.neuroticism_preference || 50,
  };

  const avgMatchScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.overallScore, 0) / candidates.length)
    : 0;

  const topCandidateScore = candidates.length > 0 ? candidates[0].overallScore : 0;

  const topCandidates = candidates.slice(0, 5);

  /* ---- Render ---- */

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ===== 3a. HERO HEADER ===== */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <EmberFirefly size="xl" mood="happy" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                Ember Insights
              </h1>
              <p className="text-sm mb-3" style={{ color: 'var(--color-textMuted)' }}>
                Your personalized hiring and culture dashboard powered by AI
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                {archetype && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {archetype.name} Culture
                  </span>
                )}
                {employer.industry && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
                  >
                    {employer.industry}
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

        {/* ===== 3b. TALENT LANDSCAPE ===== */}
        <Section
          title="Talent Landscape"
          icon={<BarChart3 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />}
        >
          {candidates.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-textMuted)' }}>
              No candidates have completed assessments yet. Check back soon!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                {/* Score Distribution */}
                <div>
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-textMuted)' }}>
                    Score Distribution
                  </h3>
                  <ScoreDistribution candidates={candidates} />
                </div>

                {/* Archetype Distribution */}
                <div>
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-textMuted)' }}>
                    Candidate Archetypes
                  </h3>
                  <ArchetypeDistribution candidates={candidates} />
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>{topCandidateScore}%</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Top Candidate</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{avgMatchScore}%</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Average Score</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{candidates.length}</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Total Assessed</div>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ===== 3c. IDEAL CANDIDATE PROFILE ===== */}
        <Section
          title="Ideal Candidate Profile"
          icon={<Map className="w-5 h-5" style={{ color: '#8b5cf6' }} />}
        >
          {archetype && (
            <div className="space-y-5">
              {/* Archetype header */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{archetype.name} Culture</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                  {archetype.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Your Ideal Candidate */}
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Your Ideal Candidate
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                    {(() => {
                      const highTraits: string[] = [];
                      if ((employer.openness_preference || 50) >= 65) highTraits.push('openness to experience');
                      if ((employer.conscientiousness_preference || 50) >= 65) highTraits.push('conscientiousness');
                      if ((employer.extraversion_preference || 50) >= 65) highTraits.push('extraversion');
                      if ((employer.agreeableness_preference || 50) >= 65) highTraits.push('agreeableness');
                      if ((employer.neuroticism_preference || 50) <= 35) highTraits.push('emotional stability');
                      const traitStr = highTraits.length > 0
                        ? `Your ideal candidate scores high in ${highTraits.join(' and ')}.`
                        : 'Your culture has balanced personality preferences.';
                      return `${traitStr} They thrive in environments that value ${archetype.strengths.map(s => s.toLowerCase()).join(', ')} and are naturally drawn to ${archetype.idealEnvironments.map(e => e.toLowerCase()).join(', ')}.`;
                    })()}
                  </p>

                  {/* Culture Values */}
                  {employer.culture_values && employer.culture_values.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>
                        Culture Values
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {employer.culture_values.map((val) => (
                          <span
                            key={val}
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* OCEAN Radar Chart */}
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Your OCEAN Preferences
                  </h3>
                  <RadarChart
                    scores={{ ...employerOcean }}
                    size={260}
                    animated
                  />
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ===== 3d. ARCHETYPE COMPATIBILITY MAP ===== */}
        {archetype && compatibilityMap.length > 0 && (
          <Section
            title="Archetype Compatibility Map"
            icon={<Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />}
          >
            <p className="text-sm mb-4" style={{ color: 'var(--color-textMuted)' }}>
              As <strong style={{ color: 'var(--color-text)' }}>{archetype.name}</strong> culture, here&apos;s how different candidate personalities match
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {compatibilityMap.map((entry) => (
                <CompatibilityCard
                  key={entry.candidateKey}
                  candidateArchetype={entry.candidateArchetype}
                  bonus={entry.bonus}
                  synergy_note={entry.synergy_note}
                  friction_note={entry.friction_note}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ===== 3e. CULTURE STRENGTHS ===== */}
        {cultureStrengths.length > 0 && (
          <Section
            title="Culture Strengths"
            icon={<Star className="w-5 h-5" style={{ color: '#10b981' }} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cultureStrengths.map((s, i) => (
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

        {/* ===== 3f. CULTURE BLIND SPOTS ===== */}
        {blindSpots.length > 0 && (
          <Section
            title="Culture Blind Spots"
            icon={<AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blindSpots.map((b, i) => (
                <InsightCard
                  key={i}
                  icon={b.icon}
                  title={b.title}
                  description={b.description}
                  color="#f59e0b"
                />
              ))}
            </div>
          </Section>
        )}

        {/* ===== 3g. TOP CANDIDATES ===== */}
        <Section
          title="Top Candidates"
          icon={<Heart className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />}
          action={
            roles.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedRoleId || ''}
                  onChange={e => handleRoleChange(e.target.value || null)}
                  className="appearance-none pl-7 pr-7 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textSecondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="">All Roles</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <Briefcase className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
              </div>
            ) : undefined
          }
        >
          {topCandidates.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-textMuted)' }}>
              No candidates have completed assessments yet. Check back soon!
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {topCandidates.map((c) => (
                  <div
                    key={c.candidateId}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                    onClick={() => setModalCandidate(c)}
                  >
                    {/* Candidate avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: avatarGradient(c.name) }}
                    >
                      <span className="text-base font-semibold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                        {c.name}
                      </h3>
                      <p className="text-xs line-clamp-1" style={{ color: 'var(--color-textSecondary)' }}>
                        {c.headline}
                      </p>
                      <div className="flex gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                        <span className="flex items-center gap-0.5"><Brain className="w-2.5 h-2.5" style={{ color: 'var(--color-accent)' }} />{c.traitScore}%</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" style={{ color: 'var(--color-warning)' }} />{c.cultureScore}%</span>
                        <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" style={{ color: 'var(--color-success)' }} />{c.workStyleFit}%</span>
                      </div>
                    </div>

                    {/* Archetype badge */}
                    <span
                      className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                    >
                      <Target className="w-2.5 h-2.5" />
                      {c.archetype.name}
                    </span>

                    {/* Score ring */}
                    <ScoreRing score={c.overallScore} size={44} />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setModalCandidate(c); }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="xs"
                        onClick={async (e) => { e.stopPropagation(); await handleInviteChat(c); }}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {candidates.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate('/app/employer/top-candidates')}
                  >
                    View all {candidates.length} candidates
                  </Button>
                </div>
              )}
            </>
          )}
        </Section>

        {/* ===== 3h. RECOMMENDED ACTIONS ===== */}
        <Section
          title="Recommended Actions"
          icon={<ClipboardList className="w-5 h-5" style={{ color: 'var(--color-success)' }} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/employer/roles/new')}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-accent)15` }}>
                <PlusCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Post a new role</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Attract candidates that match your culture</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
            </button>

            {pendingChats > 0 && (
              <button
                onClick={() => navigate('/app/employer/chats')}
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

            <button
              onClick={() => navigate('/app/employer/top-candidates')}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-success)15` }}>
                <Users className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Browse all candidates</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Search, filter, and shortlist candidates</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
            </button>

            <button
              onClick={() => navigate('/app/employer/insights')}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--color-warning)15` }}>
                <Brain className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>View culture insights</p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Deep dive into your culture profile</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
            </button>
          </div>
        </Section>
      </div>

      {/* Match Detail Modal */}
      {modalCandidate && employer && (
        <MatchDetailModal
          isOpen={!!modalCandidate}
          onClose={() => setModalCandidate(null)}
          role="employer"
          matchData={buildModalData(modalCandidate)}
          candidateId={modalCandidate.candidateId}
          employerId={employer.id}
          roleId={selectedRoleId || undefined}
          onRequestChat={() => handleInviteChat(modalCandidate)}
          onAskEmber={() => {}}
        />
      )}
    </div>
  );
}
