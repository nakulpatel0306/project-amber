import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { EmployerSetupModal } from '../employer/EmployerSetupModal';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility } from '../../lib/compatibilityScoring';

import { DashboardHeader } from './DashboardHeader';
import { BentoMetricCard } from './BentoMetricCard';
import { EmployerArchetypeStrip } from './EmployerArchetypeStrip';
import { EmployerQuickActions } from './EmployerQuickActions';
import { EmployerCandidateTable } from './EmployerCandidateTable';
import { StreakTracker } from './StreakTracker';
import { CompatibilityInsights } from './CompatibilityInsights';
import { ScheduleWidget } from './ScheduleWidget';

import type { UpcomingChat } from './DashboardCalendar';

interface CulturePreferences {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface CandidateRow {
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  matchScore: number;
  topTrait: string;
  chatStatus: 'none' | 'pending' | 'accepted' | 'completed';
}

interface EmployerData {
  company_name: string | null;
  description: string | null;
  culture_quiz_completed: boolean;
  openness_preference: number | null;
  conscientiousness_preference: number | null;
  extraversion_preference: number | null;
  agreeableness_preference: number | null;
  neuroticism_preference: number | null;
  culture_values: string[] | null;
  updated_at: string | null;
}

export function EmployerDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [hasCompletedCultureQuiz, setHasCompletedCultureQuiz] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [culturePreferences, setCulturePreferences] = useState<CulturePreferences | null>(null);

  // Stats
  const [activeRolesCount, setActiveRolesCount] = useState(0);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [pendingChats, setPendingChats] = useState(0);
  const [acceptedChats, setAcceptedChats] = useState(0);
  const [completedChats, setCompletedChats] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [uniqueCandidates, setUniqueCandidates] = useState(0);

  // Loading states
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [_candidatesLoaded, setCandidatesLoaded] = useState(false);

