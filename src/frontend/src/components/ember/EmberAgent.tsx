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
import type { EmployerResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';

export function EmberAgent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();

  // Data hooks
  const {
    candidate, employers, archetype, isLoading, error: dataError, setPendingChats,
  } = useCandidateMatchData();
  const { isSaved, save, unsave, getSavedMatch } = useSavedMatches();

  // View state
  const deepdiveParam = searchParams.get('deepdive');
  const [view, setView] = useState<PageView>(deepdiveParam ? 'deepdive' : 'gallery');
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerResult | null>(null);
  const [brewTarget, setBrewTarget] = useState<EmployerResult | null>(null);

  // Handle deepdive URL param once employers load
  useEffect(() => {
    if (deepdiveParam && employers.length > 0 && !selectedEmployer) {
      const emp = employers.find(e => e.employerId === deepdiveParam);
      if (emp) {
        setSelectedEmployer(emp);
        setView('deepdive');
      }
    }
  }, [deepdiveParam, employers, selectedEmployer]);

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
    const set = new Set(employers.map(e => e.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [employers]);

  const locations = useMemo(() => {
    const set = new Set(employers.map(e => e.location).filter(Boolean));
    return Array.from(set).sort();
  }, [employers]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedIndustry) count++;
    if (selectedWorkStyle) count++;
    if (selectedLocation) count++;
    if (minScore > 0) count++;
    if (maxScore < 100) count++;
    return count;
  }, [selectedIndustry, selectedWorkStyle, selectedLocation, minScore, maxScore]);

  // Filtered + sorted employers
  const filteredEmployers = useMemo(() => {
    let result = [...employers];

    // Quick filter
    if (quickFilter === 'top5') result = result.slice(0, 5);
    else if (quickFilter === 'top10') result = result.slice(0, 10);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.companyName.toLowerCase().includes(q) ||
        e.industry.toLowerCase().includes(q)
      );
    }

    // Filters
    if (selectedIndustry) result = result.filter(e => e.industry === selectedIndustry);
    if (selectedLocation) result = result.filter(e => e.location === selectedLocation);
    if (minScore > 0) result = result.filter(e => e.overallScore >= minScore);
    if (maxScore < 100) result = result.filter(e => e.overallScore <= maxScore);

    // Sort
    switch (sortBy) {
      case 'culture': result.sort((a, b) => b.cultureScore - a.cultureScore); break;
      case 'workstyle': result.sort((a, b) => b.workStyleFit - a.workStyleFit); break;
      case 'score':
      default: result.sort((a, b) => b.overallScore - a.overallScore);
    }

    return result;
  }, [employers, quickFilter, searchQuery, selectedIndustry, selectedLocation, minScore, maxScore, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedWorkStyle('');
    setSelectedLocation('');
    setMinScore(0);
    setMaxScore(100);
    setQuickFilter('all');
  }, []);

  // Saved match IDs (using employer_id now)
  const savedIds = useMemo(() => {
    return new Set(employers.filter(e => isSaved('candidate', e.employerId)).map(e => e.employerId));
  }, [employers, isSaved]);

  // Handlers
  const handleDeepDive = useCallback((emp: EmployerResult) => {
    setSelectedEmployer(emp);
    setView('deepdive');
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedEmployer(null);
    setView('gallery');
  }, []);

  const handleToggleSave = useCallback(async (emp: EmployerResult) => {
    try {
      const existing = getSavedMatch('candidate', emp.employerId);
      if (existing) {
        await unsave(existing.id);
        showSuccess('Removed', 'Match removed from saved');
      } else {
        await save({
          target_type: 'candidate', // Reusing this type for employer saves from candidate side
          role_id: null,
          employer_id: emp.employerId,
          candidate_id: candidate?.id || null,
          candidate_name: null,
          match_score: emp.overallScore,
          notes: null,
          status: 'saved',
        });
        showSuccess('Saved!', 'Match added to saved');
      }
    } catch {
      showError('Error', 'Failed to update saved matches');
    }
  }, [candidate, getSavedMatch, save, unsave, showSuccess, showError]);

  const handleBrew = useCallback(async (note: string, preferredDates: Date[]) => {
    if (!candidate || !brewTarget) return;
    try {
      await supabase.from('coffee_chats').insert({
        candidate_id: candidate.id,
        employer_id: brewTarget.employerId,
        role_id: null,
        initiated_by: 'candidate',
        status: 'pending',
        message: note || `Interested in learning about ${brewTarget.companyName}`,
        role_title: null,
        match_score: brewTarget.overallScore,
        company_name: brewTarget.companyName,
        preferred_dates: preferredDates.length > 0 ? preferredDates.map(d => d.toISOString()) : null,
      });
      showSuccess('Sent!', 'Coffee chat request sent — view it in your Chats');
      setPendingChats(prev => prev + 1);

      // Also update saved match status to pending if saved
      const existing = getSavedMatch('candidate', brewTarget.employerId);
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
    if (!selectedEmployer || !candidate) return [];
    return [
      { name: 'Openness', candidateScore: candidate.openness_score, employerPreference: selectedEmployer.employerOcean.openness, fitScore: selectedEmployer.breakdown.opennessFit },
      { name: 'Conscientiousness', candidateScore: candidate.conscientiousness_score, employerPreference: selectedEmployer.employerOcean.conscientiousness, fitScore: selectedEmployer.breakdown.conscientiousnessFit },
      { name: 'Extraversion', candidateScore: candidate.extraversion_score, employerPreference: selectedEmployer.employerOcean.extraversion, fitScore: selectedEmployer.breakdown.extraversionFit },
      { name: 'Agreeableness', candidateScore: candidate.agreeableness_score, employerPreference: selectedEmployer.employerOcean.agreeableness, fitScore: selectedEmployer.breakdown.agreeablenessFit },
      { name: 'Stability', candidateScore: 100 - candidate.neuroticism_score, employerPreference: 100 - selectedEmployer.employerOcean.neuroticism, fitScore: selectedEmployer.breakdown.neuroticismFit },
    ];
  }, [selectedEmployer, candidate]);

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
              {employers.length > 0 && ` · ${employers.length} companies`}
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
                matchCount={filteredEmployers.length}
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
                employers={filteredEmployers}
                savedIds={savedIds}
                onDeepDive={handleDeepDive}
                onBrew={(emp) => setBrewTarget(emp)}
                onToggleSave={handleToggleSave}
              />
            </motion.div>
          ) : view === 'deepdive' && selectedEmployer ? (
            <DeepDive
              key="deepdive"
              mode="candidate"
              name={selectedEmployer.companyName}
              subtitle={selectedEmployer.industry}
              archetype={selectedEmployer.archetype}
              overallScore={selectedEmployer.overallScore}
              traitScore={selectedEmployer.traitScore}
              cultureScore={selectedEmployer.cultureScore}
              workStyleScore={selectedEmployer.workStyleFit}
              communicationScore={Math.round((selectedEmployer.breakdown.extraversionFit + selectedEmployer.breakdown.agreeablenessFit) / 2)}
              dimensions={deepDiveDimensions}
              candidateOcean={candidateOcean}
              employerOcean={selectedEmployer.employerOcean}
              candidateId={candidate.id}
              employerId={selectedEmployer.employerId}
              isSaved={savedIds.has(selectedEmployer.employerId)}
              onBack={handleBackToGallery}
              onBrew={() => setBrewTarget(selectedEmployer)}
              onToggleSave={() => handleToggleSave(selectedEmployer)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Coffee Brew Modal */}
      {brewTarget && (
        <CoffeeBrewModal
          isOpen={!!brewTarget}
          onClose={() => setBrewTarget(null)}
          name={brewTarget.companyName}
          subtitle={brewTarget.industry}
          archetype={brewTarget.archetype}
          overallScore={brewTarget.overallScore}
          onBrew={handleBrew}
        />
      )}
    </div>
  );
}
