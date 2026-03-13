import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Star,
  Coffee,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Sparkles,
  Heart,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';

interface CandidateData {
  id: string;
  user_id: string;
  headline: string | null;
  location: string | null;
  work_style: string | null;
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;
  top_traits: string[] | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface RoleData {
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

interface EmployerData {
  id: string;
  openness_preference: number | null;
  conscientiousness_preference: number | null;
  extraversion_preference: number | null;
  agreeableness_preference: number | null;
  neuroticism_preference: number | null;
  culture_values: string[] | null;
}

interface CandidateMatch {
  candidate: CandidateData;
  traitMatchScore: number;
  cultureMatchScore: number;
  overallMatchScore: number;
  topTraits: string[];
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  roleId: string | null;
  roleTitle: string | null;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
];

export function BrowseCandidates() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'all';

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);

  const showLoader = useMinLoader(isLoading);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch employer data
      const { data: employerData } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!employerData) {
        setIsLoading(false);
        return;
      }

      setEmployer(employerData);

      // Fetch employer's roles
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .eq('employer_id', employerData.id)
        .eq('status', 'active');

      setRoles(rolesData || []);

      // Fetch all candidates with OCEAN scores
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*, profiles!inner(full_name, email)')
        .not('openness_score', 'is', null);

      if (!candidatesData) {
        setCandidates([]);
        setIsLoading(false);
        return;
      }

      // Fetch existing applications to get status
      const { data: applications } = await supabase
        .from('applications')
        .select('candidate_id, role_id, status')
        .eq('employer_id', employerData.id);

      const applicationMap = new Map(
        (applications || []).map(app => [`${app.candidate_id}-${app.role_id}`, app.status])
      );

      // Calculate match scores for each candidate
      const employerOcean: OCEANScores = {
        openness: employerData.openness_preference || 50,
        conscientiousness: employerData.conscientiousness_preference || 50,
        extraversion: employerData.extraversion_preference || 50,
        agreeableness: employerData.agreeableness_preference || 50,
        neuroticism: employerData.neuroticism_preference || 50,
      };

      const matchedCandidates: CandidateMatch[] = candidatesData.map((candidate: CandidateData) => {
        const candidateOcean: OCEANScores = {
          openness: candidate.openness_score || 50,
          conscientiousness: candidate.conscientiousness_score || 50,
          extraversion: candidate.extraversion_score || 50,
          agreeableness: candidate.agreeableness_score || 50,
          neuroticism: candidate.neuroticism_score || 50,
        };

        // Use employer-level scoring (without role-specific requirements)
        const result = calculateCompatibility({
          candidateOCEAN: candidateOcean,
          employerPreferences: {
            ...employerOcean,
            cultureValues: employerData.culture_values || [],
          },
          candidateWorkStyle: candidate.work_style || undefined,
        });

        // Find if candidate has applied to any of employer's roles
        let status: CandidateMatch['status'] = 'new';
        let roleId: string | null = null;
        let roleTitle: string | null = null;

        for (const role of rolesData || []) {
          const appStatus = applicationMap.get(`${candidate.id}-${role.id}`);
          if (appStatus) {
            status = appStatus as CandidateMatch['status'];
            roleId = role.id;
            roleTitle = role.title;
            break;
          }
        }

        return {
          candidate,
          traitMatchScore: result.traitMatchScore,
          cultureMatchScore: result.cultureMatchScore,
          overallMatchScore: result.overallMatchScore,
          topTraits: candidate.top_traits || [],
          status,
          roleId,
          roleTitle,
        };
      });

      // Sort by match score
      matchedCandidates.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
      setCandidates(matchedCandidates);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    if (!employer) return;

    try {
      // Find the role to use (first active role or null)
      const roleId = roles.length > 0 ? roles[0].id : null;

      if (roleId) {
        await supabase.from('applications').upsert({
          candidate_id: candidateId,
          role_id: roleId,
          employer_id: employer.id,
          status: newStatus,
        }, {
          onConflict: 'candidate_id,role_id',
        });
      }

      // Update local state
      setCandidates(prev =>
        prev.map(c =>
          c.candidate.id === candidateId
            ? { ...c, status: newStatus as CandidateMatch['status'] }
            : c
        )
      );

      success('Status updated', `Candidate marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Failed to update', 'Please try again');
    }
  };

  const filteredCandidates = candidates.filter(match => {
    const candidate = match.candidate;
    const name = candidate.profiles?.full_name || '';
    const headline = candidate.headline || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      headline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'all' || match.roleId === selectedRole;

    const matchesStatus =
      selectedStatus === 'all' || match.status === selectedStatus;

    const matchesScore = match.overallMatchScore >= minMatchScore;

    return matchesSearch && matchesRole && matchesStatus && matchesScore;
  });

  const getStatusColor = (status: CandidateMatch['status']) => {
    switch (status) {
      case 'new':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' };
      case 'reviewed':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--color-textMuted)' };
      case 'shortlisted':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-error)' };
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-accent)';
    return 'var(--color-textMuted)';
  };

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Finding candidates..." />
    );
  }

  if (!employer) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          Complete Your Profile
        </h2>
        <p style={{ color: 'var(--color-textMuted)' }}>
          Please complete your employer profile to browse candidates.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Browse Candidates
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          Candidates ranked by culture fit for your company
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>

          {roles.length > 0 && (
            <select
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
                if (e.target.value === 'all') {
                  searchParams.delete('role');
                } else {
                  searchParams.set('role', e.target.value);
                }
                setSearchParams(searchParams);
              }}
              className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all"
            style={{
              backgroundColor: showFilters
                ? 'rgba(217, 119, 6, 0.1)'
                : 'var(--color-surface)',
              borderColor: showFilters
                ? 'var(--color-accent)'
                : 'var(--color-border)',
              color: showFilters
                ? 'var(--color-accent)'
                : 'var(--color-textSecondary)',
            }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div
            className="bento-card p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className="px-3 py-1.5 rounded-lg border text-xs transition-all"
                      style={{
                        backgroundColor:
                          selectedStatus === option.value
                            ? 'rgba(217, 119, 6, 0.1)'
                            : 'transparent',
                        borderColor:
                          selectedStatus === option.value
                            ? 'var(--color-accent)'
                            : 'var(--color-border)',
                        color:
                          selectedStatus === option.value
                            ? 'var(--color-accent)'
                            : 'var(--color-textSecondary)',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  Minimum Match Score: {minMatchScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minMatchScore}
                  onChange={e => setMinMatchScore(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-textMuted)' }}
      >
        {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
      </p>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div
            className="bento-card text-center py-12"
          >
            <Users
              className="w-12 h-12 mx-auto mb-4 opacity-40"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {candidates.length === 0
                ? 'No candidates have completed their assessments yet'
                : 'No candidates match your filters'}
            </p>
          </div>
        ) : (
          filteredCandidates.map(match => {
            const statusColors = getStatusColor(match.status);
            const isExpanded = expandedCandidate === match.candidate.id;
            const name = match.candidate.profiles?.full_name || 'Unknown';

            return (
              <div
                key={match.candidate.id}
                className="bento-card transition-all"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedCandidate(isExpanded ? null : match.candidate.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                      }}
                    >
                      <span className="text-lg font-medium text-white">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                          }}
                        >
                          {match.status}
                        </span>
                      </div>

                      {match.candidate.headline && (
                        <p
                          className="text-sm mb-2 truncate"
                          style={{ color: 'var(--color-textSecondary)' }}
                        >
                          {match.candidate.headline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {match.candidate.location && (
                          <span
                            className="flex items-center gap-1"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <MapPin className="w-3 h-3" />
                            {match.candidate.location}
                          </span>
                        )}
                        {match.candidate.work_style && (
                          <span
                            className="flex items-center gap-1"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <Briefcase className="w-3 h-3" />
                            {match.candidate.work_style}
                          </span>
                        )}
                        {match.roleTitle && (
                          <span
                            className="flex items-center gap-1"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <Star className="w-3 h-3" />
                            {match.roleTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: getMatchScoreColor(match.overallMatchScore) }}
                      >
                        {match.overallMatchScore}%
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        Culture Fit
                      </p>
                    </div>
                  </div>

                  {/* Top Traits */}
                  {match.topTraits.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <Sparkles
                        className="w-3.5 h-3.5"
                        style={{ color: 'var(--color-accent)' }}
                      />
                      <div className="flex gap-1.5">
                        {match.topTraits.slice(0, 3).map(trait => (
                          <span
                            key={trait}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: 'rgba(217, 119, 6, 0.1)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div
                    className="px-5 py-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Heart className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(match.candidate.id, 'shortlisted');
                        }}
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<Coffee className="w-4 h-4" />}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!employer) return;
                          try {
                            await supabase.from('coffee_chats').insert({
                              candidate_id: match.candidate.id,
                              employer_id: employer.id,
                              role_id: match.roleId,
                              initiated_by: 'employer',
                              status: 'pending',
                              match_score: match.overallMatchScore,
                              role_title: match.roleTitle,
                            });
                            success('Sent!', 'Coffee chat invitation sent');
                          } catch {
                            showError('Error', 'Failed to send invitation');
                          }
                        }}
                      >
                        Request Coffee Chat
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-lg border transition-colors hover:bg-[var(--color-background)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-textMuted)',
                        }}
                        title="Mark As Reviewed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(match.candidate.id, 'reviewed');
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg border transition-colors hover:bg-[var(--color-background)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-error)',
                        }}
                        title="Reject"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(match.candidate.id, 'rejected');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredCandidates.length > 0 && filteredCandidates.length >= 10 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load More Candidates</Button>
        </div>
      )}
    </div>
  );
}
