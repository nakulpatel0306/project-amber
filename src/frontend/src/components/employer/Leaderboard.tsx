import { useState } from 'react';
import { Trophy, Target, MessageSquare, Crown, Medal, Award } from 'lucide-react';

type Tab = 'engaged' | 'matchers' | 'chatters';

interface LeaderboardEntry {
  rank: number;
  company: string;
  avatar: string;
  score: number;
  industry: string;
  industryColor: string;
}

const mockData: Record<Tab, LeaderboardEntry[]> = {
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

const tabsConfig: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'engaged', label: 'Most Engaged', icon: Trophy, description: 'Most active on the platform' },
  { id: 'matchers', label: 'Top Matchers', icon: Target, description: 'Highest average match scores' },
  { id: 'chatters', label: 'Chat Champions', icon: MessageSquare, description: 'Most coffee chats initiated' },
];

const scoreLabel: Record<Tab, string> = {
  engaged: 'pts',
  matchers: '% avg',
  chatters: 'chats',
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4" style={{ color: '#F59E0B' }} />;
  if (rank === 2) return <Medal className="w-4 h-4" style={{ color: '#94A3B8' }} />;
  if (rank === 3) return <Award className="w-4 h-4" style={{ color: '#D97706' }} />;
  return <span className="text-xs font-bold" style={{ color: 'var(--color-textMuted)' }}>#{rank}</span>;
};

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('engaged');
  const entries = mockData[activeTab];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Employer Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>See which companies lead the Amber community</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabsConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-surface)',
                color: activeTab === tab.id ? 'white' : 'var(--color-textSecondary)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--color-border)',
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>
          {tabsConfig.find(t => t.id === activeTab)?.description}
        </p>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const podiumOrder = [2, 1, 3];
            const isFirst = podiumOrder[i] === 1;
            return (
              <div
                key={entry.rank}
                className="p-4 rounded-2xl text-center border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: isFirst ? 'var(--color-accent)' : 'var(--color-border)',
                  transform: isFirst ? 'scale(1.05)' : undefined,
                }}
              >
                <div className="flex justify-center mb-2">{getRankIcon(entry.rank)}</div>
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: entry.industryColor }}
                >
                  {entry.avatar}
                </div>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.company}</p>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: `${entry.industryColor}20`, color: entry.industryColor }}
                >
                  {entry.industry}
                </span>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-accent)' }}>
                  {entry.score} <span className="text-xs font-normal" style={{ color: 'var(--color-textMuted)' }}>{scoreLabel[activeTab]}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Remaining entries */}
        <div className="space-y-2">
          {entries.slice(3).map(entry => (
            <div
              key={entry.rank}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: entry.industryColor }}
              >
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.company}</p>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${entry.industryColor}20`, color: entry.industryColor }}
                >
                  {entry.industry}
                </span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                {entry.score} <span className="text-xs font-normal" style={{ color: 'var(--color-textMuted)' }}>{scoreLabel[activeTab]}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
