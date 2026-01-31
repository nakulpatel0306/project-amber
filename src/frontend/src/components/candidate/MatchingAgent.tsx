import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  Users,
  Heart,
  TrendingUp,
  MapPin,
  Globe,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { OCEANScores } from '../../lib/personalityEngine';
import { cn } from '../../utils/cn';

interface CandidateData {
  id: string;
  user_id: string;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  top_traits: string[];
}

interface EmployerData {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  company_size: string;
  industry: string;
  location: string;
  company_website: string;
  culture_values: string[];
  culture_quiz_completed: boolean;
  openness_preference: number;
  conscientiousness_preference: number;
  extraversion_preference: number;
  agreeableness_preference: number;
  neuroticism_preference: number;
}

interface MatchResult {
  employer: EmployerData;
  matchScore: number;
  breakdown: {
    personalityFit: number;
    valueAlignment: number;
    workStyleMatch: number;
  };
  highlights: string[];
  compatibilityInsights: string[];
}

export function MatchingAgent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [agentThinking, setAgentThinking] = useState(false);

  const agentMessages = [
    "Analyzing your personality profile...",
    "Scanning company cultures across industries...",
    "Calculating compatibility scores...",
    "Finding your ideal work environments...",
    "Identifying value alignments...",
    "Discovering hidden connections...",
    "Ranking your best matches...",
  ];

  useEffect(() => {
    if (!user) return;
    loadCandidateData();
  }, [user]);

  const loadCandidateData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch candidate's personality data
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (candidate && candidate.openness_score !== null) {
        setCandidateData(candidate);
        await findMatches(candidate);
      } else {
        // No assessment completed
        setCandidateData(null);
      }
    } catch (err) {
      console.error('Error loading candidate data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const findMatches = async (candidate: CandidateData) => {
    setIsAnalyzing(true);
    setAgentThinking(true);

    // Animate through agent messages
    for (let i = 0; i < agentMessages.length; i++) {
      setAgentMessage(agentMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      // Fetch all employers with culture data (those who completed the culture quiz)
      const { data: employers, error } = await supabase
        .from('employers')
        .select('*')
        .eq('culture_quiz_completed', true);

      if (error) throw error;

      if (!employers || employers.length === 0) {
        setMatches([]);
        setAgentThinking(false);
        setAgentMessage("No employers have completed their culture assessment yet. Check back soon!");
        return;
      }

      const candidateOcean: OCEANScores = {
        openness: candidate.openness_score || 50,
        conscientiousness: candidate.conscientiousness_score || 50,
        extraversion: candidate.extraversion_score || 50,
        agreeableness: candidate.agreeableness_score || 50,
        neuroticism: candidate.neuroticism_score || 50,
      };

      // Calculate matches for each employer
      const matchResults: MatchResult[] = employers.map(employer => {
        const idealOcean: OCEANScores = {
          openness: employer.openness_preference || 50,
          conscientiousness: employer.conscientiousness_preference || 50,
          extraversion: employer.extraversion_preference || 50,
          agreeableness: employer.agreeableness_preference || 50,
          neuroticism: employer.neuroticism_preference || 50,
        };

        // Calculate match score directly
        const matchScore = calculateMatchScore(candidateOcean, idealOcean);
        const breakdown = calculateBreakdown(candidateOcean, idealOcean);
        const highlights = generateHighlights(candidateOcean, idealOcean, employer);
        const compatibilityInsights = generateInsights(candidateOcean, idealOcean, employer);

        return {
          employer,
          matchScore,
          breakdown,
          highlights,
          compatibilityInsights,
        };
      });

      // Sort by match score
      matchResults.sort((a, b) => b.matchScore - a.matchScore);

      setMatches(matchResults);
      setAgentMessage(`Found ${matchResults.length} potential matches! Here are your top recommendations.`);
    } catch (err) {
      console.error('Error finding matches:', err);
      setAgentMessage("Had trouble finding matches. Please try again.");
    } finally {
      setAgentThinking(false);
      setIsAnalyzing(false);
    }
  };

  const calculateMatchScore = (candidate: OCEANScores, ideal: OCEANScores): number => {
    // Calculate OCEAN distance and convert to a score
    const oceanDiff =
      Math.abs(candidate.openness - ideal.openness) +
      Math.abs(candidate.conscientiousness - ideal.conscientiousness) +
      Math.abs(candidate.extraversion - ideal.extraversion) +
      Math.abs(candidate.agreeableness - ideal.agreeableness) +
      Math.abs(candidate.neuroticism - ideal.neuroticism);

    // Max possible difference is 500 (5 dimensions * 100)
    // Convert to percentage match (0-100)
    return Math.round(100 - (oceanDiff / 5));
  };

  const calculateBreakdown = (candidate: OCEANScores, ideal: OCEANScores): MatchResult['breakdown'] => {
    // Personality fit based on OCEAN distance
    const oceanDiff =
      Math.abs(candidate.openness - ideal.openness) +
      Math.abs(candidate.conscientiousness - ideal.conscientiousness) +
      Math.abs(candidate.extraversion - ideal.extraversion) +
      Math.abs(candidate.agreeableness - ideal.agreeableness) +
      Math.abs(candidate.neuroticism - ideal.neuroticism);

    const personalityFit = Math.round(100 - (oceanDiff / 5));

    // Value alignment based on how close key traits are
    const valueAlignment = Math.round(
      100 - (Math.abs(candidate.openness - ideal.openness) +
             Math.abs(candidate.conscientiousness - ideal.conscientiousness)) / 2
    );

    // Work style match based on extraversion and conscientiousness alignment
    const workStyleMatch = Math.round(
      100 - (Math.abs(candidate.extraversion - ideal.extraversion) +
             Math.abs(candidate.agreeableness - ideal.agreeableness)) / 2
    );

    return { personalityFit, valueAlignment, workStyleMatch };
  };

  const generateHighlights = (
    candidate: OCEANScores,
    ideal: OCEANScores,
    employer: EmployerData
  ): string[] => {
    const highlights: string[] = [];

    if (candidate.openness > 60 && ideal.openness > 60) {
      highlights.push("Shared love for innovation and new ideas");
    }
    if (candidate.conscientiousness > 65 && ideal.conscientiousness > 65) {
      highlights.push("Strong alignment on quality and attention to detail");
    }
    if (candidate.extraversion > 55 && ideal.extraversion > 55) {
      highlights.push("Compatible communication and collaboration styles");
    }
    if (candidate.agreeableness > 60 && ideal.agreeableness > 60) {
      highlights.push("Values teamwork and supportive relationships");
    }
    if (Math.abs(candidate.neuroticism - ideal.neuroticism) < 15) {
      highlights.push("Similar approach to handling pressure and stress");
    }

    if (employer.company_size === '1-10' || employer.company_size === '11-50') {
      highlights.push("Thrives in fast-paced, dynamic environments");
    }
    if (ideal.openness > 65) {
      highlights.push("Culture that celebrates creative thinking");
    }
    if (ideal.agreeableness > 65 && ideal.extraversion > 55) {
      highlights.push("Team-oriented environment with strong support");
    }

    return highlights.slice(0, 4);
  };

  const generateInsights = (
    candidate: OCEANScores,
    ideal: OCEANScores,
    employer: EmployerData
  ): string[] => {
    const insights: string[] = [];

    if (candidate.openness > ideal.openness + 15) {
      insights.push("Your creative drive could bring fresh perspectives to this team");
    }
    if (candidate.conscientiousness > ideal.conscientiousness + 10) {
      insights.push("Your attention to detail exceeds their expectations");
    }
    if (candidate.extraversion < ideal.extraversion - 15) {
      insights.push("This role may require more social interaction than you prefer");
    }
    if (candidate.agreeableness > 70 && ideal.conscientiousness > 70) {
      insights.push("Your collaborative nature could help balance their achievement-focused culture");
    }

    if (employer.industry === 'Technology') {
      insights.push("Tech industry aligns with innovation-driven personalities");
    }
    if (employer.industry === 'Healthcare') {
      insights.push("Healthcare sector values empathy and conscientiousness");
    }

    return insights.slice(0, 3);
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-accent)';
    if (score >= 55) return 'var(--color-warning)';
    return 'var(--color-textMuted)';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 55) return 'Good Match';
    return 'Potential Match';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p style={{ color: 'var(--color-textMuted)' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}
          >
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Complete Your Assessment First
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Take our personality assessment to discover your unique traits and find companies that match your values and work style.
          </p>
          <Button onClick={() => navigate('/app/personality')}>
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Agent Header */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                agentThinking && "animate-pulse"
              )}
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Match Agent
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {agentThinking ? agentMessage : `${matches.length} companies analyzed`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => findMatches(candidateData)}
            disabled={isAnalyzing}
            leftIcon={<RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />}
          >
            Refresh Matches
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Agent Message */}
        {agentMessage && !agentThinking && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <MessageCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-accent)' }} />
            <p style={{ color: 'var(--color-text)' }}>{agentMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Your Top Matches
            </h2>

            {matches.length === 0 ? (
              <div
                className="p-8 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
                <p style={{ color: 'var(--color-textMuted)' }}>
                  No employers have completed their culture assessment yet. Check back soon!
                </p>
              </div>
            ) : (
              matches.map((match, index) => (
                <button
                  key={match.employer.id}
                  onClick={() => setSelectedMatch(match)}
                  className={cn(
                    "w-full p-5 rounded-2xl text-left transition-all",
                    selectedMatch?.employer.id === match.employer.id
                      ? "ring-2 ring-[var(--color-accent)]"
                      : "hover:bg-[var(--color-surfaceHover)]"
                  )}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Building2 className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                            {match.employer.company_name || 'Unnamed Company'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            {match.employer.industry && (
                              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                {match.employer.industry}
                              </span>
                            )}
                            {match.employer.location && (
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                <MapPin className="w-3 h-3" />
                                {match.employer.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-xl font-bold"
                            style={{ color: getMatchColor(match.matchScore) }}
                          >
                            {match.matchScore}%
                          </div>
                          <div
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${getMatchColor(match.matchScore)}20`,
                              color: getMatchColor(match.matchScore),
                            }}
                          >
                            {getMatchLabel(match.matchScore)}
                          </div>
                        </div>
                      </div>

                      {/* Match Breakdown Mini */}
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {match.breakdown.personalityFit}% Personality
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {match.breakdown.valueAlignment}% Values
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {match.breakdown.workStyleMatch}% Work Style
                          </span>
                        </div>
                      </div>

                      {index < 3 && match.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {match.highlights.slice(0, 2).map((highlight, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-md"
                              style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-textSecondary)',
                              }}
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--color-textMuted)' }}
                    />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Selected Match Details */}
          <div className="lg:col-span-1">
            {selectedMatch ? (
              <div
                className="sticky top-6 p-5 rounded-2xl space-y-5"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <Building2 className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                    {selectedMatch.employer.company_name || 'Unnamed Company'}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    {selectedMatch.employer.industry}
                  </p>
                  <div
                    className="text-3xl font-bold mt-3"
                    style={{ color: getMatchColor(selectedMatch.matchScore) }}
                  >
                    {selectedMatch.matchScore}%
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    Match Score
                  </p>
                </div>

                {/* Detailed Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                    Compatibility Breakdown
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Personality Fit', value: selectedMatch.breakdown.personalityFit, icon: Heart, color: 'var(--color-accent)' },
                      { label: 'Value Alignment', value: selectedMatch.breakdown.valueAlignment, icon: Star, color: 'var(--color-warning)' },
                      { label: 'Work Style', value: selectedMatch.breakdown.workStyleMatch, icon: Zap, color: 'var(--color-success)' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                              {item.label}
                            </span>
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                            {item.value}%
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                {selectedMatch.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                      Why You Match
                    </h4>
                    <ul className="space-y-2">
                      {selectedMatch.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: 'var(--color-textSecondary)' }}
                        >
                          <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Insights */}
                {selectedMatch.compatibilityInsights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                      Insights
                    </h4>
                    <ul className="space-y-2">
                      {selectedMatch.compatibilityInsights.map((insight, i) => (
                        <li
                          key={i}
                          className="text-xs p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-textMuted)',
                          }}
                        >
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Company Info */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="space-y-2 text-sm">
                    {selectedMatch.employer.location && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-4 h-4" />
                        {selectedMatch.employer.location}
                      </div>
                    )}
                    {selectedMatch.employer.company_size && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <Users className="w-4 h-4" />
                        {selectedMatch.employer.company_size.charAt(0).toUpperCase() + selectedMatch.employer.company_size.slice(1)} company
                      </div>
                    )}
                    {selectedMatch.employer.company_website && (
                      <a
                        href={selectedMatch.employer.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <Globe className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                <Button className="w-full" rightIcon={<MessageCircle className="w-4 h-4" />}>
                  Request Coffee Chat
                </Button>
              </div>
            ) : (
              <div
                className="sticky top-6 p-8 rounded-2xl text-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
                <p style={{ color: 'var(--color-textMuted)' }}>
                  Select a match to see detailed compatibility insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
