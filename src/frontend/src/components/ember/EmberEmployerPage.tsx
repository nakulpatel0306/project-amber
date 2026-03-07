import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useEmployerMatchData } from '../../hooks/useMatchData';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import { useMinLoader } from '../../hooks/useMinLoader';
import { EmberFirefly } from './EmberFirefly';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { PlayerCardGrid } from './gallery/PlayerCardGrid';
import { GalleryFilterBar } from './gallery/GalleryFilterBar';
import { DeepDive } from './gallery/DeepDive';
import { CompareView } from './gallery/CompareView';
import { CoffeeBrewModal } from './gallery/CoffeeBrewModal';
import { ConnectModal } from '../connections/ConnectModal';
import { Button } from '../ui/Button';
import type { CandidateResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';

type EmployerView = PageView | 'compare';

export function EmberEmployerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const { profile } = useAuth();
  const { getConnectionStatus, sendConnectionRequest } = useConnections();

  // Data hooks
  const {
    employer, candidates, roles, archetype, isLoading,
    selectedRoleId, handleRoleChange, setPendingChats,
  } = useEmployerMatchData();
  const { isSaved, save, unsave, getSavedMatch } = useSavedMatches();
  const showLoader = useMinLoader(isLoading, 3500);

  // View state
  const deepdiveParam = searchParams.get('deepdive');
  const [view, setView] = useState<EmployerView>(deepdiveParam ? 'deepdive' : 'gallery');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [brewTarget, setBrewTarget] = useState<CandidateResult | null>(null);
  const [connectTarget, setConnectTarget] = useState<CandidateResult | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  // Handle deepdive URL param once candidates load
  useEffect(() => {
    if (deepdiveParam && candidates.length > 0 && !selectedCandidate) {
      const candidate = candidates.find(c => c.candidateId === deepdiveParam);
      if (candidate) {
        setSelectedCandidate(candidate);
        setView('deepdive');
      }
    }
  }, [deepdiveParam, candidates, selectedCandidate]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [quickFilter, setQuickFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArchetypes, setSelectedArchetypes] = useState<Set<string>>(new Set());
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // Derived filter data
  const archetypes = useMemo(() => {
    const set = new Set(candidates.map(c => c.archetype.name));
    return Array.from(set).sort();
  }, [candidates]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedArchetypes.size > 0) count++;
    if (minScore > 0) count++;
    if (maxScore < 100) count++;
    return count;
  }, [selectedArchetypes, minScore, maxScore]);

  // Filtered + sorted candidates
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // Quick filter
    if (quickFilter === 'top5') result = result.slice(0, 5);
    else if (quickFilter === 'top10') result = result.slice(0, 10);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q)
      );
    }

    // Filters
    if (selectedArchetypes.size > 0) {
      result = result.filter(c => selectedArchetypes.has(c.archetype.name));
    }
    if (minScore > 0) result = result.filter(c => c.overallScore >= minScore);
    if (maxScore < 100) result = result.filter(c => c.overallScore <= maxScore);

    // Sort
    switch (sortBy) {
      case 'culture': result.sort((a, b) => b.cultureScore - a.cultureScore); break;
      case 'workstyle': result.sort((a, b) => b.workStyleFit - a.workStyleFit); break;
      case 'score':
      default: result.sort((a, b) => b.overallScore - a.overallScore);
    }

    return result;
  }, [candidates, quickFilter, searchQuery, selectedArchetypes, minScore, maxScore, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedArchetypes(new Set());
    setMinScore(0);
    setMaxScore(100);
    setQuickFilter('all');
  }, []);

  // Saved match IDs
  const savedIds = useMemo(() => {
    return new Set(candidates.filter(c => isSaved('candidate', c.candidateId)).map(c => c.candidateId));
  }, [candidates, isSaved]);

  // Handlers
  const handleDeepDive = useCallback((c: CandidateResult) => {
    setSelectedCandidate(c);
    setView('deepdive');
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedCandidate(null);
    setCompareIds(new Set());
    setView('gallery');
  }, []);

  const handleToggleSave = useCallback(async (c: CandidateResult) => {
    try {
      const existing = getSavedMatch('candidate', c.candidateId);
      if (existing) {
        await unsave(existing.id);
        showSuccess('Removed', 'Candidate removed from shortlist');
      } else {
        await save({
          target_type: 'candidate',
          role_id: selectedRoleId || null,
          employer_id: employer?.id || null,
          candidate_id: c.candidateId,
          candidate_name: c.name,
          match_score: c.overallScore,
          notes: null,
          status: 'saved',
        });
        showSuccess('Shortlisted!', 'Candidate added to shortlist');
      }
    } catch {
      showError('Error', 'Failed to update shortlist');
    }
  }, [employer, selectedRoleId, getSavedMatch, save, unsave, showSuccess, showError]);

  const handleToggleSelect = useCallback((c: CandidateResult) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(c.candidateId)) next.delete(c.candidateId);
      else if (next.size < 3) next.add(c.candidateId);
      return next;
    });
  }, []);

  const handleBrew = useCallback(async (note: string, preferredDates: Date[]) => {
    if (!employer || !brewTarget) return;
    try {
      const insertData: any = {
        candidate_id: brewTarget.candidateId,
        employer_id: employer.id,
        initiated_by: 'employer',
        status: 'pending',
        match_score: brewTarget.overallScore,
        message: note || undefined,
        // Store names directly to avoid cross-table JOINs blocked by RLS
        candidate_name: brewTarget.name,
        company_name: employer.company_name,
        // Store preferred dates as ISO strings
        preferred_dates: preferredDates.length > 0
          ? preferredDates.map(d => d.toISOString())
          : undefined,
      };
      if (selectedRoleId) {
        const role = roles.find(r => r.id === selectedRoleId);
        if (role) {
          insertData.role_id = selectedRoleId;
          insertData.role_title = role.title;
        }
      }
      await supabase.from('coffee_chats').insert(insertData);
      showSuccess('Sent!', 'Coffee chat invitation sent — view it in your Chats');
      setPendingChats(prev => prev + 1);

      const existing = getSavedMatch('candidate', brewTarget.candidateId);
      if (existing) {
        await supabase.from('saved_matches').update({ status: 'pending' }).eq('id', existing.id);
      }
    } catch {
      showError('Error', 'Failed to send invitation');
      throw new Error('Failed to send');
    }
  }, [employer, brewTarget, selectedRoleId, roles, getSavedMatch, showSuccess, showError, setPendingChats]);

  const handleConnect = useCallback(async (message: string, meetInvite?: { proposed_times: string[]; duration_minutes: number }) => {
    if (!employer || !connectTarget) return;
    try {
      await sendConnectionRequest({
        receiverId: connectTarget.candidateId,
        senderRole: 'employer',
        message,
        senderName: profile?.full_name || undefined,
        senderCompany: employer.company_name,
        receiverName: connectTarget.name,
        meetInvite,
      });
      showSuccess('Sent!', `Connection request sent to ${connectTarget.name}`);
    } catch {
      showError('Error', 'Failed to send connection request');
      throw new Error('Failed');
    }
  }, [employer, connectTarget, profile, sendConnectionRequest, showSuccess, showError]);

  // Deep dive dimension data
  const deepDiveDimensions = useMemo(() => {
    if (!selectedCandidate || !employer) return [];
    return [
      { name: 'Openness', candidateScore: selectedCandidate.candidateOcean.openness, employerPreference: employer.openness_preference || 50, fitScore: selectedCandidate.breakdown.opennessFit },
      { name: 'Conscientiousness', candidateScore: selectedCandidate.candidateOcean.conscientiousness, employerPreference: employer.conscientiousness_preference || 50, fitScore: selectedCandidate.breakdown.conscientiousnessFit },
      { name: 'Extraversion', candidateScore: selectedCandidate.candidateOcean.extraversion, employerPreference: employer.extraversion_preference || 50, fitScore: selectedCandidate.breakdown.extraversionFit },
      { name: 'Agreeableness', candidateScore: selectedCandidate.candidateOcean.agreeableness, employerPreference: employer.agreeableness_preference || 50, fitScore: selectedCandidate.breakdown.agreeablenessFit },
      { name: 'Stability', candidateScore: 100 - selectedCandidate.candidateOcean.neuroticism, employerPreference: 100 - (employer.neuroticism_preference || 50), fitScore: selectedCandidate.breakdown.neuroticismFit },
    ];
  }, [selectedCandidate, employer]);

  // Compare candidates
  const compareCandidates = useMemo(() => {
    return candidates.filter(c => compareIds.has(c.candidateId));
  }, [candidates, compareIds]);

  // Loading
  if (showLoader) {
    return <CoffeeBrewLoader variant="fullscreen" />;
  }

  // No employer setup
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

  const employerOcean: OCEANScores = {
    openness: employer.openness_preference || 50,
    conscientiousness: employer.conscientiousness_preference || 50,
    extraversion: employer.extraversion_preference || 50,
    agreeableness: employer.agreeableness_preference || 50,
    neuroticism: employer.neuroticism_preference || 50,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EmberFirefly size="md" mood="happy" />
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Ember Candidates</h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {archetype ? `${archetype.name} Culture` : 'Your personalized candidate gallery'}
              </p>
            </div>
          </div>
          {compareIds.size >= 2 && view === 'gallery' && (
            <Button size="sm" onClick={() => setView('compare')}>
              Compare ({compareIds.size})
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'gallery' ? (
            <motion.div
              key="gallery"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GalleryFilterBar
                mode="employer"
                matchCount={filteredCandidates.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                quickFilter={quickFilter}
                onQuickFilterChange={setQuickFilter}
                activeFilterCount={activeFilterCount}
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                archetypes={archetypes}
                selectedArchetypes={selectedArchetypes}
                onToggleArchetype={(arch) => {
                  setSelectedArchetypes(prev => {
                    const next = new Set(prev);
                    if (next.has(arch)) next.delete(arch);
                    else next.add(arch);
                    return next;
                  });
                }}
                roles={roles}
                selectedRoleId={selectedRoleId}
                onRoleChange={handleRoleChange}
                minScore={minScore}
                maxScore={maxScore}
                onMinScoreChange={setMinScore}
                onMaxScoreChange={setMaxScore}
                onClearFilters={clearFilters}
              />

              <PlayerCardGrid
                mode="employer"
                candidates={filteredCandidates}
                savedIds={savedIds}
                selectedIds={compareIds}
                showSelect={true}
                getConnectionStatus={getConnectionStatus}
                onDeepDive={handleDeepDive}
                onBrew={(c) => setBrewTarget(c)}
                onToggleSave={handleToggleSave}
                onToggleSelect={handleToggleSelect}
                onConnect={(c) => setConnectTarget(c)}
              />
            </motion.div>
          ) : view === 'deepdive' && selectedCandidate ? (
            <DeepDive
              key="deepdive"
              mode="employer"
              name={selectedCandidate.name}
              subtitle={selectedCandidate.headline}
              archetype={selectedCandidate.archetype}
              overallScore={selectedCandidate.overallScore}
              traitScore={selectedCandidate.traitScore}
              cultureScore={selectedCandidate.cultureScore}
              workStyleScore={selectedCandidate.workStyleFit}
              communicationScore={Math.round((selectedCandidate.breakdown.extraversionFit + selectedCandidate.breakdown.agreeablenessFit) / 2)}
              dimensions={deepDiveDimensions}
              candidateOcean={selectedCandidate.candidateOcean}
              employerOcean={employerOcean}
              candidateId={selectedCandidate.candidateId}
              employerId={employer.id}
              roleId={selectedRoleId || undefined}
              isSaved={savedIds.has(selectedCandidate.candidateId)}
              connectionStatus={getConnectionStatus(selectedCandidate.candidateId)}
              onBack={handleBackToGallery}
              onBrew={() => setBrewTarget(selectedCandidate)}
              onToggleSave={() => handleToggleSave(selectedCandidate)}
              onConnect={() => setConnectTarget(selectedCandidate)}
              onCompare={() => {
                setCompareIds(prev => {
                  const next = new Set(prev);
                  next.add(selectedCandidate.candidateId);
                  return next;
                });
                setView('gallery');
              }}
            />
          ) : view === 'compare' && compareCandidates.length >= 2 ? (
            <CompareView
              key="compare"
              candidates={compareCandidates}
              employerOcean={employerOcean as unknown as Record<string, number>}
              onBack={handleBackToGallery}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Coffee Brew Modal */}
      {brewTarget && (
        <CoffeeBrewModal
          isOpen={!!brewTarget}
          onClose={() => setBrewTarget(null)}
          name={brewTarget.name}
          subtitle={brewTarget.headline}
          archetype={brewTarget.archetype}
          overallScore={brewTarget.overallScore}
          onBrew={handleBrew}
        />
      )}

      {/* Connect Modal */}
      {connectTarget && (
        <ConnectModal
          isOpen={!!connectTarget}
          onClose={() => setConnectTarget(null)}
          name={connectTarget.name}
          subtitle={connectTarget.headline}
          archetype={connectTarget.archetype}
          overallScore={connectTarget.overallScore}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}
