import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Coffee,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Heart,
  MessageCircle,
  Calendar,
  ChevronRight,
  Users,
  Brain,
  RotateCcw,
  Lightbulb,
  Zap,
  Anchor,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { CandidateSetupModal } from '../candidate/CandidateSetupModal';
import { supabase } from '../../lib/supabase';

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
  openness_score: number | null;
  conscientiousness_score: number | null;
  extraversion_score: number | null;
  agreeableness_score: number | null;
  neuroticism_score: number | null;
  top_traits: string[] | null;
  assessment_completed_at: string | null;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  color: string;
  status?: 'complete' | 'in-progress' | 'not-started';
  onClick?: () => void;
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('good morning');
    else if (hour >= 12 && hour < 17) setGreeting('good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('good evening');
    else setGreeting('hey there');
  }, []);

  // Check profile and assessment completion status from candidates table
  useEffect(() => {
    if (!user) return;

    const checkCompletionStatus = async () => {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('headline, bio, openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits, assessment_completed_at')
        .eq('user_id', user.id)
        .single();

      const typedCandidate = candidate as CandidateData | null;

      // Profile is complete if they have a headline or bio filled out
      const profileComplete = !!(typedCandidate?.headline || typedCandidate?.bio);
      setHasCompletedProfile(profileComplete);

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

  const quickActions: QuickAction[] = [
    {
      title: 'complete your profile',
      description: 'add your details so employers can learn about you',
      icon: CheckCircle2,
      color: '#10B981',
      status: hasCompletedProfile ? 'complete' : 'not-started',
      onClick: () => setShowSetupModal(true),
    },
    {
      title: hasCompletedAssessment ? 'view personality insights' : 'take personality assessment',
      description: hasCompletedAssessment ? 'explore your detailed personality profile' : '15 minutes to discover your work style',
      icon: Brain,
      href: hasCompletedAssessment ? '/app/insights' : '/app/personality',
      color: '#8B5CF6',
      status: hasCompletedAssessment ? 'complete' : 'not-started',
    },
    {
      title: 'find your matches',
      description: 'discover companies that match your personality',
      icon: Users,
      href: '/app/matches',
      color: '#8B5CF6',
      status: hasCompletedAssessment ? 'not-started' : 'not-started',
    },
    {
      title: 'coffee chats',
      description: 'connect with teams over casual conversations',
      icon: Coffee,
      href: '/app/chats',
      color: '#EC4899',
      status: 'not-started',
    },
  ];

  // Real data from Supabase
  const [topMatches, setTopMatches] = useState<Array<{ company: string; role: string; matchScore: number; location: string }>>([]);
  const [upcomingChats, setUpcomingChats] = useState<Array<{ company: string; person: string; role: string; time: string }>>([]);

  useEffect(() => {
    if (!user || !hasCompletedAssessment || !personalityScores) return;

    const loadMatches = async () => {
      try {
        // Get active roles with employer data
        const { data: roles } = await supabase
          .from('roles')
          .select('*, employers!inner(company_name, location, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_quiz_completed)')
          .eq('status', 'active');

        if (roles && personalityScores) {
          const matches = roles
            .filter(r => {
              const emp = r.employers as Record<string, unknown> | null;
              return emp?.culture_quiz_completed;
            })
            .map(role => {
              const emp = role.employers as Record<string, unknown>;
              // Simple trait distance scoring
              const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
              let totalDiff = 0;
              for (const t of traits) {
                const candidateVal = personalityScores[t] || 50;
                const empVal = (emp?.[`${t}_preference`] as number) || 50;
                totalDiff += Math.abs(candidateVal - empVal);
              }
              const maxDiff = 500;
              const matchScore = Math.round((1 - totalDiff / maxDiff) * 100);

              return {
                company: (emp?.company_name as string) || 'Unknown',
                role: role.title,
                matchScore,
                location: role.location || (emp?.location as string) || 'Remote',
              };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

          setTopMatches(matches);
        }

        // Get upcoming coffee chats
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (candidate) {
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
        }
      } catch (err) {
        console.error('Error loading matches:', err);
      }
    };

    loadMatches();
  }, [user, hasCompletedAssessment, personalityScores]);

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
            ? "here's what's happening with your job search"
            : "complete your personality assessment to get matched with jobs that fit your culture"}
        </p>
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
                complete your setup
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedProfile
                  ? 'start by setting up your profile, then take the personality assessment to get matched with jobs.'
                  : 'take the personality assessment to start getting matched with jobs that fit your style.'}
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
                    profile
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
                    assessment
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    matches
                  </span>
                </div>
              </div>
            </div>
            {hasCompletedProfile ? (
              <Link to="/app/personality">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  take assessment
                </Button>
              </Link>
            ) : (
              <Button
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setShowSetupModal(true)}
              >
                set up profile
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
              your personality profile
            </h2>
            <div className="flex items-center gap-3">
              {lastAssessmentDate && (
                <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  completed {lastAssessmentDate.toLocaleDateString()}
                </span>
              )}
              <Link to="/app/insights">
                <Button variant="ghost" size="sm" leftIcon={<ArrowRight className="w-3 h-3" />}>
                  full insights
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
                your top traits
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

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {quickActions.map((action) => {
          const cardContent = (
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {action.title}
                  </h3>
                  {action.status === 'complete' && (
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {action.description}
                </p>
              </div>
              <ChevronRight
                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: 'var(--color-textMuted)' }}
              />
            </div>
          );

          if (action.onClick) {
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                className="p-5 rounded-xl border transition-all hover:shadow-md group text-left"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={action.title}
              to={action.href || '#'}
              className="p-5 rounded-xl border transition-all hover:shadow-md group"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Matches */}
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
              <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              top matches
            </h2>
            <Link
              to="/app/jobs"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              view all
            </Link>
          </div>

          {hasCompletedAssessment ? (
            <div className="space-y-3">
              {topMatches.map((match, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                      {match.role}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {match.company} · {match.location}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1 rounded-lg text-sm font-semibold"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--color-success)',
                    }}
                  >
                    {match.matchScore}%
                  </div>
                </div>
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
                complete your assessment to see job matches
              </p>
            </div>
          )}
        </div>

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
              upcoming chats
            </h2>
            <Link
              to="/app/chats"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              view all
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
                no upcoming coffee chats yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tip of the Day */}
      <div
        className="mt-8 p-4 rounded-xl border flex items-center gap-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            tip: be authentic in your assessment
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            there are no right or wrong answers. honest responses lead to better culture matches.
          </p>
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
