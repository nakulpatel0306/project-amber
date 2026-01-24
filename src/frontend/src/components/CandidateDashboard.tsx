import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Coffee,
  TrendingUp,
  Filter,
  ChevronDown,
  Mail,
  Loader2,
} from 'lucide-react';
import { getCandidates, type Candidate } from '../utils/api';

type SortField = 'culture_fit_score' | 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export function CandidateDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('culture_fit_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [candidates, searchQuery, sortField, sortOrder, showCompleted]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...candidates];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
      );
    }

    // Filter by completion status
    if (showCompleted) {
      filtered = filtered.filter(c => c.assessment_status === 'completed');
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      if (sortField === 'culture_fit_score') {
        aVal = a.culture_fit_score ?? 0;
        bVal = b.culture_fit_score ?? 0;
      } else if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'desc'
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }
      return 0;
    });

    setFilteredCandidates(filtered);
  };

  const handleScheduleCoffeeChat = (candidate: Candidate) => {
    const subject = encodeURIComponent(`Coffee Chat - ${candidate.name}`);
    const body = encodeURIComponent(
      `Hi ${candidate.name},\n\nI'd love to schedule a coffee chat to learn more about your background and interests.\n\nWould you be available sometime this week?\n\nBest regards`
    );
    window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'var(--color-textMuted)';
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-accent)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 mx-auto mb-4 spinner"
            style={{ color: 'var(--color-accent)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            loading candidates...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
          <button
            onClick={loadCandidates}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accentText)',
            }}
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Users className="w-5 h-5" />
            candidate dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>
            {filteredCandidates.length} candidates
          </p>
        </div>

        <button
          onClick={loadCandidates}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-textMuted)' }}
          title="refresh"
        >
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>

      {/* filters */}
      <div
        className="p-4 rounded-xl border mb-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="culture_fit_score">score</option>
              <option value="name">name</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
              }}
            >
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{
                  color: 'var(--color-textMuted)',
                  transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
          </div>

          {/* completed filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              completed only
            </span>
          </label>
        </div>
      </div>

      {/* candidates list */}
      {filteredCandidates.length === 0 ? (
        <div
          className="text-center py-12 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Users
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--color-textMuted)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            no candidates found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map(candidate => (
            <div
              key={candidate.id}
              className="p-4 rounded-xl border transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* candidate info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                    }}
                  >
                    <span className="text-lg font-medium text-white">
                      {candidate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {candidate.name}
                    </h3>
                    <p
                      className="text-sm flex items-center gap-1.5 mt-0.5"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {candidate.email}
                    </p>

                    {/* traits */}
                    {candidate.top_traits && candidate.top_traits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {candidate.top_traits.map((trait, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* score and action */}
                <div className="flex items-center gap-4">
                  {/* score */}
                  <div className="text-right">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getScoreColor(candidate.culture_fit_score) }}
                    >
                      {candidate.culture_fit_score ?? '—'}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      culture fit
                    </p>
                  </div>

                  {/* coffee chat button */}
                  <button
                    onClick={() => handleScheduleCoffeeChat(candidate)}
                    className="px-4 py-2 rounded-lg text-sm font-medium btn-smooth flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accentText)',
                    }}
                  >
                    <Coffee className="w-4 h-4" />
                    coffee chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
