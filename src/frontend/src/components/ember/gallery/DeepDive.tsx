import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Brain, Heart, Zap, MessageCircle, Coffee,
  Bookmark, BookmarkCheck, GitCompareArrows, Share2, Lightbulb,
  AlertTriangle, CheckCircle2, HelpCircle, Target,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { RadarChart } from '../../ui/RadarChart';
import { GradientProgressBar } from '../../ui/GradientProgressBar';
import { EmberFirefly } from '../EmberFirefly';
import { avatarGradient, getMatchColor } from '../../../utils/matchHelpers';
import type { OCEANScores } from '../../../lib/compatibilityScoring';

const API_BASE = 'http://127.0.0.1:8000';

interface DimensionData {
  name: string;
  candidateScore: number;
  employerPreference: number;
  fitScore: number;
}

interface DeepDiveProps {
  mode: 'candidate' | 'employer';
  name: string;
  subtitle?: string;
  archetype?: { name: string; key: string; description?: string };
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  workStyleScore: number;
  communicationScore: number;
  dimensions: DimensionData[];
  candidateOcean: OCEANScores;
  employerOcean: OCEANScores;
  avatarUrl?: string | null;
  candidateId?: string;
  employerId?: string;
  roleId?: string;
  isSaved: boolean;
  onBack: () => void;
  onBrew: () => void;
  onToggleSave: () => void;
  onCompare?: () => void;
}

interface EmberNarrative {
  ember_summary?: string;
  ember_recommendation?: string;
  ember_strengths?: string[];
  ember_friction?: string[];
  ember_success_tips?: string[];
  ember_questions?: string[];
}

