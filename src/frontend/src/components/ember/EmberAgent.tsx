/**
 * Ember Agent - The Personality Matching Mascot for Project Amber
 *
 * Ember is like Duolingo's owl, but for personality-based job matching.
 * It's a warm, glowing flame character that represents the "amber" in the brand.
 * Ember analyzes personality profiles and shows compatibility scores.
 *
 * Works for both candidates (seeing employer matches) and employers (seeing candidate fits).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  Users,
  Heart,
  TrendingUp,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Target,
  Star,
  MessageCircle,
  Briefcase,
  Lightbulb,
  AlertTriangle,
  Brain,
  Compass,
  Layers,
  Music,
  User,
  Coffee,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { EmberFirefly } from './EmberFirefly';
import { cn } from '../../utils/cn';

// Alias for backward compatibility in this file
const EmberMascot = EmberFirefly;

// ============================================
// TYPES
// ============================================

interface EmberMatch {
  role_id: string;
  role_title: string;
  company_name: string;
  company_industry: string;
  company_size: string;
  company_location: string;
  role_location: string;
  work_style: string;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string;
  overall_score: number;
  trait_match_score: number;
  culture_match_score: number;
  candidate_archetype: {
    name: string;
    emoji: string;
    description: string;
    key: string;
    confidence: number;
  };
  breakdown: Record<string, number>;
  insights: Array<{
    category: string;
    message: string;
    trait_related: string | null;
    score_impact: string | null;
  }>;
  ember_summary: string;
  ember_recommendation: string;
  dimension_analysis: Array<{
    name: string;
    candidate_score: number;
    employer_preference: number;
    fit_score: number;
    gap: number;
    direction: string;
    in_role_range: boolean;
    role_range: number[] | null;
  }>;
}

interface EmberCandidateResult {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_headline: string;
  candidate_location: string;
  candidate_archetype: {
    name: string;
    emoji: string;
    description: string;
    key: string;
    confidence: number;
  };
  overall_score: number;
  trait_match_score: number;
  culture_match_score: number;
  breakdown: Record<string, number>;
  top_insights: Array<{
    category: string;
    message: string;
    trait_related: string | null;
    score_impact: string | null;
  }>;
  ember_summary: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const ARCHETYPE_ICONS: Record<string, typeof Brain> = {
  the_innovator: Lightbulb,
  the_architect: Layers,
  the_connector: Heart,
  the_catalyst: Zap,
  the_craftsperson: Target,
  the_harmonizer: Music,
  the_explorer: Compass,
  the_strategist: Brain,
};

function getMatchColor(score: number) {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

function getMatchLabel(score: number) {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 55) return 'Good Match';
  return 'Potential Match';
}

function getInsightIcon(category: string) {
  switch (category) {
    case 'strength': return TrendingUp;
    case 'caution': return AlertTriangle;
    case 'tip': return Lightbulb;
    case 'highlight': return Star;
    default: return MessageCircle;
  }
}

function getInsightColor(category: string) {
  switch (category) {
    case 'strength': return 'var(--color-success)';
    case 'caution': return 'var(--color-warning)';
    case 'tip': return 'var(--color-accent)';
    case 'highlight': return 'var(--color-accent)';
    default: return 'var(--color-textMuted)';
  }
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const formatNum = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
  if (min) return `From ${formatNum(min)}`;
  return `Up to ${formatNum(max!)}`;
}

// ============================================
// EMBER TYPING ANIMATION
// ============================================

function EmberTypingMessage({ messages, onComplete }: { messages: string[]; onComplete: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (currentIdx >= messages.length) {
      onComplete();
      return;
    }

    const msg = messages[currentIdx];
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx <= msg.length) {
        setCurrentText(msg.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentIdx(prev => prev + 1);
        }, 300);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [currentIdx, messages, onComplete]);

  return (
    <div className="flex items-start gap-3">
      <EmberMascot size="sm" animated mood="thinking" />
      <div
        className="px-4 py-2 rounded-2xl rounded-tl-sm text-sm"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
      >
        {currentText}
        <span className="animate-pulse">|</span>
      </div>
    </div>
  );
}

// ============================================
// SCORE RING COMPONENT
// ============================================

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getMatchColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={4}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================
// DIMENSION BAR COMPONENT
// ============================================

function DimensionBar({
  name,
  candidateScore,
  employerPreference,
  inRange,
}: {
  name: string;
  candidateScore: number;
  employerPreference: number;
  inRange: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
          {name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
            You: {candidateScore}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            Ideal: {employerPreference}
          </span>
        </div>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Candidate bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${candidateScore}%`,
            backgroundColor: inRange ? 'var(--color-accent)' : 'var(--color-warning)',
            opacity: 0.8,
          }}
        />
        {/* Employer preference marker */}
        <div
          className="absolute top-0 h-full w-0.5"
          style={{
            left: `${employerPreference}%`,
            backgroundColor: 'var(--color-text)',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// MAIN EMBER AGENT COMPONENT
// ============================================

export function EmberAgent() {
  const { user, isEmployer } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);

  // Candidate state
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [matches, setMatches] = useState<EmberMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<EmberMatch | null>(null);
  const [archetype, setArchetype] = useState<EmberMatch['candidate_archetype'] | null>(null);

  // Employer state
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [candidateResults, setCandidateResults] = useState<EmberCandidateResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<EmberCandidateResult | null>(null);

  const [emberMessage, setEmberMessage] = useState('');
  const [expandedInsights, setExpandedInsights] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const analyzeMessages = isEmployer
    ? [
        "Scanning candidate personality profiles...",
        "Mapping personality traits to your culture...",
        "Evaluating culture alignment...",
        "Calculating compatibility scores...",
        "Ranking candidates by personality fit...",
        "Generating insights...",
      ]
    : [
        "Reading your personality profile...",
        "Scanning open roles and company cultures...",
        "Comparing your traits with employer preferences...",
        "Evaluating culture fit...",
        "Ranking your best matches...",
        "Generating personalized insights...",
      ];

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      if (isEmployer) {
        // Load employer data
        const { data: employer } = await supabase
          .from('employers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (employer) {
          setEmployerId(employer.id);
          setHasAssessment(employer.culture_quiz_completed || false);
          await runEmployerAnalysis(employer.id);
        }
      } else {
        // Load candidate data
        const { data: candidate } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (candidate) {
          setCandidateId(candidate.id);
          setHasAssessment(candidate.openness_score !== null);
          if (candidate.openness_score !== null) {
            await runCandidateAnalysis(candidate.id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runCandidateAnalysis = async (cId: string) => {
    setIsAnalyzing(true);
    setShowTyping(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ember/candidate-matches/${cId}`
      );

      if (!response.ok) {
        // Fallback: compute matches client-side if backend unavailable
        await runCandidateAnalysisFallback(cId);
        return;
      }

      const data = await response.json();
      setArchetype(data.archetype);
      setMatches(data.matches || []);
      setEmberMessage(data.ember_message || '');

      if (data.matches?.length > 0) {
        setSelectedMatch(data.matches[0]);
      }
    } catch {
      // Backend not running - use fallback client-side matching
      await runCandidateAnalysisFallback(cId);
    } finally {
      setShowTyping(false);
      setIsAnalyzing(false);
    }
  };

  const runCandidateAnalysisFallback = async (cId: string) => {
    // Client-side fallback when backend isn't running
    try {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', cId)
        .single();

      const { data: roles } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (!candidate || !roles) {
        setEmberMessage("Couldn't load matching data. Please try again.");
        return;
      }

      // Simple archetype determination
      const ocean = {
        o: candidate.openness_score || 50,
        c: candidate.conscientiousness_score || 50,
        e: candidate.extraversion_score || 50,
        a: candidate.agreeableness_score || 50,
        n: candidate.neuroticism_score || 50,
      };

      let archetypeKey = 'the_explorer';
      if (ocean.o >= 80 && ocean.c <= 55) archetypeKey = 'the_innovator';
      else if (ocean.c >= 80 && ocean.e <= 50) archetypeKey = 'the_craftsperson';
      else if (ocean.e >= 80 && ocean.a >= 75) archetypeKey = 'the_connector';
      else if (ocean.e >= 75 && ocean.a <= 50) archetypeKey = 'the_catalyst';
      else if (ocean.c >= 80 && ocean.o >= 60) archetypeKey = 'the_strategist';
      else if (ocean.a >= 80 && ocean.n <= 35) archetypeKey = 'the_harmonizer';
      else if (ocean.c >= 80) archetypeKey = 'the_architect';

      const archetypeNames: Record<string, { name: string; emoji: string; description: string }> = {
        the_innovator: { name: 'The Innovator', emoji: 'lightbulb', description: 'Creative thinker who thrives on new ideas' },
        the_architect: { name: 'The Architect', emoji: 'layers', description: 'Systematic builder who creates order' },
        the_connector: { name: 'The Connector', emoji: 'heart', description: 'Natural relationship builder' },
        the_catalyst: { name: 'The Catalyst', emoji: 'zap', description: 'Bold leader who drives change' },
        the_craftsperson: { name: 'The Craftsperson', emoji: 'target', description: 'Detail-oriented perfectionist' },
        the_harmonizer: { name: 'The Harmonizer', emoji: 'music', description: 'Empathetic mediator who creates balance' },
        the_explorer: { name: 'The Explorer', emoji: 'compass', description: 'Curious adventurer who adapts quickly' },
        the_strategist: { name: 'The Strategist', emoji: 'brain', description: 'Analytical thinker who plans ahead' },
      };

      const arch = {
        ...archetypeNames[archetypeKey],
        key: archetypeKey,
        confidence: 80,
      };
      setArchetype(arch);

      // Calculate matches
      const matchResults: EmberMatch[] = roles.map((role: any) => {
        const emp = role.employers;

        // Simple trait distance scoring
        const dims = [
          { c: ocean.o, e: emp.openness_preference || 50, name: 'Openness' },
          { c: ocean.c, e: emp.conscientiousness_preference || 50, name: 'Conscientiousness' },
          { c: ocean.e, e: emp.extraversion_preference || 50, name: 'Extraversion' },
          { c: ocean.a, e: emp.agreeableness_preference || 50, name: 'Agreeableness' },
          { c: 100 - ocean.n, e: 100 - (emp.neuroticism_preference || 50), name: 'Emotional Stability' },
        ];

        let totalFit = 0;
        const dimAnalysis = dims.map(d => {
          const fit = Math.max(0, 100 - Math.abs(d.c - d.e));
          totalFit += fit;
          return {
            name: d.name,
            candidate_score: d.c,
            employer_preference: d.e,
            fit_score: fit,
            gap: Math.abs(d.c - d.e),
            direction: d.c > d.e ? 'above' : 'below',
            in_role_range: true,
            role_range: null,
          };
        });

        const traitScore = Math.round(totalFit / dims.length);
        const cultureScore = Math.round(traitScore * 0.9 + Math.random() * 10);
        const overall = Math.round(traitScore * 0.5 + cultureScore * 0.5);

        const insights: EmberMatch['insights'] = [];
        if (overall >= 80) {
          insights.push({
            category: 'highlight',
            message: `Your ${arch.name} personality aligns well with ${emp.company_name}'s culture`,
            trait_related: null,
            score_impact: 'positive',
          });
        }

        dims.forEach(d => {
          if (d.c - d.e > 20) {
            insights.push({
              category: 'strength',
              message: `Your ${d.name.toLowerCase()} exceeds expectations for this role`,
              trait_related: d.name.toLowerCase(),
              score_impact: 'positive',
            });
          }
          if (d.e - d.c > 25) {
            insights.push({
              category: 'caution',
              message: `This role expects higher ${d.name.toLowerCase()} than your natural tendency`,
              trait_related: d.name.toLowerCase(),
              score_impact: 'negative',
            });
          }
        });

        return {
          role_id: role.id,
          role_title: role.title,
          company_name: emp.company_name || 'Unknown',
          company_industry: emp.industry || '',
          company_size: emp.company_size || '',
          company_location: emp.location || '',
          role_location: role.location || '',
          work_style: role.work_style || '',
          salary_min: role.salary_min,
          salary_max: role.salary_max,
          employment_type: role.employment_type || '',
          overall_score: overall,
          trait_match_score: traitScore,
          culture_match_score: cultureScore,
          candidate_archetype: arch,
          breakdown: {
            openness_fit: dimAnalysis[0].fit_score,
            conscientiousness_fit: dimAnalysis[1].fit_score,
            extraversion_fit: dimAnalysis[2].fit_score,
            agreeableness_fit: dimAnalysis[3].fit_score,
            neuroticism_fit: dimAnalysis[4].fit_score,
            work_style_fit: 75,
            values_alignment: cultureScore,
          },
          insights: insights.slice(0, 5),
          ember_summary: overall >= 80
            ? `As ${arch.name}, you're an excellent fit for this role.`
            : overall >= 65
            ? `As ${arch.name}, you have solid compatibility with this team.`
            : `This role may require some personality adaptation.`,
          ember_recommendation: overall >= 80
            ? 'Highly recommended'
            : overall >= 65
            ? 'Worth exploring'
            : 'Proceed thoughtfully',
          dimension_analysis: dimAnalysis,
        };
      });

      matchResults.sort((a, b) => b.overall_score - a.overall_score);
      setMatches(matchResults);

      if (matchResults.length > 0) {
        setSelectedMatch(matchResults[0]);
        const top = matchResults[0].overall_score;
        setEmberMessage(
          top >= 80
            ? `Great news! I found ${matchResults.length} roles and your top match is ${top}%!`
            : `I analyzed ${matchResults.length} roles for your personality profile.`
        );
      } else {
        setEmberMessage("No active roles available yet. Check back soon!");
      }
    } catch (err) {
      console.error('Fallback analysis error:', err);
      setEmberMessage("Had trouble analyzing matches. Please try again.");
    }
  };

  const runEmployerAnalysis = async (eId: string) => {
    setIsAnalyzing(true);
    setShowTyping(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ember/employer-matches/${eId}`
      );

      if (!response.ok) {
        await runEmployerAnalysisFallback(eId);
        return;
      }

      const data = await response.json();
      setCandidateResults(data.candidates || []);
      setEmberMessage(data.ember_message || '');

      if (data.candidates?.length > 0) {
        setSelectedCandidate(data.candidates[0]);
      }
    } catch {
      await runEmployerAnalysisFallback(eId);
    } finally {
      setShowTyping(false);
      setIsAnalyzing(false);
    }
  };

  const runEmployerAnalysisFallback = async (eId: string) => {
    try {
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('id', eId)
        .single();

      const { data: candidates } = await supabase
        .from('candidates')
        .select('*, profiles!inner(full_name, email)')
        .not('openness_score', 'is', null);

      if (!employer || !candidates) {
        setEmberMessage("Couldn't load candidate data.");
        return;
      }

      const results: EmberCandidateResult[] = candidates.map((c: any) => {
        const dims = [
          Math.abs((c.openness_score || 50) - (employer.openness_preference || 50)),
          Math.abs((c.conscientiousness_score || 50) - (employer.conscientiousness_preference || 50)),
          Math.abs((c.extraversion_score || 50) - (employer.extraversion_preference || 50)),
          Math.abs((c.agreeableness_score || 50) - (employer.agreeableness_preference || 50)),
          Math.abs((c.neuroticism_score || 50) - (employer.neuroticism_preference || 50)),
        ];

        const avgFit = Math.round(dims.reduce((sum, d) => sum + (100 - d), 0) / dims.length);
        const overall = Math.round(avgFit * 0.95 + Math.random() * 5);

        // Determine archetype
        let archetypeKey = 'the_explorer';
        const o = c.openness_score || 50;
        const con = c.conscientiousness_score || 50;
        const e = c.extraversion_score || 50;
        const a = c.agreeableness_score || 50;
        if (o >= 80 && con <= 55) archetypeKey = 'the_innovator';
        else if (con >= 80 && e <= 50) archetypeKey = 'the_craftsperson';
        else if (e >= 80 && a >= 75) archetypeKey = 'the_connector';
        else if (e >= 75 && a <= 50) archetypeKey = 'the_catalyst';
        else if (con >= 80 && o >= 60) archetypeKey = 'the_strategist';
        else if (a >= 80) archetypeKey = 'the_harmonizer';
        else if (con >= 80) archetypeKey = 'the_architect';

        const archetypeNames: Record<string, { name: string; emoji: string; description: string }> = {
          the_innovator: { name: 'The Innovator', emoji: 'lightbulb', description: 'Creative thinker' },
          the_architect: { name: 'The Architect', emoji: 'layers', description: 'Systematic builder' },
          the_connector: { name: 'The Connector', emoji: 'heart', description: 'Relationship builder' },
          the_catalyst: { name: 'The Catalyst', emoji: 'zap', description: 'Change driver' },
          the_craftsperson: { name: 'The Craftsperson', emoji: 'target', description: 'Quality focused' },
          the_harmonizer: { name: 'The Harmonizer', emoji: 'music', description: 'Team balancer' },
          the_explorer: { name: 'The Explorer', emoji: 'compass', description: 'Adaptable learner' },
          the_strategist: { name: 'The Strategist', emoji: 'brain', description: 'Big-picture thinker' },
        };

        return {
          candidate_id: c.id,
          candidate_name: c.profiles?.full_name || 'Unknown',
          candidate_email: c.profiles?.email || '',
          candidate_headline: c.headline || '',
          candidate_location: c.location || '',
          candidate_archetype: { ...archetypeNames[archetypeKey], key: archetypeKey, confidence: 80 },
          overall_score: overall,
          trait_match_score: avgFit,
          culture_match_score: Math.round(avgFit * 0.9 + 5),
          breakdown: {},
          top_insights: [
            {
              category: overall >= 75 ? 'strength' : 'tip',
              message: `${archetypeNames[archetypeKey].name} personality - ${archetypeNames[archetypeKey].description}`,
              trait_related: null,
              score_impact: overall >= 75 ? 'positive' : 'neutral',
            },
          ],
          ember_summary: overall >= 80
            ? 'Excellent personality fit for your culture.'
            : overall >= 65
            ? 'Good personality alignment with some complementary differences.'
            : 'Some personality gaps, but diversity can be valuable.',
        };
      });

      results.sort((a, b) => b.overall_score - a.overall_score);
      setCandidateResults(results);

      if (results.length > 0) {
        setSelectedCandidate(results[0]);
        setEmberMessage(
          `Analyzed ${results.length} candidates. Top personality match: ${results[0].overall_score}%!`
        );
      } else {
        setEmberMessage("No candidates with completed assessments yet.");
      }
    } catch (err) {
      console.error('Employer fallback error:', err);
      setEmberMessage("Had trouble analyzing candidates. Please try again.");
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <EmberMascot size="lg" animated mood="thinking" />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Ember is warming up...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // NO ASSESSMENT STATE
  // ============================================

  if (!hasAssessment) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <EmberMascot size="xl" mood="neutral" />
          <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>
            Hey! I'm Ember
          </h2>
          <p className="mb-2 text-lg" style={{ color: 'var(--color-textSecondary)' }}>
            Your personality matching companion
          </p>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            {isEmployer
              ? "Complete your culture quiz first so I can find candidates who match your company's personality."
              : "Take your personality assessment first so I can find roles that match who you truly are."
            }
          </p>
          <Button
            onClick={() => navigate(isEmployer ? '/app/employer/culture' : '/app/personality')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isEmployer ? 'Take Culture Quiz' : 'Start Assessment'}
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // EMPLOYER VIEW
  // ============================================

  if (isEmployer) {
    return (
      <div className="min-h-[80vh]" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <EmberMascot size="sm" mood={isAnalyzing ? 'thinking' : candidateResults.length > 0 ? 'happy' : 'neutral'} animated={isAnalyzing} />
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  Ember - Personality Matcher
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {isAnalyzing ? 'Analyzing candidates...' : emberMessage}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => employerId && runEmployerAnalysis(employerId)}
              disabled={isAnalyzing}
              leftIcon={<RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />}
            >
              Re-analyze
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {showTyping && (
            <div className="mb-6">
              <EmberTypingMessage messages={analyzeMessages} onComplete={() => setShowTyping(false)} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate List */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Candidate Personality Rankings
              </h2>

              {candidateResults.length === 0 ? (
                <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
                  <p style={{ color: 'var(--color-textMuted)' }}>No candidates with completed assessments yet.</p>
                </div>
              ) : (
                candidateResults.map((result, idx) => {
                  const ArchIcon = ARCHETYPE_ICONS[result.candidate_archetype.key] || User;
                  return (
                    <button
                      key={result.candidate_id}
                      onClick={() => setSelectedCandidate(result)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all",
                        selectedCandidate?.candidate_id === result.candidate_id
                          ? "ring-2 ring-[var(--color-accent)]"
                          : "hover:bg-[var(--color-surfaceHover)]"
                      )}
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                            <ArchIcon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs font-bold" style={{ color: 'var(--color-textMuted)', border: '1px solid var(--color-border)' }}>
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{result.candidate_name}</h3>
                          <p className="text-sm truncate" style={{ color: 'var(--color-textSecondary)' }}>{result.candidate_headline || result.candidate_archetype.name}</p>
                          {result.candidate_location && (
                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
                              <MapPin className="w-3 h-3" /> {result.candidate_location}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold" style={{ color: getMatchColor(result.overall_score) }}>
                            {result.overall_score}%
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getMatchColor(result.overall_score)}20`, color: getMatchColor(result.overall_score) }}>
                            {getMatchLabel(result.overall_score)}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-textMuted)' }} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Candidate Detail */}
            <div className="lg:col-span-1">
              {selectedCandidate ? (
                <div className="sticky top-6 p-5 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                      {(() => { const I = ARCHETYPE_ICONS[selectedCandidate.candidate_archetype.key] || User; return <I className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />; })()}
                    </div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{selectedCandidate.candidate_name}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{selectedCandidate.candidate_archetype.name}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>{selectedCandidate.candidate_archetype.description}</p>
                    <div className="text-3xl font-bold mt-3" style={{ color: getMatchColor(selectedCandidate.overall_score) }}>
                      {selectedCandidate.overall_score}%
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>Personality Fit</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Trait Match', value: selectedCandidate.trait_match_score, icon: Heart, color: 'var(--color-accent)' },
                      { label: 'Culture Fit', value: selectedCandidate.culture_match_score, icon: Star, color: 'var(--color-warning)' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{item.label}</span>
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{selectedCandidate.ember_summary}</p>
                  </div>

                  {selectedCandidate.top_insights.length > 0 && (
                    <div className="space-y-2">
                      {selectedCandidate.top_insights.map((insight, i) => {
                        const Icon = getInsightIcon(insight.category);
                        return (
                          <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                            <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: getInsightColor(insight.category) }} />
                            {insight.message}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="sm"
                    leftIcon={<Coffee className="w-4 h-4" />}
                    onClick={async () => {
                      if (!employerId || !selectedCandidate) return;
                      try {
                        await supabase.from('coffee_chats').insert({
                          candidate_id: selectedCandidate.candidate_id,
                          employer_id: employerId,
                          initiated_by: 'employer',
                          status: 'pending',
                          match_score: selectedCandidate.overall_score,
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
                  <EmberMascot size="md" mood="neutral" />
                  <p className="mt-4" style={{ color: 'var(--color-textMuted)' }}>Select a candidate to see their personality analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // CANDIDATE VIEW
  // ============================================

  return (
    <div className="min-h-[80vh]" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EmberMascot
              size="sm"
              mood={isAnalyzing ? 'thinking' : matches.length > 0 ? 'happy' : 'neutral'}
              animated={isAnalyzing}
            />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Ember - Personality Matcher
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {isAnalyzing ? 'Analyzing your matches...' : emberMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {archetype && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                {(() => { const I = ARCHETYPE_ICONS[archetype.key] || Sparkles; return <I className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />; })()}
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{archetype.name}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => candidateId && runCandidateAnalysis(candidateId)}
              disabled={isAnalyzing}
              leftIcon={<RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />}
            >
              Re-analyze
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Typing animation */}
        {showTyping && (
          <div className="mb-6">
            <EmberTypingMessage messages={analyzeMessages} onComplete={() => setShowTyping(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Your Personality Matches
            </h2>

            {matches.length === 0 && !isAnalyzing ? (
              <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
                <p style={{ color: 'var(--color-textMuted)' }}>No active roles available yet. Check back soon!</p>
              </div>
            ) : (
              matches.map((match, idx) => (
                <button
                  key={match.role_id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setExpandedInsights(false);
                    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    "w-full p-5 rounded-2xl text-left transition-all",
                    selectedMatch?.role_id === match.role_id
                      ? "ring-2 ring-[var(--color-accent)]"
                      : "hover:bg-[var(--color-surfaceHover)]"
                  )}
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                        <Building2 className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: getMatchColor(match.overall_score), color: 'white' }}>
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{match.role_title}</h3>
                          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{match.company_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {match.company_industry && (
                              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{match.company_industry}</span>
                            )}
                            {match.role_location && (
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                <MapPin className="w-3 h-3" /> {match.role_location}
                              </span>
                            )}
                            {match.work_style && (
                              <span className="text-xs capitalize" style={{ color: 'var(--color-textMuted)' }}>{match.work_style}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold" style={{ color: getMatchColor(match.overall_score) }}>
                            {match.overall_score}%
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getMatchColor(match.overall_score)}20`, color: getMatchColor(match.overall_score) }}>
                            {getMatchLabel(match.overall_score)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{match.trait_match_score}% Traits</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{match.culture_match_score}% Culture</span>
                        </div>
                      </div>

                      {idx < 3 && match.insights.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                            {(() => { const I = getInsightIcon(match.insights[0].category); return <I className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: getInsightColor(match.insights[0].category) }} />; })()}
                            {match.insights[0].message}
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 mt-4" style={{ color: 'var(--color-textMuted)' }} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Selected Match Detail */}
          <div className="lg:col-span-1" ref={detailRef}>
            {selectedMatch ? (
              <div className="sticky top-6 p-5 rounded-2xl space-y-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {/* Score header */}
                <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                    <Building2 className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{selectedMatch.role_title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{selectedMatch.company_name}</p>

                  <div className="flex justify-center gap-4 mt-4">
                    <ScoreRing score={selectedMatch.overall_score} label="Overall" />
                    <ScoreRing score={selectedMatch.trait_match_score} size={60} label="Traits" />
                    <ScoreRing score={selectedMatch.culture_match_score} size={60} label="Culture" />
                  </div>
                </div>

                {/* Ember's take */}
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                  <EmberMascot size="sm" mood={selectedMatch.overall_score >= 75 ? 'happy' : 'neutral'} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Ember's Take</p>
                    <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{selectedMatch.ember_summary}</p>
                  </div>
                </div>

                {/* Dimension Analysis */}
                {selectedMatch.dimension_analysis?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Personality Dimensions</h4>
                    <div className="space-y-3">
                      {selectedMatch.dimension_analysis.map(dim => (
                        <DimensionBar
                          key={dim.name}
                          name={dim.name}
                          candidateScore={dim.candidate_score}
                          employerPreference={dim.employer_preference}
                          inRange={dim.in_role_range}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {selectedMatch.insights.length > 0 && (
                  <div>
                    <button
                      className="flex items-center justify-between w-full"
                      onClick={() => setExpandedInsights(!expandedInsights)}
                    >
                      <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Personality Insights ({selectedMatch.insights.length})
                      </h4>
                      {expandedInsights ? (
                        <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                      ) : (
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                      )}
                    </button>
                    <div className={cn("space-y-2 mt-2", !expandedInsights && "max-h-[120px] overflow-hidden")}>
                      {selectedMatch.insights.map((insight, i) => {
                        const Icon = getInsightIcon(insight.category);
                        return (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)' }}>
                            <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: getInsightColor(insight.category) }} />
                            {insight.message}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Role info */}
                <div className="pt-4 border-t space-y-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  {selectedMatch.role_location && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                      <MapPin className="w-4 h-4" /> {selectedMatch.role_location}
                    </div>
                  )}
                  {selectedMatch.work_style && (
                    <div className="flex items-center gap-2 capitalize" style={{ color: 'var(--color-textMuted)' }}>
                      <Briefcase className="w-4 h-4" /> {selectedMatch.work_style}
                    </div>
                  )}
                  {formatSalary(selectedMatch.salary_min, selectedMatch.salary_max) && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                      <span className="w-4 h-4 text-center text-xs">$</span>
                      {formatSalary(selectedMatch.salary_min, selectedMatch.salary_max)}
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-lg text-center text-xs" style={{ backgroundColor: `${getMatchColor(selectedMatch.overall_score)}15`, color: getMatchColor(selectedMatch.overall_score) }}>
                  {selectedMatch.ember_recommendation}
                </div>

                <Button
                  className="w-full"
                  size="sm"
                  leftIcon={<Coffee className="w-4 h-4" />}
                  onClick={async () => {
                    if (!candidateId || !selectedMatch) return;
                    try {
                      const { data: employer } = await supabase
                        .from('roles')
                        .select('employer_id')
                        .eq('id', selectedMatch.role_id)
                        .single();
                      if (!employer) return;
                      await supabase.from('coffee_chats').insert({
                        candidate_id: candidateId,
                        employer_id: employer.employer_id,
                        role_id: selectedMatch.role_id,
                        initiated_by: 'candidate',
                        status: 'pending',
                        message: `Interested in ${selectedMatch.role_title}`,
                        role_title: selectedMatch.role_title,
                        match_score: selectedMatch.overall_score,
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
                <EmberMascot size="md" mood="neutral" />
                <p className="mt-4" style={{ color: 'var(--color-textMuted)' }}>
                  Select a match to see Ember's detailed personality analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
