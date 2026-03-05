import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp, Target, MessageSquare, Crown, Medal, Award, Building2, Users } from 'lucide-react';
import { staggerContainer, fadeUp } from '../../utils/motion';
import { avatarGradient } from '../../utils/matchHelpers';

interface Props {
  isEmployer: boolean;
}

type PeopleTab = 'connectors' | 'networkers' | 'rising';
type CompaniesTab = 'engaged' | 'matchers' | 'chatters';

interface PeopleEntry { rank: number; name: string; avatar: string; score: number; archetype: string; archetypeColor: string }
interface CompanyEntry { rank: number; company: string; avatar: string; score: number; industry: string; industryColor: string }

const peopleMock: Record<PeopleTab, PeopleEntry[]> = {
  connectors: [
    { rank: 1, name: 'Priya M.', avatar: 'PM', score: 980, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 2, name: 'Jordan L.', avatar: 'JL', score: 945, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 3, name: 'Alex K.', avatar: 'AK', score: 910, archetype: 'Visionary', archetypeColor: '#F59E0B' },
    { rank: 4, name: 'Sam T.', avatar: 'ST', score: 875, archetype: 'Builder', archetypeColor: '#10B981' },
    { rank: 5, name: 'Riley N.', avatar: 'RN', score: 840, archetype: 'Strategist', archetypeColor: '#06B6D4' },
    { rank: 6, name: 'Morgan F.', avatar: 'MF', score: 815, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 7, name: 'Casey D.', avatar: 'CD', score: 790, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 8, name: 'Taylor W.', avatar: 'TW', score: 765, archetype: 'Visionary', archetypeColor: '#F59E0B' },
  ],
  networkers: [
    { rank: 1, name: 'Alex K.', avatar: 'AK', score: 52, archetype: 'Visionary', archetypeColor: '#F59E0B' },
    { rank: 2, name: 'Morgan F.', avatar: 'MF', score: 48, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 3, name: 'Priya M.', avatar: 'PM', score: 45, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 4, name: 'Casey D.', avatar: 'CD', score: 41, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 5, name: 'Jordan L.', avatar: 'JL', score: 38, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 6, name: 'Sam T.', avatar: 'ST', score: 35, archetype: 'Builder', archetypeColor: '#10B981' },
    { rank: 7, name: 'Riley N.', avatar: 'RN', score: 32, archetype: 'Strategist', archetypeColor: '#06B6D4' },
    { rank: 8, name: 'Taylor W.', avatar: 'TW', score: 28, archetype: 'Visionary', archetypeColor: '#F59E0B' },
  ],
  rising: [
    { rank: 1, name: 'Taylor W.', avatar: 'TW', score: 320, archetype: 'Visionary', archetypeColor: '#F59E0B' },
    { rank: 2, name: 'Riley N.', avatar: 'RN', score: 290, archetype: 'Strategist', archetypeColor: '#06B6D4' },
    { rank: 3, name: 'Casey D.', avatar: 'CD', score: 275, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 4, name: 'Sam T.', avatar: 'ST', score: 260, archetype: 'Builder', archetypeColor: '#10B981' },
    { rank: 5, name: 'Morgan F.', avatar: 'MF', score: 245, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 6, name: 'Priya M.', avatar: 'PM', score: 230, archetype: 'Catalyst', archetypeColor: '#EC4899' },
    { rank: 7, name: 'Jordan L.', avatar: 'JL', score: 220, archetype: 'Harmonizer', archetypeColor: '#8B5CF6' },
    { rank: 8, name: 'Alex K.', avatar: 'AK', score: 210, archetype: 'Visionary', archetypeColor: '#F59E0B' },
  ],
};

