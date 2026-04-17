import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark, X, Users, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useEmployerMatchData } from '../../hooks/useMatchData';
import { useSavedMatches } from '../../hooks/useSavedMatches';
import { EmberFirefly } from './EmberFirefly';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { PlayerCardGrid } from './gallery/PlayerCardGrid';
import { GalleryFilterBar } from './gallery/GalleryFilterBar';
import { DeepDive } from './gallery/DeepDive';
import { CompareView } from './gallery/CompareView';
import { CoffeeBrewModal } from './gallery/CoffeeBrewModal';
import { ConnectModal } from '../connections/ConnectModal';
import { Button } from '../ui/Button';
import { EmberBrain } from './EmberBrain';
import { EmberIdentityCard } from './EmberIdentityCard';
import { TopMatchCard } from './TopMatchCard';
import { MatchActivityFeed } from './MatchActivityFeed';
import { emberFadeUp, emberStagger } from '../../utils/motion';
import type { CandidateResult, PageView, SortOption } from '../../types/matching.types';
import type { OCEANScores } from '../../lib/compatibilityScoring';
import { useRef } from 'react';

type EmployerView = PageView | 'compare';

/* ── Overview Carousel ── */
interface OverviewSlide {
  value: string;
  label: string;
}

function OverviewCarousel({ stats }: { stats: { totalCandidates: number; strongCandidates: number; avgScore: number } }) {
  const slides: OverviewSlide[] = [
    { value: String(stats.totalCandidates), label: 'Candidates' },
    { value: String(stats.strongCandidates), label: 'Strong (80+)' },
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

export function EmberEmployerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const { profile } = useAuth();
  const { getConnectionStatus, sendConnectionRequest, pendingSent, accepted } = useConnections();

  // Data hooks
  const {
    employer, candidates, roles, archetype, isLoading,
    selectedRoleId, handleRoleChange, setPendingChats,
  } = useEmployerMatchData();
  const { savedMatches, isSaved, save, unsave, getSavedMatch } = useSavedMatches();
  const showLoader = useMinLoader(isLoading, 2500);

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

    // Search — when active, skip quick-filter slicing
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q)
      );
    } else {
      if (quickFilter === 'top5') result = result.slice(0, 5);
      else if (quickFilter === 'top10') result = result.slice(0, 10);
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

  // Shortlisted candidates — full objects for sidebar
  const shortlistedCandidates = useMemo(() => {
    return candidates.filter(c => savedIds.has(c.candidateId));
  }, [candidates, savedIds]);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    if (candidates.length === 0) return null;
    const scores = candidates.map(c => c.overallScore);
    const strongCandidates = candidates.filter(c => c.overallScore >= 80).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { totalCandidates: candidates.length, strongCandidates, avgScore };
  }, [candidates]);

  // Featured match (top candidate)
  const featuredMatch = useMemo(() => {
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [candidates]);

  // Handlers
  const handleDeepDive = useCallback((c: CandidateResult) => {
    setSelectedCandidate(c);
    setView('deepdive');
    requestAnimationFrame(() => {
      const el = document.getElementById('main-scroll-container');
      if (el) el.scrollTop = 0;
      window.scrollTo({ top: 0 });
    });
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
        candidate_name: brewTarget.name,
        company_name: employer.company_name,
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
      // Get selected role info for the coffee chat
      const selectedRole = selectedRoleId ? roles.find(r => r.id === selectedRoleId) : undefined;

      await sendConnectionRequest({
        receiverId: connectTarget.userId,
        senderRole: 'employer',
        message,
        senderName: profile?.full_name || undefined,
        senderCompany: employer.company_name,
        receiverName: connectTarget.name,
        meetInvite,
        matchScore: connectTarget.overallScore,
        roleId: selectedRole?.id,
        roleTitle: selectedRole?.title,
      });
      showSuccess('Sent!', `Connection request sent to ${connectTarget.name}`);
    } catch {
      showError('Error', 'Failed to send connection request');
      throw new Error('Failed');
    }
  }, [employer, connectTarget, profile, selectedRoleId, roles, sendConnectionRequest, showSuccess, showError]);

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
      <div className="ember-page min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
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
    <div className="ember-page min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Header — matches EmberAgent bento-card style */}
        {view !== 'deepdive' && (
          <motion.div
            className="bento-card p-6 mb-5"
            variants={emberFadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="hidden sm:flex items-center justify-center w-14 h-14 flex-shrink-0">
                  <EmberFirefly size="md" mood="happy" animated />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-3xl sm:text-4xl font-serif font-normal tracking-tight"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Ember
                  </h1>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {archetype ? `${archetype.name} culture` : 'Your personalized candidate gallery'}
                    {candidates.length > 0 ? ` · ${candidates.length} candidates` : ''}
                  </p>
                  {dashboardStats && (
                    <div className="flex flex-wrap items-center gap-2.5 mt-3">
                      {([
                        { label: 'Candidates', value: dashboardStats.totalCandidates, color: '#f59e0b', Icon: Users },
                        { label: 'Strong (80+)', value: dashboardStats.strongCandidates, color: 'var(--color-trait-openness)', Icon: Zap },
                        { label: 'Avg Score', value: `${dashboardStats.avgScore}%`, color: 'var(--color-trait-conscientiousness)', Icon: TrendingUp },
                      ] as const).map(stat => (
                        <span
                          key={stat.label}
                          className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                            border: `1px solid ${stat.color}30`,
                            color: 'var(--color-text)',
                          }}
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${stat.color}20` }}
                          >
                            <stat.Icon className="w-3 h-3" style={{ color: stat.color }} />
                          </span>
                          <span className="font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                          <span style={{ color: 'var(--color-textSecondary)' }}>{stat.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {compareIds.size >= 2 && view === 'gallery' && (
                <Button size="sm" onClick={() => setView('compare')}>
                  Compare ({compareIds.size})
                </Button>
              )}
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
                  <EmberIdentityCard archetype={archetype} ocean={employerOcean} />
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
            {/* Brain hero */}
            {view === 'gallery' && (
              <motion.div
                className="h-64 overflow-hidden"
                variants={emberFadeUp}
                initial="hidden"
                animate="show"
              >
                <EmberBrain candidates={candidates} />
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
                    mode="employer"
                    matchCount={filteredCandidates.length}
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
                  connectionStatus={getConnectionStatus(selectedCandidate.userId)}
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
                      name={featuredMatch.name}
                      subtitle={featuredMatch.headline}
                      score={featuredMatch.overallScore}
                      onDeepDive={() => handleDeepDive(featuredMatch)}
                    />
                  </motion.div>
                )}

                <motion.div variants={emberFadeUp}>
                  <MatchActivityFeed
                    mode="employer"
                    candidateMatches={candidates}
                    savedMatches={savedMatches}
                    pendingSent={pendingSent}
                    acceptedConnections={accepted}
                  />
                </motion.div>

                {/* Shortlisted Candidates */}
                <motion.div variants={emberFadeUp}>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3 mt-1"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    <Bookmark className="w-3 h-3 inline-block mr-1.5 -mt-px" />
                    Shortlisted Candidates //
                  </p>

                  {shortlistedCandidates.length === 0 ? (
                    <p className="text-xs py-3" style={{ color: 'var(--color-textMuted)' }}>
                      Bookmark A Candidate To Save Them Here.
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {shortlistedCandidates.map((c, i) => (
                        <div
                          key={c.candidateId}
                          className="flex items-center gap-2.5 py-2.5 group"
                          style={{
                            borderBottom: i < shortlistedCandidates.length - 1
                              ? '1px solid var(--color-border)'
                              : undefined,
                          }}
                        >
                          {/* Avatar */}
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
                          >
                            {c.name.charAt(0)}
                          </div>

                          {/* Info — clickable to deep dive */}
                          <button
                            className="flex-1 min-w-0 text-left"
                            onClick={() => handleDeepDive(c)}
                          >
                            <p
                              className="text-xs font-medium truncate"
                              style={{ color: 'var(--color-text)' }}
                            >
                              {c.name}
                            </p>
                            <p
                              className="text-[10px] truncate"
                              style={{ color: 'var(--color-textMuted)' }}
                            >
                              {c.archetype.name} · {c.overallScore}%
                            </p>
                          </button>

                          {/* Remove bookmark */}
                          <button
                            onClick={() => handleToggleSave(c)}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-textMuted)' }}
                            title="Remove from shortlist"
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
