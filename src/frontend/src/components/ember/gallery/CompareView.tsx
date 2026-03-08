import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Heart, Zap, Sparkles, ArrowUpRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { avatarGradient, getMatchColor } from '../../../utils/matchHelpers';
import type { CandidateResult } from '../../../types/matching.types';

interface CompareViewProps {
  candidates: CandidateResult[];
  employerOcean: Record<string, number>;
  onBack: () => void;
}

export function CompareView({ candidates, employerOcean, onBack }: CompareViewProps) {
  if (candidates.length < 2) return null;

  const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
  const dimensionLabels: Record<string, string> = {
    openness: 'Openness',
    conscientiousness: 'Conscientiousness',
    extraversion: 'Extraversion',
    agreeableness: 'Agreeableness',
    neuroticism: 'Stability',
  };

  const colors = ['var(--color-accent)', '#8b5cf6', '#06b6d4'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--color-accent)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </button>

      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        Compare Candidates ({candidates.length})
      </h1>

      {/* Candidate headers */}
      <div className="bento-card bento-card-accent">
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
          {candidates.map((c) => (
            <div key={c.candidateId} className="text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: avatarGradient(c.name) }}
              >
                <span className="text-xl font-bold text-white">{c.name.charAt(0)}</span>
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--color-textSecondary)' }}>{c.headline}</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {c.archetype.name}
              </span>
              <div className="flex justify-center">
                <ScoreRing score={c.overallScore} size={64} strokeWidth={4} fontSize="text-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score comparison */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Score Comparison</h2>
          <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)', opacity: 0.3 }} />
        </div>
        <div className="space-y-4">
          {[
            { label: 'Overall', key: 'overallScore' as const, icon: Zap },
            { label: 'Trait Match', key: 'traitScore' as const, icon: Brain },
            { label: 'Culture Fit', key: 'cultureScore' as const, icon: Heart },
            { label: 'Work Style', key: 'workStyleFit' as const, icon: Zap },
          ].map(({ label, key, icon: Icon }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
              </div>
              <div className="space-y-1.5">
                {candidates.map((c, idx) => (
                  <div key={c.candidateId} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium w-20 truncate" style={{ color: 'var(--color-textMuted)' }}>
                      {c.name}
                    </span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${c[key]}%`,
                          backgroundColor: colors[idx],
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color: getMatchColor(c[key]) }}>
                      {c[key]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OCEAN Dimension Comparison */}
      <div className="bento-card">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>OCEAN Profile Comparison</h2>
        <div className="space-y-4">
          {dimensions.map(dim => (
            <div key={dim}>
              <span className="text-xs font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>
                {dimensionLabels[dim]}
              </span>
              <div className="space-y-1">
                {/* Employer preference line */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium w-20 truncate" style={{ color: 'var(--color-textMuted)' }}>Your Pref</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${dim === 'neuroticism' ? 100 - employerOcean[dim] : employerOcean[dim]}%`, backgroundColor: '#3b82f6', opacity: 0.4 }}
                    />
                  </div>
                  <span className="text-[10px] font-medium w-6 text-right" style={{ color: 'var(--color-textMuted)' }}>
                    {dim === 'neuroticism' ? 100 - employerOcean[dim] : employerOcean[dim]}
                  </span>
                </div>
                {candidates.map((c, idx) => (
                  <div key={c.candidateId} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium w-20 truncate" style={{ color: 'var(--color-textMuted)' }}>{c.name}</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${dim === 'neuroticism' ? 100 - c.candidateOcean[dim] : c.candidateOcean[dim]}%`,
                          backgroundColor: colors[idx],
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium w-6 text-right" style={{ color: 'var(--color-textMuted)' }}>
                      {dim === 'neuroticism' ? 100 - c.candidateOcean[dim] : c.candidateOcean[dim]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      <div className="text-center pb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Gallery
        </Button>
      </div>
    </motion.div>
  );
}
