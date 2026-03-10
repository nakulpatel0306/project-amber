import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useCandidateMatchData } from '../../hooks/useMatchData';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { PlayerCardGrid } from './gallery/PlayerCardGrid';
import { GalleryFilterBar } from './gallery/GalleryFilterBar';
import { DeepDive } from './gallery/DeepDive';
import { CoffeeBrewModal } from './gallery/CoffeeBrewModal';
import { ConnectModal } from '../connections/ConnectModal';
import { Button } from '../ui/Button';
import { EmberBrain } from './EmberBrain';
import { EmberFirefly } from './EmberFirefly';
import { EmberIdentityCard } from './EmberIdentityCard';
import { TopMatchCard } from './TopMatchCard';
import { MatchActivityFeed } from './MatchActivityFeed';
import { emberFadeUp, emberStagger } from '../../utils/motion';
import type { EmployerResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';

/* ── Overview Carousel ── */
interface OverviewSlide {
  value: string;
  label: string;
}

function OverviewCarousel({ stats }: { stats: { totalMatches: number; strongMatches: number; avgScore: number } }) {
  const slides: OverviewSlide[] = [
    { value: String(stats.totalMatches), label: 'Matches' },
    { value: String(stats.strongMatches), label: 'Strong (80+)' },
    { value: `${stats.avgScore}%`, label: 'Avg Score' },
  ];

  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => setActive(i => (i + 1) % slides.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const go = (dir: -1 | 1) => {
    setActive(i => (i + dir + slides.length) % slides.length);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(i => (i + 1) % slides.length), 4000);
  };

  const slide = slides[active];

  return (
    <div className="bento-card overflow-hidden" style={{ padding: '20px 16px 16px' }}>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-1"
        style={{ color: 'var(--color-textMuted)' }}
      >
        Overview //
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center"
          style={{ minHeight: 120 }}
        >
          <span
            className="font-extrabold tracking-tighter leading-none"
            style={{
              fontSize: '4.5rem',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {slide.value}
          </span>
          <span
            className="text-sm font-semibold mt-1 uppercase tracking-widest"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {slide.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Dots only — tap to navigate */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button onClick={() => go(-1)} className="p-0.5" style={{ color: 'var(--color-textMuted)' }}>
          <ChevronLeft className="w-3 h-3" />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); clearInterval(timerRef.current); timerRef.current = setInterval(() => setActive(j => (j + 1) % slides.length), 4000); }}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              backgroundColor: i === active ? 'var(--color-accent)' : 'var(--color-border)',
              transform: i === active ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
        <button onClick={() => go(1)} className="p-0.5" style={{ color: 'var(--color-textMuted)' }}>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function EmberAgent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const { profile } = useAuth();
  const { getConnectionStatus, sendConnectionRequest, pendingSent, accepted } = useConnections();

  // Data hooks
  const {
    candidate, employers, archetype, isLoading, error: dataError, setPendingChats,
  } = useCandidateMatchData();
  const { savedMatches, save, unsave } = useSavedMatches();
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

    // Search — when a search query is active, skip quick-filter slicing
    // so the user can search across ALL employers, not just the top N.
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.companyName.toLowerCase().includes(q) ||
        e.industry.toLowerCase().includes(q)
      );
    } else {
      // Quick filter (only when not searching)
      if (quickFilter === 'top5') result = result.slice(0, 5);
      else if (quickFilter === 'top10') result = result.slice(0, 10);
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

  // Saved match IDs — match on employer_id directly since isSaved checks candidate_id
  const savedIds = useMemo(() => {
    const savedEmployerIds = new Set(savedMatches.map(m => m.employer_id).filter(Boolean));
    return new Set(employers.filter(e => savedEmployerIds.has(e.employerId)).map(e => e.employerId));
  }, [employers, savedMatches]);

  // Bookmarked employers — full objects for the sidebar list
  const bookmarkedEmployers = useMemo(() => {
    return employers.filter(e => savedIds.has(e.employerId));
  }, [employers, savedIds]);

  // Handlers
  const handleDeepDive = useCallback((emp: EmployerResult) => {
    setSelectedEmployer(emp);
    setView('deepdive');
    requestAnimationFrame(() => {
      const el = document.getElementById('main-scroll-container');
      if (el) el.scrollTop = 0;
      window.scrollTo({ top: 0 });
    });
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedEmployer(null);
    setView('gallery');
    // Clear deepdive param so the useEffect doesn't re-open it
    if (searchParams.has('deepdive')) {
      searchParams.delete('deepdive');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleToggleSave = useCallback(async (emp: EmployerResult) => {
    try {
      // Look up by employer_id directly since getSavedMatch checks candidate_id
      const existing = savedMatches.find(m => m.employer_id === emp.employerId);
      if (existing) {
        await unsave(existing.id);
        showSuccess('Removed', 'Match removed from saved');
      } else {
        await save({
          target_type: 'candidate',
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
  }, [candidate, savedMatches, save, unsave, showSuccess, showError]);

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

      const existing = savedMatches.find(m => m.employer_id === brewTarget.employerId);
      if (existing) {
        await supabase.from('saved_matches').update({ status: 'pending' }).eq('id', existing.id);
      }
    } catch {
      showError('Error', 'Failed to send request');
      throw new Error('Failed to send');
    }
  }, [candidate, brewTarget, savedMatches, showSuccess, showError, setPendingChats]);

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
    const strongMatches = employers.filter(e => e.overallScore >= 80).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { totalMatches: employers.length, strongMatches, avgScore };
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
      <div className="ember-page min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <h2 className="font-bold text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
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
      <div className="ember-page min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <h2 className="font-bold text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
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
    <div className="ember-page min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Header — matches dashboard DashboardHeader bento-card style */}
        {view !== 'deepdive' && (
          <motion.div
            className="bento-card p-6 mb-5"
            variants={emberFadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center gap-3">
              <EmberFirefly size="sm" mood="happy" animated />
              <div>
                <h1
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                >
                  Ember
                </h1>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {archetype ? `${archetype.name} archetype` : 'Your personalized match gallery'}
                  {employers.length > 0 ? ` · ${employers.length} companies` : ''}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Three-column layout */}
        <div className="flex gap-4">

          {/* ── Left Sidebar (260px, sticky) ── */}
          {view !== 'deepdive' && (
            <motion.aside
              className="hidden xl:block w-[260px] flex-shrink-0"
              variants={emberStagger}
              initial="hidden"
              animate="show"
            >
              <div className="sticky top-6 space-y-4">
                <motion.div variants={emberFadeUp}>
                  <EmberIdentityCard archetype={archetype} ocean={candidateOcean} />
                </motion.div>

                {/* Overview carousel */}
                {dashboardStats && (
                  <motion.div variants={emberFadeUp}>
                    <OverviewCarousel stats={dashboardStats} />
                  </motion.div>
                )}
              </div>
            </motion.aside>
          )}

          {/* ── Center Content (flex) ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Brain hero — no card wrapper, breathes freely */}
            {view === 'gallery' && (
              <motion.div
                className="h-64 overflow-hidden"
                variants={emberFadeUp}
                initial="hidden"
                animate="show"
              >
                <EmberBrain employers={employers} />
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {view === 'gallery' ? (
                <motion.div
                  key="gallery"
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                >
                  <GalleryFilterBar
                    mode="candidate"
                    matchCount={filteredEmployers.length}
                    searchQuery={searchQuery}
                    onSearchChange={(q) => {
                      setSearchQuery(q);
                      if (q) setQuickFilter('all');
                    }}
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
                  subtitle={selectedEmployer.profileName}
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
          </main>

          {/* ── Right Sidebar (320px, sticky) ── */}
          {view !== 'deepdive' && (
            <motion.aside
              className="hidden lg:block w-[320px] flex-shrink-0"
              variants={emberStagger}
              initial="hidden"
              animate="show"
            >
              <div className="sticky top-6 space-y-4">
                {featuredMatch && (
                  <motion.div variants={emberFadeUp}>
                    <TopMatchCard
                      name={featuredMatch.companyName}
                      subtitle={featuredMatch.industry}
                      score={featuredMatch.overallScore}
                      avatarUrl={featuredMatch.logoUrl}
                      onDeepDive={() => handleDeepDive(featuredMatch)}
                    />
                  </motion.div>
                )}

                <motion.div variants={emberFadeUp}>
                  <MatchActivityFeed
                    matches={employers}
                    savedMatches={savedMatches}
                    pendingSent={pendingSent}
                    acceptedConnections={accepted}
                  />
                </motion.div>

                {/* Bookmarked Jobs — not in a card, raw section */}
                <motion.div variants={emberFadeUp}>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3 mt-1"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    <Bookmark className="w-3 h-3 inline-block mr-1.5 -mt-px" />
                    Saved Jobs //
                  </p>

                  {bookmarkedEmployers.length === 0 ? (
                    <p className="text-xs py-3" style={{ color: 'var(--color-textMuted)' }}>
                      Bookmark A Match To Save It Here.
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {bookmarkedEmployers.map((emp, i) => (
                        <div
                          key={emp.employerId}
                          className="flex items-center gap-2.5 py-2.5 group"
                          style={{
                            borderBottom: i < bookmarkedEmployers.length - 1
                              ? '1px solid var(--color-border)'
                              : undefined,
                          }}
                        >
                          {/* Avatar */}
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
                          >
                            {emp.companyName.charAt(0)}
                          </div>

                          {/* Info — clickable to deep dive */}
                          <button
                            className="flex-1 min-w-0 text-left"
                            onClick={() => handleDeepDive(emp)}
                          >
                            <p
                              className="text-xs font-medium truncate"
                              style={{ color: 'var(--color-text)' }}
                            >
                              {emp.companyName}
                            </p>
                            <p
                              className="text-[10px] truncate"
                              style={{ color: 'var(--color-textMuted)' }}
                            >
                              {emp.industry} · {emp.overallScore}%
                            </p>
                          </button>

                          {/* Remove bookmark */}
                          <button
                            onClick={() => handleToggleSave(emp)}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-textMuted)' }}
                            title="Remove bookmark"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.aside>
          )}
        </div>
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

