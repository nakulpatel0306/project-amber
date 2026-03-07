import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Target, MessageSquare, Crown, Medal, Award, Building2, Users } from 'lucide-react';
import { staggerContainer, fadeUp } from '../../utils/motion';
import { avatarGradient } from '../../utils/matchHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Props {
  isEmployer: boolean;
}

type PeopleTab = 'connectors' | 'networkers' | 'rising';
type CompaniesTab = 'engaged' | 'matchers' | 'chatters';

interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  label: string;
  labelColor: string;
  isYou?: boolean;
}

const pTabs: { id: PeopleTab; label: string; icon: React.ElementType; desc: string; unit: string }[] = [
  { id: 'connectors', label: 'Top Connectors', icon: Trophy, desc: 'Most completed coffee chats', unit: 'chats' },
  { id: 'networkers', label: 'Super Networkers', icon: Flame, desc: 'Most total conversations', unit: 'total' },
  { id: 'rising', label: 'Rising Stars', icon: TrendingUp, desc: 'Newest active members', unit: '' },
];

const cTabs: { id: CompaniesTab; label: string; icon: React.ElementType; desc: string; unit: string }[] = [
  { id: 'engaged', label: 'Most Engaged', icon: Trophy, desc: 'Most active companies', unit: 'chats' },
  { id: 'matchers', label: 'Top Matchers', icon: Target, desc: 'Highest hiring activity', unit: 'roles' },
  { id: 'chatters', label: 'Chat Champions', icon: MessageSquare, desc: 'Most coffee chats hosted', unit: 'chats' },
];

const COLORS = ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#06B6D4', '#EF4444'];

