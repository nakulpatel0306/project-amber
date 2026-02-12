import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Coffee,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  Brain,
  Lightbulb,
  Zap,
  Anchor,
  Clock,
  X,
  MapPin,
  Briefcase,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { CandidateSetupModal } from '../candidate/CandidateSetupModal';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility } from '../../lib/compatibilityScoring';

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

interface RecentActivity {
  company: string;
  person: string;
  status: string;
  time: string;
}

export function JobSeekerDashboard() {
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores | null>(null);
  const [topTraits, setTopTraits] = useState<string[]>([]);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<Date | null>(null);

  // Stats
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [matchesAvailable, setMatchesAvailable] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [pendingChats, setPendingChats] = useState(0);

  // Data
  const [topMatches, setTopMatches] = useState<TopMatch[]>([]);
  const [upcomingChats, setUpcomingChats] = useState<Array<{ company: string; person: string; role: string; time: string }>>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

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
        if (typedCandidate.assessment_completed_at) {
          setLastAssessmentDate(new Date(typedCandidate.assessment_completed_at));
        }
      }
    };

    checkCompletionStatus();
  }, [user]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setHasCompletedProfile(true);
    // Clear the skip flag since profile is now complete
    sessionStorage.removeItem('profile_setup_skipped');
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);
    // Mark that user has skipped setup this session
    sessionStorage.setItem('profile_setup_skipped', 'true');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (!user || !hasCompletedAssessment || !personalityScores) return;

    const loadMatches = async () => {
      try {
        // Get active roles with employer data
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

        // Get candidate id for chat queries
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (candidate) {
          // Get pending coffee chats count
          const { data: pendingChatData } = await supabase
            .from('coffee_chats')
            .select('id')
            .eq('candidate_id', candidate.id)
            .eq('status', 'pending');

          setPendingChats(pendingChatData?.length || 0);

          // Get upcoming coffee chats (accepted/pending)
          const { data: chats } = await supabase
            .from('coffee_chats')
            .select('*, employers!inner(company_name, profiles:user_id(full_name))')
            .eq('candidate_id', candidate.id)
            .in('status', ['accepted', 'pending'])
            .order('scheduled_at', { ascending: true })
            .limit(3);

          if (chats) {
            setUpcomingChats(chats.map(c => {
              const emp = c.employers as Record<string, unknown> | null;
              const empProfile = emp?.profiles as Record<string, unknown> | null;
              return {
                company: (emp?.company_name as string) || 'Unknown',
                person: (empProfile?.full_name as string) || 'Unknown',
                role: 'Hiring Manager',
                time: c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : 'TBD',
              };
            }));
          }

          // Get recent activity (all statuses)
          const { data: allChats } = await supabase
            .from('coffee_chats')
            .select('*, employers!inner(company_name, profiles:user_id(full_name))')
            .eq('candidate_id', candidate.id)
            .order('updated_at', { ascending: false })
            .limit(5);

          if (allChats) {
            setRecentActivity(allChats.map(c => {
              const emp = c.employers as Record<string, unknown> | null;
              const empProfile = emp?.profiles as Record<string, unknown> | null;
              return {
                company: (emp?.company_name as string) || 'Unknown',
                person: (empProfile?.full_name as string) || 'Unknown',
                status: c.status || 'pending',
                time: c.updated_at
                  ? new Date(c.updated_at).toLocaleDateString()
                  : c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : '',
              };
            }));
          }
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      }
    };

    loadMatches();
  }, [user, hasCompletedAssessment, personalityScores]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-accent)';
    if (score >= 55) return '#F59E0B';
    return 'var(--color-textMuted)';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />;
      case 'cancelled':
      case 'declined':
        return <X className="w-4 h-4" style={{ color: 'var(--color-error, #EF4444)' }} />;
      default:
        return <Clock className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {hasCompletedAssessment
            ? `${greeting}, ${firstName}`
            : `${firstName}, ready for your assessment?`}
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          {hasCompletedAssessment
            ? "Here's what's happening with your job search"
            : "Complete your personality assessment to get matched with jobs that fit your culture"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Profile Completion', value: `${profileCompletion}%`, icon: Users },
          { label: 'Matches Available', value: String(matchesAvailable), icon: Briefcase },
          { label: 'Avg Match Score', value: avgMatchScore > 0 ? `${avgMatchScore}%` : '--', icon: BarChart3 },
          { label: 'Pending Chats', value: String(pendingChats), icon: Coffee },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Banner (if not complete) */}
      {(!hasCompletedProfile || !hasCompletedAssessment) && (
        <div
          className="p-6 rounded-2xl mb-8 border"
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

      {/* Personality Profile Summary (when assessment is complete) */}
      {hasCompletedAssessment && personalityScores && (
        <div
          className="p-6 rounded-2xl mb-8 border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Your Personality Profile
            </h2>
            <div className="flex items-center gap-3">
              {lastAssessmentDate && (
                <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  completed {lastAssessmentDate.toLocaleDateString()}
                </span>
              )}
              <Link to="/app/insights">
                <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3 h-3" />}>
                  Full Insights
                </Button>
              </Link>
            </div>
          </div>

          {/* OCEAN Scores */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'openness', label: 'Openness', icon: Lightbulb, color: '#8B5CF6' },
              { key: 'conscientiousness', label: 'Conscient.', icon: Target, color: '#10B981' },
              { key: 'extraversion', label: 'Extraversion', icon: Zap, color: '#F59E0B' },
              { key: 'agreeableness', label: 'Agreeable.', icon: Heart, color: '#EC4899' },
              { key: 'neuroticism', label: 'Stability', icon: Anchor, color: '#06B6D4' },
            ].map(({ key, label, icon: Icon, color }) => {
              const value = key === 'neuroticism'
                ? 100 - personalityScores[key as keyof PersonalityScores]
                : personalityScores[key as keyof PersonalityScores];
              return (
                <div
                  key={key}
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color }}
                  >
                    {value}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    {label}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${value}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Traits */}
          {topTraits.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                Your Top Traits
              </p>
              <div className="flex flex-wrap gap-2">
                {topTraits.slice(0, 5).map((trait, index) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-background)',
                      color: index === 0 ? 'white' : 'var(--color-text)',
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Matches (full-width) */}
      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-semibold flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
          >
            <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            Top Matches
          </h2>
          <Link
            to="/app/matches"
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            View All
          </Link>
        </div>

        {hasCompletedAssessment ? (
          topMatches.length > 0 ? (
            <div className="space-y-3">
              {topMatches.map((match, i) => (
                <Link
                  key={i}
                  to="/app/matches"
                  className="p-4 rounded-lg flex items-center justify-between hover:shadow-sm transition-shadow"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                      {match.role}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {match.company}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-3 h-3" />
                        {match.location}
                      </span>
                      {match.workStyle && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs capitalize"
                          style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-textSecondary)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {match.workStyle}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold ml-4"
                    style={{
                      backgroundColor: `${getScoreColor(match.matchScore)}15`,
                      color: getScoreColor(match.matchScore),
                    }}
                  >
                    {match.matchScore}%
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Target
                className="w-10 h-10 mx-auto mb-3 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No matches available yet. Check back soon!
              </p>
            </div>
          )
        ) : (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <Target
              className="w-10 h-10 mx-auto mb-3 opacity-40"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Complete your assessment to see job matches
            </p>
          </div>
        )}
      </div>

      {/* Two Column: Upcoming Chats + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Coffee Chats */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Coffee className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              Upcoming Chats
            </h2>
            <Link
              to="/app/chats"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View All
            </Link>
          </div>

          {upcomingChats.length > 0 ? (
            <div className="space-y-3">
              {upcomingChats.map((chat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                      {chat.person} at {chat.company}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                      <Calendar className="w-3 h-3" />
                      {chat.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Coffee
                className="w-10 h-10 mx-auto mb-3 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No upcoming coffee chats yet
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              Recent Activity
            </h2>
            <Link
              to="/app/chats"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View All
            </Link>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {activity.person} at {activity.company}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {activity.time}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs capitalize"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-textSecondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <TrendingUp
                className="w-10 h-10 mx-auto mb-3 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No recent activity yet
              </p>
            </div>
          )}
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