  // Data
  const [allCandidates, setAllCandidates] = useState<CandidateRow[]>([]);
  const [topCandidates, setTopCandidates] = useState<CandidateRow[]>([]);
  const [candidatePage, setCandidatePage] = useState(0);
  const [upcomingChats, setUpcomingChats] = useState<UpcomingChat[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Hey There');
  }, []);

  // Check profile and culture assessment completion status
  useEffect(() => {
    if (!user) return;

    const checkCompletionStatus = async () => {
      const { data: employer } = await supabase
        .from('employers')
        .select('company_name, description, culture_quiz_completed, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values, updated_at')
        .eq('user_id', user.id)
        .single();

      const typedEmployer = employer as EmployerData | null;

      const profileComplete = !!(typedEmployer?.company_name || typedEmployer?.description);
      setHasCompletedProfile(profileComplete);

      const hasSkippedThisSession = sessionStorage.getItem('employer_setup_skipped');
      if (!profileComplete && !hasSkippedThisSession) {
        setShowSetupModal(true);
      }

      const cultureComplete = !!typedEmployer?.culture_quiz_completed;
      setHasCompletedCultureQuiz(cultureComplete);

      if (cultureComplete && typedEmployer) {
        setCulturePreferences({
          openness: typedEmployer.openness_preference || 0,
          conscientiousness: typedEmployer.conscientiousness_preference || 0,
          extraversion: typedEmployer.extraversion_preference || 0,
          agreeableness: typedEmployer.agreeableness_preference || 0,
          neuroticism: typedEmployer.neuroticism_preference || 0,
        });

      }
    };

    checkCompletionStatus();
  }, [user]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setHasCompletedProfile(true);
    sessionStorage.removeItem('employer_setup_skipped');
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);
    sessionStorage.setItem('employer_setup_skipped', 'true');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'There';

  // Load chats (independent of culture quiz)
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const { data: employer } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!employer) return;

        const { data: pendingChatData } = await supabase
          .from('coffee_chats')
          .select('id')
          .eq('employer_id', employer.id)
          .eq('status', 'pending');

        setPendingChats(pendingChatData?.length || 0);

        const { data: connectionData } = await supabase
          .from('coffee_chats')
          .select('id, status')
          .eq('employer_id', employer.id)
          .in('status', ['accepted', 'completed']);

        setAcceptedChats(connectionData?.filter(c => c.status === 'accepted').length || 0);
        setCompletedChats(connectionData?.filter(c => c.status === 'completed').length || 0);

        // Get ALL non-cancelled coffee chats for schedule widget
        const { data: chats } = await supabase
          .from('coffee_chats')
          .select('*')
          .eq('employer_id', employer.id)
          .order('created_at', { ascending: false });

        if (chats) {
          setUpcomingChats(
            chats
              .filter((c: any) => c.status !== 'cancelled')
              .map((c: any) => ({
                id: c.id,
                company: c.candidate_name || 'Unknown',
                person: c.candidate_name || 'Unknown',
                role: c.role_title || 'Coffee Chat',
                time: c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : 'TBD',
                scheduledAt: c.scheduled_at || null,
                meetingLink: c.meeting_link || null,
                status: c.status || 'pending',
                preferredDates: c.preferred_dates || null,
              }))
          );
        }
      } catch (err) {
        console.error('Error loading chats:', err);
      }
    };

    loadChats();
  }, [user]);

  // Load dashboard stats + candidates
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        const { data: employer } = await supabase
          .from('employers')
          .select('id, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values')
          .eq('user_id', user.id)
          .single();

        if (!employer) return;

        // Get roles
        const { data: roles } = await supabase
          .from('roles')
          .select('*')
          .eq('employer_id', employer.id)
          .order('created_at', { ascending: false });

        const activeRolesList = (roles || []).filter(r => r.status === 'active');
        setActiveRolesCount(activeRolesList.length);

        // Get applications
        const roleIds = (roles || []).map(r => r.id);
        let totalApps = 0;

        if (roleIds.length > 0) {
          const { data: apps } = await supabase
            .from('applications')
            .select('*, candidates(*, profiles:user_id(full_name)), roles!inner(title, employer_id)')
            .eq('roles.employer_id', employer.id)
            .order('overall_match_score', { ascending: false })
            .limit(50);

          totalApps = apps?.length || 0;
          setTotalApplicants(totalApps);

          // Build candidate rows from applications
          if (apps && apps.length > 0) {
            const candidateRows: CandidateRow[] = [];
            const seenCandidates = new Set<string>();

            for (const app of apps) {
              const candidate = app.candidates as Record<string, unknown> | null;
              const profiles = candidate?.profiles as Record<string, unknown> | null;
              const candidateId = (candidate?.id as string) || '';

              if (seenCandidates.has(candidateId)) continue;
              seenCandidates.add(candidateId);

              // Calculate compatibility
              const candidateOCEAN = {
                openness: (candidate?.openness_score as number) || 50,
                conscientiousness: (candidate?.conscientiousness_score as number) || 50,
                extraversion: (candidate?.extraversion_score as number) || 50,
                agreeableness: (candidate?.agreeableness_score as number) || 50,
                neuroticism: (candidate?.neuroticism_score as number) || 50,
              };

              const result = calculateCompatibility({
                candidateOCEAN,
                employerPreferences: {
                  openness: employer.openness_preference || 50,
                  conscientiousness: employer.conscientiousness_preference || 50,
                  extraversion: employer.extraversion_preference || 50,
                  agreeableness: employer.agreeableness_preference || 50,
                  neuroticism: employer.neuroticism_preference || 50,
                  cultureValues: employer.culture_values || [],
                },
                roleRequirements: {},
              });

              candidateRows.push({
                candidateId,
                name: (profiles?.full_name as string) || 'Unknown',
                headline: (candidate?.headline as string) || '',
                location: (candidate?.location as string) || 'Remote',
                matchScore: result.overallMatchScore,
                topTrait: ((candidate?.top_traits as string[]) || ['--'])[0],
                chatStatus: 'none',
              });
            }

            // Lookup chat statuses
            const { data: chatData } = await supabase
              .from('coffee_chats')
              .select('candidate_id, status')
              .eq('employer_id', employer.id);

            if (chatData) {
              const chatMap = new Map<string, string>();
              const priority: Record<string, number> = { completed: 3, accepted: 2, pending: 1 };
              for (const c of chatData) {
                const existing = chatMap.get(c.candidate_id);
                const existingPri = existing ? (priority[existing] || 0) : 0;
                const newPri = priority[c.status] || 0;
                if (newPri > existingPri) chatMap.set(c.candidate_id, c.status);
              }

              for (const row of candidateRows) {
                const status = chatMap.get(row.candidateId);
                if (status) row.chatStatus = status as CandidateRow['chatStatus'];
              }
            }

            candidateRows.sort((a, b) => b.matchScore - a.matchScore);
            setAllCandidates(candidateRows);
            setCandidatePage(0);
            setTopCandidates(candidateRows.slice(0, 5));
            setUniqueCandidates(candidateRows.length);

            if (candidateRows.length > 0) {
              setAvgMatchScore(Math.round(
                candidateRows.reduce((s, c) => s + c.matchScore, 0) / candidateRows.length
              ));
            }
          }
        } else {
          setTotalApplicants(0);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setStatsLoaded(true);
        setCandidatesLoaded(true);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleRefreshCandidates = () => {
    if (allCandidates.length <= 5) return;
    const nextPage = candidatePage + 1;
    const start = (nextPage * 5) % allCandidates.length;
    const page = allCandidates.slice(start, start + 5);
    if (page.length < 5) {
      page.push(...allCandidates.slice(0, 5 - page.length));
    }
    setCandidatePage(nextPage);
    setTopCandidates(page);
  };

  const bestMatchScore = topCandidates.length > 0 ? topCandidates[0].matchScore : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      {/* Dashboard Header */}
      <DashboardHeader
        greeting={hasCompletedCultureQuiz ? greeting : `${firstName}, ready to define your culture?`}
        firstName={hasCompletedCultureQuiz ? firstName : ''}
      />

      {/* Culture Archetype Strip */}
      {hasCompletedCultureQuiz && culturePreferences && (
        <EmployerArchetypeStrip
          culturePreferences={culturePreferences}
        />
      )}

      {/* Key Metrics Row — 3 bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoMetricCard
          title="Culture Match Index"
          loading={!statsLoaded}
          value={avgMatchScore > 0 ? `${avgMatchScore}%` : hasCompletedCultureQuiz ? '0%' : 'N/A'}
          subtitle={
            avgMatchScore > 0
              ? `Average compatibility across ${uniqueCandidates} ${uniqueCandidates === 1 ? 'candidate' : 'candidates'}`
              : hasCompletedCultureQuiz
              ? 'No candidates available yet'
              : 'Complete culture quiz to unlock'
          }
          accentBorder
          tags={avgMatchScore > 0 ? [
            { label: `Best ${bestMatchScore}%`, shade: 'light' as const },
            { label: `${uniqueCandidates} Candidates Analyzed`, shade: 'medium' as const },
            { label: `${activeRolesCount} ${activeRolesCount === 1 ? 'Role' : 'Roles'}`, shade: 'dark' as const },
          ] : hasCompletedCultureQuiz ? [
            { label: 'Culture Defined', shade: 'light' as const },
            { label: 'Awaiting Candidates', shade: 'medium' as const },
          ] : [
            { label: 'Not Started', shade: 'dark' as const },
          ]}
          onClick={() => navigate(hasCompletedCultureQuiz ? '/app/employer/ember' : '/app/employer/culture-assessment')}
        />
        <BentoMetricCard
          title="Active Roles"
          loading={!statsLoaded}
          value={String(activeRolesCount)}
          subtitle={
            activeRolesCount > 0
              ? `${totalApplicants} ${totalApplicants === 1 ? 'applicant' : 'applicants'} across all roles`
              : 'No open positions right now'
          }
          accentBorder
          tags={activeRolesCount > 0 ? [
            { label: `${activeRolesCount} Active`, shade: 'light' as const },
            { label: `${totalApplicants} Applied`, shade: 'medium' as const },
            { label: 'Manage', shade: 'dark' as const },
          ] : []}
          onClick={() => navigate('/app/employer/roles')}
        />
        <BentoMetricCard
          title="Coffee Chats"
          loading={!statsLoaded}
          value={String(pendingChats + acceptedChats + completedChats)}
          subtitle={
            (pendingChats + acceptedChats + completedChats) > 0
              ? 'Your conversation activity'
              : 'Start connecting with candidates'
          }
          accentBorder
          tags={[
            ...(pendingChats > 0 ? [{ label: `${pendingChats} Pending`, shade: 'light' as const }] : []),
            ...(acceptedChats > 0 ? [{ label: `${acceptedChats} Scheduled`, shade: 'medium' as const }] : []),
            ...(completedChats > 0 ? [{ label: `${completedChats} Completed`, shade: 'dark' as const }] : []),
          ]}
          onClick={() => navigate('/app/employer/chats')}
        />
      </div>

      {/* Quick Actions */}
      <EmployerQuickActions hasCompletedCultureQuiz={hasCompletedCultureQuiz} />

      {/* Widgets row: Streak + Insights + Schedule (2-col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakTracker />
        <CompatibilityInsights viewerRole="employer" />
        <div className="md:col-span-2">
          <ScheduleWidget
            upcomingChats={upcomingChats}
            pendingChats={pendingChats}
            acceptedChats={acceptedChats}
            allAcceptedChats={upcomingChats.filter(c => c.status === 'accepted' && !c.scheduledAt)}
            viewerRole="employer"
          />
        </div>
      </div>

      {/* Setup Banner (if not complete) */}
      {(!hasCompletedProfile || !hasCompletedCultureQuiz) && (
        <div
          className="bento-card"
          style={{ borderColor: 'var(--color-accent)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-sm font-semibold mb-2 flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                Get Started With Hiring
              </h2>
              <p className="text-xs mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedProfile
                  ? 'Set up your company profile, then define your culture to match with candidates.'
                  : 'Define your company culture to start matching with candidates who fit your team.'}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Profile', done: hasCompletedProfile },
                  { label: 'Culture', done: hasCompletedCultureQuiz },
                  { label: 'Candidates', done: false },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className="w-6 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                    )}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${step.done ? '' : 'border'}`}
                      style={{
                        backgroundColor: step.done ? 'var(--color-success)' : 'transparent',
                        borderColor: step.done ? 'transparent' : 'var(--color-border)',
                      }}
                    >
                      {step.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {hasCompletedProfile ? (
              <Link to="/app/employer/culture-assessment">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Define Culture
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Company
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top Culture Matches — clean status table */}
      <EmployerCandidateTable
        candidates={topCandidates}
        hasCompletedCultureQuiz={hasCompletedCultureQuiz}
        onRowClick={(candidate) => navigate(`/app/employer/ember?deepdive=${candidate.candidateId}`)}
        onRefresh={handleRefreshCandidates}
      />

      {/* Employer Setup Modal */}
      <EmployerSetupModal
        isOpen={showSetupModal}
        onClose={handleSetupSkip}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
