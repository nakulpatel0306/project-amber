import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Coffee,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Brain,
  Heart,
  Briefcase,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Lightbulb,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { EmberFirefly } from '../ember/EmberFirefly';
import { cn } from '../../utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DimensionAnalysis {
  name: string;
  candidate_score: number;
  employer_preference: number;
  fit_score: number;
  gap: number;
  direction: string;
}

interface Insight {
  category: string;
  message: string;
  trait_related?: string;
  score_impact?: string;
}

export interface MatchDetailData {
  id: string;
  name: string;
  subtitle?: string;
  archetype?: { name: string; key: string; description?: string };
  overallScore: number;
  traitScore: number;
  cultureScore: number;
  workStyleScore: number;
  communicationScore: number;
  dimensionAnalysis?: DimensionAnalysis[];
  insights?: Insight[];
  emberSummary?: string;
  emberRecommendation?: string;
}

export interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'candidate' | 'employer';
  matchData: MatchDetailData;
  candidateId?: string;
  employerId?: string;
  roleId?: string;
  onRequestChat?: () => void;
  onAskEmber?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

function categoryIcon(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('trait') || lower.includes('personality')) return <Brain className="w-4 h-4" />;
  if (lower.includes('culture') || lower.includes('value')) return <Heart className="w-4 h-4" />;
  if (lower.includes('work') || lower.includes('style')) return <Briefcase className="w-4 h-4" />;
  if (lower.includes('commun')) return <MessageSquare className="w-4 h-4" />;
  if (lower.includes('strength')) return <Zap className="w-4 h-4" />;
  if (lower.includes('growth') || lower.includes('develop')) return <TrendingUp className="w-4 h-4" />;
  if (lower.includes('risk') || lower.includes('caution')) return <Shield className="w-4 h-4" />;
  return <Lightbulb className="w-4 h-4" />;
}

function directionIcon(direction: string) {
  if (direction === 'above') return <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />;
  if (direction === 'below') return <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />;
  return <Minus className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />;
}

/* ------------------------------------------------------------------ */
/*  ScoreRing (self-contained for the modal)                           */
/* ------------------------------------------------------------------ */

