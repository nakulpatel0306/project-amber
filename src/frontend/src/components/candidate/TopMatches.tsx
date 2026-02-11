import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Building2,
  MapPin,
  Coffee,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { EmberFirefly } from '../ember/EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';

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

function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? 'var(--color-success)' : score >= 70 ? 'var(--color-accent)' : 'var(--color-warning)';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={3} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={3}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{label}</span>}
    </div>
  );
}

const OCEAN_LABELS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Stability'];

export function TopMatches() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<TopMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<TopMatch | null>(null);
  const [archetype, setArchetype] = useState<ReturnType<typeof determineArchetype> | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <EmberFirefly size="lg" mood="thinking" animated />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Calculating your top 10 matches...
          </p>
        </div>
      </div>
    );
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
            Complete your personality assessment to see your top 10 role matches.
          </p>
          <Button onClick={() => navigate('/app/personality')}>
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Trophy className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
            your top 10 matches
          </h1>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            {archetype ? `As ${archetype.name}, here are your best personality fits` : 'Roles ranked by personality compatibility'}
          </p>
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
        <div className="lg:col-span-2 space-y-3">
          {matches.map(match => (
            <button
              key={match.roleId}
              onClick={() => setSelectedMatch(match)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                selectedMatch?.roleId === match.roleId
                  ? 'ring-2 ring-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-surfaceHover)]'
              }`}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                    <Building2 className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: match.rank <= 3 ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: match.rank <= 3 ? 'white' : 'var(--color-textMuted)',
                      border: match.rank > 3 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {match.rank}
                  </div>
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
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: match.overallScore >= 85 ? 'var(--color-success)' : match.overallScore >= 70 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                    {match.overallScore}%
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{match.traitScore}% T</span>
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{match.cultureScore}% C</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedMatch ? (
            <div className="sticky top-6 p-5 rounded-2xl space-y-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-center gap-3">
                  <ScoreRing score={selectedMatch.overallScore} label="Overall" />
                  <ScoreRing score={selectedMatch.traitScore} size={50} label="Traits" />
                  <ScoreRing score={selectedMatch.cultureScore} size={50} label="Culture" />
                </div>
                <h3 className="font-semibold text-lg mt-3" style={{ color: 'var(--color-text)' }}>{selectedMatch.roleTitle}</h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{selectedMatch.companyName}</p>
              </div>

              {/* OCEAN mini bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>OCEAN Breakdown</h4>
                <div className="space-y-2">
                  {[
                    selectedMatch.breakdown.opennessFit,
                    selectedMatch.breakdown.conscientiousnessFit,
                    selectedMatch.breakdown.extraversionFit,
                    selectedMatch.breakdown.agreeablenessFit,
                    selectedMatch.breakdown.neuroticismFit,
                  ].map((fit, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{OCEAN_LABELS[i]}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{fit}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                        <div className="h-full rounded-full" style={{ width: `${fit}%`, backgroundColor: fit >= 80 ? 'var(--color-success)' : fit >= 60 ? 'var(--color-accent)' : 'var(--color-warning)' }} />
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
    </div>
  );
}