export function NetworkLeaderboard(_props: Props) {
  const { user } = useAuth();
  const [pTab, setPTab] = useState<PeopleTab>('connectors');
  const [cTab, setCTab] = useState<CompaniesTab>('engaged');
  const [peopleData, setPeopleData] = useState<Record<PeopleTab, LeaderEntry[]>>({
    connectors: [], networkers: [], rising: [],
  });
  const [companyData, setCompanyData] = useState<Record<CompaniesTab, LeaderEntry[]>>({
    engaged: [], matchers: [], chatters: [],
  });
  const [yourRank, setYourRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      // People: Top connectors — completed coffee chats grouped by candidate
      const { data: completedChats } = await supabase
        .from('coffee_chats')
        .select('candidate_id, candidates!inner(user_id, profiles:user_id(full_name))')
        .eq('status', 'completed');

      const candidateCounts = new Map<string, { name: string; count: number; userId: string }>();
      (completedChats || []).forEach((c: any) => {
        const cand = c.candidates as any;
        const name = cand?.profiles?.full_name || 'Unknown';
        const prev = candidateCounts.get(c.candidate_id);
        candidateCounts.set(c.candidate_id, {
          name,
          count: (prev?.count || 0) + 1,
          userId: cand?.user_id || '',
        });
      });

      const connectors = [...candidateCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v], i) => ({
          rank: i + 1, name: v.name, score: v.count,
          label: 'Connector', labelColor: COLORS[i % COLORS.length],
          isYou: v.userId === user?.id,
        }));

      // People: Super networkers — all chats (any status)
      const { data: allChats } = await supabase
        .from('coffee_chats')
        .select('candidate_id, candidates!inner(user_id, profiles:user_id(full_name))');

      const networkCounts = new Map<string, { name: string; count: number; userId: string }>();
      (allChats || []).forEach((c: any) => {
        const cand = c.candidates as any;
        const name = cand?.profiles?.full_name || 'Unknown';
        const prev = networkCounts.get(c.candidate_id);
        networkCounts.set(c.candidate_id, {
          name,
          count: (prev?.count || 0) + 1,
          userId: cand?.user_id || '',
        });
      });

      const networkers = [...networkCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v], i) => ({
          rank: i + 1, name: v.name, score: v.count,
          label: 'Networker', labelColor: COLORS[i % COLORS.length],
          isYou: v.userId === user?.id,
        }));

      // People: Rising stars — most recent assessment completions
      const { data: recentCandidates } = await supabase
        .from('candidates')
        .select('user_id, assessment_completed_at, profiles:user_id(full_name)')
        .not('assessment_completed_at', 'is', null)
        .order('assessment_completed_at', { ascending: false })
        .limit(8);

      const rising = (recentCandidates || []).map((c: any, i: number) => ({
        rank: i + 1,
        name: c.profiles?.full_name || 'Unknown',
        score: 0,
        label: 'Rising', labelColor: COLORS[i % COLORS.length],
        isYou: c.user_id === user?.id,
      }));

      setPeopleData({ connectors, networkers, rising });

      // Find user's rank in current tab
      const myEntry = connectors.find(e => e.isYou);
      setYourRank(myEntry?.rank || null);

      // Companies: Most engaged — coffee chats by employer
      const { data: empChats } = await supabase
        .from('coffee_chats')
        .select('employer_id, employers!inner(company_name, industry)');

      const empCounts = new Map<string, { name: string; count: number; industry: string }>();
      (empChats || []).forEach((c: any) => {
        const emp = c.employers as any;
        const prev = empCounts.get(c.employer_id);
        empCounts.set(c.employer_id, {
          name: emp?.company_name || 'Unknown',
          count: (prev?.count || 0) + 1,
          industry: emp?.industry || 'Technology',
        });
      });

      const engaged = [...empCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v], i) => ({
          rank: i + 1, name: v.name, score: v.count,
          label: v.industry, labelColor: COLORS[i % COLORS.length],
        }));

      // Companies: Top matchers — most roles
      const { data: empRoles } = await supabase
        .from('roles')
        .select('employer_id, employers!inner(company_name, industry)')
        .eq('status', 'active');

      const roleCounts = new Map<string, { name: string; count: number; industry: string }>();
      (empRoles || []).forEach((r: any) => {
        const emp = r.employers as any;
        const prev = roleCounts.get(r.employer_id);
        roleCounts.set(r.employer_id, {
          name: emp?.company_name || 'Unknown',
          count: (prev?.count || 0) + 1,
          industry: emp?.industry || 'Technology',
        });
      });

      const matchers = [...roleCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v], i) => ({
          rank: i + 1, name: v.name, score: v.count,
          label: v.industry, labelColor: COLORS[i % COLORS.length],
        }));

      // Companies: Chat champions — completed chats only
      const { data: empCompleted } = await supabase
        .from('coffee_chats')
        .select('employer_id, employers!inner(company_name, industry)')
        .eq('status', 'completed');

      const completedCounts = new Map<string, { name: string; count: number; industry: string }>();
      (empCompleted || []).forEach((c: any) => {
        const emp = c.employers as any;
        const prev = completedCounts.get(c.employer_id);
        completedCounts.set(c.employer_id, {
          name: emp?.company_name || 'Unknown',
          count: (prev?.count || 0) + 1,
          industry: emp?.industry || 'Technology',
        });
      });

      const chatters = [...completedCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([, v], i) => ({
          rank: i + 1, name: v.name, score: v.count,
          label: v.industry, labelColor: COLORS[i % COLORS.length],
        }));

      setCompanyData({ engaged, matchers, chatters });
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const currentPTab = pTabs.find(t => t.id === pTab)!;
  const currentCTab = cTabs.find(t => t.id === cTab)!;
  const pData = peopleData[pTab];
  const cData = companyData[cTab];

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4" style={{ color: '#F59E0B' }} />;
    if (rank === 2) return <Medal className="w-4 h-4" style={{ color: '#94A3B8' }} />;
    if (rank === 3) return <Award className="w-4 h-4" style={{ color: '#D97706' }} />;
    return <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--color-textMuted)' }}>#{rank}</span>;
  };

  const renderHeroCard = (entry: LeaderEntry, rank: number, isCompany: boolean) => {
    const accentBorder = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : '#CD7F32';
    return (
      <div
        className="p-5 rounded-xl text-center border-2 transition-all"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: accentBorder,
          boxShadow: rank === 1 ? `0 0 24px ${accentBorder}30` : undefined,
        }}
      >
        <div className="flex justify-center mb-2">
          {rank === 1 ? <Crown className="w-5 h-5" style={{ color: '#F59E0B' }} /> :
            rank === 2 ? <Medal className="w-5 h-5" style={{ color: '#94A3B8' }} /> :
              <Award className="w-5 h-5" style={{ color: '#CD7F32' }} />}
        </div>
        <div
          className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
          style={{ background: avatarGradient(entry.name) }}
        >
          {entry.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
        {entry.isYou && (
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}>You</span>
        )}
        <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 ml-1"
          style={{ backgroundColor: `${entry.labelColor}20`, color: entry.labelColor }}>
          {entry.label}
        </span>
        {entry.score > 0 && (
          <p className="text-xl font-bold mt-2" style={{ color: 'var(--color-accent)' }}>
            {entry.score}
          </p>
        )}
      </div>
    );
  };

  const renderList = (data: LeaderEntry[], isCompany: boolean, unit: string) => (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
      {data.slice(3).map((entry, i) => (
        <div
          key={entry.rank}
          className="flex items-center gap-3 py-3.5 px-5 transition-colors hover:bg-[var(--color-surface)]"
          style={{
            borderTop: i > 0 ? '1px solid var(--color-border)' : undefined,
            borderLeft: entry.isYou ? '3px solid var(--color-accent)' : undefined,
          }}
        >
          <div className="w-6 flex justify-center">{renderRankIcon(entry.rank)}</div>
          <div
            className={`w-9 h-9 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${isCompany ? 'rounded-xl' : 'rounded-full'}`}
            style={{ background: avatarGradient(entry.name) }}
          >
            {entry.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
              {entry.name}
              {entry.isYou && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}>You</span>
              )}
            </p>
            <p className="text-xs" style={{ color: entry.labelColor }}>{entry.label}</p>
          </div>
          {entry.score > 0 && (
            <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
              {entry.score}
              {unit && <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--color-textMuted)' }}>{unit}</span>}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* People Rankings */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            People
          </h2>
          {yourRank && (
            <span className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}>
              Your Rank: #{yourRank}
            </span>
          )}
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>{currentPTab.desc}</p>

        {/* Category pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hidden">
          {pTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: pTab === tab.id ? 'var(--color-accent)' : 'var(--color-background)',
                color: pTab === tab.id ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                border: `1px solid ${pTab === tab.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {pData.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>No data yet — be the first!</p>
          </div>
        ) : (
          <>
            {/* Top 3 hero cards */}
            <motion.div className="grid grid-cols-3 gap-3 mb-4" variants={staggerContainer} initial="hidden" animate="show" key={pTab}>
              {[pData[1], pData[0], pData[2]].filter(Boolean).map((entry, i) => (
                <motion.div key={entry?.rank || i} variants={fadeUp}>
                  {entry && renderHeroCard(entry, [2, 1, 3][i], false)}
                </motion.div>
              ))}
            </motion.div>
            {/* Remaining list */}
            {pData.length > 3 && renderList(pData, false, currentPTab.unit)}
          </>
        )}
      </div>

      {/* Company Rankings */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Companies
          </h2>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>{currentCTab.desc}</p>

        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hidden">
          {cTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: cTab === tab.id ? 'var(--color-accent)' : 'var(--color-background)',
                color: cTab === tab.id ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                border: `1px solid ${cTab === tab.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {cData.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>No company data yet</p>
          </div>
        ) : (
          <>
            <motion.div className="grid grid-cols-3 gap-3 mb-4" variants={staggerContainer} initial="hidden" animate="show" key={cTab}>
              {[cData[1], cData[0], cData[2]].filter(Boolean).map((entry, i) => (
                <motion.div key={entry?.rank || i} variants={fadeUp}>
                  {entry && renderHeroCard(entry, [2, 1, 3][i], true)}
                </motion.div>
              ))}
            </motion.div>
            {cData.length > 3 && renderList(cData, true, currentCTab.unit)}
          </>
        )}
      </div>
    </div>
  );
}
