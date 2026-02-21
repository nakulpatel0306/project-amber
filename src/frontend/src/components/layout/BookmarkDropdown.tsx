import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Star, Clock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SavedCandidate {
  id: string;
  candidate_id: string;
  candidate_name: string | null;
  match_score: number | null;
  created_at: string;
}

export function BookmarkDropdown() {
  const { user, isEmployer } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);

  useEffect(() => {
    if (!user || !isEmployer) return;
    loadSavedCandidates();
  }, [user, isEmployer]);

  const loadSavedCandidates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_matches')
        .select('id, candidate_id, candidate_name, match_score, created_at')
        .eq('user_id', user.id)
        .eq('target_type', 'candidate')
        .eq('status', 'saved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Error loading saved candidates:', error.message);
      } else if (data) {
        setSavedCandidates(data);
      }
    } catch (err) {
      console.error('Error loading saved candidates:', err);
    }
  };

  const handleClick = (candidateId: string) => {
    navigate(`/app/employer/ember?deepdive=${candidateId}`);
    setIsOpen(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Only show for employers
  if (!isEmployer) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)] relative"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        <Bookmark className="w-5 h-5" />
        {savedCandidates.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{
              backgroundColor: 'var(--color-accent)',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
            }}
          >
            {savedCandidates.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Saved Candidates
              </h3>
              {savedCandidates.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  {savedCandidates.length} saved
                </span>
              )}
            </div>

            {/* Saved candidates list */}
            <div className="max-h-80 overflow-y-auto">
              {savedCandidates.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--color-textMuted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    No saved candidates yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                    Save candidates from Ember to see them here
                  </p>
                </div>
              ) : (
                savedCandidates.map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => handleClick(candidate.candidate_id)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-[var(--color-background)]"
                  >
                    {/* Avatar placeholder */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                      }}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {candidate.candidate_name || 'Unknown Candidate'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {candidate.match_score && (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                            <Star className="w-3 h-3" /> {candidate.match_score}% match
                          </span>
                        )}
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                          <Clock className="w-3 h-3" /> {timeAgo(candidate.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {savedCandidates.length > 0 && (
              <div
                className="px-4 py-2 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => {
                    navigate('/app/employer/candidates');
                    setIsOpen(false);
                  }}
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View All Saved
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