const companyMock: Record<CompaniesTab, CompanyEntry[]> = {
  engaged: [
    { rank: 1, company: 'TechFlow Inc.', avatar: 'TF', score: 950, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 2, company: 'GreenLeaf Health', avatar: 'GL', score: 920, industry: 'Healthcare', industryColor: '#10B981' },
    { rank: 3, company: 'Nexus Labs', avatar: 'NL', score: 885, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 4, company: 'Bright Minds Ed.', avatar: 'BM', score: 860, industry: 'Education', industryColor: '#F59E0B' },
    { rank: 5, company: 'Urban Studio', avatar: 'US', score: 835, industry: 'Design', industryColor: '#EC4899' },
    { rank: 6, company: 'FinPulse', avatar: 'FP', score: 810, industry: 'Finance', industryColor: '#06B6D4' },
    { rank: 7, company: 'CloudBase', avatar: 'CB', score: 790, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 8, company: 'WellBeing Co.', avatar: 'WB', score: 770, industry: 'Healthcare', industryColor: '#10B981' },
  ],
  matchers: [
    { rank: 1, company: 'Nexus Labs', avatar: 'NL', score: 94, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 2, company: 'TechFlow Inc.', avatar: 'TF', score: 91, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 3, company: 'Bright Minds Ed.', avatar: 'BM', score: 89, industry: 'Education', industryColor: '#F59E0B' },
    { rank: 4, company: 'GreenLeaf Health', avatar: 'GL', score: 86, industry: 'Healthcare', industryColor: '#10B981' },
    { rank: 5, company: 'Urban Studio', avatar: 'US', score: 83, industry: 'Design', industryColor: '#EC4899' },
    { rank: 6, company: 'FinPulse', avatar: 'FP', score: 80, industry: 'Finance', industryColor: '#06B6D4' },
    { rank: 7, company: 'WellBeing Co.', avatar: 'WB', score: 77, industry: 'Healthcare', industryColor: '#10B981' },
    { rank: 8, company: 'CloudBase', avatar: 'CB', score: 74, industry: 'Technology', industryColor: '#8B5CF6' },
  ],
  chatters: [
    { rank: 1, company: 'GreenLeaf Health', avatar: 'GL', score: 38, industry: 'Healthcare', industryColor: '#10B981' },
    { rank: 2, company: 'TechFlow Inc.', avatar: 'TF', score: 35, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 3, company: 'Urban Studio', avatar: 'US', score: 32, industry: 'Design', industryColor: '#EC4899' },
    { rank: 4, company: 'Nexus Labs', avatar: 'NL', score: 29, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 5, company: 'Bright Minds Ed.', avatar: 'BM', score: 26, industry: 'Education', industryColor: '#F59E0B' },
    { rank: 6, company: 'CloudBase', avatar: 'CB', score: 23, industry: 'Technology', industryColor: '#8B5CF6' },
    { rank: 7, company: 'FinPulse', avatar: 'FP', score: 20, industry: 'Finance', industryColor: '#06B6D4' },
    { rank: 8, company: 'WellBeing Co.', avatar: 'WB', score: 18, industry: 'Healthcare', industryColor: '#10B981' },
  ],
};

const pTabs: { id: PeopleTab; label: string; icon: React.ElementType; desc: string; unit: string }[] = [
  { id: 'connectors', label: 'Top Connectors', icon: Trophy, desc: 'Highest match scores across the platform', unit: 'pts' },
  { id: 'networkers', label: 'Super Networkers', icon: Flame, desc: 'Most coffee chats completed', unit: 'chats' },
  { id: 'rising', label: 'Rising Stars', icon: TrendingUp, desc: 'Fastest growing this month', unit: 'pts' },
];

const cTabs: { id: CompaniesTab; label: string; icon: React.ElementType; desc: string; unit: string }[] = [
  { id: 'engaged', label: 'Most Engaged', icon: Trophy, desc: 'Most active companies on the platform', unit: 'pts' },
  { id: 'matchers', label: 'Top Matchers', icon: Target, desc: 'Highest average candidate match scores', unit: '% avg' },
  { id: 'chatters', label: 'Chat Champions', icon: MessageSquare, desc: 'Most coffee chats hosted', unit: 'chats' },
];

