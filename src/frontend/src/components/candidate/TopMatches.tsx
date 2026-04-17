import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Building2,
  MapPin,
  Coffee,
  Briefcase,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ScoreRing } from '../ui/ScoreRing';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { EmberFirefly } from '../ember/EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { getMatchColor } from '../../utils/matchHelpers';
import { cardGridContainer, cardItem, sectionReveal } from '../../utils/motion';

interface TopMatch {
  rank: number;
  roleId: string;
  roleTitle: string;
  companyName: string;
  companyIndustry: string;
  location: string;
  workStyle: string;
  employerId: string;
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
  };
}

const OCEAN_LABELS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Stability'];

function getRankMedalClass(rank: number): string | null {
  if (rank === 1) return 'rank-medal rank-medal-gold';
  if (rank === 2) return 'rank-medal rank-medal-silver';
  if (rank === 3) return 'rank-medal rank-medal-bronze';
  return null;
}

export function TopMatches() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<TopMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<TopMatch | null>(null);
  const [archetype, setArchetype] = useState<ReturnType<typeof determineArchetype> | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const showLoader = useMinLoader(isLoading, 2500);

  // Dashboard stats
  const stats = useMemo(() => {
    if (matches.length === 0) return null;
    const scores = matches.map(m => m.overallScore);
    return {
      total: matches.length,
      topScore: Math.max(...scores),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }, [matches]);

  useEffect(() => {
    if (!user) return;
    loadTopMatches();
  }, [user]);

  const loadTopMatches = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!candidate || !candidate.openness_score) {
        setIsLoading(false);
        return;
      }

      setCandidateId(candidate.id);

      const ocean: OCEANScores = {
        openness: candidate.openness_score || 50,
        conscientiousness: candidate.conscientiousness_score || 50,
        extraversion: candidate.extraversion_score || 50,
        agreeableness: candidate.agreeableness_score || 50,
        neuroticism: candidate.neuroticism_score || 50,
      };

      setArchetype(determineArchetype(ocean));

      const { data: roles } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (!roles) {
        setIsLoading(false);
        return;
      }

      const results: TopMatch[] = roles.map((role: any) => {
        const emp = role.employers;
        const result = calculateCompatibility({
          candidateOCEAN: ocean,
          employerPreferences: {
            openness: emp.openness_preference || 50,
            conscientiousness: emp.conscientiousness_preference || 50,
            extraversion: emp.extraversion_preference || 50,
            agreeableness: emp.agreeableness_preference || 50,
            neuroticism: emp.neuroticism_preference || 50,
            cultureValues: emp.culture_values || [],
          },
          candidateWorkStyle: candidate.work_style || undefined,
          roleWorkStyle: role.work_style || undefined,
        });

        return {
          rank: 0,
          roleId: role.id,
          roleTitle: role.title,
          companyName: emp.company_name || 'Unknown',
          companyIndustry: emp.industry || '',
          location: role.location || emp.location || '',
          workStyle: role.work_style || '',
          employerId: emp.id,
          overallScore: result.overallMatchScore,
          traitScore: result.traitMatchScore,
          cultureScore: result.cultureMatchScore,
          breakdown: {
            opennessFit: result.breakdown.opennessFit,
            conscientiousnessFit: result.breakdown.conscientiousnessFit,
            extraversionFit: result.breakdown.extraversionFit,
            agreeablenessFit: result.breakdown.agreeablenessFit,
            neuroticismFit: result.breakdown.neuroticismFit,
          },
        };
      });

      results.sort((a, b) => b.overallScore - a.overallScore);
      const top10 = results.slice(0, 10).map((m, i) => ({ ...m, rank: i + 1 }));
      setMatches(top10);

      if (top10.length > 0) setSelectedMatch(top10[0]);
    } catch (err) {
      console.error('Error loading top matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLoader) {
    return <CoffeeBrewLoader variant="fullscreen" />;
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            No matches yet
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Complete your personality assessment to see your top role matches.
          </p>
          <Button onClick={() => navigate('/app/personality')}>
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-8"
      variants={sectionReveal}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <Trophy className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
            Your Top Matches
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p style={{ color: 'var(--color-textSecondary)' }}>
              {archetype ? `As ${archetype.name}, here are your best personality fits` : 'Roles ranked by personality compatibility'}
            </p>
            {stats && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="stat-badge">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {stats.total} matches
                </span>
                <span className="stat-badge">
                  Top {stats.topScore}%
                </span>
                <span className="stat-badge">
                  Avg {stats.avgScore}%
                </span>
              </div>
            )}
          </div>
        </div>
        {archetype && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{archetype.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match list */}
        <motion.div
          className="lg:col-span-2 space-y-3"
          variants={cardGridContainer}
          initial="hidden"
          animate="show"
        >
          {matches.map(match => {
            const medalClass = getRankMedalClass(match.rank);

            return (
              <motion.div key={match.roleId} variants={cardItem}>
                <button
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    selectedMatch?.roleId === match.roleId
                      ? 'ring-2 ring-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-surfaceHover)]'
                  }`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: selectedMatch?.roleId === match.roleId ? '0 0 16px color-mix(in srgb, var(--color-accent) 12%, transparent)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                        <Building2 className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      {medalClass ? (
                        <span className={`${medalClass} absolute -top-1.5 -right-1.5 text-[9px]`}>
                          {match.rank}
                        </span>
                      ) : (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-textMuted)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {match.rank}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{match.roleTitle}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{match.companyName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {match.location && (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                            <MapPin className="w-3 h-3" /> {match.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold" style={{ color: getMatchColor(match.overallScore) }}>
                        {match.overallScore}%
                      </div>
                      {/* Mini metric bars */}
                      <div className="space-y-0.5 mt-1 w-20">
                        {[
                          { score: match.traitScore, label: 'T' },
                          { score: match.cultureScore, label: 'C' },
                        ].map(({ score, label }) => (
                          <div key={label} className="flex items-center gap-1">
                            <span className="text-[9px] w-3" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
                            <div className="metric-bar flex-1">
                              <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: getMatchColor(score) }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedMatch ? (
            <div className="sticky top-6 glass-stat p-5 space-y-5">
              <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-center gap-3">
                  <div className="inner-glow-ring">
                    <ScoreRing score={selectedMatch.overallScore} size={64} strokeWidth={3} label="Overall" />
                  </div>
                  <ScoreRing score={selectedMatch.traitScore} size={50} strokeWidth={3} label="Traits" />
                  <ScoreRing score={selectedMatch.cultureScore} size={50} strokeWidth={3} label="Culture" />
                </div>
                <h3 className="font-semibold text-lg mt-3" style={{ color: 'var(--color-text)' }}>{selectedMatch.roleTitle}</h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{selectedMatch.companyName}</p>
                {selectedMatch.rank <= 3 && (
                  <span className={getRankMedalClass(selectedMatch.rank) || ''} style={{ marginTop: 4, display: 'inline-flex' }}>
                    #{selectedMatch.rank}
                  </span>
                )}
              </div>

              {/* OCEAN breakdown with metric bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>OCEAN Breakdown</h4>
                <div className="space-y-2.5">
                  {[
                    selectedMatch.breakdown.opennessFit,
                    selectedMatch.breakdown.conscientiousnessFit,
                    selectedMatch.breakdown.extraversionFit,
                    selectedMatch.breakdown.agreeablenessFit,
                    selectedMatch.breakdown.neuroticismFit,
                  ].map((fit, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{OCEAN_LABELS[i]}</span>
                        <span className="text-xs font-semibold" style={{ color: getMatchColor(fit) }}>{fit}%</span>
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-bar-fill"
                          style={{ width: `${fit}%`, backgroundColor: getMatchColor(fit) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {selectedMatch.location && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                    <MapPin className="w-4 h-4" /> {selectedMatch.location}
                  </div>
                )}
                {selectedMatch.workStyle && (
                  <div className="flex items-center gap-2 capitalize" style={{ color: 'var(--color-textMuted)' }}>
                    <Briefcase className="w-4 h-4" /> {selectedMatch.workStyle}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="sm"
                leftIcon={<Coffee className="w-4 h-4" />}
                onClick={async () => {
                  if (!candidateId || !selectedMatch) return;
                  try {
                    await supabase.from('coffee_chats').insert({
                      candidate_id: candidateId,
                      employer_id: selectedMatch.employerId,
                      role_id: selectedMatch.roleId,
                      initiated_by: 'candidate',
                      status: 'pending',
                      message: `Interested in ${selectedMatch.roleTitle}`,
                      role_title: selectedMatch.roleTitle,
                      match_score: selectedMatch.overallScore,
                    });
                    showSuccess('Sent!', 'Coffee chat request sent');
                  } catch {
                    showError('Error', 'Failed to send request');
                  }
                }}
              >
                request coffee chat
              </Button>
            </div>
          ) : (
            <div className="sticky top-6 p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <EmberFirefly size="md" mood="neutral" />
              <p className="mt-4" style={{ color: 'var(--color-textMuted)' }}>Select a match to see details</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
