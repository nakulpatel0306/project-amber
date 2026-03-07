import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { CandidateSetupModal } from '../candidate/CandidateSetupModal';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility } from '../../lib/compatibilityScoring';

import { DashboardHeader } from './DashboardHeader';
import { BentoMetricCard } from './BentoMetricCard';
import { ChatHeatmap } from './ChatHeatmap';
import { MatchFlowChart } from './MatchFlowChart';
import { MatchingTable } from './MatchingTable';
import { OceanRadar } from './OceanRadar';
import { ActivityTimeline } from './ActivityTimeline';
import { QuickActions } from './QuickActions';
import { WeeklyDigest } from './WeeklyDigest';
import { PersonalityPlayerCard } from './PersonalityPlayerCard';
import { DashboardCalendar, type UpcomingChat } from './DashboardCalendar';
import { StreakTracker } from './StreakTracker';
import { CompatibilityInsights } from './CompatibilityInsights';
import { ScheduleWidget } from './ScheduleWidget';

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
  company: string;
  role: string;
  matchScore: number;
  location: string;
  workStyle: string | null;
}

export function JobSeekerDashboard() {
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores | null>(null);
  const [topTraits, setTopTraits] = useState<string[]>([]);

  // Stats
  const [_profileCompletion, setProfileCompletion] = useState(0);
  const [matchesAvailable, setMatchesAvailable] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [pendingChats, setPendingChats] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [acceptedChats, setAcceptedChats] = useState(0);
  const [completedChats, setCompletedChats] = useState(0);
  const [_totalRoles, setTotalRoles] = useState(0);
  const [uniqueCompanies, setUniqueCompanies] = useState(0);

  // Loading states — prevent 0 → N/A → value flash
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [chatsLoaded, setChatsLoaded] = useState(false);

  // Data
  const [topMatches, setTopMatches] = useState<TopMatch[]>([]);
  const [upcomingChats, setUpcomingChats] = useState<UpcomingChat[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Hey there');
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
        setTopTraits(typedCandidate.top_traits || []);
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

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

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

        // Get upcoming coffee chats (accepted/pending) with scheduledAt and status
        const { data: chats } = await supabase
          .from('coffee_chats')
          .select('*, employers!inner(company_name, profiles:user_id(full_name))')
          .eq('candidate_id', candidate.id)
          .in('status', ['accepted', 'pending'])
          .order('scheduled_at', { ascending: true })
          .limit(5);

        if (chats) {
          setUpcomingChats(chats.map(c => {
            const emp = c.employers as Record<string, unknown> | null;
            const empProfile = emp?.profiles as Record<string, unknown> | null;
            return {
              id: c.id,
              company: (emp?.company_name as string) || 'Unknown',
              person: (empProfile?.full_name as string) || 'Unknown',
              role: 'Hiring Manager',
              time: c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : 'TBD',
              scheduledAt: c.scheduled_at || null,
              meetingLink: c.meeting_link || null,
              status: c.status || 'pending',
            };
          }));
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

        // Fetch all employers (left join approach — get what RLS allows)
        const { data: employers } = await supabase
          .from('employers')
          .select('id, company_name, location, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_quiz_completed, culture_values');

        const employerMap = new Map(
          (employers || []).map(e => [e.id, e])
        );

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

            return {
              company: (emp?.company_name as string) || 'Unknown',
              role: role.title,
              matchScore: result.overallMatchScore,
              location: role.location || (emp?.location as string) || 'Remote',
              workStyle: role.work_style || null,
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5);

        setTopMatches(matches);
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

  // Best match score
  const bestMatchScore = topMatches.length > 0 ? topMatches[0].matchScore : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      {/* Dashboard Header — search + date + notifications */}
      <DashboardHeader greeting={greeting} firstName={firstName} />

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
          onClick={() => navigate('/app/network')}
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
          tags={[
            ...(pendingChats > 0 ? [{ label: `${pendingChats} Pending`, shade: 'light' as const }] : []),
            ...(acceptedChats > 0 ? [{ label: `${acceptedChats} Scheduled`, shade: 'medium' as const }] : []),
            ...(completedChats > 0 ? [{ label: `${completedChats} Completed`, shade: 'dark' as const }] : []),
          ]}
          onClick={() => navigate('/app/chats')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions hasCompletedAssessment={hasCompletedAssessment} />

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
      {(!hasCompletedProfile || !hasCompletedAssessment) && (
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
                  { label: 'Assessment', done: hasCompletedAssessment },
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

      {/* Heatmap + Flow Chart — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChatHeatmap matchCount={matchesAvailable} />
        <MatchFlowChart matchesAvailable={matchesAvailable} avgMatchScore={avgMatchScore} />
      </div>

      {/* Deep Matching Table */}
      <MatchingTable
        matches={topMatches}
        hasCompletedAssessment={hasCompletedAssessment}
      />

      {/* OCEAN Radar + Activity Timeline + Weekly Digest — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hasCompletedAssessment && personalityScores ? (
          <OceanRadar scores={personalityScores} />
        ) : (
          <WeeklyDigest
            avgMatchScore={avgMatchScore}
            matchesAvailable={matchesAvailable}
            connectionsCount={connectionsCount}
            pendingChats={pendingChats}
          />
        )}
        <ActivityTimeline
          matchCount={matchesAvailable}
          chatCount={pendingChats}
          connectionCount={connectionsCount}
        />
        {hasCompletedAssessment && personalityScores ? (
          <WeeklyDigest
            avgMatchScore={avgMatchScore}
            matchesAvailable={matchesAvailable}
            connectionsCount={connectionsCount}
            pendingChats={pendingChats}
          />
        ) : (
          <div className="bento-card flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: 'var(--color-textMuted)' }}>
                Complete your assessment to unlock OCEAN radar
              </p>
              <Link to="/app/personality">
                <Button size="sm" variant="outline">Take Assessment</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Player Card + Calendar — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {hasCompletedAssessment && personalityScores && (
          <div className="lg:col-span-2">
            <PersonalityPlayerCard
              personalityScores={personalityScores}
              topTraits={topTraits}
            />
          </div>
        )}
        <div className={hasCompletedAssessment && personalityScores ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <DashboardCalendar
            upcomingChats={upcomingChats}
            pendingChats={pendingChats}
          />
        </div>
      </div>

      {/* Candidate Setup Modal */}
      <CandidateSetupModal
        isOpen={showSetupModal}
        onClose={handleSetupSkip}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
