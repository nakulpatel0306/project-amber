import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Coffee, Search, X, Target, Users, Briefcase, Heart, Brain,
  DollarSign, Bookmark,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { staggerContainer, fadeUp } from '../../utils/motion';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { MatchDetailModal, type MatchDetailData } from '../matches/MatchDetailModal';
import { getMatchColor, avatarGradient, generateHighlightPills, formatSalary, getScoreLabel } from '../../utils/matchHelpers';

interface Props {
  isCandidate: boolean;
}

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

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const sw = 3;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  const color = getMatchColor(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export function NetworkRoles({ isCandidate }: Props) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const companyFilter = searchParams.get('company') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyFilter || null);
  const [minScore, setMinScore] = useState<number>(0);
  const [modalMatch, setModalMatch] = useState<MatchResult | null>(null);
  const [savedRoles, setSavedRoles] = useState<Set<string>>(new Set());

  const industries = useMemo(() => [...new Set(matches.map(m => m.role.employers.industry).filter(Boolean))].sort(), [matches]);
  const companies = useMemo(() => {
    const map = new Map<string, string>();
    matches.forEach(m => map.set(m.role.employers.id, m.role.employers.company_name));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let result = matches.filter(m => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !m.role.title.toLowerCase().includes(q) &&
          !m.role.employers.company_name.toLowerCase().includes(q) &&
          !(m.role.employers.industry || '').toLowerCase().includes(q) &&
          !(m.role.location || '').toLowerCase().includes(q)
        ) return false;
      }
      if (selectedIndustry && m.role.employers.industry !== selectedIndustry) return false;
      if (selectedWorkStyle && m.role.work_style !== selectedWorkStyle) return false;
      if (selectedCompanyId && m.role.employers.id !== selectedCompanyId) return false;
      if (minScore > 0 && isCandidate && m.overallMatchScore < minScore) return false;
      return true;
    });
    result.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
    return result;
  }, [matches, searchQuery, selectedIndustry, selectedWorkStyle, selectedCompanyId, minScore, isCandidate]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: roles, error: roleErr } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (roleErr) throw roleErr;
      if (!roles?.length) { setMatches([]); setIsLoading(false); return; }

      let candidate: CandidateData | null = null;
      if (isCandidate) {
        const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
        if (cand?.openness_score != null) { candidate = cand; setCandidateData(cand); }
      }

      const candidateOcean: OCEANScores | null = candidate ? {
        openness: candidate.openness_score, conscientiousness: candidate.conscientiousness_score,
        extraversion: candidate.extraversion_score, agreeableness: candidate.agreeableness_score,
        neuroticism: candidate.neuroticism_score,
      } : null;

      const matchResults: MatchResult[] = roles.map((role: RoleData) => {
        const emp = role.employers;
        let traitMatchScore = 0, cultureMatchScore = 0, overallMatchScore = 0;
        let breakdown = {
          opennessFit: 0, conscientiousnessFit: 0, extraversionFit: 0,
          agreeablenessFit: 0, neuroticismFit: 0, workStyleFit: 0, valuesFit: 0,
        };

        if (candidateOcean) {
          const result = calculateCompatibility({
            candidateOCEAN: candidateOcean,
            employerPreferences: {
              openness: emp.openness_preference || 50, conscientiousness: emp.conscientiousness_preference || 50,
              extraversion: emp.extraversion_preference || 50, agreeableness: emp.agreeableness_preference || 50,
              neuroticism: emp.neuroticism_preference || 50, cultureValues: emp.culture_values || [],
            },
            candidateWorkStyle: candidate?.work_style || undefined,
            roleWorkStyle: role.work_style || undefined,
            roleRequirements: {
              required_openness_min: role.required_openness_min, required_openness_max: role.required_openness_max,
              required_conscientiousness_min: role.required_conscientiousness_min, required_conscientiousness_max: role.required_conscientiousness_max,
              required_extraversion_min: role.required_extraversion_min, required_extraversion_max: role.required_extraversion_max,
              required_agreeableness_min: role.required_agreeableness_min, required_agreeableness_max: role.required_agreeableness_max,
              required_neuroticism_min: role.required_neuroticism_min, required_neuroticism_max: role.required_neuroticism_max,
              work_style: role.work_style,
            },
          });
          traitMatchScore = result.traitMatchScore;
          cultureMatchScore = result.cultureMatchScore;
          overallMatchScore = result.overallMatchScore;
          breakdown = result.breakdown;
        }

        const empOcean: OCEANScores = {
          openness: emp.openness_preference || 50, conscientiousness: emp.conscientiousness_preference || 50,
          extraversion: emp.extraversion_preference || 50, agreeableness: emp.agreeableness_preference || 50,
          neuroticism: emp.neuroticism_preference || 50,
        };

        return {
          role, traitMatchScore, cultureMatchScore, overallMatchScore,
          employerArchetype: determineArchetype(empOcean),
          breakdown,
          highlightPills: candidateOcean ? generateHighlightPills({ cultureMatchScore, traitMatchScore, breakdown }) : [],
        };
      });

      matchResults.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
      setMatches(matchResults);
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildModalData = useCallback((match: MatchResult): MatchDetailData => {
    const emp = match.role.employers;
    const base: MatchDetailData = {
      id: match.role.id, name: emp.company_name, subtitle: match.role.title,
      archetype: match.employerArchetype,
      overallScore: match.overallMatchScore, traitScore: match.traitMatchScore,
      cultureScore: match.cultureMatchScore, workStyleScore: match.breakdown.workStyleFit,
      communicationScore: Math.round((match.breakdown.extraversionFit + match.breakdown.agreeablenessFit) / 2),
    };
    if (candidateData) {
      base.dimensionAnalysis = [
        { name: 'Openness', candidate_score: candidateData.openness_score, employer_preference: emp.openness_preference || 50, fit_score: match.breakdown.opennessFit, gap: Math.abs(candidateData.openness_score - (emp.openness_preference || 50)), direction: candidateData.openness_score > (emp.openness_preference || 50) ? 'above' : candidateData.openness_score < (emp.openness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Conscientiousness', candidate_score: candidateData.conscientiousness_score, employer_preference: emp.conscientiousness_preference || 50, fit_score: match.breakdown.conscientiousnessFit, gap: Math.abs(candidateData.conscientiousness_score - (emp.conscientiousness_preference || 50)), direction: candidateData.conscientiousness_score > (emp.conscientiousness_preference || 50) ? 'above' : candidateData.conscientiousness_score < (emp.conscientiousness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Extraversion', candidate_score: candidateData.extraversion_score, employer_preference: emp.extraversion_preference || 50, fit_score: match.breakdown.extraversionFit, gap: Math.abs(candidateData.extraversion_score - (emp.extraversion_preference || 50)), direction: candidateData.extraversion_score > (emp.extraversion_preference || 50) ? 'above' : candidateData.extraversion_score < (emp.extraversion_preference || 50) ? 'below' : 'aligned' },
        { name: 'Agreeableness', candidate_score: candidateData.agreeableness_score, employer_preference: emp.agreeableness_preference || 50, fit_score: match.breakdown.agreeablenessFit, gap: Math.abs(candidateData.agreeableness_score - (emp.agreeableness_preference || 50)), direction: candidateData.agreeableness_score > (emp.agreeableness_preference || 50) ? 'above' : candidateData.agreeableness_score < (emp.agreeableness_preference || 50) ? 'below' : 'aligned' },
        { name: 'Stability', candidate_score: 100 - candidateData.neuroticism_score, employer_preference: 100 - (emp.neuroticism_preference || 50), fit_score: match.breakdown.neuroticismFit, gap: Math.abs(candidateData.neuroticism_score - (emp.neuroticism_preference || 50)), direction: candidateData.neuroticism_score < (emp.neuroticism_preference || 50) ? 'above' : candidateData.neuroticism_score > (emp.neuroticism_preference || 50) ? 'below' : 'aligned' },
      ];
    }
    return base;
  }, [candidateData]);

  const handleRequestChat = useCallback(async (match: MatchResult) => {
    if (!candidateData) return;
    try {
      await supabase.from('coffee_chats').insert({
        candidate_id: candidateData.id, employer_id: match.role.employers.id,
        role_id: match.role.id, initiated_by: 'candidate', status: 'pending',
        message: `Interested in ${match.role.title}`,
        role_title: match.role.title, match_score: match.overallMatchScore,
      });
      showSuccess('Sent!', 'Coffee chat request sent');
    } catch { showError('Error', 'Failed to send request'); }
  }, [candidateData, showSuccess, showError]);

  const toggleSave = (roleId: string) => {
    setSavedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  if (isLoading) return <CoffeeBrewLoader message="Loading roles..." />;

  if (isCandidate && !candidateData) {
    return (
      <div className="space-y-6">
        <div
          className="p-6 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}>
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Complete Your Assessment</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-textMuted)' }}>
                Take our personality assessment to unlock match scores for every role on the platform.
              </p>
              <Button size="md" onClick={() => navigate('/app/personality')}>Start Assessment</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = !!(selectedIndustry || selectedWorkStyle || selectedCompanyId || minScore > 0);
  const avgScore = isCandidate && filteredMatches.length > 0
    ? Math.round(filteredMatches.reduce((s, m) => s + m.overallMatchScore, 0) / filteredMatches.length)
    : null;
  const highMatches = filteredMatches.filter(m => m.overallMatchScore >= 80).length;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Briefcase className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Open Roles
          </h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            <span>{matches.length} active</span>
            {isCandidate && avgScore != null && (
              <>
                <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span>Avg match: <span className="font-semibold" style={{ color: getMatchColor(avgScore) }}>{avgScore}%</span></span>
              </>
            )}
            {isCandidate && highMatches > 0 && (
              <>
                <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span><span className="font-semibold" style={{ color: 'var(--color-success)' }}>{highMatches}</span> strong matches</span>
              </>
            )}
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <input
              type="text"
              placeholder="Search roles, companies, locations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.length > 0 && (
              <select
                value={selectedIndustry || ''}
                onChange={e => setSelectedIndustry(e.target.value || null)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
              >
                <option value="">All industries</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            )}
            <select
              value={selectedWorkStyle || ''}
              onChange={e => setSelectedWorkStyle(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
            >
              <option value="">All work styles</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            {companies.length > 1 && (
              <select
                value={selectedCompanyId || ''}
                onChange={e => setSelectedCompanyId(e.target.value || null)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
              >
                <option value="">All companies</option>
                {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            )}
            {isCandidate && (
              <select
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
              >
                <option value={0}>Any score</option>
                <option value={60}>60%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {filteredMatches.length} role{filteredMatches.length !== 1 ? 's' : ''}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => { setSelectedIndustry(null); setSelectedWorkStyle(null); setSelectedCompanyId(null); setMinScore(0); }}
              className="text-xs font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredMatches.length === 0 ? (
          <div className="py-16 text-center rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <Briefcase className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              {matches.length === 0 ? 'No active roles yet' : 'No roles match your filters'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {matches.length === 0 ? 'Check back soon for new opportunities' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="show">
            {filteredMatches.map(match => {
              const emp = match.role.employers;
              const salary = formatSalary(match.role.salary_min, match.role.salary_max);
              const isSaved = savedRoles.has(match.role.id);
              return (
                <motion.div
                  key={match.role.id}
                  variants={fadeUp}
                  className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                  onClick={() => setModalMatch(match)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: avatarGradient(emp.company_name) }}
                      >
                        <span className="text-sm font-bold text-white">{emp.company_name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>{match.role.title}</h3>
                        <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{emp.company_name}</p>
                      </div>
                    </div>
                    {isCandidate && <ScoreRing score={match.overallMatchScore} />}
                  </div>

                  {isCandidate && (
                    <p className="text-xs font-medium mb-2" style={{ color: getMatchColor(match.overallMatchScore) }}>
                      {getScoreLabel(match.overallMatchScore)} Match
                    </p>
                  )}

                  {match.highlightPills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {match.highlightPills.map((pill, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: pill.includes('Culture') ? 'rgba(22, 163, 74, 0.1)' : pill.includes('Values') ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: pill.includes('Culture') ? 'var(--color-success)' : pill.includes('Values') ? 'var(--color-accent)' : 'var(--color-warning)',
                          }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                    {match.role.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.role.location}</span>}
                    {match.role.work_style && <span>{match.role.work_style.charAt(0).toUpperCase() + match.role.work_style.slice(1)}</span>}
                    {emp.company_size && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{emp.company_size}</span>}
                  </div>

                  {salary !== 'Not specified' && (
                    <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--color-text)' }}>
                      <DollarSign className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                      <span className="font-medium">{salary}</span>
                    </div>
                  )}

                  {isCandidate && (
                    <div className="flex gap-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}>
                      <span className="flex items-center gap-1"><Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />Trait {match.traitMatchScore}%</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: '#EC4899' }} />Culture {match.cultureMatchScore}%</span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); toggleSave(match.role.id); }}
                          className="p-0.5"
                        >
                          <Bookmark
                            className="w-3.5 h-3.5 transition-colors"
                            style={{ color: isSaved ? 'var(--color-accent)' : 'var(--color-textMuted)' }}
                            fill={isSaved ? 'var(--color-accent)' : 'none'}
                          />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleRequestChat(match); }}
                          className="p-0.5"
                        >
                          <Coffee className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {modalMatch && candidateData && (
        <MatchDetailModal
          isOpen={!!modalMatch}
          onClose={() => setModalMatch(null)}
          role="candidate"
          matchData={buildModalData(modalMatch)}
          candidateId={candidateData.id}
          employerId={modalMatch.role.employers.id}
          roleId={modalMatch.role.id}
          onRequestChat={() => handleRequestChat(modalMatch)}
          onAskEmber={() => navigate('/app/ember')}
        />
      )}
    </div>
  );
}
