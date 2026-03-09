import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { avatarGradient } from '../../utils/matchHelpers';

interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  userId: string;
  isYou?: boolean;
}

export function LeaderboardSidebar() {
  const { user } = useAuth();
  const [topConnectors, setTopConnectors] = useState<LeaderEntry[]>([]);
  const [risingStars, setRisingStars] = useState<LeaderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Top connectors - most completed coffee chats
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
        .slice(0, 5)
        .map(([, v], i) => ({
          rank: i + 1,
          name: v.name,
          score: v.count,
          userId: v.userId,
          isYou: v.userId === user?.id,
        }));

      setTopConnectors(connectors);

      // Rising stars - newest active members
      const { data: recentCandidates } = await supabase
        .from('candidates')
        .select('user_id, assessment_completed_at, profiles:user_id(full_name)')
        .not('assessment_completed_at', 'is', null)
        .order('assessment_completed_at', { ascending: false })
        .limit(5);

      const rising = (recentCandidates || []).map((c: any, i: number) => ({
        rank: i + 1,
        name: c.profiles?.full_name || 'Unknown',
        score: 0,
        userId: c.user_id,
        isYou: c.user_id === user?.id,
      }));

      setRisingStars(rising);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />;
    if (rank === 2) return <Medal className="w-3.5 h-3.5" style={{ color: '#94A3B8' }} />;
    if (rank === 3) return <Award className="w-3.5 h-3.5" style={{ color: '#CD7F32' }} />;
    return <span className="text-[10px] font-bold" style={{ color: 'var(--color-textMuted)' }}>#{rank}</span>;
  };

  const renderEntry = (entry: LeaderEntry, showScore: boolean) => (
    <div
      key={entry.userId}
      className="flex items-center gap-2 py-2 px-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
      style={{
        backgroundColor: entry.isYou ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
      }}
    >
      <div className="w-5 flex justify-center">{renderRankIcon(entry.rank)}</div>
      <div
        className="w-7 h-7 flex items-center justify-center text-[10px] font-semibold text-white rounded-full flex-shrink-0"
        style={{ background: avatarGradient(entry.name) }}
      >
        {entry.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {entry.name}
          {entry.isYou && (
            <span
              className="ml-1 text-[8px] px-1 py-0.5 rounded font-bold"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              You
            </span>
          )}
        </p>
      </div>
      {showScore && entry.score > 0 && (
        <p className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
          {entry.score}
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bento-card p-4">
          <div className="h-4 w-24 rounded mb-3 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2 py-2">
              <div className="w-7 h-7 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="h-3 flex-1 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Connectors */}
      <div className="bento-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            Top Connectors
          </h3>
        </div>
        {topConnectors.length > 0 ? (
          <div className="space-y-0.5">
            {topConnectors.map(entry => renderEntry(entry, true))}
          </div>
        ) : (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-textMuted)' }}>
            No data yet
          </p>
        )}
      </div>

      {/* Rising Stars */}
      <div className="bento-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            Rising Stars
          </h3>
        </div>
        {risingStars.length > 0 ? (
          <div className="space-y-0.5">
            {risingStars.map(entry => renderEntry(entry, false))}
          </div>
        ) : (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-textMuted)' }}>
            No data yet
          </p>
        )}
      </div>
    </div>
  );
}
