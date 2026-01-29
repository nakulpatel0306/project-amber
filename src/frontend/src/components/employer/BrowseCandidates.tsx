import { useState } from 'react';
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

interface Candidate {
  id: string;
  name: string;
  headline: string;
  location: string;
  matchScore: number;
  topTraits: string[];
  experience: string;
  appliedRole: string;
  appliedRoleId: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  avatar?: string;
}

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Kim',
    headline: 'Senior Product Designer with 6+ years experience',
    location: 'San Francisco, CA',
    matchScore: 96,
    topTraits: ['creative', 'collaborative', 'empathetic'],
    experience: '6 years',
    appliedRole: 'Senior Product Designer',
    appliedRoleId: '1',
    status: 'new',
  },
  {
    id: '2',
    name: 'Marcus Thompson',
    headline: 'Full-stack Engineer | React, Node, Python',
    location: 'Austin, TX',
    matchScore: 92,
    topTraits: ['analytical', 'independent', 'detail-oriented'],
    experience: '5 years',
    appliedRole: 'Frontend Engineer',
    appliedRoleId: '2',
    status: 'new',
  },
  {
    id: '3',
    name: 'Alex Rivera',
    headline: 'UX Researcher passionate about user-centered design',
    location: 'New York, NY',
    matchScore: 88,
    topTraits: ['empathetic', 'methodical', 'collaborative'],
    experience: '4 years',
    appliedRole: 'Senior Product Designer',
    appliedRoleId: '1',
    status: 'reviewed',
  },
  {
    id: '4',
    name: 'Jordan Chen',
    headline: 'Frontend Developer specializing in React & TypeScript',
    location: 'Seattle, WA',
    matchScore: 85,
    topTraits: ['fast-paced', 'adaptable', 'creative'],
    experience: '3 years',
    appliedRole: 'Frontend Engineer',
    appliedRoleId: '2',
    status: 'shortlisted',
  },
  {
    id: '5',
    name: 'Taylor Morgan',
    headline: 'Product Designer with startup experience',
    location: 'Remote',
    matchScore: 82,
    topTraits: ['independent', 'big-picture', 'fast-paced'],
    experience: '4 years',
    appliedRole: 'Senior Product Designer',
    appliedRoleId: '1',
    status: 'new',
  },
  {
    id: '6',
    name: 'Casey Williams',
    headline: 'Software Engineer | Backend focused',
    location: 'Chicago, IL',
    matchScore: 78,
    topTraits: ['structured', 'analytical', 'methodical'],
    experience: '7 years',
    appliedRole: 'Frontend Engineer',
    appliedRoleId: '2',
    status: 'rejected',
  },
];

const roles = [
  { id: 'all', title: 'all roles' },
  { id: '1', title: 'Senior Product Designer' },
  { id: '2', title: 'Frontend Engineer' },
];

const statusOptions = [
  { value: 'all', label: 'all status' },
  { value: 'new', label: 'new' },
  { value: 'reviewed', label: 'reviewed' },
  { value: 'shortlisted', label: 'shortlisted' },
  { value: 'rejected', label: 'rejected' },
];

export function BrowseCandidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.headline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === 'all' || candidate.appliedRoleId === selectedRole;
    const matchesStatus =
      selectedStatus === 'all' || candidate.status === selectedStatus;
    const matchesScore = candidate.matchScore >= minMatchScore;
    return matchesSearch && matchesRole && matchesStatus && matchesScore;
  });

  const sortedCandidates = [...filteredCandidates].sort(
    (a, b) => b.matchScore - a.matchScore
  );

  const getStatusColor = (status: Candidate['status']) => {
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
    if (score >= 90) return 'var(--color-success)';
    if (score >= 80) return 'var(--color-accent)';
    return 'var(--color-textMuted)';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          browse candidates
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          candidates ranked by culture fit for your roles
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
              placeholder="search candidates..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

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
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.title}
              </option>
            ))}
          </select>

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
            filters
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
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  status
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
                  minimum match score: {minMatchScore}%
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
        {sortedCandidates.length} candidate{sortedCandidates.length !== 1 ? 's' : ''} found
      </p>

      {/* Candidates List */}
      <div className="space-y-4">
        {sortedCandidates.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Users
              className="w-12 h-12 mx-auto mb-4 opacity-40"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              no candidates match your filters
            </p>
          </div>
        ) : (
          sortedCandidates.map(candidate => {
            const statusColors = getStatusColor(candidate.status);
            const isExpanded = expandedCandidate === candidate.id;

            return (
              <div
                key={candidate.id}
                className="rounded-xl border transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedCandidate(isExpanded ? null : candidate.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                      }}
                    >
                      <span className="text-lg font-medium text-white">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {candidate.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                          }}
                        >
                          {candidate.status}
                        </span>
                      </div>

                      <p
                        className="text-sm mb-2 truncate"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {candidate.headline}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span
                          className="flex items-center gap-1"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          <MapPin className="w-3 h-3" />
                          {candidate.location}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          <Briefcase className="w-3 h-3" />
                          {candidate.experience}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          <Star className="w-3 h-3" />
                          applied for {candidate.appliedRole}
                        </span>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: getMatchScoreColor(candidate.matchScore) }}
                      >
                        {candidate.matchScore}%
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        culture fit
                      </p>
                    </div>
                  </div>

                  {/* Top Traits */}
                  <div className="mt-4 flex items-center gap-2">
                    <Sparkles
                      className="w-3.5 h-3.5"
                      style={{ color: 'var(--color-accent)' }}
                    />
                    <div className="flex gap-1.5">
                      {candidate.topTraits.map(trait => (
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
                      >
                        shortlist
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<Coffee className="w-4 h-4" />}
                      >
                        request coffee chat
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-lg border transition-colors hover:bg-[var(--color-background)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-textMuted)',
                        }}
                        title="mark as reviewed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg border transition-colors hover:bg-[var(--color-background)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-error)',
                        }}
                        title="reject"
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
      {sortedCandidates.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">load more candidates</Button>
        </div>
      )}
    </div>
  );
}
