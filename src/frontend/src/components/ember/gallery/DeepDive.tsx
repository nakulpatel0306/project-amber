import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Brain, Heart, Zap, MessageCircle, Coffee,
  Bookmark, BookmarkCheck, GitCompareArrows, Share2, Lightbulb,
  AlertTriangle, CheckCircle2, HelpCircle, Target, ArrowUpRight,
  TrendingUp, ChevronRight, BarChart3, Users, Shield,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmberFirefly } from '../EmberFirefly';
import { CoffeeBrewLoader } from '../../ui/CoffeeBrewLoader';
import { ConnectButton } from '../../connections/ConnectButton';
import type { OCEANScores } from '../../../lib/compatibilityScoring';
import type { ConnectionStatus } from '../../../types/connections.types';

const API_BASE = 'http://127.0.0.1:8000';

/* ── Brew helpers ── */
function getBrewLabel(score: number): string {
  if (score >= 90) return "Barista's Choice";
  if (score >= 80) return 'Perfect Brew';
  if (score >= 70) return 'Strong Pour';
  if (score >= 60) return 'Warming Up';
  if (score >= 40) return 'Lukewarm';
  return 'Cold Brew';
}

/* ── Multi-color insight palette ── */
const INSIGHT_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

/* ── Composite meta ── */
const COMPOSITE_META: Record<string, { color: string; description: string; bullets: string[] }> = {
  'Trait Match': {
    color: INSIGHT_COLORS[0],
    description: 'Measures how closely your personality traits align with what this role demands. High scores indicate a natural fit between who you are and what the position requires.',
    bullets: ['Based on Big Five personality assessment', 'Compares your OCEAN scores against role benchmarks', 'Higher alignment means less adaptation needed', 'Considers both trait level and trait importance'],
  },
  'Culture Fit': {
    color: INSIGHT_COLORS[1],
    description: "Evaluates how well your values, work preferences, and interpersonal style match the company's culture and team dynamics.",
    bullets: ['Assesses shared values and priorities', 'Considers team collaboration preferences', 'Factors in communication norms', 'Accounts for organizational structure fit'],
  },
  'Work Style': {
    color: INSIGHT_COLORS[2],
    description: 'Compares your preferred way of working (pace, structure, autonomy) with the environment this role offers.',
    bullets: ['Evaluates pace and deadline preferences', 'Considers autonomy vs. guidance needs', 'Factors in decision-making style', 'Assesses adaptability to role structure'],
  },
  Communication: {
    color: INSIGHT_COLORS[3],
    description: "Analyzes how your communication patterns and preferences align with the team's norms and the role's requirements.",
    bullets: ['Compares directness vs. diplomacy preferences', 'Considers feedback style compatibility', 'Evaluates meeting and async preferences', 'Factors in conflict resolution approach'],
  },
};

