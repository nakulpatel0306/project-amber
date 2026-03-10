import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Heart,
  MapPin,
  Zap,
  Target,
  Briefcase,
  Coffee,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Eye,
  Brain,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
// ScoreRing is defined locally below
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { MatchDetailModal, type MatchDetailData } from '../matches/MatchDetailModal';
import { MatchPipeline } from '../matches/MatchPipeline';
import { useSavedMatches } from '../../hooks/useSavedMatches';
// getMatchColor is defined locally below
import type { PipelineTab } from '../../types/matching.types';

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
    company_website: string;
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

type SortOption = 'score' | 'recent' | 'company_size';

const WORK_STYLE_OPTIONS = ['remote', 'hybrid', 'onsite'];
const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

/* ------------------------------------------------------------------ */
/*  Inline ScoreRing                                                   */
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMatchColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
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
  if (match.traitMatchScore >= 90) pills.push('Top Trait Fit');
  // Cap at 3 pills
  return pills.slice(0, 3);
}

function companySizeOrder(size: string): number {
  const order: Record<string, number> = { '1-10': 1, '11-50': 2, '51-200': 3, '201-500': 4, '500+': 5 };
  return order[size] || 0;
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

export function MatchingAgent() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string | null>(null);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // Sort
  const [sortBy, setSortBy] = useState<SortOption>('score');

  // Modal
  const [modalMatch, setModalMatch] = useState<MatchResult | null>(null);

  // Pipeline
  const [activeView, setActiveView] = useState<'browse' | 'pipeline'>('browse');
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>('saved');
  const { savedMatches, unsave, counts: pipelineCounts } = useSavedMatches();
  const showLoader = useMinLoader(isLoading);

  // Derived filter values
  const industries = useMemo(
    () => [...new Set(matches.map(m => m.role.employers.industry).filter(Boolean))].sort(),
    [matches]
  );
  const locations = useMemo(
    () => [...new Set(matches.map(m => m.role.location).filter(Boolean))].sort(),
    [matches]
  );

  const activeFilterCount = [selectedIndustry, selectedWorkStyle, selectedCompanySize, selectedLocation].filter(Boolean).length
    + (minScore > 0 ? 1 : 0)
    + (maxScore < 100 ? 1 : 0);

  const filteredMatches = useMemo(() => {
    let result = matches.filter(m => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          m.role.title.toLowerCase().includes(q) ||
          m.role.employers.company_name.toLowerCase().includes(q) ||
          (m.role.employers.industry || '').toLowerCase().includes(q) ||
          (m.role.location || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (selectedIndustry && m.role.employers.industry !== selectedIndustry) return false;
      if (selectedWorkStyle && m.role.work_style !== selectedWorkStyle) return false;
      if (selectedCompanySize && m.role.employers.company_size !== selectedCompanySize) return false;
      if (selectedLocation && m.role.location !== selectedLocation) return false;
      if (m.overallMatchScore < minScore || m.overallMatchScore > maxScore) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'score':
        result.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
        break;
      case 'recent':
        // No created_at on roles in current schema — preserve original order (already score-sorted)
        break;
      case 'company_size':
        result.sort((a, b) => companySizeOrder(b.role.employers.company_size) - companySizeOrder(a.role.employers.company_size));
        break;
    }

    return result;
  }, [matches, searchQuery, selectedIndustry, selectedWorkStyle, selectedCompanySize, selectedLocation, minScore, maxScore, sortBy]);

  /* ---- Data Loading ---- */

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (candErr) throw candErr;

      if (!candidate || candidate.openness_score === null) {
        setCandidateData(null);
        setIsLoading(false);
        return;
      }

      setCandidateData(candidate);

      const { data: roles, error: roleErr } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (roleErr) throw roleErr;

      if (!roles || roles.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }

      const candidateOcean: OCEANScores = {
        openness: candidate.openness_score || 50,
        conscientiousness: candidate.conscientiousness_score || 50,
        extraversion: candidate.extraversion_score || 50,
        agreeableness: candidate.agreeableness_score || 50,
        neuroticism: candidate.neuroticism_score || 50,
      };

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
          candidateWorkStyle: candidate.work_style || undefined,
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

        // Determine employer archetype from their OCEAN preferences
        const employerOcean: OCEANScores = {
          openness: employer.openness_preference || 50,
          conscientiousness: employer.conscientiousness_preference || 50,
          extraversion: employer.extraversion_preference || 50,
          agreeableness: employer.agreeableness_preference || 50,
          neuroticism: employer.neuroticism_preference || 50,
        };
        const empArchetype = determineArchetype(employerOcean);

        const matchData = {
          cultureMatchScore: result.cultureMatchScore,
          traitMatchScore: result.traitMatchScore,
          breakdown: result.breakdown,
        };

        return {
          role,
          traitMatchScore: result.traitMatchScore,
          cultureMatchScore: result.cultureMatchScore,
          overallMatchScore: result.overallMatchScore,
          employerArchetype: { name: empArchetype.name, key: empArchetype.key, description: empArchetype.description },
          breakdown: result.breakdown,
          highlightPills: generateHighlightPills(matchData),
        };
      });

      matchResults.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
      setMatches(matchResults);
    } catch (err) {
      console.error('Error loading match data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- Modal data formatting ---- */

  const buildModalData = useCallback((match: MatchResult): MatchDetailData => {
    if (!candidateData) {
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
        {
          name: 'Openness',
          candidate_score: candidateData.openness_score,
          employer_preference: employer.openness_preference || 50,
          fit_score: match.breakdown.opennessFit,
          gap: Math.abs(candidateData.openness_score - (employer.openness_preference || 50)),
          direction: candidateData.openness_score > (employer.openness_preference || 50) ? 'above' : candidateData.openness_score < (employer.openness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Conscientiousness',
          candidate_score: candidateData.conscientiousness_score,
          employer_preference: employer.conscientiousness_preference || 50,
          fit_score: match.breakdown.conscientiousnessFit,
          gap: Math.abs(candidateData.conscientiousness_score - (employer.conscientiousness_preference || 50)),
          direction: candidateData.conscientiousness_score > (employer.conscientiousness_preference || 50) ? 'above' : candidateData.conscientiousness_score < (employer.conscientiousness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Extraversion',
          candidate_score: candidateData.extraversion_score,
          employer_preference: employer.extraversion_preference || 50,
          fit_score: match.breakdown.extraversionFit,
          gap: Math.abs(candidateData.extraversion_score - (employer.extraversion_preference || 50)),
          direction: candidateData.extraversion_score > (employer.extraversion_preference || 50) ? 'above' : candidateData.extraversion_score < (employer.extraversion_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Agreeableness',
          candidate_score: candidateData.agreeableness_score,
          employer_preference: employer.agreeableness_preference || 50,
          fit_score: match.breakdown.agreeablenessFit,
          gap: Math.abs(candidateData.agreeableness_score - (employer.agreeableness_preference || 50)),
          direction: candidateData.agreeableness_score > (employer.agreeableness_preference || 50) ? 'above' : candidateData.agreeableness_score < (employer.agreeableness_preference || 50) ? 'below' : 'aligned',
        },
        {
          name: 'Stability',
          candidate_score: 100 - candidateData.neuroticism_score,
          employer_preference: 100 - (employer.neuroticism_preference || 50),
          fit_score: match.breakdown.neuroticismFit,
          gap: Math.abs(candidateData.neuroticism_score - (employer.neuroticism_preference || 50)),
          direction: candidateData.neuroticism_score < (employer.neuroticism_preference || 50) ? 'above' : candidateData.neuroticism_score > (employer.neuroticism_preference || 50) ? 'below' : 'aligned',
        },
      ],
    };
  }, [candidateData]);

  /* ---- Coffee chat handler ---- */

  const handleRequestChat = useCallback(async (match: MatchResult) => {
    if (!candidateData) return;
    try {
      await supabase.from('coffee_chats').insert({
        candidate_id: candidateData.id,
        employer_id: match.role.employers.id,
        role_id: match.role.id,
        initiated_by: 'candidate',
        status: 'pending',
        message: `Interested in ${match.role.title}`,
        role_title: match.role.title,
        match_score: match.overallMatchScore,
      });
      showSuccess('Sent!', 'Coffee chat request sent');
    } catch {
      showError('Error', 'Failed to send request');
    }
  }, [candidateData, showSuccess, showError]);

  const clearFilters = () => {
    setSelectedIndustry(null);
    setSelectedWorkStyle(null);
    setSelectedCompanySize(null);
    setSelectedLocation(null);
    setMinScore(0);
    setMaxScore(100);
    setSearchQuery('');
  };

  /* ---- Loading state ---- */

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading roles..." />
    );
  }

  /* ---- No assessment state ---- */

  if (!candidateData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Complete Your Assessment First
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Take our personality assessment to discover your unique traits and find roles that match your values and work style.
          </p>
          <Button onClick={() => navigate('/app/personality')}>Start Assessment</Button>
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
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                  {pipelineCounts.saved + pipelineCounts.pending + pipelineCounts.connected}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {activeView === 'browse' ? 'Browse Roles' : 'Your Pipeline'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {activeView === 'browse'
                  ? `${filteredMatches.length} role${filteredMatches.length !== 1 ? 's' : ''} found`
                  : 'Track your saved and pending matches'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
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
                  <option value="score">Match Score</option>
                  <option value="recent">Recently Added</option>
                  <option value="company_size">Company Size</option>
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

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <input
              type="text"
              placeholder="Search by title, company, industry, or location..."
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
            <div className="mt-4 p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Industry */}
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Industry</label>
                  <select
                    value={selectedIndustry || ''}
                    onChange={e => setSelectedIndustry(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">All</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                {/* Work Style */}
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Work Style</label>
                  <select
                    value={selectedWorkStyle || ''}
                    onChange={e => setSelectedWorkStyle(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">All</option>
                    {WORK_STYLE_OPTIONS.map(ws => <option key={ws} value={ws}>{ws.charAt(0).toUpperCase() + ws.slice(1)}</option>)}
                  </select>
                </div>
                {/* Company Size */}
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Company Size</label>
                  <select
                    value={selectedCompanySize || ''}
                    onChange={e => setSelectedCompanySize(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">All</option>
                    {COMPANY_SIZE_OPTIONS.map(cs => <option key={cs} value={cs}>{cs}</option>)}
                  </select>
                </div>
                {/* Location */}
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-textMuted)' }}>Location</label>
                  <select
                    value={selectedLocation || ''}
                    onChange={e => setSelectedLocation(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">All</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

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
            mode="candidate"
            onViewInEmber={(matchId) => navigate(`/app/ember?deepdive=${matchId}`)}
            onRemove={async (id) => {
              try {
                await unsave(id);
                showSuccess('Removed', 'Match removed');
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
        {filteredMatches.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>No roles found</p>
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {matches.length === 0 ? 'No active roles available yet. Check back soon!' : 'Try adjusting your filters or search query.'}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map(match => {
              const companyName = match.role.employers.company_name;
              return (
                <div
                  key={match.role.id}
                  className="p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  onClick={() => setModalMatch(match)}
                >
                  {/* Top row: avatar + score ring */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Company initial avatar */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: avatarColor(companyName) }}
                      >
                        <span className="text-lg font-semibold text-white">
                          {companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>
                          {match.role.title}
                        </h3>
                        <p className="text-sm line-clamp-1" style={{ color: 'var(--color-textSecondary)' }}>
                          {companyName}
                        </p>
                      </div>
                    </div>
                    <ScoreRing score={match.overallMatchScore} size={48} />
                  </div>

                  {/* Employer archetype badge */}
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                    >
                      <Target className="w-3 h-3" />
                      {match.employerArchetype.name}
                    </span>
                  </div>

                  {/* Highlight pills */}
                  {match.highlightPills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {match.highlightPills.map((pill, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: pill.includes('Culture') ? `var(--color-success)15` : pill.includes('Values') ? `var(--color-accent)15` : `var(--color-warning)15`,
                            color: pill.includes('Culture') ? 'var(--color-success)' : pill.includes('Values') ? 'var(--color-accent)' : 'var(--color-warning)',
                          }}
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.role.location && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-3 h-3" />{match.role.location}
                      </span>
                    )}
                    {match.role.work_style && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                        {match.role.work_style.charAt(0).toUpperCase() + match.role.work_style.slice(1)}
                      </span>
                    )}
                    {match.role.employers.company_size && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                        <Users className="w-3 h-3" />{match.role.employers.company_size}
                      </span>
                    )}
                  </div>

                  {/* Score breakdown mini */}
                  <div className="flex gap-3 mb-4 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    <span className="flex items-center gap-1"><Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />{match.traitMatchScore}%</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />{match.cultureMatchScore}%</span>
                    {match.breakdown.workStyleFit > 0 && (
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: 'var(--color-success)' }} />{match.breakdown.workStyleFit}%</span>
                    )}
                  </div>

                  {/* Salary */}
                  {formatSalary(match.role.salary_min, match.role.salary_max) && (
                    <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                      {formatSalary(match.role.salary_min, match.role.salary_max)}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      rightIcon={<Coffee className="w-3.5 h-3.5" />}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleRequestChat(match);
                      }}
                    >
                      Coffee Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalMatch(match);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>}

      {/* Match Detail Modal */}
      {modalMatch && (
        <MatchDetailModal
          isOpen={!!modalMatch}
          onClose={() => setModalMatch(null)}
          role="candidate"
          matchData={buildModalData(modalMatch)}
          candidateId={candidateData.id}
          employerId={modalMatch.role.employers.id}
          roleId={modalMatch.role.id}
          onRequestChat={() => handleRequestChat(modalMatch)}
          onAskEmber={() => {
            navigate('/app/ember');
          }}
        />
      )}
    </div>
  );
}
