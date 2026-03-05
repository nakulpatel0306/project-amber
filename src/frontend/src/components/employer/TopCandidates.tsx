import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Coffee,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Brain,
  Heart,
  Briefcase,
  Zap,
  Target,
  Star,
  Users,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
// ScoreRing is defined locally in this component
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { EmberFirefly } from '../ember/EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { MatchDetailModal, type MatchDetailData } from '../matches/MatchDetailModal';
import { MatchPipeline } from '../matches/MatchPipeline';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import type { PipelineTab } from '../../types/matching.types';

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
  work_style?: string;
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
  valuesFit: number;
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
  };
  candidateOcean: OCEANScores;
}

type SortOption = 'overall' | 'culture' | 'trait' | 'archetype';

/* ------------------------------------------------------------------ */
/*  ScoreRing                                                          */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

const AVATAR_COLORS = [
  '#6366f1',
  '#f43f5e',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TopCandidates() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);

  // Roles
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [selectedArchetypes, setSelectedArchetypes] = useState<Set<string>>(new Set());
  const [selectedWorkStyleFilter, setSelectedWorkStyleFilter] = useState<string | null>(null);

  // Sort
  const [sortBy, setSortBy] = useState<SortOption>('overall');

  // Modal
  const [modalCandidate, setModalCandidate] = useState<CandidateResult | null>(null);

  // Shortlist (now backed by Supabase)
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  // Pipeline
  const [activeView, setActiveView] = useState<'browse' | 'pipeline'>('browse');
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>('saved');
  const { savedMatches, unsave: unsaveMatch, counts: pipelineCounts } = useSavedMatches();

  // Raw candidates data (before scoring — allows re-scoring when role changes)
  const [rawCandidates, setRawCandidates] = useState<any[]>([]);

  /* ---- Derived data ---- */

  const uniqueArchetypes = useMemo(
    () => [...new Set(candidates.map(c => c.archetype.name))].sort(),
    [candidates]
  );

  const activeFilterCount =
    (minScore > 0 ? 1 : 0) +
    (maxScore < 100 ? 1 : 0) +
    (selectedArchetypes.size > 0 ? 1 : 0) +
    (selectedWorkStyleFilter ? 1 : 0);

  const filteredCandidates = useMemo(() => {
    let result = candidates.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.headline.toLowerCase().includes(q) &&
          !c.archetype.name.toLowerCase().includes(q) &&
          !(c.location || '').toLowerCase().includes(q)
        ) return false;
      }
      if (c.overallScore < minScore || c.overallScore > maxScore) return false;
      if (selectedArchetypes.size > 0 && !selectedArchetypes.has(c.archetype.name)) return false;
      if (selectedWorkStyleFilter && c.workStyle !== selectedWorkStyleFilter) return false;
      return true;
    });

    switch (sortBy) {
      case 'overall':
        result.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'culture':
        result.sort((a, b) => b.cultureScore - a.cultureScore);
        break;
      case 'trait':
        result.sort((a, b) => b.traitScore - a.traitScore);
        break;
      case 'archetype':
        result.sort((a, b) => a.archetype.name.localeCompare(b.archetype.name));
        break;
    }

    return result;
  }, [candidates, searchQuery, minScore, maxScore, selectedArchetypes, selectedWorkStyleFilter, sortBy]);

  /* ---- Data Loading ---- */

  useEffect(() => {
    if (!user) return;
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
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

      // Fetch roles for this employer
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

      if (!candidatesData || candidatesData.length === 0) {
        setCandidates([]);
        setIsLoading(false);
        return;
      }

      setRawCandidates(candidatesData);
      scoreCandidates(candidatesData, emp, null);
    } catch (err) {
      console.error('Error loading top candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

      // If a role is selected, include role requirements
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
        valuesFit: result.breakdown.valuesFit,
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

  /* ---- Role change handler ---- */

  const handleRoleChange = useCallback((roleId: string | null) => {
    setSelectedRoleId(roleId);
    if (!employer || rawCandidates.length === 0) return;

    const role = roleId ? roles.find(r => r.id === roleId) || null : null;
    scoreCandidates(rawCandidates, employer, role);
  }, [employer, rawCandidates, roles, scoreCandidates]);

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
        {
          name: 'Openness',
          candidate_score: c.candidateOcean.openness,
          employer_preference: employer.openness_preference || 50,
          fit_score: c.breakdown.opennessFit,
          gap: Math.abs(c.candidateOcean.openness - (employer.openness_preference || 50)),
          direction: c.candidateOcean.openness > (employer.openness_preference || 50) ? 'above' : c.candidateOcean.openness < (employer.openness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Conscientiousness',
          candidate_score: c.candidateOcean.conscientiousness,
          employer_preference: employer.conscientiousness_preference || 50,
          fit_score: c.breakdown.conscientiousnessFit,
          gap: Math.abs(c.candidateOcean.conscientiousness - (employer.conscientiousness_preference || 50)),
          direction: c.candidateOcean.conscientiousness > (employer.conscientiousness_preference || 50) ? 'above' : c.candidateOcean.conscientiousness < (employer.conscientiousness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Extraversion',
          candidate_score: c.candidateOcean.extraversion,
          employer_preference: employer.extraversion_preference || 50,
          fit_score: c.breakdown.extraversionFit,
          gap: Math.abs(c.candidateOcean.extraversion - (employer.extraversion_preference || 50)),
          direction: c.candidateOcean.extraversion > (employer.extraversion_preference || 50) ? 'above' : c.candidateOcean.extraversion < (employer.extraversion_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Agreeableness',
          candidate_score: c.candidateOcean.agreeableness,
          employer_preference: employer.agreeableness_preference || 50,
          fit_score: c.breakdown.agreeablenessFit,
          gap: Math.abs(c.candidateOcean.agreeableness - (employer.agreeableness_preference || 50)),
          direction: c.candidateOcean.agreeableness > (employer.agreeableness_preference || 50) ? 'above' : c.candidateOcean.agreeableness < (employer.agreeableness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Stability',
          candidate_score: 100 - c.candidateOcean.neuroticism,
          employer_preference: 100 - (employer.neuroticism_preference || 50),
          fit_score: c.breakdown.neuroticismFit,
          gap: Math.abs(c.candidateOcean.neuroticism - (employer.neuroticism_preference || 50)),
          direction: c.candidateOcean.neuroticism < (employer.neuroticism_preference || 50) ? 'above' : c.candidateOcean.neuroticism > (employer.neuroticism_preference || 50) ? 'below' : 'aligned',
        },
      ],
    };
  }, [employer]);

  /* ---- Chat handler ---- */

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
    } catch {
      showError('Error', 'Failed to send invitation');
    }
  }, [employer, selectedRoleId, roles, showSuccess, showError]);

  /* ---- Shortlist toggle ---- */

  const toggleShortlist = (candidateId: string) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  /* ---- Archetype filter toggle ---- */

  const toggleArchetypeFilter = (name: string) => {
    setSelectedArchetypes(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setMinScore(0);
    setMaxScore(100);
    setSelectedArchetypes(new Set());
    setSelectedWorkStyleFilter(null);
    setSearchQuery('');
  };

  /* ---- Loading ---- */

  if (isLoading) {
    return (
      <CoffeeBrewLoader message="Ranking candidates by culture fit..." />
    );
  }

  if (!employer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Complete your setup
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Set up your employer profile to start finding candidates.
          </p>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            No candidates yet
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            No candidates have completed their assessments yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  /* ---- Main Render ---- */

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          {/* View tabs */}
          <div className="flex items-center gap-1 mb-4 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setActiveView('browse')}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeView === 'browse' ? 'var(--color-accent)' : 'transparent',
                color: activeView === 'browse' ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
              }}
            >
              Browse All
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: activeView === 'pipeline' ? 'var(--color-accent)' : 'transparent',
                color: activeView === 'pipeline' ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
              }}
            >
              Pipeline
              {(pipelineCounts.saved + pipelineCounts.pending + pipelineCounts.connected) > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  {pipelineCounts.saved + pipelineCounts.pending + pipelineCounts.connected}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Trophy className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                {activeView === 'browse' ? 'Top Candidates' : 'Your Pipeline'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {activeView === 'browse'
                  ? <>
                      {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
                      {shortlisted.size > 0 && (
                        <span style={{ color: 'var(--color-accent)' }}> &middot; {shortlisted.size} shortlisted</span>
                      )}
                    </>
                  : 'Track your shortlisted and pending candidates'
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Role dropdown */}
              {roles.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedRoleId || ''}
                    onChange={e => handleRoleChange(e.target.value || null)}
                    className="appearance-none pl-8 pr-8 py-2 rounded-xl text-sm font-medium cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-textSecondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                  <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
                </div>
              )}

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-8 pr-8 py-2 rounded-xl text-sm font-medium cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-textSecondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="overall">Overall Match</option>
                  <option value="culture">Culture Fit</option>
                  <option value="trait">Trait Match</option>
                  <option value="archetype">Archetype</option>
                </select>
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--color-textMuted)' }} />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: showFilters || activeFilterCount > 0 ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: showFilters || activeFilterCount > 0 ? 'white' : 'var(--color-textSecondary)',
                  border: showFilters || activeFilterCount > 0 ? 'none' : '1px solid var(--color-border)',
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <input
              type="text"
              placeholder="Search by name, headline, archetype, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              {/* Match score range */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Match Score Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={minScore}
                    onChange={e => setMinScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-20 px-3 py-2 rounded-lg text-sm text-center"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    placeholder="0"
                  />
                  <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>to</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={maxScore}
                    onChange={e => setMaxScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 100)))}
                    className="w-20 px-3 py-2 rounded-lg text-sm text-center"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    placeholder="100"
                  />
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>%</span>
                </div>
              </div>

              {/* Archetype checkboxes */}
              {uniqueArchetypes.length > 0 && (
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-textMuted)' }}>Archetype</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueArchetypes.map(arch => (
                      <button
                        key={arch}
                        onClick={() => toggleArchetypeFilter(arch)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: selectedArchetypes.has(arch) ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: selectedArchetypes.has(arch) ? 'white' : 'var(--color-textSecondary)',
                          border: selectedArchetypes.has(arch) ? 'none' : '1px solid var(--color-border)',
                        }}
                      >
                        {selectedArchetypes.has(arch) && <Check className="w-3 h-3" />}
                        {arch}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Work style preference */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Work Style Preference</label>
                <select
                  value={selectedWorkStyleFilter || ''}
                  onChange={e => setSelectedWorkStyleFilter(e.target.value || null)}
                  className="w-full max-w-xs px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                >
                  <option value="">All</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex justify-end">
                  <button onClick={clearFilters} className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline View */}
      {activeView === 'pipeline' && (
        <div className="max-w-6xl mx-auto p-6">
          <MatchPipeline
            savedMatches={savedMatches}
            activeTab={pipelineTab}
            onTabChange={setPipelineTab}
            counts={pipelineCounts}
            mode="employer"
            onViewInEmber={(matchId) => navigate(`/app/employer/ember?deepdive=${matchId}`)}
            onRemove={async (id) => {
              try {
                await unsaveMatch(id);
                showSuccess('Removed', 'Candidate removed');
              } catch {
                showError('Error', 'Failed to remove');
              }
            }}
            onCoffeeChat={() => {}}
          />
        </div>
      )}

      {/* Results Grid */}
      {activeView === 'browse' && <div className="max-w-6xl mx-auto p-6">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>No candidates match your filters</p>
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Try adjusting your filters or search query.
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((c) => {
              const isShortlisted = shortlisted.has(c.candidateId);
              return (
                <div
                  key={c.candidateId}
                  className="p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group relative"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: isShortlisted ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                  onClick={() => setModalCandidate(c)}
                >
                  {/* Shortlist indicator */}
                  {isShortlisted && (
                    <div
                      className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Top row: avatar + score ring */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Candidate initial avatar */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: avatarColor(c.name) }}
                      >
                        <span className="text-lg font-semibold text-white">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>
                          {c.name}
                        </h3>
                        <p className="text-sm line-clamp-1" style={{ color: 'var(--color-textSecondary)' }}>
                          {c.headline}
                        </p>
                      </div>
                    </div>
                    <ScoreRing score={c.overallScore} size={48} />
                  </div>

                  {/* Archetype badge */}
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                    >
                      <Target className="w-3 h-3" />
                      {c.archetype.name}
                    </span>
                  </div>

                  {/* Top trait pills (from archetype strengths) */}
                  {c.archetype.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.archetype.strengths.slice(0, 3).map((strength, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Location + work style */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.location && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-3 h-3" />{c.location}
                      </span>
                    )}
                    {c.workStyle && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                        {c.workStyle.charAt(0).toUpperCase() + c.workStyle.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Score mini breakdown */}
                  <div className="flex gap-3 mb-4 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    <span className="flex items-center gap-1"><Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />{c.traitScore}%</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />{c.cultureScore}%</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: 'var(--color-success)' }} />{c.workStyleFit}%</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      leftIcon={<Coffee className="w-3.5 h-3.5" />}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleInviteChat(c);
                      }}
                    >
                      Invite to Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalCandidate(c);
                      }}
                    >
                      Details
                    </Button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShortlist(c.candidateId);
                      }}
                      className="p-2 rounded-lg border transition-all"
                      style={{
                        borderColor: isShortlisted ? 'var(--color-accent)' : 'var(--color-border)',
                        backgroundColor: isShortlisted ? 'var(--color-accent)' : 'transparent',
                        color: isShortlisted ? 'white' : 'var(--color-textMuted)',
                      }}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>}

      {/* Match Detail Modal */}
      {modalCandidate && (
        <MatchDetailModal
          isOpen={!!modalCandidate}
          onClose={() => setModalCandidate(null)}
          role="employer"
          matchData={buildModalData(modalCandidate)}
          candidateId={modalCandidate.candidateId}
          employerId={employer.id}
          roleId={selectedRoleId || undefined}
          onRequestChat={() => handleInviteChat(modalCandidate)}
          onAskEmber={() => {
            navigate('/app/employer/ember');
          }}
        />
      )}
    </div>
  );
}