function ScoreRing({
  score,
  size = 96,
  strokeWidth = 4,
  animated = false,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={animated ? { strokeDashoffset: offset } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] font-medium" style={{ color: 'var(--color-textMuted)' }}>match</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composite score bar                                                */
/* ------------------------------------------------------------------ */

function CompositeBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {icon}
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OCEAN comparison bar                                               */
/* ------------------------------------------------------------------ */

function OceanComparisonBar({
  label,
  candidateScore,
  employerPreference,
}: {
  label: string;
  candidateScore: number;
  employerPreference: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--color-textMuted)' }}>{label}</span>
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: 'var(--color-accent)' }}>{candidateScore}</span>
          <span style={{ color: 'var(--color-textMuted)' }}>vs</span>
          <span style={{ color: 'var(--color-warning)' }}>{employerPreference}</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Employer preference (background layer) */}
        <div
          className="absolute top-0 left-0 h-full rounded-full opacity-40"
          style={{ width: `${employerPreference}%`, backgroundColor: 'var(--color-warning)' }}
        />
        {/* Candidate score (foreground layer) */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${candidateScore}%`, backgroundColor: 'var(--color-accent)' }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function MatchDetailModal({
  isOpen,
  onClose,
  role,
  matchData,
  candidateId,
  employerId,
  roleId,
  onRequestChat,
  onAskEmber,
}: MatchDetailModalProps) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [emberNarrative, setEmberNarrative] = useState<{
    summary?: string;
    recommendation?: string;
    insights?: Insight[];
  } | null>(null);
  const [emberLoading, setEmberLoading] = useState(false);

  /* Fetch Ember narrative on open */
  const fetchEmberAnalysis = useCallback(async () => {
    if (!candidateId || !employerId) return;
    setEmberLoading(true);
    try {
      const params = new URLSearchParams({ candidate_id: candidateId, employer_id: employerId });
      if (roleId) params.set('role_id', roleId);
      const res = await fetch(`http://127.0.0.1:8000/api/ember/analysis?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmberNarrative({
          summary: data.ember_summary || data.summary,
          recommendation: data.ember_recommendation || data.recommendation,
          insights: data.insights,
        });
      }
    } catch {
      // Silently fail — show static data instead
    } finally {
      setEmberLoading(false);
    }
  }, [candidateId, employerId, roleId]);

  useEffect(() => {
    if (isOpen) {
      fetchEmberAnalysis();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchEmberAnalysis]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const summary = emberNarrative?.summary || matchData.emberSummary;
  const recommendation = emberNarrative?.recommendation || matchData.emberRecommendation;
  const allInsights = emberNarrative?.insights || matchData.insights || [];

  const handleAskEmber = () => {
    if (onAskEmber) {
      onAskEmber();
    } else {
      navigate(role === 'candidate' ? '/app/ember' : '/app/employer/ember');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors z-10 hover:bg-[var(--color-surfaceHover)]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* ---- Hero Section ---- */}
        <div className="pt-8 pb-6 px-6 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            {matchData.name}
          </h2>
          {matchData.subtitle && (
            <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
              {matchData.subtitle}
            </p>
          )}
          {matchData.archetype && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              <Target className="w-3 h-3" />
              {matchData.archetype.name}
            </span>
          )}
          <div className="flex justify-center mt-3">
            <ScoreRing score={matchData.overallScore} size={112} strokeWidth={5} animated />
          </div>
        </div>

        {/* ---- OCEAN Comparison ---- */}
        {matchData.dimensionAnalysis && matchData.dimensionAnalysis.length > 0 && (
          <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              OCEAN Personality Comparison
            </h3>
            <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
                {role === 'candidate' ? 'You' : 'Candidate'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full opacity-40" style={{ backgroundColor: 'var(--color-warning)' }} />
                {role === 'candidate' ? 'Ideal' : 'Your Preference'}
              </span>
            </div>
            <div className="space-y-3">
              {matchData.dimensionAnalysis.map((dim) => (
                <div key={dim.name} className="flex items-center gap-2">
                  <div className="flex-1">
                    <OceanComparisonBar
                      label={dim.name}
                      candidateScore={dim.candidate_score}
                      employerPreference={dim.employer_preference}
                    />
                  </div>
                  <div className="flex-shrink-0 w-5">
                    {directionIcon(dim.direction)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Composite Scores ---- */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Compatibility Breakdown
          </h3>
          <div className="space-y-4">
            <CompositeBar label="Trait Match" score={matchData.traitScore} icon={<Brain className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />} />
            <CompositeBar label="Culture Fit" score={matchData.cultureScore} icon={<Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />} />
            <CompositeBar label="Work Style" score={matchData.workStyleScore} icon={<Briefcase className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />} />
            <CompositeBar label="Communication" score={matchData.communicationScore} icon={<MessageSquare className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />} />
          </div>
        </div>

        {/* ---- Ember Narrative ---- */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <EmberFirefly size="sm" mood={emberLoading ? 'thinking' : 'happy'} animated={emberLoading} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Ember's Analysis
            </h3>
          </div>

          {emberLoading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                Ember is analyzing this match...
              </p>
            </div>
          ) : (
            <>
              {summary && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)' }}>
                    Why this could work
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                    {summary}
                  </p>
                </div>
              )}

              {recommendation && (
                <div
                  className="p-3 rounded-xl mb-4"
                  style={{ backgroundColor: `${scoreColor(matchData.overallScore)}10`, border: `1px solid ${scoreColor(matchData.overallScore)}25` }}
                >
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5" style={{ color: 'var(--color-accent)' }} />
                    {recommendation}
                  </p>
                </div>
              )}

              {allInsights.length > 0 && (
                <div className="space-y-2">
                  {allInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }}>
                        {categoryIcon(insight.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-textMuted)' }}>
                          {insight.category}
                        </span>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-textSecondary)' }}>
                          {insight.message}
                        </p>
                        {insight.trait_related && (
                          <span className="text-xs mt-1 inline-block" style={{ color: 'var(--color-textMuted)' }}>
                            Related: {insight.trait_related}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!summary && !recommendation && allInsights.length === 0 && (
                <p className="text-sm py-2" style={{ color: 'var(--color-textMuted)' }}>
                  Ember analysis is not available for this match yet. Click "Ask Ember" below for detailed insights.
                </p>
              )}
            </>
          )}
        </div>

        {/* ---- Actions ---- */}
        <div className="px-6 py-5 flex flex-wrap items-center gap-3">
          <Button
            className="flex-1 min-w-[140px]"
            leftIcon={<Coffee className="w-4 h-4" />}
            onClick={() => {
              if (onRequestChat) onRequestChat();
            }}
          >
            {role === 'candidate' ? 'Request Coffee Chat' : 'Invite to Coffee Chat'}
          </Button>

          <Button
            variant="secondary"
            className="flex-1 min-w-[120px]"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleAskEmber}
          >
            Ask Ember
          </Button>

          <button
            onClick={() => setSaved(!saved)}
            className={cn(
              'p-2.5 rounded-xl border transition-all',
              saved ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'
            )}
            style={{
              backgroundColor: saved ? `var(--color-accent)` : 'transparent',
              color: saved ? 'white' : 'var(--color-textMuted)',
            }}
            title={saved ? 'Saved' : 'Save for Later'}
          >
            {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
