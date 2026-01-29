import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Coffee,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Plus,
  Star,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

export function EmployerDashboard() {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedCultureQuiz, setHasCompletedCultureQuiz] = useState(false);
  const [hasCreatedRole, setHasCreatedRole] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('good morning');
    else if (hour >= 12 && hour < 17) setGreeting('good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('good evening');
    else setGreeting('hey there');

    // TODO: Check actual status from API
    setHasCompletedCultureQuiz(false);
    setHasCreatedRole(false);
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const quickActions: QuickAction[] = [
    {
      title: 'define company culture',
      description: 'take our quiz to help us find the right candidates',
      icon: Building2,
      href: '/app/employer/culture',
      color: '#F59E0B',
    },
    {
      title: 'create a role',
      description: 'post a new position and set personality requirements',
      icon: Plus,
      href: '/app/employer/roles/new',
      color: '#10B981',
    },
    {
      title: 'browse candidates',
      description: 'view candidates ranked by culture fit',
      icon: Users,
      href: '/app/employer/candidates',
      color: '#8B5CF6',
    },
    {
      title: 'coffee chats',
      description: 'manage conversations with potential hires',
      icon: Coffee,
      href: '/app/employer/chats',
      color: '#EC4899',
    },
  ];

  // Mock data
  const topCandidates = [
    { name: 'Sarah K.', role: 'Product Designer', matchScore: 96, topTrait: 'Creative' },
    { name: 'Marcus T.', role: 'Software Engineer', matchScore: 92, topTrait: 'Analytical' },
    { name: 'Alex R.', role: 'UX Researcher', matchScore: 88, topTrait: 'Empathetic' },
  ];

  const activeRoles = [
    { title: 'Senior Product Designer', applicants: 24, newThisWeek: 8 },
    { title: 'Frontend Engineer', applicants: 31, newThisWeek: 12 },
  ];

  const stats = [
    { label: 'active roles', value: '2', change: '+1 this week' },
    { label: 'total applicants', value: '55', change: '+20 this week' },
    { label: 'pending chats', value: '3', change: '2 new requests' },
    { label: 'avg. match score', value: '84%', change: 'above average' },
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
          {hasCompletedCultureQuiz
            ? "here's an overview of your hiring activity"
            : "let's set up your company profile to start finding great culture fits"}
        </p>
      </div>

      {/* Setup Banner (if not complete) */}
      {(!hasCompletedCultureQuiz || !hasCreatedRole) && (
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
                get started with hiring
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedCultureQuiz
                  ? 'define your company culture first so we can match you with candidates who fit your team.'
                  : 'create your first role to start receiving culture-matched applicants.'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${hasCompletedCultureQuiz ? '' : 'border-2'}`}
                    style={{
                      backgroundColor: hasCompletedCultureQuiz ? 'var(--color-success)' : 'transparent',
                      borderColor: hasCompletedCultureQuiz ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {hasCompletedCultureQuiz && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    culture quiz
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${hasCreatedRole ? '' : 'border-2'}`}
                    style={{
                      backgroundColor: hasCreatedRole ? 'var(--color-success)' : 'transparent',
                      borderColor: hasCreatedRole ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {hasCreatedRole && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    first role
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    candidates
                  </span>
                </div>
              </div>
            </div>
            <Link to={hasCompletedCultureQuiz ? '/app/employer/roles/new' : '/app/employer/culture'}>
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                {hasCompletedCultureQuiz ? 'create role' : 'define culture'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {stat.label}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

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
                <h3
                  className="font-medium mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {action.title}
                </h3>
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
        {/* Top Candidates */}
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
              <Star className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              top candidates
            </h2>
            <Link
              to="/app/employer/candidates"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              view all
            </Link>
          </div>

          {hasCompletedCultureQuiz ? (
            <div className="space-y-3">
              {topCandidates.map((candidate, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                        {candidate.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {candidate.role} · {candidate.topTrait}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 rounded-lg text-sm font-semibold"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--color-success)',
                    }}
                  >
                    {candidate.matchScore}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Users
                className="w-10 h-10 mx-auto mb-3 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                define your culture to see matched candidates
              </p>
            </div>
          )}
        </div>

        {/* Active Roles */}
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
              <Briefcase className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              active roles
            </h2>
            <Link
              to="/app/employer/roles"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              manage
            </Link>
          </div>

          {activeRoles.length > 0 ? (
            <div className="space-y-3">
              {activeRoles.map((role, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                      {role.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {role.applicants} applicants · {role.newThisWeek} new this week
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                </div>
              ))}
              <Link
                to="/app/employer/roles/new"
                className="p-3 rounded-lg flex items-center justify-center gap-2 border-2 border-dashed transition-colors hover:bg-[var(--color-background)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">add new role</span>
              </Link>
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Briefcase
                className="w-10 h-10 mx-auto mb-3 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p className="text-sm mb-3" style={{ color: 'var(--color-textMuted)' }}>
                no active roles yet
              </p>
              <Link to="/app/employer/roles/new">
                <Button size="sm">create your first role</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
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
            tip: coffee chats reduce time-to-hire by 40%
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            candidates who have casual chats before formal interviews are more likely to accept offers.
          </p>
        </div>
      </div>
    </div>
  );
}
