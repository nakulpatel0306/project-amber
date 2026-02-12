import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Heart,
  MapPin,
  Globe,
  Zap,
  Target,
  Star,
  Briefcase,
  Coffee,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';

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
}

const WORK_STYLE_OPTIONS = ['remote', 'hybrid', 'onsite'];
const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

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

  // Derived filter values from data
  const industries = useMemo(
    () => [...new Set(matches.map(m => m.role.employers.industry).filter(Boolean))].sort(),
    [matches]
  );
  const locations = useMemo(
    () => [...new Set(matches.map(m => m.role.location).filter(Boolean))].sort(),
    [matches]
  );

  const activeFilterCount = [selectedIndustry, selectedWorkStyle, selectedCompanySize, selectedLocation].filter(Boolean).length;

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
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
      return true;
    });
  }, [matches, searchQuery, selectedIndustry, selectedWorkStyle, selectedCompanySize, selectedLocation]);

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

        return {
          role,
          traitMatchScore: result.traitMatchScore,
          cultureMatchScore: result.cultureMatchScore,
          overallMatchScore: result.overallMatchScore,
          breakdown: result.breakdown,
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

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-accent)';
    if (score >= 55) return 'var(--color-warning)';
    return 'var(--color-textMuted)';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Strong';
    if (score >= 55) return 'Good';
    return 'Potential';
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const clearFilters = () => {
    setSelectedIndustry(null);
    setSelectedWorkStyle(null);
    setSelectedCompanySize(null);
    setSelectedLocation(null);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }}>
            <Search className="w-8 h-8 text-white" />
          </div>
          <p style={{ color: 'var(--color-textMuted)' }}>Loading roles...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Browse Roles</h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {filteredMatches.length} role{filteredMatches.length !== 1 ? 's' : ''} found
              </p>
            </div>
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
            <div className="mt-4 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
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
              {activeFilterCount > 0 && (
                <div className="col-span-2 md:col-span-4 flex justify-end">
                  <button onClick={clearFilters} className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-6xl mx-auto p-6">
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
            {filteredMatches.map(match => (
              <div
                key={match.role.id}
                className="p-5 rounded-2xl border transition-all hover:shadow-md"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {/* Match badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: `${getMatchColor(match.overallMatchScore)}15`,
                      color: getMatchColor(match.overallMatchScore),
                    }}
                  >
                    {match.overallMatchScore}% {getMatchLabel(match.overallMatchScore)}
                  </div>
                </div>

                {/* Title & Company */}
                <h3 className="font-semibold mb-0.5 line-clamp-1" style={{ color: 'var(--color-text)' }}>
                  {match.role.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                  {match.role.employers.company_name}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.role.employers.industry && (
                    <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>
                      {match.role.employers.industry}
                    </span>
                  )}
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
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />{match.traitMatchScore}%</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />{match.cultureMatchScore}%</span>
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
                    onClick={async () => {
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
                    }}
                  >
                    Coffee Chat
                  </Button>
                  {match.role.employers.company_website && (
                    <a
                      href={match.role.employers.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9 h-9 rounded-lg border"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
