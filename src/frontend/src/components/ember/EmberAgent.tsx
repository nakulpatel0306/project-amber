import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Coffee, TrendingUp, Target, Award, BarChart3, Flame } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useCandidateMatchData } from '../../hooks/useMatchData';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import { useMinLoader } from '../../hooks/useMinLoader';
import { EmberFirefly } from './EmberFirefly';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { ScoreRing } from '../ui/ScoreRing';
import { PlayerCardGrid } from './gallery/PlayerCardGrid';
import { GalleryFilterBar } from './gallery/GalleryFilterBar';
import { DeepDive } from './gallery/DeepDive';
import { CoffeeBrewModal } from './gallery/CoffeeBrewModal';
import { ConnectModal } from '../connections/ConnectModal';
import { Button } from '../ui/Button';
import { PageBanner } from '../ui/PageBanner';
import { bentoContainer, bentoItem, counterReveal } from '../../utils/motion';
import { getMatchColor, avatarGradient } from '../../utils/matchHelpers';
import type { EmployerResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';

export function EmberAgent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const { profile } = useAuth();
  const { getConnectionStatus, sendConnectionRequest } = useConnections();

  // Data hooks
  const {
    candidate, employers, archetype, isLoading, error: dataError, setPendingChats,
  } = useCandidateMatchData();
  const { isSaved, save, unsave, getSavedMatch } = useSavedMatches();
  const showLoader = useMinLoader(isLoading, 3500);

  // View state
  const deepdiveParam = searchParams.get('deepdive');
  const [view, setView] = useState<PageView>(deepdiveParam ? 'deepdive' : 'gallery');
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerResult | null>(null);
  const [brewTarget, setBrewTarget] = useState<EmployerResult | null>(null);
  const [connectTarget, setConnectTarget] = useState<EmployerResult | null>(null);

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
      case 'recent': result.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      }); break;
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

  const handleConnect = useCallback(async (message: string, meetInvite?: { proposed_times: string[]; duration_minutes: number }) => {
    if (!candidate || !connectTarget) return;
    try {
      await sendConnectionRequest({
        receiverId: connectTarget.employerId,
        senderRole: 'candidate',
        message,
        senderName: profile?.full_name || undefined,
        receiverName: connectTarget.companyName,
        receiverCompany: connectTarget.companyName,
        meetInvite,
      });
      showSuccess('Sent!', `Connection request sent to ${connectTarget.companyName}`);
    } catch {
      showError('Error', 'Failed to send connection request');
      throw new Error('Failed');
    }
  }, [candidate, connectTarget, profile, sendConnectionRequest, showSuccess, showError]);

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

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    if (employers.length === 0) return null;
    const scores = employers.map(e => e.overallScore);
    const sortedScores = [...scores].sort((a, b) => b - a);
    const topScores = sortedScores.slice(0, 3);
    const strongMatches = employers.filter(e => e.overallScore >= 80).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const buckets = [0, 0, 0, 0, 0];
    scores.forEach(s => {
      const idx = Math.min(Math.floor(s / 20), 4);
      buckets[idx]++;
    });
    const maxBucket = Math.max(...buckets, 1);
    return { totalMatches: employers.length, topScores, strongMatches, avgScore, buckets, maxBucket };
  }, [employers]);

  // Featured match (top employer)
  const featuredMatch = useMemo(() => {
    if (employers.length === 0) return null;
    return [...employers].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [employers]);

  // Loading
  if (showLoader) {
    return <CoffeeBrewLoader variant="fullscreen" />;
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
        <PageBanner
          title="Ember"
          subtitle={
            (archetype ? `${archetype.name} archetype` : 'Your personalized match gallery') +
            (employers.length > 0 ? ` · ${employers.length} companies` : '')
          }
          icon={Flame}
          className="mb-0"
        />

        {/* ── Dashboard Stats Row ── */}
        {dashboardStats && view === 'gallery' && (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            variants={bentoContainer}
            initial="hidden"
            animate="show"
          >
            {/* Total Matches */}
            <motion.div variants={counterReveal} className="bento-card bento-card-accent p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Total Matches</span>
                </div>
              </div>
              <div className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                {dashboardStats.totalMatches}
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-0.5 mt-2 h-6">
                {dashboardStats.buckets.map((count, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${Math.max((count / dashboardStats.maxBucket) * 100, 8)}%`,
                      backgroundColor: i >= 3 ? 'var(--color-accent)' : 'var(--color-border)',
                      opacity: i >= 3 ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Top Scores */}
            <motion.div variants={counterReveal} className="bento-card bento-card-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Top Scores</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="rank-medal rank-medal-gold text-[10px]">1st</span>
                  <span className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: getMatchColor(dashboardStats.topScores[0]) }}>
                    {dashboardStats.topScores[0]}
                  </span>
                </div>
                {dashboardStats.topScores[1] && (
                  <div className="flex items-center gap-2">
                    <span className="rank-medal rank-medal-silver text-[8px]">2nd</span>
                    <span className="text-sm font-bold" style={{ color: getMatchColor(dashboardStats.topScores[1]) }}>
                      {dashboardStats.topScores[1]}
                    </span>
                  </div>
                )}
                {dashboardStats.topScores[2] && (
                  <div className="flex items-center gap-2">
                    <span className="rank-medal rank-medal-bronze text-[8px]">3rd</span>
                    <span className="text-sm font-bold" style={{ color: getMatchColor(dashboardStats.topScores[2]) }}>
                      {dashboardStats.topScores[2]}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Strong Matches */}
            <motion.div variants={counterReveal} className="bento-card bento-card-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Strong (80+)</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                  {dashboardStats.strongMatches}
                </span>
                {dashboardStats.totalMatches > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#22C55E' }}>
                    {Math.round((dashboardStats.strongMatches / dashboardStats.totalMatches) * 100)}%
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>of total matches</span>
            </motion.div>

            {/* Avg Compatibility */}
            <motion.div variants={counterReveal} className="bento-card bento-card-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Avg Score</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: getMatchColor(dashboardStats.avgScore) }}>
                  {dashboardStats.avgScore}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>%</span>
              </div>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${dashboardStats.avgScore}%`, backgroundColor: getMatchColor(dashboardStats.avgScore) }} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Featured Match Hero (bento) ── */}
        {featuredMatch && view === 'gallery' && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            variants={bentoContainer}
            initial="hidden"
            animate="show"
          >
            {/* Left 2/3: Hero card */}
            <motion.div variants={bentoItem} className="lg:col-span-2 bento-card bento-card-accent">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ background: featuredMatch.logoUrl ? undefined : avatarGradient(featuredMatch.companyName) }}
                  >
                    {featuredMatch.logoUrl ? (
                      <img src={featuredMatch.logoUrl} alt={featuredMatch.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{featuredMatch.companyName.charAt(0)}</span>
                    )}
                  </div>
                  <span className="rank-medal rank-medal-gold absolute -top-1 -right-1 text-[9px]">#1</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                      {featuredMatch.companyName}
                    </h3>
                    <span className="stat-badge">{featuredMatch.archetype.name}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                    {featuredMatch.industry}{featuredMatch.location ? ` · ${featuredMatch.location}` : ''}
                  </p>

                  {/* Metric bars */}
                  <div className="space-y-2">
                    {[
                      { label: 'Culture', score: featuredMatch.cultureScore },
                      { label: 'Work Style', score: featuredMatch.workStyleFit },
                      { label: 'Traits', score: featuredMatch.traitScore },
                    ].map(({ label, score }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs w-16 text-right" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
                        <div className="metric-bar flex-1">
                          <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: getMatchColor(score) }} />
                        </div>
                        <span className="text-xs font-semibold w-8" style={{ color: getMatchColor(score) }}>{score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="ghost" onClick={() => handleDeepDive(featuredMatch)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Deep Dive
                    </Button>
                    {getConnectionStatus(featuredMatch.employerId) === 'accepted' ? (
                      <Button size="sm" onClick={() => setBrewTarget(featuredMatch)}>
                        <Coffee className="w-3.5 h-3.5 mr-1" /> Let's Brew
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setConnectTarget(featuredMatch)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Score ring */}
                <div className="hidden sm:flex flex-shrink-0">
                  <ScoreRing score={featuredMatch.overallScore} size={80} strokeWidth={5} fontSize="text-lg" />
                </div>
              </div>
            </motion.div>

            {/* Right 1/3: Score breakdown */}
            <motion.div variants={bentoItem} className="lg:col-span-1 bento-card p-5">
              <h4 className="text-xs font-medium mb-4" style={{ color: 'var(--color-textMuted)' }}>Score Breakdown</h4>
              <div className="flex justify-around mb-4">
                <ScoreRing score={featuredMatch.traitScore} size={56} strokeWidth={3} label="Traits" />
                <ScoreRing score={featuredMatch.cultureScore} size={56} strokeWidth={3} label="Culture" />
                <ScoreRing score={featuredMatch.workStyleFit} size={56} strokeWidth={3} label="Work Style" />
              </div>
              <div className="text-center">
                <span className="stat-badge">{featuredMatch.archetype.name}</span>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                getConnectionStatus={getConnectionStatus}
                onDeepDive={handleDeepDive}
                onBrew={(emp) => setBrewTarget(emp)}
                onToggleSave={handleToggleSave}
                onConnect={(emp) => setConnectTarget(emp)}
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
              connectionStatus={getConnectionStatus(selectedEmployer.employerId)}
              onBack={handleBackToGallery}
              onBrew={() => setBrewTarget(selectedEmployer)}
              onToggleSave={() => handleToggleSave(selectedEmployer)}
              onConnect={() => setConnectTarget(selectedEmployer)}
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

      {/* Connect Modal */}
      {connectTarget && (
        <ConnectModal
          isOpen={!!connectTarget}
          onClose={() => setConnectTarget(null)}
          name={connectTarget.companyName}
          subtitle={connectTarget.industry}
          archetype={connectTarget.archetype}
          overallScore={connectTarget.overallScore}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}
