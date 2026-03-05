import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Mic, MapPin, Users, Briefcase, Coffee,
  Link2, TrendingUp, Zap, Crown, Medal, Award,
  Heart, Brain, Sparkles, Building2, Trophy,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { useNetworkData } from '../../hooks/useNetworkData';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { avatarGradient, getMatchColor, generateHighlightPills, formatSalary } from '../../utils/matchHelpers';
import { staggerContainer, fadeUp } from '../../utils/motion';

interface Props {
  isEmployer: boolean;
  isCandidate: boolean;
}

interface HotRole {
  id: string;
  title: string;
  location: string;
  work_style: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employer: { id: string; company_name: string; industry: string };
  matchScore: number | null;
  traitScore: number;
  cultureScore: number;
  highlightPills: string[];
}

interface PersonSuggestion {
  id: string;
  user_id: string;
  full_name: string;
  archetype: string;
  archetypeColor: string;
  score: number;
  headline: string;
  candidateId?: string;
}

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const sw = 3;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  const color = getMatchColor(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

const ARCHETYPE_COLORS: Record<string, string> = {
  'The Innovator': '#8B5CF6', 'The Architect': '#06B6D4', 'The Connector': '#EC4899',
  'The Catalyst': '#F59E0B', 'The Craftsperson': '#10B981', 'The Harmonizer': '#8B5CF6',
  'The Explorer': '#06B6D4', 'The Strategist': '#3B82F6',
};

const topConnectors = [
  { rank: 1, name: 'Priya M.', avatar: 'PM', score: 980, archetype: 'Catalyst', color: '#EC4899' },
  { rank: 2, name: 'Jordan L.', avatar: 'JL', score: 945, archetype: 'Harmonizer', color: '#8B5CF6' },
  { rank: 3, name: 'Alex K.', avatar: 'AK', score: 910, archetype: 'Visionary', color: '#F59E0B' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NetworkDiscover({ isCandidate }: Props) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { stats, featuredCompanies, recentActivity, isLoading: statsLoading } = useNetworkData();

  const [hotRoles, setHotRoles] = useState<HotRole[]>([]);
  const [peopleSuggestions, setPeopleSuggestions] = useState<PersonSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myArchetype, setMyArchetype] = useState<{ name: string; emoji: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadDiscoverData();
  }, [user]);

  const loadDiscoverData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: roles } = await supabase
        .from('roles')
        .select('id, title, location, work_style, salary_min, salary_max, status, created_at, required_openness_min, required_openness_max, required_conscientiousness_min, required_conscientiousness_max, required_extraversion_min, required_extraversion_max, required_agreeableness_min, required_agreeableness_max, required_neuroticism_min, required_neuroticism_max, employers!inner(id, company_name, industry, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference, culture_values)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      let candidateOcean: OCEANScores | null = null;
      let candidateWorkStyle: string | undefined;
      if (isCandidate) {
        const { data: cand } = await supabase
          .from('candidates')
          .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, work_style')
          .eq('user_id', user.id)
          .single();
        if (cand?.openness_score != null) {
          candidateOcean = {
            openness: cand.openness_score, conscientiousness: cand.conscientiousness_score,
            extraversion: cand.extraversion_score, agreeableness: cand.agreeableness_score,
            neuroticism: cand.neuroticism_score,
          };
          candidateWorkStyle = cand.work_style || undefined;
          const arch = determineArchetype(candidateOcean);
          setMyArchetype({ name: arch.name, emoji: arch.emoji });
        }
      }

      const processedRoles: HotRole[] = (roles || []).map((r: any) => {
        const emp = r.employers;
        let matchScore: number | null = null;
        let traitScore = 0, cultureScore = 0;
        let highlightPills: string[] = [];
        if (candidateOcean && emp) {
          const result = calculateCompatibility({
            candidateOCEAN: candidateOcean,
            employerPreferences: {
              openness: emp.openness_preference || 50, conscientiousness: emp.conscientiousness_preference || 50,
              extraversion: emp.extraversion_preference || 50, agreeableness: emp.agreeableness_preference || 50,
              neuroticism: emp.neuroticism_preference || 50, cultureValues: emp.culture_values || [],
            },
            candidateWorkStyle,
            roleWorkStyle: r.work_style || undefined,
            roleRequirements: {
              required_openness_min: r.required_openness_min, required_openness_max: r.required_openness_max,
              required_conscientiousness_min: r.required_conscientiousness_min, required_conscientiousness_max: r.required_conscientiousness_max,
              required_extraversion_min: r.required_extraversion_min, required_extraversion_max: r.required_extraversion_max,
              required_agreeableness_min: r.required_agreeableness_min, required_agreeableness_max: r.required_agreeableness_max,
              required_neuroticism_min: r.required_neuroticism_min, required_neuroticism_max: r.required_neuroticism_max,
              work_style: r.work_style,
            },
          });
          matchScore = result.overallMatchScore;
          traitScore = result.traitMatchScore;
          cultureScore = result.cultureMatchScore;
          highlightPills = generateHighlightPills({ cultureMatchScore: cultureScore, traitMatchScore: traitScore, breakdown: result.breakdown });
        }
        return {
          id: r.id, title: r.title, location: r.location || '', work_style: r.work_style,
          salary_min: r.salary_min, salary_max: r.salary_max,
          employer: { id: emp.id, company_name: emp.company_name, industry: emp.industry || '' },
          matchScore, traitScore, cultureScore, highlightPills,
        };
      });
      setHotRoles(processedRoles);

      // People suggestions
      if (candidateOcean) {
        const { data: candidates } = await supabase
          .from('candidates')
          .select('id, user_id, openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, headline')
          .not('openness_score', 'is', null)
          .neq('user_id', user.id)
          .limit(20);

        if (candidates?.length) {
          const { data: profiles } = await supabase
            .from('profiles').select('id, full_name').in('id', candidates.map((c: any) => c.user_id));
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

          const scored = candidates
            .map((c: any) => {
              const profile = profileMap.get(c.user_id);
              if (!profile) return null;
              const theirOcean: OCEANScores = {
                openness: c.openness_score, conscientiousness: c.conscientiousness_score,
                extraversion: c.extraversion_score, agreeableness: c.agreeableness_score,
                neuroticism: c.neuroticism_score,
              };
              const result = calculateCompatibility({ candidateOCEAN: candidateOcean!, employerPreferences: { ...theirOcean } });
              const arch = determineArchetype(theirOcean);
              return {
                id: c.id, user_id: c.user_id,
                full_name: profile.full_name || 'Anonymous',
                archetype: arch.name, archetypeColor: ARCHETYPE_COLORS[arch.name] || '#D97706',
                score: result.overallMatchScore,
                headline: c.headline || '', candidateId: c.id,
              } as PersonSuggestion;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 6) as PersonSuggestion[];
          setPeopleSuggestions(scored);
        }
      }
    } catch (err) {
      console.error('Error loading discover data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChat = async (_person: PersonSuggestion) => {
    if (!user) return;
    try {
      const { data: myCandidate } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
      if (myCandidate) {
        showSuccess('Coming soon', 'Peer-to-peer coffee chats launching soon!');
      }
    } catch { showError('Error', 'Something went wrong'); }
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (isLoading && statsLoading) return <CoffeeBrewLoader message="Loading your network..." />;

  return (
    <div className="space-y-6">

      {/* Community Stats */}
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {myArchetype && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {myArchetype.emoji}
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Your Archetype</p>
                <p className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{myArchetype.name}</p>
              </div>
            </div>
          )}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Members', value: stats.memberCount, icon: Users, color: 'var(--color-accent)' },
              { label: 'Connections', value: stats.connectionCount, icon: Link2, color: '#10B981' },
              { label: 'Chats this week', value: stats.chatsThisWeek, icon: Coffee, color: '#8B5CF6' },
              { label: 'Open Roles', value: stats.openRolesCount, icon: Briefcase, color: '#06B6D4' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-textMuted)' }}>{stat.label}</span>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column: Hot Roles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Roles Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Zap className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Latest Roles
            </h2>
            <button
              onClick={() => setSearchParams({ tab: 'roles' })}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {hotRoles.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>No active roles yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={staggerContainer} initial="hidden" animate="show">
              {hotRoles.map(role => {
                const salary = formatSalary(role.salary_min, role.salary_max);
                return (
                  <motion.div
                    key={role.id}
                    variants={fadeUp}
                    className="p-4 rounded-xl border transition-all hover:shadow-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                    onClick={() => setSearchParams({ tab: 'roles' })}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: avatarGradient(role.employer.company_name) }}
                        >
                          <span className="text-xs font-bold text-white">{role.employer.company_name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>{role.title}</h3>
                          <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{role.employer.company_name}</p>
                        </div>
                      </div>
                      {role.matchScore != null && <ScoreRing score={role.matchScore} size={38} />}
                    </div>

                    {role.highlightPills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {role.highlightPills.map((pill, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: pill.includes('Culture') ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                              color: pill.includes('Culture') ? 'var(--color-success)' : 'var(--color-accent)',
                            }}>
                            {pill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {role.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>}
                      {role.work_style && <span>{role.work_style.charAt(0).toUpperCase() + role.work_style.slice(1)}</span>}
                      {salary !== 'Not specified' && <span className="font-medium" style={{ color: 'var(--color-text)' }}>{salary}</span>}
                    </div>

                    {role.matchScore != null && (
                      <div className="flex gap-4 mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}>
                        <span className="flex items-center gap-1"><Brain className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />Trait {role.traitScore}%</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: '#EC4899' }} />Culture {role.cultureScore}%</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Feed Card */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold font-display flex items-center gap-2 mb-4" style={{ color: 'var(--color-text)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--color-textMuted)' }}>No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: activity.type === 'chat_accepted' ? 'rgba(22, 163, 74, 0.1)' : activity.type === 'new_role' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                      }}>
                      {activity.type === 'chat_accepted' ? <Coffee className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} /> :
                        activity.type === 'new_role' ? <Briefcase className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} /> :
                          <Coffee className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--color-text)' }}>{activity.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-textMuted)' }}>{activity.subtitle}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-textMuted)' }}>
                      {timeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice CTA Card */}
          <div
            className="p-6 rounded-2xl text-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <div className="w-11 h-11 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Practice Your Pitch</h3>
            <p className="text-xs text-white/75 mb-4">Sharpen your intro with AI coaching</p>
            <Button
              size="sm"
              onClick={() => navigate('/app/practice')}
              className="!bg-white !text-[var(--color-accent)] font-semibold hover:!bg-white/90"
            >
              Start Practicing
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Companies Card */}
      {featuredCompanies.length > 0 && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              Featured Companies
            </h2>
            <button
              onClick={() => setSearchParams({ tab: 'companies' })}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hidden -mx-1 px-1">
            {featuredCompanies.map(company => (
              <div
                key={company.id}
                className="flex-shrink-0 w-56 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                onClick={() => setSearchParams({ tab: 'companies' })}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: avatarGradient(company.company_name) }}
                  >
                    {company.company_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>{company.company_name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{company.industry || 'Company'}</p>
                  </div>
                </div>
                {company.culture_values.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {company.culture_values.slice(0, 2).map((v, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                  <Briefcase className="w-3 h-3" />
                  {company.activeRolesCount} role{company.activeRolesCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People Suggestions Card */}
      {peopleSuggestions.length > 0 && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              People You Should Meet
            </h2>
            <button
              onClick={() => setSearchParams({ tab: 'people' })}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="show">
            {peopleSuggestions.map(person => (
              <motion.div
                key={person.id}
                variants={fadeUp}
                className="p-4 rounded-xl border transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: avatarGradient(person.full_name) }}
                  >
                    {initials(person.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{person.full_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-textSecondary)' }}>
                      {person.headline || 'Community member'}
                    </p>
                  </div>
                  {person.score > 0 && <ScoreRing score={person.score} size={36} />}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${person.archetypeColor}15`, color: person.archetypeColor }}
                  >
                    {person.archetype}
                  </span>
                  <Button size="xs" variant="ghost" rightIcon={<Coffee className="w-3 h-3" />}
                    onClick={() => handleRequestChat(person)}>
                    Chat
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Top Connectors Card */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Trophy className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Top Connectors
          </h2>
          <button
            onClick={() => setSearchParams({ tab: 'leaderboard' })}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            Full leaderboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[topConnectors[1], topConnectors[0], topConnectors[2]].map((entry, i) => {
            const isFirst = [2, 1, 3][i] === 1;
            return (
              <div
                key={entry.rank}
                className="p-4 rounded-xl text-center border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: isFirst ? 'var(--color-accent)' : 'var(--color-border)',
                  boxShadow: isFirst ? '0 0 16px rgba(217, 119, 6, 0.08)' : undefined,
                }}
              >
                <div className="flex justify-center mb-2">
                  {entry.rank === 1 ? <Crown className="w-5 h-5" style={{ color: '#F59E0B' }} /> :
                    entry.rank === 2 ? <Medal className="w-5 h-5" style={{ color: '#94A3B8' }} /> :
                      <Award className="w-5 h-5" style={{ color: '#D97706' }} />}
                </div>
                <div
                  className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: entry.color }}
                >
                  {entry.avatar}
                </div>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
                <span className="inline-block text-[11px] px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: `${entry.color}20`, color: entry.color }}>
                  {entry.archetype}
                </span>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-accent)' }}>
                  {entry.score}
                  <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--color-textMuted)' }}>pts</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
