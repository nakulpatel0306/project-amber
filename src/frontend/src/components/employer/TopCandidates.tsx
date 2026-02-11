import { useState, useEffect } from 'react';
import {
  Trophy,
  MapPin,
  Coffee,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { EmberFirefly } from '../ember/EmberFirefly';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';

interface TopCandidate {
  rank: number;
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  archetype: string;
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

export function TopCandidates() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<TopCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<TopCandidate | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadTopCandidates();
  }, [user]);

  const loadTopCandidates = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!employer) {
        setIsLoading(false);
        return;
      }

      setEmployerId(employer.id);

      const employerOcean: OCEANScores = {
        openness: employer.openness_preference || 50,
        conscientiousness: employer.conscientiousness_preference || 50,
        extraversion: employer.extraversion_preference || 50,
        agreeableness: employer.agreeableness_preference || 50,
        neuroticism: employer.neuroticism_preference || 50,
      };

      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*, profiles!inner(full_name, email)')
        .not('openness_score', 'is', null);

      if (!candidatesData) {
        setIsLoading(false);
        return;
      }

      const results: TopCandidate[] = candidatesData.map((c: any) => {
        const candidateOcean: OCEANScores = {
          openness: c.openness_score || 50,
          conscientiousness: c.conscientiousness_score || 50,
          extraversion: c.extraversion_score || 50,
          agreeableness: c.agreeableness_score || 50,
          neuroticism: c.neuroticism_score || 50,
        };

        const result = calculateCompatibility({
          candidateOCEAN: candidateOcean,
          employerPreferences: {
            ...employerOcean,
            cultureValues: employer.culture_values || [],
          },
          candidateWorkStyle: c.work_style || undefined,
        });

        const arch = determineArchetype(candidateOcean);

        return {
          rank: 0,
          candidateId: c.id,
          name: c.profiles?.full_name || 'Unknown',
          headline: c.headline || arch.name,
          location: c.location || '',
          archetype: arch.name,
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
      const top10 = results.slice(0, 10).map((c, i) => ({ ...c, rank: i + 1 }));
      setCandidates(top10);

      if (top10.length > 0) setSelectedCandidate(top10[0]);
    } catch (err) {
      console.error('Error loading top candidates:', err);
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
            Ranking candidates by culture fit...
          </p>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <EmberFirefly size="xl" mood="neutral" />
          <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            No candidates yet
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            No candidates have completed their assessments yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Trophy className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
          top 10 candidates
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          Candidates ranked by personality fit for your culture
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate list */}
        <div className="lg:col-span-2 space-y-3">
          {candidates.map(c => (
            <button
              key={c.candidateId}
              onClick={() => setSelectedCandidate(c)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                selectedCandidate?.candidateId === c.candidateId
                  ? 'ring-2 ring-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-surfaceHover)]'
              }`}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}
                  >
                    <span className="text-lg font-medium text-white">{c.name.charAt(0)}</span>
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: c.rank <= 3 ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: c.rank <= 3 ? 'white' : 'var(--color-textMuted)',
                      border: c.rank > 3 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {c.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</h3>
                  <p className="text-sm truncate" style={{ color: 'var(--color-textSecondary)' }}>{c.headline}</p>
                  {c.location && (
                    <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
                      <MapPin className="w-3 h-3" /> {c.location}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: c.overallScore >= 85 ? 'var(--color-success)' : c.overallScore >= 70 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                    {c.overallScore}%
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{c.archetype}</p>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedCandidate ? (
            <div className="sticky top-6 p-5 rounded-2xl space-y-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-center gap-3">
                  <ScoreRing score={selectedCandidate.overallScore} label="Overall" />
                  <ScoreRing score={selectedCandidate.traitScore} size={50} label="Traits" />
                  <ScoreRing score={selectedCandidate.cultureScore} size={50} label="Culture" />
                </div>
                <h3 className="font-semibold text-lg mt-3" style={{ color: 'var(--color-text)' }}>{selectedCandidate.name}</h3>
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{selectedCandidate.archetype}</p>
              </div>

              {/* OCEAN bars */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>OCEAN Breakdown</h4>
                <div className="space-y-2">
                  {[
                    selectedCandidate.breakdown.opennessFit,
                    selectedCandidate.breakdown.conscientiousnessFit,
                    selectedCandidate.breakdown.extraversionFit,
                    selectedCandidate.breakdown.agreeablenessFit,
                    selectedCandidate.breakdown.neuroticismFit,
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

              <Button
                className="w-full"
                size="sm"
                leftIcon={<Coffee className="w-4 h-4" />}
                onClick={async () => {
                  if (!employerId || !selectedCandidate) return;
                  try {
                    await supabase.from('coffee_chats').insert({
                      candidate_id: selectedCandidate.candidateId,
                      employer_id: employerId,
                      initiated_by: 'employer',
                      status: 'pending',
                      match_score: selectedCandidate.overallScore,
                    });
                    showSuccess('Sent!', 'Coffee chat invitation sent');
                  } catch {
                    showError('Error', 'Failed to send invitation');
                  }
                }}
              >
                invite to coffee chat
              </Button>
            </div>
          ) : (
            <div className="sticky top-6 p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <EmberFirefly size="md" mood="neutral" />
              <p className="mt-4" style={{ color: 'var(--color-textMuted)' }}>Select a candidate for details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
