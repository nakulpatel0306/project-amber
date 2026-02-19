import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { useCandidateMatchData } from '../../hooks/useMatchData';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import { EmberFirefly } from './EmberFirefly';
import { PlayerCardGrid } from './gallery/PlayerCardGrid';
import { GalleryFilterBar } from './gallery/GalleryFilterBar';
import { DeepDive } from './gallery/DeepDive';
import { CoffeeBrewModal } from './gallery/CoffeeBrewModal';
import { Button } from '../ui/Button';
import type { MatchResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';

export function EmberAgent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();

  // Data hooks
  const {
    candidate, matches, archetype, isLoading, error: dataError, setPendingChats,
  } = useCandidateMatchData();
  const { isSaved, save, unsave, getSavedMatch } = useSavedMatches();

  // View state
  const deepdiveParam = searchParams.get('deepdive');
  const [view, setView] = useState<PageView>(deepdiveParam ? 'deepdive' : 'gallery');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [brewTarget, setBrewTarget] = useState<MatchResult | null>(null);

  // Handle deepdive URL param once matches load
  useEffect(() => {
    if (deepdiveParam && matches.length > 0 && !selectedMatch) {
      const match = matches.find(m => m.role.id === deepdiveParam);
      if (match) {
        setSelectedMatch(match);
        setView('deepdive');
      }
    }
  }, [deepdiveParam, matches, selectedMatch]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [quickFilter, setQuickFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // Derived filter data
  const industries = useMemo(() => {
    const set = new Set(matches.map(m => m.role.employers.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [matches]);

  const locations = useMemo(() => {
    const set = new Set(matches.map(m => m.role.employers.location || m.role.location).filter(Boolean));
    return Array.from(set).sort();
  }, [matches]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedIndustry) count++;
    if (selectedWorkStyle) count++;
    if (selectedLocation) count++;
    if (minScore > 0) count++;
    if (maxScore < 100) count++;
    return count;
  }, [selectedIndustry, selectedWorkStyle, selectedLocation, minScore, maxScore]);

  // Filtered + sorted matches
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Quick filter
    if (quickFilter === 'top5') result = result.slice(0, 5);
    else if (quickFilter === 'top10') result = result.slice(0, 10);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.role.employers.company_name.toLowerCase().includes(q) ||
        m.role.title.toLowerCase().includes(q)
      );
    }

    // Filters
    if (selectedIndustry) result = result.filter(m => m.role.employers.industry === selectedIndustry);
    if (selectedWorkStyle) result = result.filter(m => m.role.work_style === selectedWorkStyle);
    if (selectedLocation) result = result.filter(m =>
      (m.role.employers.location || m.role.location) === selectedLocation
    );
    if (minScore > 0) result = result.filter(m => m.overallMatchScore >= minScore);
    if (maxScore < 100) result = result.filter(m => m.overallMatchScore <= maxScore);

    // Sort
    switch (sortBy) {
      case 'culture': result.sort((a, b) => b.cultureMatchScore - a.cultureMatchScore); break;
      case 'workstyle': result.sort((a, b) => b.breakdown.workStyleFit - a.breakdown.workStyleFit); break;
      case 'score':
      default: result.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
    }

    return result;
  }, [matches, quickFilter, searchQuery, selectedIndustry, selectedWorkStyle, selectedLocation, minScore, maxScore, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedWorkStyle('');
    setSelectedLocation('');
    setMinScore(0);
    setMaxScore(100);
    setQuickFilter('all');
  }, []);

  // Saved match IDs
  const savedIds = useMemo(() => {
    return new Set(matches.filter(m => isSaved('role', m.role.id)).map(m => m.role.id));
  }, [matches, isSaved]);

  // Handlers
  const handleDeepDive = useCallback((match: MatchResult) => {
    setSelectedMatch(match);
    setView('deepdive');
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedMatch(null);
    setView('gallery');
  }, []);

  const handleToggleSave = useCallback(async (match: MatchResult) => {
    try {
      const existing = getSavedMatch('role', match.role.id);
      if (existing) {
        await unsave(existing.id);
        showSuccess('Removed', 'Match removed from saved');
      } else {
        await save({
          target_type: 'role',
          role_id: match.role.id,
          employer_id: match.role.employers.id,
          candidate_id: candidate?.id || null,
          match_score: match.overallMatchScore,
          notes: null,
          status: 'saved',
        });
        showSuccess('Saved!', 'Match added to saved');
      }
    } catch {
      showError('Error', 'Failed to update saved matches');
    }
  }, [candidate, getSavedMatch, save, unsave, showSuccess, showError]);

  const handleBrew = useCallback(async (note: string) => {
    if (!candidate || !brewTarget) return;
    try {
      await supabase.from('coffee_chats').insert({
        candidate_id: candidate.id,
        employer_id: brewTarget.role.employers.id,
        role_id: brewTarget.role.id,
        initiated_by: 'candidate',
        status: 'pending',
        message: note || `Interested in ${brewTarget.role.title}`,
        role_title: brewTarget.role.title,
        match_score: brewTarget.overallMatchScore,
      });
      showSuccess('Sent!', 'Coffee chat request sent — view it in your Chats');
      setPendingChats(prev => prev + 1);

      // Also update saved match status to pending if saved
      const existing = getSavedMatch('role', brewTarget.role.id);
      if (existing) {
        await supabase.from('saved_matches').update({ status: 'pending' }).eq('id', existing.id);
      }
    } catch {
      showError('Error', 'Failed to send request');
      throw new Error('Failed to send');
    }
  }, [candidate, brewTarget, getSavedMatch, showSuccess, showError, setPendingChats]);

  // Deep dive dimension data
  const deepDiveDimensions = useMemo(() => {
    if (!selectedMatch || !candidate) return [];
    const emp = selectedMatch.role.employers;
    return [
      { name: 'Openness', candidateScore: candidate.openness_score, employerPreference: emp.openness_preference || 50, fitScore: selectedMatch.breakdown.opennessFit },
      { name: 'Conscientiousness', candidateScore: candidate.conscientiousness_score, employerPreference: emp.conscientiousness_preference || 50, fitScore: selectedMatch.breakdown.conscientiousnessFit },
      { name: 'Extraversion', candidateScore: candidate.extraversion_score, employerPreference: emp.extraversion_preference || 50, fitScore: selectedMatch.breakdown.extraversionFit },
      { name: 'Agreeableness', candidateScore: candidate.agreeableness_score, employerPreference: emp.agreeableness_preference || 50, fitScore: selectedMatch.breakdown.agreeablenessFit },
      { name: 'Stability', candidateScore: 100 - candidate.neuroticism_score, employerPreference: 100 - (emp.neuroticism_preference || 50), fitScore: selectedMatch.breakdown.neuroticismFit },
    ];
  }, [selectedMatch, candidate]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <EmberFirefly size="lg" mood="thinking" animated />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Preparing your matches...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Something went wrong
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            {dataError}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // No assessment
  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Complete Your Assessment First
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Take our personality assessment to unlock Ember insights, discover your archetype, and find your best matches.
          </p>
          <Button onClick={() => navigate('/app/personality')}>Start Assessment</Button>
        </div>
      </div>
    );
  }

  const candidateOcean: OCEANScores = {
    openness: candidate.openness_score,
    conscientiousness: candidate.conscientiousness_score,
    extraversion: candidate.extraversion_score,
    agreeableness: candidate.agreeableness_score,
    neuroticism: candidate.neuroticism_score,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <EmberFirefly size="md" mood="happy" />
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Ember Matches</h1>
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {archetype ? `${archetype.name} archetype` : 'Your personalized match gallery'}
              {matches.length > 0 && ` · ${matches.length} matches`}
            </p>
          </div>
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
                mode="candidate"
                matchCount={filteredMatches.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                quickFilter={quickFilter}
                onQuickFilterChange={setQuickFilter}
                activeFilterCount={activeFilterCount}
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                industries={industries}
                selectedIndustry={selectedIndustry}
                onIndustryChange={setSelectedIndustry}
                selectedWorkStyle={selectedWorkStyle}
                onWorkStyleChange={setSelectedWorkStyle}
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                minScore={minScore}
                maxScore={maxScore}
                onMinScoreChange={setMinScore}
                onMaxScoreChange={setMaxScore}
                onClearFilters={clearFilters}
              />

              <PlayerCardGrid
                mode="candidate"
                matches={filteredMatches}
                savedIds={savedIds}
                onDeepDive={handleDeepDive}
                onBrew={(match) => setBrewTarget(match)}
                onToggleSave={handleToggleSave}
              />
            </motion.div>
          ) : view === 'deepdive' && selectedMatch ? (
            <DeepDive
              key="deepdive"
              mode="candidate"
              name={selectedMatch.role.employers.company_name}
              subtitle={selectedMatch.role.title}
              archetype={selectedMatch.employerArchetype}
              overallScore={selectedMatch.overallMatchScore}
              traitScore={selectedMatch.traitMatchScore}
              cultureScore={selectedMatch.cultureMatchScore}
              workStyleScore={selectedMatch.breakdown.workStyleFit}
              communicationScore={Math.round((selectedMatch.breakdown.extraversionFit + selectedMatch.breakdown.agreeablenessFit) / 2)}
              dimensions={deepDiveDimensions}
              candidateOcean={candidateOcean}
              employerOcean={{
                openness: selectedMatch.role.employers.openness_preference || 50,
                conscientiousness: selectedMatch.role.employers.conscientiousness_preference || 50,
                extraversion: selectedMatch.role.employers.extraversion_preference || 50,
                agreeableness: selectedMatch.role.employers.agreeableness_preference || 50,
                neuroticism: selectedMatch.role.employers.neuroticism_preference || 50,
              }}
              candidateId={candidate.id}
              employerId={selectedMatch.role.employers.id}
              roleId={selectedMatch.role.id}
              isSaved={savedIds.has(selectedMatch.role.id)}
              onBack={handleBackToGallery}
              onBrew={() => setBrewTarget(selectedMatch)}
              onToggleSave={() => handleToggleSave(selectedMatch)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Coffee Brew Modal */}
      {brewTarget && (
        <CoffeeBrewModal
          isOpen={!!brewTarget}
          onClose={() => setBrewTarget(null)}
          name={brewTarget.role.employers.company_name}
          subtitle={brewTarget.role.title}
          archetype={brewTarget.employerArchetype}
          overallScore={brewTarget.overallMatchScore}
          onBrew={handleBrew}
        />
      )}
    </div>
  );
}
