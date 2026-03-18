import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { CandidateSetupModal } from '../candidate/CandidateSetupModal';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility } from '../../lib/compatibilityScoring';

import { DashboardHeader } from './DashboardHeader';
import { BentoMetricCard } from './BentoMetricCard';
import { MatchingTable } from './MatchingTable';
import { QuickActions } from './QuickActions';
import { StreakTracker } from './StreakTracker';
import { CompatibilityInsights } from './CompatibilityInsights';
import { ScheduleWidget } from './ScheduleWidget';
import { ArchetypeStrip } from './ArchetypeStrip';

import type { UpcomingChat } from './DashboardCalendar';

interface PersonalityScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface CandidateData {
  headline: string | null;
  bio: string | null;
  location: string | null;
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;
  top_traits: string[] | null;
  assessment_completed_at: string | null;
}

interface TopMatch {
  name: string;
  company: string;
  role: string;
  matchScore: number;
  location: string;
  workStyle: string | null;
  logoUrl: string | null;
  description: string | null;
  industry: string | null;
  employerId: string;
  chatStatus: 'none' | 'pending' | 'accepted' | 'scheduled' | 'completed' | 'connected';
}

export function JobSeekerDashboard() {
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores | null>(null);
  const [topTraits, setTopTraits] = useState<string[]>([]);

  // Stats
  const [_profileCompletion, setProfileCompletion] = useState(0);
  const [matchesAvailable, setMatchesAvailable] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [pendingChats, setPendingChats] = useState(0);
  const [_connectionsCount, setConnectionsCount] = useState(0);
  const [acceptedChats, setAcceptedChats] = useState(0);
  const [completedChats, setCompletedChats] = useState(0);
  const [_totalRoles, setTotalRoles] = useState(0);
  const [uniqueCompanies, setUniqueCompanies] = useState(0);

  // Loading states — prevent 0 → N/A → value flash
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [chatsLoaded, setChatsLoaded] = useState(false);

  // Data
  const [allMatches, setAllMatches] = useState<TopMatch[]>([]);
  const [topMatches, setTopMatches] = useState<TopMatch[]>([]);
  const [matchPage, setMatchPage] = useState(0);
  const [upcomingChats, setUpcomingChats] = useState<UpcomingChat[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
    else setGreeting('Hey There');
  }, []);

  // Check profile and assessment completion status from candidates table
  useEffect(() => {
    if (!user) return;

    const checkCompletionStatus = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('headline, bio, location, openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits, assessment_completed_at')
        .eq('user_id', user.id)
        .single();

      const typedCandidate = candidate as CandidateData | null;

      // Store top traits for ArchetypeStrip
      setTopTraits(typedCandidate?.top_traits || []);

      // Profile is complete if they have a headline or bio filled out
      const profileComplete = !!(typedCandidate?.headline || typedCandidate?.bio);
      setHasCompletedProfile(profileComplete);

      // Compute profile completion %
      let completionParts = 0;
      if (typedCandidate?.headline) completionParts++;
      if (typedCandidate?.bio) completionParts++;
      if (typedCandidate?.location) completionParts++;
      if (typedCandidate?.openness_score !== null && typedCandidate?.openness_score !== undefined) completionParts++;
      setProfileCompletion(Math.round((completionParts / 4) * 100));

      // Show modal automatically if profile is not complete AND user hasn't skipped this session
      const hasSkippedThisSession = sessionStorage.getItem('profile_setup_skipped');
      if (!profileComplete && !hasSkippedThisSession) {
        setShowSetupModal(true);
      }

      // Assessment is complete if they have OCEAN scores
      const assessmentComplete = typedCandidate?.openness_score !== null && typedCandidate?.openness_score !== undefined;
      setHasCompletedAssessment(assessmentComplete);

      // Set personality scores if assessment is complete
      if (assessmentComplete && typedCandidate) {
        setPersonalityScores({
          openness: typedCandidate.openness_score || 0,
          conscientiousness: typedCandidate.conscientiousness_score || 0,
          extraversion: typedCandidate.extraversion_score || 0,
          agreeableness: typedCandidate.agreeableness_score || 0,
          neuroticism: typedCandidate.neuroticism_score || 0,
        });
      }
    };

    checkCompletionStatus();
  }, [user]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setHasCompletedProfile(true);
    sessionStorage.removeItem('profile_setup_skipped');
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);
    sessionStorage.setItem('profile_setup_skipped', 'true');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'There';

  // Load chats, connections, and pending invites (independent of assessment)
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!candidate) return;

        // Get pending coffee chats count
        const { data: pendingChatData } = await supabase
          .from('coffee_chats')
          .select('id')
          .eq('candidate_id', candidate.id)
          .eq('status', 'pending');

        setPendingChats(pendingChatData?.length || 0);

        // Get connections count (accepted + completed chats)
        const { data: connectionData } = await supabase
          .from('coffee_chats')
          .select('id, status')
          .eq('candidate_id', candidate.id)
          .in('status', ['accepted', 'completed']);

        setConnectionsCount(connectionData?.length || 0);
        setAcceptedChats(connectionData?.filter(c => c.status === 'accepted').length || 0);
        setCompletedChats(connectionData?.filter(c => c.status === 'completed').length || 0);

        // Get ALL non-cancelled coffee chats with full data (same as CandidateCoffeeChats)
        const { data: chats } = await supabase
          .from('coffee_chats')
          .select('*')
          .eq('candidate_id', candidate.id)
          .order('created_at', { ascending: false });

        if (chats) {
          setUpcomingChats(
            chats
              .filter((c: any) => c.status !== 'cancelled')
              .map((c: any) => ({
                id: c.id,
                company: c.company_name || 'Unknown',
                person: c.candidate_name || c.company_name || 'Unknown',
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
      } finally {
        setChatsLoaded(true);
      }
    };

    loadChats();
  }, [user]);

  // Load matches (requires assessment completion)
  useEffect(() => {
    if (!user) return;
    if (!hasCompletedAssessment || !personalityScores) {
      // If assessment not done, we know the final value already
      if (hasCompletedAssessment === false) setMatchesLoaded(true);
      return;
    }

    const loadMatches = async () => {
      try {
        // Fetch roles and employer data separately to avoid inner-join RLS issues
        const { data: roles, error: rolesErr } = await supabase
          .from('roles')
          .select('*')
          .eq('status', 'active');

        if (rolesErr) {
          console.error('Error fetching roles:', rolesErr);
          return;
        }

        if (!roles || roles.length === 0) {
          setMatchesAvailable(0);
          return;
        }

        // Fetch employers via RPC (bypasses RLS — direct table query fails for candidates)
        const { data: employersRaw, error: empErr } = await supabase
          .rpc('get_employers_for_candidate', { candidate_user_id: user.id });

        if (empErr) {
          console.error('Error fetching employers via RPC:', empErr);
        }

        const employersArr = (employersRaw as Record<string, unknown>[] | null) || [];
        const employerMap = new Map(
          employersArr.map(e => [e.id as string, e])
        );

        // Fetch employer profile names
        const empUserIds = employersArr.map(e => e.user_id as string).filter(Boolean);
        let empProfileMap = new Map<string, string>();
        if (empUserIds.length > 0) {
          try {
            const { data: rpcData, error: rpcErr } = await supabase
              .rpc('get_profiles_by_ids', { user_ids: empUserIds });
            const profiles = rpcErr ? [] : (rpcData || []);
            for (const p of profiles) {
              empProfileMap.set(p.id, p.full_name || '');
            }
          } catch {
            // Profile lookup failed
          }
        }

        // Fetch candidate record for chat status lookup
        const { data: candRecord } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Build employer_id → chat status map
        let chatStatusMap = new Map<string, string>();
        if (candRecord) {
          const { data: chats } = await supabase
            .from('coffee_chats')
            .select('employer_id, status')
            .eq('candidate_id', candRecord.id);

          if (chats) {
            // Priority: completed > scheduled > accepted > pending
            const priority: Record<string, number> = { completed: 4, scheduled: 3, accepted: 2, pending: 1 };
            for (const chat of chats) {
              const existing = chatStatusMap.get(chat.employer_id);
              const existingPri = existing ? (priority[existing] || 0) : 0;
              const newPri = priority[chat.status] || 0;
              if (newPri > existingPri) {
                chatStatusMap.set(chat.employer_id, chat.status);
              }
            }
          }

          // Also check connections
          const { data: conns } = await supabase
            .from('connections')
            .select('employer_id, status')
            .eq('candidate_id', candRecord.id)
            .eq('status', 'accepted');

          if (conns) {
            for (const conn of conns) {
              // 'connected' overrides everything except completed
              const existing = chatStatusMap.get(conn.employer_id);
              if (existing !== 'completed') {
                chatStatusMap.set(conn.employer_id, 'connected');
              }
            }
          }
        }

        setTotalRoles(roles.length);

        const matches = roles
          .map(role => {
            const emp = employerMap.get(role.employer_id) as Record<string, unknown> | undefined;

            const result = calculateCompatibility({
              candidateOCEAN: personalityScores,
              employerPreferences: {
                openness: (emp?.openness_preference as number) || 50,
                conscientiousness: (emp?.conscientiousness_preference as number) || 50,
                extraversion: (emp?.extraversion_preference as number) || 50,
                agreeableness: (emp?.agreeableness_preference as number) || 50,
                neuroticism: (emp?.neuroticism_preference as number) || 50,
                cultureValues: (emp?.culture_values as string[]) || [],
              },
              roleRequirements: {
                required_openness_min: role.required_openness_min ?? null,
                required_openness_max: role.required_openness_max ?? null,
                required_conscientiousness_min: role.required_conscientiousness_min ?? null,
                required_conscientiousness_max: role.required_conscientiousness_max ?? null,
                required_extraversion_min: role.required_extraversion_min ?? null,
                required_extraversion_max: role.required_extraversion_max ?? null,
                required_agreeableness_min: role.required_agreeableness_min ?? null,
                required_agreeableness_max: role.required_agreeableness_max ?? null,
                required_neuroticism_min: role.required_neuroticism_min ?? null,
                required_neuroticism_max: role.required_neuroticism_max ?? null,
                work_style: role.work_style ?? null,
              },
            });

            const rawChatStatus = chatStatusMap.get(role.employer_id) || 'none';

            const empUserId = emp?.user_id as string | undefined;

            return {
              name: (empUserId && empProfileMap.get(empUserId)) || (emp?.company_name as string) || 'Unknown',
              company: (emp?.company_name as string) || 'Unknown',
              role: role.title,
              matchScore: result.overallMatchScore,
              location: role.location || (emp?.location as string) || 'Remote',
              workStyle: role.work_style || null,
              logoUrl: (emp?.company_logo_url as string) || null,
              description: (emp?.description as string) || null,
              industry: (emp?.industry as string) || null,
              employerId: role.employer_id as string,
              chatStatus: rawChatStatus as TopMatch['chatStatus'],
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore);

        setAllMatches(matches);
        setMatchPage(0);
        setTopMatches(matches.slice(0, 5));
        setMatchesAvailable(roles.length);
        setUniqueCompanies(new Set(roles.map(r => r.employer_id)).size);

        // Compute average across ALL roles, not just top 5
        const allScores = roles.map(role => {
          const emp = employerMap.get(role.employer_id) as Record<string, unknown> | undefined;
          return calculateCompatibility({
            candidateOCEAN: personalityScores,
            employerPreferences: {
              openness: (emp?.openness_preference as number) || 50,
              conscientiousness: (emp?.conscientiousness_preference as number) || 50,
              extraversion: (emp?.extraversion_preference as number) || 50,
              agreeableness: (emp?.agreeableness_preference as number) || 50,
              neuroticism: (emp?.neuroticism_preference as number) || 50,
              cultureValues: (emp?.culture_values as string[]) || [],
            },
            roleRequirements: {
              required_openness_min: role.required_openness_min ?? null,
              required_openness_max: role.required_openness_max ?? null,
              required_conscientiousness_min: role.required_conscientiousness_min ?? null,
              required_conscientiousness_max: role.required_conscientiousness_max ?? null,
              required_extraversion_min: role.required_extraversion_min ?? null,
              required_extraversion_max: role.required_extraversion_max ?? null,
              required_agreeableness_min: role.required_agreeableness_min ?? null,
              required_agreeableness_max: role.required_agreeableness_max ?? null,
              required_neuroticism_min: role.required_neuroticism_min ?? null,
              required_neuroticism_max: role.required_neuroticism_max ?? null,
              work_style: role.work_style ?? null,
            },
          }).overallMatchScore;
        });

        if (allScores.length > 0) {
          setAvgMatchScore(Math.round(allScores.reduce((s, score) => s + score, 0) / allScores.length));
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setMatchesLoaded(true);
      }
    };

    loadMatches();
  }, [user, hasCompletedAssessment, personalityScores]);

  const navigate = useNavigate();

  const handleRefreshMatches = () => {
    if (allMatches.length <= 5) return;
    const nextPage = matchPage + 1;
    const start = (nextPage * 5) % allMatches.length;
    const page = allMatches.slice(start, start + 5);
    // If we wrapped past the end, fill from the beginning
    if (page.length < 5) {
      page.push(...allMatches.slice(0, 5 - page.length));
    }
    setMatchPage(nextPage);
    setTopMatches(page);
  };

  // Best match score
  const bestMatchScore = topMatches.length > 0 ? topMatches[0].matchScore : 0;

  const showLoader = useMinLoader(!matchesLoaded || !chatsLoaded, 1500);

  if (showLoader) {
    return <CoffeeBrewLoader variant="fullscreen" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      {/* Dashboard Header — search + date + notifications */}
      <DashboardHeader greeting={greeting} firstName={firstName} />

      {/* Archetype Strip — editorial personality display */}
      {hasCompletedAssessment === true && personalityScores && topTraits.length > 0 && (
        <ArchetypeStrip personalityScores={personalityScores} topTraits={topTraits} />
      )}

      {/* Key Metrics Row — 3 bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoMetricCard
          title="Match Index Score"
          loading={!matchesLoaded}
          value={avgMatchScore > 0 ? `${avgMatchScore}%` : hasCompletedAssessment ? '0%' : 'N/A'}
          subtitle={
            avgMatchScore > 0
              ? `Average compatibility across ${matchesAvailable} ${matchesAvailable === 1 ? 'role' : 'roles'}`
              : hasCompletedAssessment
              ? 'No roles available yet'
              : 'Complete assessment to unlock'
          }
          accentBorder
          tags={avgMatchScore > 0 ? [
            { label: `Best ${bestMatchScore}%`, shade: 'light' as const },
            { label: `${matchesAvailable} Roles Analyzed`, shade: 'medium' as const },
            { label: `${uniqueCompanies} ${uniqueCompanies === 1 ? 'Company' : 'Companies'}`, shade: 'dark' as const },
          ] : hasCompletedAssessment ? [
            { label: 'Assessment Complete', shade: 'light' as const },
            { label: 'Awaiting Roles', shade: 'medium' as const },
          ] : [
            { label: 'Not Started', shade: 'dark' as const },
          ]}
          onClick={() => navigate(hasCompletedAssessment ? '/app/ember' : '/app/personality')}
        />
        <BentoMetricCard
          title="Available Roles"
          loading={!matchesLoaded}
          value={String(matchesAvailable)}
          subtitle={
            matchesAvailable > 0
              ? `Open positions across ${uniqueCompanies} ${uniqueCompanies === 1 ? 'company' : 'companies'}`
              : 'No open positions right now'
          }
          accentBorder
          tags={matchesAvailable > 0 ? [
            { label: `${matchesAvailable} Active`, shade: 'light' as const },
            { label: `${uniqueCompanies} ${uniqueCompanies === 1 ? 'Company' : 'Companies'}`, shade: 'medium' as const },
            { label: 'Explore', shade: 'dark' as const },
          ] : []}
          onClick={() => navigate('/app/roles')}
        />
        <BentoMetricCard
          title="Coffee Chats"
          loading={!chatsLoaded}
          value={String(pendingChats + acceptedChats + completedChats)}
          subtitle={
            (pendingChats + acceptedChats + completedChats) > 0
              ? 'Your conversation activity'
              : 'Start connecting with employers'
          }
          accentBorder
          tags={(pendingChats + acceptedChats + completedChats) > 0 ? [
            ...(pendingChats > 0 ? [{ label: `${pendingChats} Pending`, shade: 'light' as const }] : []),
            ...(acceptedChats > 0 ? [{ label: `${acceptedChats} Scheduled`, shade: 'medium' as const }] : []),
            ...(completedChats > 0 ? [{ label: `${completedChats} Completed`, shade: 'dark' as const }] : []),
          ] : [
            { label: 'Get Started', shade: 'light' as const },
          ]}
          onClick={() => navigate('/app/chats')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions hasCompletedAssessment={hasCompletedAssessment === true} />

      {/* Widgets row: Streak + Insights + Schedule (2-col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakTracker />
        <CompatibilityInsights />
        <div className="md:col-span-2">
          <ScheduleWidget
            upcomingChats={upcomingChats}
            pendingChats={pendingChats}
            acceptedChats={acceptedChats}
            allAcceptedChats={upcomingChats.filter(c => c.status === 'accepted' && !c.scheduledAt)}
          />
        </div>
      </div>

      {/* Setup Banner (if not complete) */}
      {(!hasCompletedProfile || hasCompletedAssessment === false) && (
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
                Complete Your Setup
              </h2>
              <p className="text-xs mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedProfile
                  ? 'Set up your profile, then take the personality assessment to get matched.'
                  : 'Take the personality assessment to start getting matched with jobs.'}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Profile', done: hasCompletedProfile },
                  { label: 'Assessment', done: hasCompletedAssessment === true },
                  { label: 'Matches', done: false },
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
              <Link to="/app/personality">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Take Assessment
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Profile
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top Personality Matches — clean status table, no card wrapper */}
      <MatchingTable
        matches={topMatches}
        hasCompletedAssessment={hasCompletedAssessment === true}
        onRowClick={(match) => navigate(`/app/ember?deepdive=${match.employerId}`)}
        onRefresh={handleRefreshMatches}
      />

      {/* Candidate Setup Modal */}
      <CandidateSetupModal
        isOpen={showSetupModal}
        onClose={handleSetupSkip}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