function PodiumCard({ entry, rank, type, unit }: { entry: PeopleEntry | CompanyEntry; rank: number; type: 'people' | 'companies'; unit: string }) {
  const isPerson = type === 'people';
  const name = isPerson ? (entry as PeopleEntry).name : (entry as CompanyEntry).company;
  const color = isPerson ? (entry as PeopleEntry).archetypeColor : (entry as CompanyEntry).industryColor;
  const label = isPerson ? (entry as PeopleEntry).archetype : (entry as CompanyEntry).industry;
  const isFirst = rank === 1;

  return (
    <div
      className="p-4 rounded-xl text-center border transition-all"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: isFirst ? 'var(--color-accent)' : 'var(--color-border)',
        boxShadow: isFirst ? '0 0 20px rgba(217, 119, 6, 0.1)' : undefined,
      }}
    >
      <div className="flex justify-center mb-2">
        {rank === 1 ? <Crown className="w-5 h-5" style={{ color: '#F59E0B' }} /> :
          rank === 2 ? <Medal className="w-5 h-5" style={{ color: '#94A3B8' }} /> :
            <Award className="w-5 h-5" style={{ color: '#D97706' }} />}
      </div>
      <div
        className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white ${isPerson ? 'rounded-full' : 'rounded-xl'}`}
        style={{ background: avatarGradient(name) }}
      >
        {(entry as any).avatar}
      </div>
      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{name}</p>
      <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
        style={{ backgroundColor: `${color}20`, color }}>
        {label}
      </span>
      <p className="text-xl font-bold mt-2" style={{ color: 'var(--color-accent)' }}>
        {entry.score}
        <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--color-textMuted)' }}>{unit}</span>
      </p>
    </div>
  );
}

export function NetworkLeaderboard(_props: Props) {
  const [pTab, setPTab] = useState<PeopleTab>('connectors');
  const [cTab, setCTab] = useState<CompaniesTab>('engaged');

  const currentPTab = pTabs.find(t => t.id === pTab)!;
  const currentCTab = cTabs.find(t => t.id === cTab)!;

  const pData = peopleMock[pTab];
  const cData = companyMock[cTab];

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />;
    if (rank === 2) return <Medal className="w-3.5 h-3.5" style={{ color: '#94A3B8' }} />;
    if (rank === 3) return <Award className="w-3.5 h-3.5" style={{ color: '#D97706' }} />;
    return <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--color-textMuted)' }}>#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* People Rankings Card */}
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            People Rankings
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{currentPTab.desc}</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hidden">
          {pTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: pTab === tab.id ? 'var(--color-accent)' : 'var(--color-background)',
                color: pTab === tab.id ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                border: `1px solid ${pTab === tab.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Podium: top 3 */}
        <motion.div className="grid grid-cols-3 gap-4 mb-6" variants={staggerContainer} initial="hidden" animate="show" key={pTab}>
          {[pData[1], pData[0], pData[2]].map((entry, i) => (
            <motion.div key={entry.rank} variants={fadeUp}>
              <PodiumCard entry={entry} rank={[2, 1, 3][i]} type="people" unit={currentPTab.unit} />
            </motion.div>
          ))}
        </motion.div>

        {/* Remaining list */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
          {pData.slice(3).map((entry, i) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 py-3.5 px-5 transition-colors hover:bg-[var(--color-surface)]"
              style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
            >
              <div className="w-6 flex justify-center">{renderRankIcon(entry.rank)}</div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: avatarGradient(entry.name) }}
              >
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
                <p className="text-xs" style={{ color: entry.archetypeColor }}>{entry.archetype}</p>
              </div>
              <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                {entry.score}
                <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--color-textMuted)' }}>{currentPTab.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Rankings Card */}
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Company Rankings
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{currentCTab.desc}</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hidden">
          {cTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: cTab === tab.id ? 'var(--color-accent)' : 'var(--color-background)',
                color: cTab === tab.id ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                border: `1px solid ${cTab === tab.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Podium: top 3 */}
        <motion.div className="grid grid-cols-3 gap-4 mb-6" variants={staggerContainer} initial="hidden" animate="show" key={cTab}>
          {[cData[1], cData[0], cData[2]].map((entry, i) => (
            <motion.div key={entry.rank} variants={fadeUp}>
              <PodiumCard entry={entry} rank={[2, 1, 3][i]} type="companies" unit={currentCTab.unit} />
            </motion.div>
          ))}
        </motion.div>

        {/* Remaining list */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
          {cData.slice(3).map((entry, i) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 py-3.5 px-5 transition-colors hover:bg-[var(--color-surface)]"
              style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
            >
              <div className="w-6 flex justify-center">{renderRankIcon(entry.rank)}</div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: avatarGradient(entry.company) }}
              >
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{entry.company}</p>
                <p className="text-xs" style={{ color: entry.industryColor }}>{entry.industry}</p>
              </div>
              <p className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                {entry.score}
                <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--color-textMuted)' }}>{currentCTab.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
