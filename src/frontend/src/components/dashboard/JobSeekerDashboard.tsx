import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

import { DashboardGreeting } from './DashboardGreeting';
import { DashboardStats } from './DashboardStats';
import { PersonalityPlayerCard } from './PersonalityPlayerCard';
import { DashboardTopMatches } from './DashboardTopMatches';
import { DashboardCalendar } from './DashboardCalendar';

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

interface UpcomingChat {
  company: string;
  person: string;
  role: string;
  time: string;
  scheduledAt: string | null;
  status: string;
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
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [matchesAvailable, setMatchesAvailable] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [pendingChats, setPendingChats] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);

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
          .select('id')
          .eq('candidate_id', candidate.id)
          .in('status', ['accepted', 'completed']);

        setConnectionsCount(connectionData?.length || 0);

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
              company: (emp?.company_name as string) || 'Unknown',
              person: (empProfile?.full_name as string) || 'Unknown',
              role: 'Hiring Manager',
              time: c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : 'TBD',
              scheduledAt: c.scheduled_at || null,
              status: c.status || 'pending',
            };
          }));
        }
      } catch (err) {
        console.error('Error loading chats:', err);
      }
    };

    loadChats();
  }, [user]);

  // Load matches (requires assessment completion)
  useEffect(() => {
    if (!user || !hasCompletedAssessment || !personalityScores) return;

    const loadMatches = async () => {
      try {
        const { data: roles } = await supabase
          .from('roles')
          .select('*, employers!inner(company_name, location, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_quiz_completed, culture_values)')
          .eq('status', 'active');

        if (roles && personalityScores) {
          const matches = roles
            .filter(r => {
              const emp = r.employers as Record<string, unknown> | null;
              return emp?.culture_quiz_completed;
            })
            .map(role => {
              const emp = role.employers as Record<string, unknown>;

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
          setMatchesAvailable(roles.filter(r => {
            const emp = r.employers as Record<string, unknown> | null;
            return emp?.culture_quiz_completed;
          }).length);

          if (matches.length > 0) {
            setAvgMatchScore(Math.round(matches.reduce((s, m) => s + m.matchScore, 0) / matches.length));
          }
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      }
    };

    loadMatches();
  }, [user, hasCompletedAssessment, personalityScores]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Greeting */}
      <DashboardGreeting
        firstName={firstName}
        greeting={greeting}
        hasCompletedAssessment={hasCompletedAssessment}
        topTraits={topTraits}
        matchesAvailable={matchesAvailable}
        avgMatchScore={avgMatchScore}
      />

      {/* Stats Row */}
      <DashboardStats
        connectionsCount={connectionsCount}
        pendingChats={pendingChats}
        matchesAvailable={matchesAvailable}
        avgMatchScore={avgMatchScore}
        profileCompletion={profileCompletion}
      />

      {/* Progress Banner (if not complete) */}
      {(!hasCompletedProfile || !hasCompletedAssessment) && (
        <div
          className="p-5 rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(245, 158, 11, 0.05))',
            borderColor: 'var(--color-accent)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-lg font-semibold mb-2 flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                Complete Your Setup
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedProfile
                  ? 'Start by setting up your profile, then take the personality assessment to get matched with jobs.'
                  : 'Take the personality assessment to start getting matched with jobs that fit your style.'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${hasCompletedProfile ? '' : 'border-2'}`}
                    style={{
                      backgroundColor: hasCompletedProfile ? 'var(--color-success)' : 'transparent',
                      borderColor: hasCompletedProfile ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {hasCompletedProfile && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    Profile
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${hasCompletedAssessment ? '' : 'border-2'}`}
                    style={{
                      backgroundColor: hasCompletedAssessment ? 'var(--color-success)' : 'transparent',
                      borderColor: hasCompletedAssessment ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {hasCompletedAssessment && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    Assessment
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    Matches
                  </span>
                </div>
              </div>
            </div>
            {hasCompletedProfile ? (
              <Link to="/app/personality">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Take Assessment
                </Button>
              </Link>
            ) : (
              <Button
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Profile
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Player Card + Top Matches (side by side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Player Card (2/5 width) */}
        {hasCompletedAssessment && personalityScores && (
          <div className="lg:col-span-2">
            <PersonalityPlayerCard
              personalityScores={personalityScores}
              topTraits={topTraits}
            />
          </div>
        )}

        {/* Top Matches (3/5 width, or full width if no assessment) */}
        <div className={hasCompletedAssessment && personalityScores ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <DashboardTopMatches
            topMatches={topMatches}
            hasCompletedAssessment={hasCompletedAssessment}
          />
        </div>
      </div>

      {/* Calendar Widget */}
      <DashboardCalendar
        upcomingChats={upcomingChats}
        pendingChats={pendingChats}
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