/* ── Detailed trait interpretation data ── */
const TRAIT_INSIGHTS: Record<string, {
  high: string; mid: string; low: string;
  highWork: string[]; midWork: string[]; lowWork: string[];
}> = {
  openness: {
    high: 'Highly creative and intellectually curious. You actively seek novel experiences, unconventional ideas, and abstract thinking.',
    mid: 'Balanced between innovation and pragmatism. You appreciate new ideas when they serve a clear purpose.',
    low: 'Grounded and practical. You prefer proven methods, concrete plans, and steady incremental improvement.',
    highWork: ['Thrives in creative and R&D environments', 'Generates novel solutions to complex problems', 'May need structure to channel creative energy'],
    midWork: ['Adapts to both structured and creative work', 'Evaluates which ideas are worth pursuing', 'Bridges innovative and operational teams well'],
    lowWork: ['Excels with established processes and SOPs', 'Strong attention to proven methodologies', 'Brings stability and consistency to teams'],
  },
  conscientiousness: {
    high: 'Highly organized, disciplined, and goal-oriented. You set high standards and follow through systematically on commitments.',
    mid: 'Moderately structured in your approach. You can plan ahead but also adapt when circumstances change unexpectedly.',
    low: 'Flexible and spontaneous. You prefer to stay adaptable rather than follow rigid plans or strict schedules.',
    highWork: ['Excellent project management and follow-through', 'Consistently meets deadlines and quality standards', 'May find ambiguity or rapid pivots challenging'],
    midWork: ['Balanced approach to planning vs. flexibility', 'Effective in both startup and corporate environments', 'Can lead structured projects or adapt to change'],
    lowWork: ['Thrives in dynamic, fast-paced environments', 'Comfortable navigating ambiguity', 'May benefit from external accountability structures'],
  },
  extraversion: {
    high: 'Energetic, sociable, and assertive. You draw energy from interactions and naturally take initiative in group settings.',
    mid: 'Comfortably social but also values independent work. You adjust your energy based on the situation.',
    low: 'Reflective and independent. You do your best thinking alone and prefer deep one-on-one connections over large groups.',
    highWork: ['Natural in client-facing and team leadership roles', 'Energizes team meetings and brainstorms', 'May need to practice active listening and patience'],
    midWork: ['Versatile across collaborative and solo work', 'Adjusts communication style to context naturally', 'Effective in both presentations and written formats'],
    lowWork: ['Excels in focused, deep analytical work', 'Strong written and async communicator', 'Thrives with remote-first or small-team setups'],
  },
  agreeableness: {
    high: 'Empathetic, cooperative, and harmony-seeking. You prioritize team cohesion and naturally build trust.',
    mid: 'Diplomatic but principled. You cooperate when possible but can push back when it matters.',
    low: "Direct, competitive, and results-focused. You prioritize outcomes and aren't afraid to challenge assumptions.",
    highWork: ['Excellent mediator and team builder', 'Creates psychologically safe environments', 'May avoid necessary conflicts or tough feedback'],
    midWork: ['Balances collaboration with assertiveness', 'Navigates office dynamics effectively', 'Gives and receives feedback constructively'],
    lowWork: ['Strong negotiator and critical thinker', 'Comfortable making tough, unpopular decisions', 'Drives accountability and high performance standards'],
  },
  neuroticism: {
    high: 'Emotionally sensitive and deeply self-aware. You experience feelings intensely, fueling empathy but also stress.',
    mid: 'Emotionally balanced. You handle typical workplace pressures well while staying attuned to your feelings.',
    low: 'Emotionally stable and resilient. You stay calm under pressure and recover quickly from setbacks.',
    highWork: ['Highly attuned to team dynamics and morale', 'May need robust stress management support', 'Brings emotional depth to decision-making'],
    midWork: ['Handles normal workplace stress well', 'Appropriately responsive to challenges', 'Good emotional self-regulation in most situations'],
    lowWork: ['Thrives in high-pressure, fast-paced environments', 'Provides calm leadership during crises', 'May need to actively check in with team emotions'],
  },
  stability: {
    high: 'Emotionally stable and resilient. You stay calm under pressure and recover quickly from setbacks.',
    mid: 'Emotionally balanced. You handle typical workplace pressures well while staying attuned to your feelings.',
    low: 'Emotionally sensitive and deeply self-aware. You experience feelings intensely, fueling empathy but also stress.',
    highWork: ['Thrives in high-pressure, fast-paced environments', 'Provides calm leadership during crises', 'May need to actively check in with team emotions'],
    midWork: ['Handles normal workplace stress well', 'Appropriately responsive to challenges', 'Good emotional self-regulation in most situations'],
    lowWork: ['Highly attuned to team dynamics and morale', 'May need robust stress management support', 'Brings emotional depth to decision-making'],
  },
};

function getTraitLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

function getTraitLevelLabel(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

function getGapAnalysis(candidateScore: number, employerPref: number, dimName: string): string {
  const diff = candidateScore - employerPref;
  const absDiff = Math.abs(diff);
  if (absDiff <= 10) return `Your ${dimName.toLowerCase()} level closely matches what's expected here. This is a natural fit area requiring minimal adjustment, so you can show up authentically.`;
  if (diff > 10 && absDiff <= 25) return `You score somewhat higher in ${dimName.toLowerCase()} than what's typically expected. This can be a strength since you bring more energy here, but be mindful of calibrating to team norms.`;
  if (diff > 25) return `You score significantly higher in ${dimName.toLowerCase()} than the role typically calls for. While this intensity can be an asset in the right context, it may feel misaligned with the team's baseline.`;
  if (absDiff <= 25) return `The role expects slightly more ${dimName.toLowerCase()} than your natural level. With awareness and intentional effort, this gap is easily bridgeable.`;
  return `There's a notable gap where the role demands more ${dimName.toLowerCase()} than your natural tendency. Consider whether this stretch energizes or drains you long-term.`;
}

/* ── SVG arc helpers ── */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle < 0.5) return '';
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/* ── Alignment helpers ── */
function getAlignmentLabel(fitScore: number) {
  if (fitScore >= 80) return 'Aligned';
  if (fitScore >= 60) return 'Close';
  return 'Gap';
}

