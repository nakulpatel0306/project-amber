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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  status?: 'complete' | 'in-progress' | 'not-started';
}

export function JobSeekerDashboard() {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('good morning');
    else if (hour >= 12 && hour < 17) setGreeting('good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('good evening');
    else setGreeting('hey there');

    // Check if profile is complete (has full_name)
    setHasCompletedProfile(!!profile?.full_name);
    // TODO: Check assessment status from API
    setHasCompletedAssessment(false);
  }, [profile]);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const quickActions: QuickAction[] = [
    {
      title: 'complete your profile',
      description: 'add your details so employers can learn about you',
      icon: CheckCircle2,
      href: '/app/settings/profile',
      color: '#10B981',
      status: hasCompletedProfile ? 'complete' : 'not-started',
    },
    {
      title: 'take personality assessment',
      description: '15 minutes to discover your work style',
      icon: Sparkles,
      href: '/app/assessment',
      color: '#F59E0B',
      status: hasCompletedAssessment ? 'complete' : 'not-started',
    },
    {
      title: 'browse job matches',
      description: 'see roles that fit your personality',
      icon: Target,
      href: '/app/jobs',
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

  // Mock data for matched jobs
  const topMatches = [
    { company: 'TechCorp', role: 'Product Designer', matchScore: 94, location: 'Remote' },
    { company: 'StartupHub', role: 'UX Researcher', matchScore: 89, location: 'San Francisco' },
    { company: 'InnovateCo', role: 'Design Lead', matchScore: 85, location: 'New York' },
  ];

  // Mock upcoming chats
  const upcomingChats = [
    { company: 'TechCorp', person: 'Sarah M.', role: 'Hiring Manager', time: 'Tomorrow, 2pm' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {greeting}, {firstName}
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          {hasCompletedAssessment
            ? "here's what's happening with your job search"
            : "let's get you set up to find your perfect culture fit"}
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
            <Link to={hasCompletedProfile ? '/app/assessment' : '/app/settings/profile'}>
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                {hasCompletedProfile ? 'take assessment' : 'set up profile'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="p-5 rounded-xl border transition-all hover:shadow-md group"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
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
          </Link>
        ))}
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
    </div>
  );
}
