import { useState } from 'react';
import { Trophy, Flame, TrendingUp, Crown, Medal, Award } from 'lucide-react';

type Tab = 'connectors' | 'networkers' | 'rising';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  archetype: string;
  archetypeColor: string;
}

const mockData: Record<Tab, LeaderboardEntry[]> = {
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

const tabs: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'connectors', label: 'Top Connectors', icon: Trophy, description: 'Highest match scores' },
  { id: 'networkers', label: 'Super Networkers', icon: Flame, description: 'Most coffee chats' },
  { id: 'rising', label: 'Rising Stars', icon: TrendingUp, description: 'Fastest growing profiles' },
];

const scoreLabel: Record<Tab, string> = {
  connectors: 'pts',
  networkers: 'chats',
  rising: 'pts',
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4" style={{ color: '#F59E0B' }} />;
  if (rank === 2) return <Medal className="w-4 h-4" style={{ color: '#94A3B8' }} />;
  if (rank === 3) return <Award className="w-4 h-4" style={{ color: '#D97706' }} />;
  return <span className="text-xs font-bold" style={{ color: 'var(--color-textMuted)' }}>#{rank}</span>;
};

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('connectors');
  const entries = mockData[activeTab];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>See how you stack up in the Amber community</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
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
          {tabs.find(t => t.id === activeTab)?.description}
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
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: entry.archetypeColor }}
                >
                  {entry.avatar}
                </div>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: `${entry.archetypeColor}20`, color: entry.archetypeColor }}
                >
                  {entry.archetype}
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: entry.archetypeColor }}
              >
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${entry.archetypeColor}20`, color: entry.archetypeColor }}
                >
                  {entry.archetype}
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