function getAlignmentColor(fitScore: number) {
  if (fitScore >= 80) return '#10B981';
  if (fitScore >= 60) return '#F59E0B';
  return '#EF4444';
}

/* ── Types ── */
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
  candidateOcean: _candidateOcean,
  employerOcean: _employerOcean,
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
  const [compositeModal, setCompositeModal] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [deepDiveTab, setDeepDiveTab] = useState(0);

  const initial = name.charAt(0).toUpperCase();

  /* Fetch Ember analysis */
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
        /* backend unavailable */
      } finally {
        setNarrativeLoading(false);
      }
    };
    fetchNarrative();
  }, [candidateId, employerId, roleId]);

  /* Composite scores */
  const compositeScores = [
    { label: 'Trait Match', score: traitScore, icon: Brain },
    { label: 'Culture Fit', score: cultureScore, icon: Heart },
    { label: 'Work Style', score: workStyleScore, icon: Zap },
    { label: 'Communication', score: communicationScore, icon: MessageCircle },
  ];

  /* Derived metrics */
  const alignedCount = dimensions.filter(d => d.fitScore >= 80).length;
  const bestDimension =
    dimensions.length > 0 ? dimensions.reduce((b, d) => (d.fitScore > b.fitScore ? d : b)) : null;
  const weakDimension =
    dimensions.length > 0 ? dimensions.reduce((w, d) => (d.fitScore < w.fitScore ? d : w)) : null;
  const sortedDims = [...dimensions].sort((a, b) => b.fitScore - a.fitScore);

  /* Modal */
  const activeComposite = compositeModal ? compositeScores.find(c => c.label === compositeModal) : null;
  const activeCompositeMeta = compositeModal ? COMPOSITE_META[compositeModal] : null;

  /* Selected dimension detail */
  const selectedDimData = selectedDimension
    ? dimensions.find(d => d.name.toLowerCase() === selectedDimension.toLowerCase())
    : null;

  /* Donut chart — bigger */
  const DONUT_SIZE = 280;
  const DONUT_CX = DONUT_SIZE / 2;
  const DONUT_CY = DONUT_SIZE / 2;
  const DONUT_R = 106;
  const DONUT_STROKE = 22;
  const SEG_DEG = 360 / Math.max(dimensions.length, 1);
  const GAP_DEG = 6;
  const ARC_DEG = SEG_DEG - GAP_DEG;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="max-w-5xl mx-auto space-y-4"
    >
      {/* ═══ 1. Sticky Header ═══ */}
      <div
        className="sticky top-0 z-40 bento-card"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Ember</span>
          </button>
          <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-textMuted)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--color-textSecondary)' }}>
            {name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: avatarUrl ? undefined : 'var(--color-surfaceHover)' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{initial}</span>
            )}
          </div>

          {/* Name + score + pills */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1
                className="text-xl font-bold tracking-tight truncate"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                {name}
              </h1>
              {/* Score ring — inline beside name */}
              <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <svg width={40} height={40} className="-rotate-90">
                  <circle cx={20} cy={20} r={15} fill="none" stroke="var(--color-border)" strokeWidth={3} />
                  <circle
                    cx={20} cy={20} r={15}
                    fill="none" stroke="var(--color-accent)" strokeWidth={3}
                    strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * (1 - overallScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-extrabold" style={{ color: 'var(--color-accent)' }}>
                  {overallScore}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {subtitle && <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{subtitle}</span>}
              {archetype && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)' }}>
                  {archetype.name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {connectionStatus === 'accepted' ? (
              <Button size="sm" onClick={onBrew}>
                <Coffee className="w-3.5 h-3.5 mr-1" />
                Brew
              </Button>
            ) : (
              <ConnectButton
                status={connectionStatus}
                onConnect={() => onConnect?.()}
                onAccept={() => onAcceptConnection?.()}
                onDecline={() => onDeclineConnection?.()}
                size="sm"
              />
            )}
            <Button variant="outline" size="sm" onClick={onToggleSave}>
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { /* share */ }}>
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ 2. Composite Score Cards ═══ */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-textMuted)' }}>
          Score Breakdown //
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {compositeScores.map(({ label, score, icon: Icon }) => {
            const meta = COMPOSITE_META[label];
            const color = meta?.color ?? 'var(--color-accent)';
            return (
              <motion.div
                key={label}
                className="bento-card relative overflow-hidden cursor-pointer"
                style={{ borderLeft: `3px solid ${color}` }}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setCompositeModal(label)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>{label}</p>
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color, opacity: 0.4 }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    {score}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>%</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <div className="metric-bar flex-1">
                    <div className="metric-bar-fill" style={{ width: `${score}%`, backgroundColor: color }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Composite Modal */}
      <Modal isOpen={!!compositeModal} onClose={() => setCompositeModal(null)} title={compositeModal ?? ''} size="sm">
        {activeComposite && activeCompositeMeta && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-extrabold" style={{ color: activeCompositeMeta.color, fontFamily: 'var(--font-display)' }}>
                {activeComposite.score}
              </span>
              <div>
                <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>%</span>
                <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: activeCompositeMeta.color }}>
                  {getBrewLabel(activeComposite.score)}
                </p>
              </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: activeCompositeMeta.color }} initial={{ width: 0 }} animate={{ width: `${activeComposite.score}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{activeCompositeMeta.description}</p>
            <div className="space-y-2.5">
              {activeCompositeMeta.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activeCompositeMeta.color }} />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ 3. Flavor Profile (interactive donut with breakdown) ═══ */}
      <div className="bento-card">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-textMuted)' }}>
          Flavor Profile //
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
            <svg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} className="w-full h-full">
              {dimensions.map((dim, i) => {
                const color = INSIGHT_COLORS[i % INSIGHT_COLORS.length];
                const startAngle = i * SEG_DEG + GAP_DEG / 2;
                const bgEnd = startAngle + ARC_DEG;
                const fillEnd = startAngle + (dim.candidateScore / 100) * ARC_DEG;
                const bgPath = describeArc(DONUT_CX, DONUT_CY, DONUT_R, startAngle, bgEnd);
                const fillPath = describeArc(DONUT_CX, DONUT_CY, DONUT_R, startAngle, fillEnd);

                return (
                  <g key={dim.name}>
                    {bgPath && <path d={bgPath} fill="none" stroke={color} strokeWidth={DONUT_STROKE} opacity={0.12} />}
                    {fillPath && (
                      <motion.path
                        d={fillPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={DONUT_STROKE}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.85 }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-extrabold tracking-tighter"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                {overallScore}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-textMuted)' }}>
                Match Score
              </span>
            </div>
          </div>

          {/* Legend + scores */}
          <div className="flex-1 w-full space-y-1">
            {dimensions.map((dim, i) => {
              const color = INSIGHT_COLORS[i % INSIGHT_COLORS.length];
              const isSelected = selectedDimension?.toLowerCase() === dim.name.toLowerCase();
              return (
                <button
                  key={dim.name}
                  className="flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isSelected ? `${color}12` : 'transparent',
                    border: isSelected ? `1.5px solid ${color}30` : '1.5px solid transparent',
                  }}
                  onClick={() => setSelectedDimension(prev => prev?.toLowerCase() === dim.name.toLowerCase() ? null : dim.name)}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium flex-1" style={{ color: isSelected ? 'var(--color-text)' : 'var(--color-textSecondary)' }}>
                    {dim.name}
                  </span>
                  <span className="text-sm font-bold" style={{ color }}>{dim.candidateScore}</span>
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>/ {dim.employerPreference}</span>
                  <ChevronRight
                    className="w-3.5 h-3.5 transition-transform"
                    style={{
                      color: isSelected ? color : 'var(--color-textMuted)',
                      transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)',
                      opacity: isSelected ? 1 : 0.3,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded dimension detail */}
        <AnimatePresence>
          {selectedDimData && (() => {
            const dimIdx = dimensions.findIndex(d => d.name.toLowerCase() === selectedDimension?.toLowerCase());
            const dimColor = INSIGHT_COLORS[dimIdx % INSIGHT_COLORS.length];
            return (
              <motion.div
                key={selectedDimension}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5" style={{ borderTop: `2px solid ${dimColor}25` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dimColor }} />
                      <span className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{selectedDimData.name}</span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${getAlignmentColor(selectedDimData.fitScore)}18`, color: getAlignmentColor(selectedDimData.fitScore) }}
                    >
                      {getAlignmentLabel(selectedDimData.fitScore)} · {selectedDimData.fitScore}%
                    </span>
                  </div>

                  {/* Comparison bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.15em] w-14 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }}>
                          {mode === 'candidate' ? 'You' : 'Cand.'}
                        </span>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: dimColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedDimData.candidateScore}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="text-lg font-extrabold w-10 text-right" style={{ color: dimColor, fontFamily: 'var(--font-display)' }}>
                          {selectedDimData.candidateScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.15em] w-14 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }}>
                          {mode === 'candidate' ? 'Empl.' : 'Pref.'}
                        </span>
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                          <motion.div
                            className="h-full rounded-full opacity-40"
                            style={{ backgroundColor: dimColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedDimData.employerPreference}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right" style={{ color: 'var(--color-textMuted)' }}>
                          {selectedDimData.employerPreference}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                        {getGapAnalysis(selectedDimData.candidateScore, selectedDimData.employerPreference, selectedDimData.name)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ═══ 4. Key Insights ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Overall Match', value: `${overallScore}%`, sub: getBrewLabel(overallScore), icon: Coffee },
          { label: 'Strongest', value: bestDimension ? `${bestDimension.fitScore}%` : '-', sub: bestDimension?.name ?? '', icon: TrendingUp },
          { label: 'Growth Edge', value: weakDimension ? `${weakDimension.fitScore}%` : '-', sub: weakDimension?.name ?? '', icon: Target },
          { label: 'Alignment', value: `${alignedCount}/${dimensions.length}`, sub: 'dimensions aligned', icon: CheckCircle2 },
        ].map(({ label, value, sub, icon: Icon }) => (
          <motion.div
            key={label}
            className="bento-card relative overflow-hidden"
            style={{ borderLeft: '3px solid var(--color-accent)' }}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-textMuted)' }}>{label}</p>
            </div>
            <span className="text-2xl font-extrabold tracking-tight block" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
              {value}
            </span>
            {sub && (
              <p className="text-[10px] font-medium mt-1 truncate" style={{ color: 'var(--color-textMuted)' }}>
                {sub}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ═══ 5. Compatibility Deep Dive — tabbed per-dimension ═══ */}
      {dimensions.length > 0 && (() => {
        const dim = dimensions[deepDiveTab] ?? dimensions[0];
        const color = INSIGHT_COLORS[deepDiveTab % INSIGHT_COLORS.length];
        const traitKey = dim.name.toLowerCase();
        const traitData = TRAIT_INSIGHTS[traitKey];
        const level = getTraitLevel(dim.candidateScore);
        const levelLabel = getTraitLevelLabel(dim.candidateScore);
        const empLevel = getTraitLevel(dim.employerPreference);
        const workItems = traitData ? (level === 'high' ? traitData.highWork : level === 'mid' ? traitData.midWork : traitData.lowWork) : [];

        return (
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5" style={{ color: INSIGHT_COLORS[0] }} />
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                Compatibility Deep Dive
              </h2>
            </div>

            {/* Dimension tabs */}
            <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
              {dimensions.map((d, i) => {
                const tabColor = INSIGHT_COLORS[i % INSIGHT_COLORS.length];
                const active = i === deepDiveTab;
                return (
                  <button
                    key={d.name}
                    onClick={() => setDeepDiveTab(i)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      backgroundColor: active ? `${tabColor}18` : 'transparent',
                      color: active ? tabColor : 'var(--color-textMuted)',
                      border: active ? `1.5px solid ${tabColor}40` : '1.5px solid transparent',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tabColor, opacity: active ? 1 : 0.4 }} />
                    {d.name}
                  </button>
                );
              })}
            </div>

            {/* Active dimension content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={deepDiveTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header row — big score + alignment */}
                <div className="flex items-start gap-5 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{dim.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                        {levelLabel}
                      </span>
                    </div>
                    {traitData && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                        {traitData[level]}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-3xl font-extrabold tracking-tight" style={{ color, fontFamily: 'var(--font-display)' }}>
                      {dim.fitScore}%
                    </span>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: getAlignmentColor(dim.fitScore) }}>
                      {getAlignmentLabel(dim.fitScore)}
                    </p>
                  </div>
                </div>

                {/* Score comparison — visual bar */}
                <div className="p-4 rounded-xl mb-5" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-textMuted)' }}>
                        {mode === 'candidate' ? 'You' : 'Candidate'}
                      </p>
                      <span className="text-2xl font-extrabold" style={{ color, fontFamily: 'var(--font-display)' }}>{dim.candidateScore}</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--color-textMuted)' }}>Gap</p>
                      <span className="text-lg font-bold" style={{ color: getAlignmentColor(dim.fitScore) }}>
                        {Math.abs(dim.candidateScore - dim.employerPreference)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-textMuted)' }}>
                        {mode === 'candidate' ? 'Employer' : 'Your Pref'}
                      </p>
                      <span className="text-2xl font-extrabold" style={{ color: 'var(--color-textSecondary)', fontFamily: 'var(--font-display)' }}>{dim.employerPreference}</span>
                    </div>
                  </div>
                  {/* Overlapping comparison bar */}
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div className="absolute inset-y-0 left-0 rounded-full opacity-25" style={{ width: `${dim.employerPreference}%`, backgroundColor: color }} />
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${dim.candidateScore}%`, backgroundColor: color }} />
                  </div>
                </div>

                {/* Two-column: Workplace + Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>In the Workplace</p>
                    <div className="space-y-2">
                      {workItems.map((w, wi) => (
                        <div key={wi} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold" style={{ backgroundColor: `${color}15`, color }}>
                            {wi + 1}
                          </div>
                          <span className="text-xs leading-relaxed pt-0.5" style={{ color: 'var(--color-textSecondary)' }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Alignment Analysis</p>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                      {getGapAnalysis(dim.candidateScore, dim.employerPreference, dim.name)}
                    </p>
                    {traitData && empLevel !== level && traitData[empLevel] && (
                      <div className="pl-3" style={{ borderLeft: `2px solid ${color}40` }}>
                        <p className="font-mono text-[9px] uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--color-textMuted)' }}>What they expect</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>
                          {traitData[empLevel]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })()}

      {/* ═══ 6. Ember's Analysis — editorial layout ═══ */}
      <div className="bento-card">
        <div className="flex items-center gap-2 mb-5">
          <EmberFirefly size="sm" mood="happy" />
          <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Ember's Analysis
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] ml-auto" style={{ color: 'var(--color-textMuted)' }}>
            AI Insights //
          </span>
        </div>

        {narrativeLoading ? (
          <CoffeeBrewLoader variant="inline" size="sm" message="Ember is analyzing this match..." />
        ) : narrative ? (
          <div>
            {/* Summary */}
            {narrative.ember_summary && (
              <div className="pl-4 py-3 mb-6" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-textSecondary)' }}>
                  &ldquo;{narrative.ember_summary}&rdquo;
                </p>
              </div>
            )}

            {/* Strengths + Friction — side by side, no nested cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
              {narrative.ember_strengths && narrative.ember_strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>
                      {mode === 'candidate' ? 'Why This Works' : 'What They Bring'}
                    </h4>
                  </div>
                  {narrative.ember_strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 mb-3">
                      <span className="text-[10px] font-bold mt-0.5 flex-shrink-0" style={{ color: '#10B981' }}>{i + 1}.</span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {narrative.ember_friction && narrative.ember_friction.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F59E0B' }}>
                      {mode === 'candidate' ? 'Watch Out For' : 'Potential Friction'}
                    </h4>
                  </div>
                  {narrative.ember_friction.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 mb-3">
                      <span className="text-[10px] font-bold mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }}>{i + 1}.</span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{f}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)' }} />

            {/* Playbook + Questions — side by side, clean layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
              {narrative.ember_success_tips && narrative.ember_success_tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>Your Playbook</h4>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ backgroundColor: '#8B5CF640' }} />
                    {narrative.ember_success_tips.map((t, i) => (
                      <div key={i} className="relative mb-3 last:mb-0">
                        <div className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {narrative.ember_questions && narrative.ember_questions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4" style={{ color: '#06B6D4' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#06B6D4' }}>Questions to Explore</h4>
                  </div>
                  {narrative.ember_questions.map((q, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed mb-2"
                      style={{
                        backgroundColor: i % 2 === 0 ? 'var(--color-background)' : 'var(--color-surfaceHover)',
                        color: 'var(--color-textSecondary)',
                        borderBottomLeftRadius: i % 2 === 0 ? '4px' : undefined,
                        borderBottomRightRadius: i % 2 === 1 ? '4px' : undefined,
                        marginLeft: i % 2 === 1 ? '20px' : '0',
                        marginRight: i % 2 === 0 ? '20px' : '0',
                      }}
                    >
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How Your Traits Align */}
            {dimensions.length >= 5 && (() => {
              const traitInsights: { title: string; description: string }[] = [];
              const o = dimensions.find(d => d.name.toLowerCase() === 'openness');
              const c = dimensions.find(d => d.name.toLowerCase() === 'conscientiousness');
              const e = dimensions.find(d => d.name.toLowerCase() === 'extraversion');
              const a = dimensions.find(d => d.name.toLowerCase() === 'agreeableness');
              const n = dimensions.find(d => d.name.toLowerCase() === 'neuroticism') ?? dimensions.find(d => d.name.toLowerCase() === 'stability');

              if (o && c && o.candidateScore >= 70 && c.candidateScore >= 70)
                traitInsights.push({ title: 'Creative Discipline', description: 'You combine creativity with discipline, allowing you to both generate innovative ideas and execute on them reliably. This is a rare and valuable combination.' });
              if (o && c && o.candidateScore >= 70 && c.candidateScore < 40)
                traitInsights.push({ title: 'Unstructured Creativity', description: 'Your creative energy is strong, but you may start many projects without finishing them. Pairing with structured teammates or using project management tools can help.' });
              if (e && a && e.candidateScore >= 70 && a.candidateScore >= 70)
                traitInsights.push({ title: 'Natural Team Builder', description: "You're a natural team player and relationship builder. People trust you and enjoy working with you. Be mindful of saying yes too often." });
              if (e && a && e.candidateScore >= 70 && a.candidateScore < 40)
                traitInsights.push({ title: 'Assertive Driver', description: "You're assertive and outspoken. You're effective at driving decisions but may need to watch how you deliver critical feedback." });
              if (c && n && c.candidateScore >= 70 && n?.candidateScore >= 70)
                traitInsights.push({ title: 'Perfectionist Tendencies', description: 'Your high standards combined with emotional sensitivity can lead to perfectionism and self-criticism. Build in breaks and celebrate small wins.' });
              if (e && n && e.candidateScore < 40 && n?.candidateScore < 40)
                traitInsights.push({ title: 'Calm Independent', description: "You're a calm, independent thinker. You excel in deep-focus roles and bring stability to teams, but make sure to stay visible and communicate your contributions." });
              if (o && a && o.candidateScore >= 70 && a.candidateScore >= 70)
                traitInsights.push({ title: 'Empathetic Innovator', description: "You're empathetic and imaginative, great at understanding diverse perspectives and creating inclusive solutions." });
              if (c && e && c.candidateScore >= 70 && e.candidateScore >= 70)
                traitInsights.push({ title: 'Organized Leader', description: "You're a driven, organized communicator, natural for leadership roles where you need to rally teams around structured goals." });

              if (traitInsights.length === 0)
                traitInsights.push({ title: 'Balanced Profile', description: 'Your personality traits create a balanced profile without extreme combinations. This gives you flexibility to adapt to various work environments and team dynamics.' });

              return (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4" style={{ color: INSIGHT_COLORS[4] }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: INSIGHT_COLORS[4] }}>How Your Traits Align</h4>
                  </div>
                  <div className="space-y-3">
                    {traitInsights.map((insight, ii) => (
                      <div key={ii} className="pl-4" style={{ borderLeft: `2px solid ${INSIGHT_COLORS[ii % INSIGHT_COLORS.length]}30` }}>
                        <p className="text-xs font-bold mb-0.5" style={{ color: INSIGHT_COLORS[ii % INSIGHT_COLORS.length] }}>{insight.title}</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Recommendation — accent callout, not a nested card */}
            {narrative.ember_recommendation && (
              <>
                <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent)40, transparent)' }} />
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-accent)' }}>Ember's Recommendation</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{narrative.ember_recommendation}</p>
                  </div>
                </div>
              </>
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

      {/* ═══ 7. Personality Snapshot — expanded ═══ */}
      <div className="bento-card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" style={{ color: INSIGHT_COLORS[0] }} />
          <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Personality Snapshot
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] ml-auto" style={{ color: 'var(--color-textMuted)' }}>
            OCEAN Profile //
          </span>
        </div>

        {/* Archetype */}
        {archetype && (
          <div className="p-4 rounded-xl mb-5" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-3 mb-2">
              <EmberFirefly size="sm" mood="happy" />
              <span
                className="px-3 py-1.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
              >
                {archetype.name}
              </span>
            </div>
            {archetype.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>{archetype.description}</p>
            )}
          </div>
        )}

        {/* Highlights grid */}
        {sortedDims.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { heading: 'Strongest', dim: sortedDims[0], color: INSIGHT_COLORS[1] },
              { heading: 'Notable', dim: sortedDims[1], color: INSIGHT_COLORS[0] },
              { heading: 'Growth Edge', dim: sortedDims[sortedDims.length - 1], color: INSIGHT_COLORS[2] },
            ].map(({ heading, dim, color }) => (
              <div key={heading} className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color }}>{heading}</p>
                <span className="text-2xl font-extrabold block" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{dim.fitScore}</span>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-textSecondary)' }}>{dim.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Full OCEAN dimension profiles */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-textMuted)' }}>
            Trait Profiles //
          </p>
          <div className="space-y-0">
            {dimensions.map((dim, i) => {
              const color = INSIGHT_COLORS[i % INSIGHT_COLORS.length];
              const traitKey = dim.name.toLowerCase();
              const traitData = TRAIT_INSIGHTS[traitKey];
              const level = getTraitLevel(dim.candidateScore);
              const levelLabel = getTraitLevelLabel(dim.candidateScore);

              return (
                <div
                  key={dim.name}
                  className="py-4"
                  style={{ borderBottom: i < dimensions.length - 1 ? '1px solid var(--color-border)' : undefined }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{dim.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                      {levelLabel} · {dim.candidateScore}
                    </span>
                    <div className="flex-1" />
                    <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      Fit: <span className="font-bold" style={{ color: getAlignmentColor(dim.fitScore) }}>{dim.fitScore}%</span>
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.candidateScore}%`, backgroundColor: color }} />
                  </div>

                  {/* Trait description */}
                  {traitData && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                      {traitData[level]}
                    </p>
                  )}

                  {/* Workplace implications */}
                  {traitData && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(level === 'high' ? traitData.highWork : level === 'mid' ? traitData.midWork : traitData.lowWork).map((w, wi) => (
                        <span
                          key={wi}
                          className="text-[10px] px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${color}10`, color, border: `1px solid ${color}30` }}
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ═══ 8. Next Steps ═══ */}
      <div className="bento-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-0.5" style={{ color: 'var(--color-textMuted)' }}>
              Next Steps //
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
              Take This Match Further
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              {isSaved ? <><BookmarkCheck className="w-4 h-4 mr-1.5" />Saved</> : <><Bookmark className="w-4 h-4 mr-1.5" />Save</>}
            </Button>
            {mode === 'employer' && onCompare && (
              <Button variant="ghost" onClick={onCompare}>
                <GitCompareArrows className="w-4 h-4 mr-1.5" />
                Compare
              </Button>
            )}
            {mode === 'candidate' && (
              <Button variant="ghost" onClick={() => { /* share */ }}>
                <Share2 className="w-4 h-4 mr-1.5" />
                Share Match
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
