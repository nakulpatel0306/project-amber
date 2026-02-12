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
  Target,
  RotateCcw,
  Lightbulb,
  Zap,
  Heart,
  Anchor,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { EmployerSetupModal } from '../employer/EmployerSetupModal';
import { supabase } from '../../lib/supabase';


interface CulturePreferences {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
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

interface RecentChat {
  candidateName: string;
  status: string;
  time: string;
}

export function EmployerDashboard() {
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [hasCompletedCultureQuiz, setHasCompletedCultureQuiz] = useState(false);
  const [_hasCreatedRole, setHasCreatedRole] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [culturePreferences, setCulturePreferences] = useState<CulturePreferences | null>(null);
  const [cultureValues, setCultureValues] = useState<string[]>([]);
  const [lastCultureUpdate, setLastCultureUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Hey there');
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

      // Profile is complete if they have company_name or description filled out
      const profileComplete = !!(typedEmployer?.company_name || typedEmployer?.description);
      setHasCompletedProfile(profileComplete);

      // Show modal automatically if profile is not complete AND user hasn't skipped this session
      const hasSkippedThisSession = sessionStorage.getItem('employer_setup_skipped');
      if (!profileComplete && !hasSkippedThisSession) {
        setShowSetupModal(true);
      }

      // If they've completed the culture quiz
      const cultureComplete = !!typedEmployer?.culture_quiz_completed;
      setHasCompletedCultureQuiz(cultureComplete);

      // Set culture preferences if quiz is complete
      if (cultureComplete && typedEmployer) {
        setCulturePreferences({
          openness: typedEmployer.openness_preference || 0,
          conscientiousness: typedEmployer.conscientiousness_preference || 0,
          extraversion: typedEmployer.extraversion_preference || 0,
          agreeableness: typedEmployer.agreeableness_preference || 0,
          neuroticism: typedEmployer.neuroticism_preference || 0,
        });
        setCultureValues(typedEmployer.culture_values || []);
        if (typedEmployer.updated_at) {
          setLastCultureUpdate(new Date(typedEmployer.updated_at));
        }
      }
    };

    checkCompletionStatus();
    // TODO: Check role creation status
    setHasCreatedRole(false);
  }, [user]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setHasCompletedProfile(true);
    // Clear the skip flag since profile is now complete
    sessionStorage.removeItem('employer_setup_skipped');
  };

  const handleSetupSkip = () => {
    setShowSetupModal(false);
    // Mark that user has skipped setup this session
    sessionStorage.setItem('employer_setup_skipped', 'true');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Real data from Supabase
  const [topCandidates, setTopCandidates] = useState<Array<{ name: string; role: string; matchScore: number; topTrait: string }>>([]);
  const [activeRoles, setActiveRoles] = useState<Array<{ title: string; applicants: number; newThisWeek: number }>>([]);
  const [stats, setStats] = useState([
    { label: 'Active Roles', value: '0', change: '' },
    { label: 'Total Applicants', value: '0', change: '' },
    { label: 'Pending Chats', value: '0', change: '' },
    { label: 'Avg. Match Score', value: '--', change: '' },
  ]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        const { data: employer } = await supabase
          .from('employers')
          .select('id')
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

        // Get applications for these roles
        const roleIds = (roles || []).map(r => r.id);
        let totalApps = 0;
        const roleCandidates: Array<{ name: string; role: string; matchScore: number; topTrait: string }> = [];

        if (roleIds.length > 0) {
          const { data: apps } = await supabase
            .from('applications')
            .select('*, candidates(*, profiles:user_id(full_name)), roles!inner(title, employer_id)')
            .eq('roles.employer_id', employer.id)
            .order('overall_match_score', { ascending: false })
            .limit(10);

          totalApps = apps?.length || 0;

          if (apps) {
            for (const app of apps.slice(0, 3)) {
              const candidate = app.candidates as Record<string, unknown> | null;
              const profiles = candidate?.profiles as Record<string, unknown> | null;
              const role = app.roles as Record<string, unknown> | null;
              roleCandidates.push({
                name: (profiles?.full_name as string) || 'Unknown',
                role: (role?.title as string) || 'Unknown Role',
                matchScore: app.overall_match_score || 0,
                topTrait: ((candidate?.top_traits as string[]) || ['--'])[0],
              });
            }
          }
        }

        // Get pending coffee chats
        const { data: pendingChats } = await supabase
          .from('coffee_chats')
          .select('id')
          .eq('employer_id', employer.id)
          .eq('status', 'pending');

        // Get recent coffee chats (all statuses)
        const { data: allChats } = await supabase
          .from('coffee_chats')
          .select('*, candidates!inner(profiles:user_id(full_name))')
          .eq('employer_id', employer.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (allChats) {
          setRecentChats(allChats.map(c => {
            const candidateRecord = c.candidates as Record<string, unknown> | null;
            const candidateProfile = candidateRecord?.profiles as Record<string, unknown> | null;
            return {
              candidateName: (candidateProfile?.full_name as string) || 'Unknown',
              status: c.status || 'pending',
              time: c.updated_at
                ? new Date(c.updated_at).toLocaleDateString()
                : c.created_at
                  ? new Date(c.created_at).toLocaleDateString()
                  : '',
            };
          }));
        }

        setTopCandidates(roleCandidates);
        setActiveRoles(activeRolesList.map(r => ({
          title: r.title,
          applicants: totalApps,
          newThisWeek: 0,
        })));
        setStats([
          { label: 'Active Roles', value: String(activeRolesList.length), change: '' },
          { label: 'Total Applicants', value: String(totalApps), change: '' },
          { label: 'Pending Chats', value: String(pendingChats?.length || 0), change: '' },
          { label: 'Avg. Match Score', value: roleCandidates.length > 0 ? `${Math.round(roleCandidates.reduce((s, c) => s + c.matchScore, 0) / roleCandidates.length)}%` : '--', change: '' },
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    loadDashboardData();
  }, [user]);

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
          {hasCompletedCultureQuiz
            ? `${greeting}, ${firstName}`
            : `${firstName}, ready to define your culture?`}
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          {hasCompletedCultureQuiz
            ? "Here's an overview of your hiring activity"
            : "Complete the culture quiz to start matching with candidates who fit your team"}
        </p>
      </div>

      {/* Setup Banner (if not complete) */}
      {(!hasCompletedProfile || !hasCompletedCultureQuiz) && (
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
                Get Started with Hiring
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                {!hasCompletedProfile
                  ? 'Start by setting up your company profile, then define your culture to match with candidates.'
                  : 'Define your company culture to start matching with candidates who fit your team.'}
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${hasCompletedCultureQuiz ? '' : 'border-2'}`}
                    style={{
                      backgroundColor: hasCompletedCultureQuiz ? 'var(--color-success)' : 'transparent',
                      borderColor: hasCompletedCultureQuiz ? 'transparent' : 'var(--color-border)',
                    }}
                  >
                    {hasCompletedCultureQuiz && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    Culture
                  </span>
                </div>
                <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    Candidates
                  </span>
                </div>
              </div>
            </div>
            {hasCompletedProfile ? (
              <Link to="/app/employer/culture-assessment">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Define Culture
                </Button>
              </Link>
            ) : (
              <Button
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Company
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Culture Profile Summary (when quiz is complete) */}
      {hasCompletedCultureQuiz && culturePreferences && (
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
              <Target className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Ideal Candidate Profile
            </h2>
            <div className="flex items-center gap-3">
              {lastCultureUpdate && (
                <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  last updated {lastCultureUpdate.toLocaleDateString()}
                </span>
              )}
              <Link to="/app/employer/insights">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <Link to="/app/employer/culture-assessment">
                <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3 h-3" />}>
                  Retake
                </Button>
              </Link>
            </div>
          </div>

          {/* Ideal Candidate OCEAN Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              { key: 'openness', label: 'Openness', icon: Lightbulb, color: '#8B5CF6' },
              { key: 'conscientiousness', label: 'Conscient.', icon: Target, color: '#10B981' },
              { key: 'extraversion', label: 'Extraversion', icon: Zap, color: '#F59E0B' },
              { key: 'agreeableness', label: 'Agreeable.', icon: Heart, color: '#EC4899' },
              { key: 'neuroticism', label: 'Stability', icon: Anchor, color: '#06B6D4' },
            ].map(({ key, label, icon: Icon, color }) => {
              const value = key === 'neuroticism'
                ? 100 - culturePreferences[key as keyof CulturePreferences]
                : culturePreferences[key as keyof CulturePreferences];
              return (
                <div
                  key={key}
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
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

          {/* Culture Values */}
          {cultureValues.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                Your Culture Values
              </p>
              <div className="flex flex-wrap gap-2">
                {cultureValues.slice(0, 5).map((value, index) => (
                  <span
                    key={value}
                    className="px-3 py-1.5 rounded-full text-sm font-medium capitalize"
                    style={{
                      backgroundColor: index === 0 ? 'var(--color-accent)' : 'var(--color-background)',
                      color: index === 0 ? 'white' : 'var(--color-text)',
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              Top Candidates
            </h2>
            <Link
              to="/app/employer/candidates"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View All
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
                Define your culture to see matched candidates
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
              Active Roles
            </h2>
            <Link
              to="/app/employer/roles"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              Manage
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
                <span className="text-sm">Add New Role</span>
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
                No active roles yet
              </p>
              <Link to="/app/employer/roles/new">
                <Button size="sm">Create Your First Role</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Hiring Pipeline */}
      {hasCompletedCultureQuiz && (
        <div
          className="mt-6 p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2
            className="font-semibold flex items-center gap-2 mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            Hiring Pipeline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { stage: 'Matched', count: topCandidates.length > 0 ? topCandidates.length : 0, color: '#8B5CF6', desc: 'Culture-fit candidates' },
              { stage: 'Coffee Chat', count: parseInt(stats.find(s => s.label === 'Pending Chats')?.value || '0'), color: '#F59E0B', desc: 'In conversation' },
              { stage: 'Interview', count: 0, color: '#10B981', desc: 'Formal interviews' },
              { stage: 'Offer', count: 0, color: '#EC4899', desc: 'Offers extended' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center relative"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: item.color }}
                >
                  {item.count}
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {item.stage}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  {item.desc}
                </p>
                {i < 3 && (
                  <div
                    className="hidden md:block absolute top-1/2 -right-2 w-4 text-center"
                    style={{ color: 'var(--color-border)', transform: 'translateY(-50%)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Coffee Chat Activity */}
      <div
        className="mt-6 p-6 rounded-xl border"
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
            Recent Coffee Chat Activity
          </h2>
          <Link
            to="/app/employer/chats"
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            View All
          </Link>
        </div>

        {recentChats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentChats.map((chat, i) => (
              <div
                key={i}
                className="p-3 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                {getStatusIcon(chat.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {chat.candidateName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    {chat.time}
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
                  {chat.status}
                </span>
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
              No coffee chat activity yet
            </p>
          </div>
        )}
      </div>

      {/* Employer Setup Modal */}
      <EmployerSetupModal
        isOpen={showSetupModal}
        onClose={handleSetupSkip}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
