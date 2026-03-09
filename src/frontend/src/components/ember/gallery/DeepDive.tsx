import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Brain, Heart, Zap, MessageCircle, Coffee,
  Bookmark, BookmarkCheck, GitCompareArrows, Share2, Lightbulb,
  AlertTriangle, CheckCircle2, HelpCircle, Target, ArrowUpRight,
  TrendingUp, Shield, Users, BarChart3,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { OceanMindMap } from '../../ui/OceanMindMap';
import { EmberFirefly } from '../EmberFirefly';
import { CoffeeBrewLoader } from '../../ui/CoffeeBrewLoader';
import { ConnectButton } from '../../connections/ConnectButton';
import { avatarGradient, getMatchColor } from '../../../utils/matchHelpers';
import type { OCEANScores } from '../../../lib/compatibilityScoring';
import type { ConnectionStatus } from '../../../types/connections.types';

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
  connectionStatus?: ConnectionStatus;
  onBack: () => void;
  onBrew: () => void;
  onToggleSave: () => void;
  onCompare?: () => void;
  onConnect?: () => void;
  onAcceptConnection?: () => void;
  onDeclineConnection?: () => void;
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
  connectionStatus = 'accepted',
  onBack,
  onBrew,
  onToggleSave,
  onCompare,
  onConnect,
  onAcceptConnection,
  onDeclineConnection,
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
    { label: 'Trait Match', score: traitScore, icon: Brain, color: 'var(--color-accent)' },
    { label: 'Culture Fit', score: cultureScore, icon: Heart, color: 'var(--color-accent)' },
    { label: 'Work Style', score: workStyleScore, icon: Zap, color: 'var(--color-accent)' },
    { label: 'Communication', score: communicationScore, icon: MessageCircle, color: 'var(--color-accent)' },
  ];

  const getAlignmentOpacity = (fitScore: number) => {
    if (fitScore >= 80) return 1;
    if (fitScore >= 60) return 0.6;
    return 0.3;
  };

  const getAlignmentLabel = (fitScore: number) => {
    if (fitScore >= 80) return 'Aligned';
    if (fitScore >= 60) return 'Close';
    return 'Gap';
  };

  // Alignment-based color for candidate circles
  const getAlignmentBasedColor = (baseColor: string, candidateScore: number, employerScore: number): string => {
    const difference = Math.abs(candidateScore - employerScore);
    const alignment = 100 - difference;

    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }

    let newS = s;
    let newL = l;

    if (alignment >= 80) {
      newS = s;
      newL = l;
    } else if (alignment >= 60) {
      newS = s * 0.7;
      newL = l + (1 - l) * 0.15;
    } else {
      newS = s * 0.35;
      newL = l + (1 - l) * 0.3;
    }

    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const [newR, newG, newB] = hslToRgb(h, newS, newL);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const BASE_COLORS: Record<string, string> = {
    openness: 'var(--color-accent)',
    conscientiousness: 'var(--color-accent)',
    extraversion: 'var(--color-accent)',
    agreeableness: 'var(--color-accent)',
    neuroticism: 'var(--color-accent)',
  };

  const candidateAlignmentColors = Object.keys(BASE_COLORS).reduce((acc, key) => {
    const candidateScore = (candidateOcean as unknown as Record<string, number>)[key] || 0;
    const employerScore = (employerOcean as unknown as Record<string, number>)[key] || 0;
    acc[key] = getAlignmentBasedColor(BASE_COLORS[key], candidateScore, employerScore);
    return acc;
  }, {} as Record<string, string>);

  // Derived metrics for unique widgets
  const alignedCount = dimensions.filter(d => d.fitScore >= 80).length;
  const closeCount = dimensions.filter(d => d.fitScore >= 60 && d.fitScore < 80).length;
  const gapCount = dimensions.filter(d => d.fitScore < 60).length;
  const avgFit = dimensions.length > 0 ? Math.round(dimensions.reduce((s, d) => s + d.fitScore, 0) / dimensions.length) : 0;
  const bestDimension = dimensions.length > 0 ? dimensions.reduce((best, d) => d.fitScore > best.fitScore ? d : best) : null;
  const weakDimension = dimensions.length > 0 ? dimensions.reduce((worst, d) => d.fitScore < worst.fitScore ? d : worst) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
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
      <div className="bento-card">
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
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{name}</h1>
            {subtitle && (
              <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>{subtitle}</p>
            )}
            {archetype && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {archetype.name}
              </span>
            )}
          </div>

          <ScoreRing score={overallScore} size={96} strokeWidth={5} fontSize="text-2xl" />
        </div>
      </div>

      {/* 2. Composite Score Cards — bento metric cards with big numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {compositeScores.map(({ label, score, icon: Icon, color }) => (
          <div key={label} className="bento-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>
                {label}
              </p>
              <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)', opacity: 0.3 }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>{score}</span>
              <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <div className="metric-bar flex-1">
                <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Compatibility Dashboard — unique mini widgets grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Alignment Summary */}
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Alignment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}>
              {alignedCount} Aligned
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)', opacity: 0.6 }}>
              {closeCount} Close
            </span>
            {gapCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)', opacity: 0.3 }}>
                {gapCount} Gap
              </span>
            )}
          </div>
        </div>

        {/* Average Fit */}
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Avg Fit</span>
          </div>
          <span className="text-2xl font-extrabold" style={{ color: getMatchColor(avgFit) }}>{avgFit}%</span>
        </div>

        {/* Strongest Dimension */}
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Strongest</span>
          </div>
          {bestDimension && (
            <div>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{bestDimension.name}</span>
              <span className="text-xs ml-1.5" style={{ color: 'var(--color-accent)' }}>{bestDimension.fitScore}%</span>
            </div>
          )}
        </div>

        {/* Growth Area */}
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>Growth Area</span>
          </div>
          {weakDimension && (
            <div>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{weakDimension.name}</span>
              <span className="text-xs ml-1.5" style={{ color: 'var(--color-accent)', opacity: 0.6 }}>{weakDimension.fitScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. OCEAN Comparison Bars */}
      <div className="bento-card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>OCEAN Personality Comparison</h2>
        </div>

        <div className="space-y-4">
          {dimensions.map(dim => {
            const label = getAlignmentLabel(dim.fitScore);
            return (
              <div key={dim.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{dim.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)', opacity: getAlignmentOpacity(dim.fitScore) }}>
                    {label} · {dim.fitScore}%
                  </span>
                </div>
                <div className="relative h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${dim.employerPreference}%`, backgroundColor: 'var(--color-accent)', opacity: 0.2 }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${dim.candidateScore}%`, backgroundColor: 'var(--color-accent)', opacity: getAlignmentOpacity(dim.fitScore) }}
                  />
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
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-accent)' }} />
            Aligned (80%+)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.6 }} />
            Close (60-79%)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.3 }} />
            Gap (&lt;60%)
          </div>
        </div>
      </div>

      {/* 5. Profile Comparison - Side by Side Mind Maps */}
      <div className="bento-card">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Profile Comparison</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-center mb-3" style={{ color: 'var(--color-textSecondary)' }}>
              {mode === 'candidate' ? 'Your Profile' : 'Candidate Profile'}
            </p>
            <OceanMindMap
              scores={candidateOcean as unknown as Record<string, number>}
              colors={candidateAlignmentColors}
              size="sm"
              animated
              centerLabel={mode === 'candidate' ? 'You' : name.split(' ')[0]}
            />
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--color-textMuted)' }}>
              Brighter = better alignment with preferences
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-center mb-3" style={{ color: 'var(--color-textSecondary)' }}>
              {mode === 'candidate' ? 'Employer Preferences' : 'Your Preferences'}
            </p>
            <OceanMindMap
              scores={employerOcean as unknown as Record<string, number>}
              size="sm"
              animated
              centerLabel={mode === 'candidate' ? 'Employer' : 'You'}
            />
          </div>
        </div>
      </div>

      {/* 6. Ember's Analysis */}
      <div className="bento-card">
        <div className="flex items-center gap-2 mb-4">
          <EmberFirefly size="sm" mood="happy" />
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Ember's Analysis</h2>
        </div>

        {narrativeLoading ? (
          <CoffeeBrewLoader variant="inline" size="sm" message="Ember is analyzing this match..." />
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

            {/* Strengths + Friction as transaction-style lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {narrative.ember_strengths && narrative.ember_strengths.length > 0 && (
                <div className="bento-card" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'Why This Works' : 'What They Bring'}
                    </h4>
                  </div>
                  <div className="space-y-0">
                    {narrative.ember_strengths.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-2"
                        style={{ borderBottom: i < narrative.ember_strengths!.length - 1 ? '1px solid var(--color-border)' : undefined }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {narrative.ember_friction && narrative.ember_friction.length > 0 && (
                <div className="bento-card" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-accent)', opacity: 0.7 }} />
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'Watch Out For' : 'Potential Friction'}
                    </h4>
                  </div>
                  <div className="space-y-0">
                    {narrative.ember_friction.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-2"
                        style={{ borderBottom: i < narrative.ember_friction!.length - 1 ? '1px solid var(--color-border)' : undefined }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.7 }} />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tips + Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {narrative.ember_success_tips && narrative.ember_success_tips.length > 0 && (
                <div className="bento-card" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                      <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      {mode === 'candidate' ? 'How to Succeed' : 'Setup for Success'}
                    </h4>
                  </div>
                  <div className="space-y-0">
                    {narrative.ember_success_tips.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-2"
                        style={{ borderBottom: i < narrative.ember_success_tips!.length - 1 ? '1px solid var(--color-border)' : undefined }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {narrative.ember_questions && narrative.ember_questions.length > 0 && (
                <div className="bento-card" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                      <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      Questions to Explore
                    </h4>
                  </div>
                  <div className="space-y-0">
                    {narrative.ember_questions.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-2"
                        style={{ borderBottom: i < narrative.ember_questions!.length - 1 ? '1px solid var(--color-border)' : undefined }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {narrative.ember_recommendation && (
              <div
                className="bento-card bento-card-accent"
                style={{ borderColor: 'var(--color-accent)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-surfaceHover)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--color-accent)' }}>Ember's Recommendation</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                      {narrative.ember_recommendation}
                    </p>
                  </div>
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

      {/* 7. Personality Snapshot */}
      {archetype && (
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Personality Snapshot</h2>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}
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

      {/* 8. Sticky Action Bar */}
      <div
        className="sticky bottom-4 bento-card p-4 flex items-center justify-center gap-3 z-30"
        style={{
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {connectionStatus === 'accepted' ? (
          <Button onClick={onBrew}>
            <Coffee className="w-4 h-4 mr-1.5" />
            Let's Brew
          </Button>
        ) : (
          <ConnectButton
            status={connectionStatus}
            onConnect={() => onConnect?.()}
            onAccept={() => onAcceptConnection?.()}
            onDecline={() => onDeclineConnection?.()}
            size="md"
          />
        )}
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