export function DeepDive({
  mode,
  name,
  subtitle,
  archetype,
  overallScore,
  traitScore,
  cultureScore,
  workStyleScore,
  communicationScore,
  dimensions,
  candidateOcean,
  employerOcean,
  avatarUrl,
  candidateId,
  employerId,
  roleId,
  isSaved,
  onBack,
  onBrew,
  onToggleSave,
  onCompare,
}: DeepDiveProps) {
  const [narrative, setNarrative] = useState<EmberNarrative | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  // Fetch Ember analysis
  useEffect(() => {
    if (!candidateId || !employerId) return;

    const fetchNarrative = async () => {
      setNarrativeLoading(true);
      try {
        const params = new URLSearchParams();
        if (candidateId) params.set('candidate_id', candidateId);
        if (employerId) params.set('employer_id', employerId);
        if (roleId) params.set('role_id', roleId);

        const res = await fetch(`${API_BASE}/api/ember/analysis?${params}`);
        if (res.ok) {
          const data = await res.json();
          setNarrative({
            ember_summary: data.ember_summary || data.summary,
            ember_recommendation: data.ember_recommendation || data.recommendation,
            ember_strengths: data.strengths || data.what_they_bring || [],
            ember_friction: data.friction || data.potential_friction || [],
            ember_success_tips: data.success_tips || data.how_to_succeed || [],
            ember_questions: data.questions || data.questions_to_explore || [],
          });
        }
      } catch {
        // Backend unavailable, narrative stays null
      } finally {
        setNarrativeLoading(false);
      }
    };

    fetchNarrative();
  }, [candidateId, employerId, roleId]);

  const compositeScores = [
    { label: 'Trait Match', score: traitScore, icon: Brain },
    { label: 'Culture Fit', score: cultureScore, icon: Heart },
    { label: 'Work Style', score: workStyleScore, icon: Zap },
    { label: 'Communication', score: communicationScore, icon: MessageCircle },
  ];

  const getAlignmentColor = (fitScore: number) => {
    if (fitScore >= 80) return '#10b981';
    if (fitScore >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getAlignmentLabel = (fitScore: number) => {
    if (fitScore >= 80) return 'Aligned';
    if (fitScore >= 60) return 'Close';
    return 'Gap';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--color-accent)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </button>

      {/* 1. Hero section */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: avatarUrl ? undefined : avatarGradient(name) }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{initial}</span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{name}</h1>
            {subtitle && (
              <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>{subtitle}</p>
            )}
            {archetype && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {archetype.name}
              </span>
            )}
          </div>

          <ScoreRing score={overallScore} size={96} strokeWidth={5} fontSize="text-2xl" />
        </div>

        {/* Composite score cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
          {compositeScores.map(({ label, score, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: getMatchColor(score) }} />
              <div className="text-lg font-bold" style={{ color: getMatchColor(score) }}>{score}%</div>
              <div className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. OCEAN Comparison Bars */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>OCEAN Personality Comparison</h2>
        </div>

        <div className="space-y-4">
          {dimensions.map(dim => {
            const alignment = getAlignmentColor(dim.fitScore);
            const label = getAlignmentLabel(dim.fitScore);
            return (
              <div key={dim.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{dim.name}</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${alignment}15`, color: alignment }}>
                    {label}
                  </span>
                </div>
                <div className="relative h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  {/* Employer preference (background) */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30 transition-all duration-700"
                    style={{ width: `${dim.employerPreference}%`, backgroundColor: '#3b82f6' }}
                  />
                  {/* Candidate score (foreground) */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${dim.candidateScore}%`, backgroundColor: alignment, opacity: 0.8 }}
                  />
                  {/* Labels */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-[10px] font-semibold text-white drop-shadow">
                      {mode === 'candidate' ? 'You' : 'Candidate'}: {dim.candidateScore}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--color-textMuted)' }}>
                      {mode === 'candidate' ? 'Employer' : 'Your pref'}: {dim.employerPreference}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#10b981' }} />
            Aligned (80%+)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#f59e0b' }} />
            Close (60-79%)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
            Gap (&lt;60%)
          </div>
        </div>
      </div>

      {/* 3. Radar Chart Overlay */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Profile Overlay</h2>
        </div>
        <div className="max-w-xs mx-auto">
          <RadarChart
            scores={candidateOcean as unknown as Record<string, number>}
            overlayScores={employerOcean as unknown as Record<string, number>}
            overlayLabel={mode === 'candidate' ? 'Employer Preferences' : 'Your Preferences'}
            size={280}
            animated
          />
        </div>
      </div>

      {/* 4. Composite Score Grid */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Compatibility Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compositeScores.map(({ label, score, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: getMatchColor(score) }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                  <span className="text-xs font-bold" style={{ color: getMatchColor(score) }}>{score}%</span>
                </div>
                <GradientProgressBar value={score} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Ember's Analysis */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <EmberFirefly size="sm" mood="happy" />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Ember's Analysis</h2>
        </div>

        {narrativeLoading ? (
          <div className="text-center py-8">
            <EmberFirefly size="md" mood="thinking" animated />
            <p className="mt-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>Ember is analyzing this match...</p>
          </div>
        ) : narrative ? (
          <div className="space-y-4">
            {/* Summary */}
            {narrative.ember_summary && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                  {narrative.ember_summary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What they bring / Why this could work */}
              {narrative.ember_strengths && narrative.ember_strengths.length > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'Why This Could Work' : 'What They Bring'}
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {narrative.ember_strengths.map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential friction */}
              {narrative.ember_friction && narrative.ember_friction.length > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'Watch Out For' : 'Potential Friction'}
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {narrative.ember_friction.map((f, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success tips */}
              {narrative.ember_success_tips && narrative.ember_success_tips.length > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'How to Succeed Here' : 'Setting Them Up for Success'}
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {narrative.ember_success_tips.map((t, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions to explore */}
              {narrative.ember_questions && narrative.ember_questions.length > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4" style={{ color: '#06b6d4' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      Questions to Explore
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {narrative.ember_questions.map((q, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {narrative.ember_recommendation && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `var(--color-accent)08`, border: '1px solid var(--color-accent)' }}
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {narrative.ember_recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Ember analysis is unavailable. Connect to the backend for AI-powered insights.
            </p>
          </div>
        )}
      </div>

      {/* 6. Personality Snapshot */}
      {archetype && (
        <div
          className="rounded-2xl p-5 md:p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Personality Snapshot</h2>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-3 h-3" />
                {archetype.name}
              </span>
            </div>
            {archetype.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                {archetype.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Sticky Action Bar */}
      <div
        className="sticky bottom-4 rounded-2xl p-4 flex items-center justify-center gap-3 z-30"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Button onClick={onBrew}>
          <Coffee className="w-4 h-4 mr-1.5" />
          Let's Brew
        </Button>
        <Button variant="outline" onClick={onToggleSave}>
          {isSaved
            ? <><BookmarkCheck className="w-4 h-4 mr-1.5" />Saved</>
            : <><Bookmark className="w-4 h-4 mr-1.5" />Save</>
          }
        </Button>
        {mode === 'employer' && onCompare && (
          <Button variant="ghost" onClick={onCompare}>
            <GitCompareArrows className="w-4 h-4 mr-1.5" />
            Compare
          </Button>
        )}
        {mode === 'candidate' && (
          <Button variant="ghost" onClick={() => { /* share logic */ }}>
            <Share2 className="w-4 h-4 mr-1.5" />
            Share Match
          </Button>
        )}
      </div>
    </motion.div>
  );
}
