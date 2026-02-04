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
  Briefcase,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
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
  work_style: string | null;
}

interface RoleData {
  id: string;
  title: string;
  description: string;
  location: string;
  work_style: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  required_openness_min: number | null;
  required_openness_max: number | null;
  required_conscientiousness_min: number | null;
  required_conscientiousness_max: number | null;
  required_extraversion_min: number | null;
  required_extraversion_max: number | null;
  required_agreeableness_min: number | null;
  required_agreeableness_max: number | null;
  required_neuroticism_min: number | null;
  required_neuroticism_max: number | null;
  employers: {
    id: string;
    company_name: string;
    description: string;
    company_size: string;
    industry: string;
    location: string;
    company_website: string;
    culture_values: string[];
    openness_preference: number;
    conscientiousness_preference: number;
    extraversion_preference: number;
    agreeableness_preference: number;
    neuroticism_preference: number;
  };
}

interface MatchResult {
  role: RoleData;
  traitMatchScore: number;
  cultureMatchScore: number;
  overallMatchScore: number;
  breakdown: {
    opennessFit: number;
    conscientiousnessFit: number;
    extraversionFit: number;
    agreeablenessFit: number;
    neuroticismFit: number;
    workStyleFit: number;
    valuesFit: number;
    roleFit?: number;
  };
  highlights: string[];
  insights: string[];
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
    "Scanning open roles across companies...",
    "Calculating trait compatibility...",
    "Evaluating culture fit...",
    "Analyzing work style alignment...",
    "Ranking your best matches...",
    "Generating insights...",
  ];

  useEffect(() => {
    if (!user) return;
    loadCandidateData();
  }, [user]);

  const loadCandidateData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
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
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    try {
      // Fetch all active roles with employer data
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*, employers!inner(*)')
        .eq('status', 'active');

      if (error) throw error;

      if (!roles || roles.length === 0) {
        setMatches([]);
        setAgentThinking(false);
        setAgentMessage("No active roles available yet. Check back soon!");
        return;
      }

      const candidateOcean: OCEANScores = {
        openness: candidate.openness_score || 50,
        conscientiousness: candidate.conscientiousness_score || 50,
        extraversion: candidate.extraversion_score || 50,
        agreeableness: candidate.agreeableness_score || 50,
        neuroticism: candidate.neuroticism_score || 50,
      };

      // Calculate matches for each role using the compatibility engine
      const matchResults: MatchResult[] = roles.map((role: RoleData) => {
        const employer = role.employers;

        const result = calculateCompatibility({
          candidateOCEAN: candidateOcean,
          employerPreferences: {
            openness: employer.openness_preference || 50,
            conscientiousness: employer.conscientiousness_preference || 50,
            extraversion: employer.extraversion_preference || 50,
            agreeableness: employer.agreeableness_preference || 50,
            neuroticism: employer.neuroticism_preference || 50,
            cultureValues: employer.culture_values || [],
          },
          candidateWorkStyle: candidate.work_style || undefined,
          roleWorkStyle: role.work_style || undefined,
          roleRequirements: {
            required_openness_min: role.required_openness_min,
            required_openness_max: role.required_openness_max,
            required_conscientiousness_min: role.required_conscientiousness_min,
            required_conscientiousness_max: role.required_conscientiousness_max,
            required_extraversion_min: role.required_extraversion_min,
            required_extraversion_max: role.required_extraversion_max,
            required_agreeableness_min: role.required_agreeableness_min,
            required_agreeableness_max: role.required_agreeableness_max,
            required_neuroticism_min: role.required_neuroticism_min,
            required_neuroticism_max: role.required_neuroticism_max,
            work_style: role.work_style,
          },
        });

        const highlights = generateHighlights(candidateOcean, employer, result.breakdown);
        const insights = generateInsights(candidateOcean, employer, role);

        return {
          role,
          traitMatchScore: result.traitMatchScore,
          cultureMatchScore: result.cultureMatchScore,
          overallMatchScore: result.overallMatchScore,
          breakdown: result.breakdown,
          highlights,
          insights,
        };
      });

      // Sort by overall match score
      matchResults.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

      setMatches(matchResults);
      setAgentMessage(`Found ${matchResults.length} matching roles! Here are your top recommendations.`);
    } catch (err) {
      console.error('Error finding matches:', err);
      setAgentMessage("Had trouble finding matches. Please try again.");
    } finally {
      setAgentThinking(false);
      setIsAnalyzing(false);
    }
  };

  const generateHighlights = (
    candidate: OCEANScores,
    employer: RoleData['employers'],
    breakdown: MatchResult['breakdown']
  ): string[] => {
    const highlights: string[] = [];

    if (breakdown.opennessFit >= 85) {
      highlights.push("Strong alignment on innovation and creativity");
    }
    if (breakdown.conscientiousnessFit >= 85) {
      highlights.push("Excellent match on attention to detail");
    }
    if (breakdown.extraversionFit >= 85) {
      highlights.push("Compatible communication and collaboration styles");
    }
    if (breakdown.agreeablenessFit >= 85) {
      highlights.push("Shared values on teamwork and support");
    }
    if (breakdown.neuroticismFit >= 85) {
      highlights.push("Similar approach to handling pressure");
    }
    if (breakdown.workStyleFit >= 85) {
      highlights.push("Work style preferences align perfectly");
    }
    if (breakdown.valuesFit >= 80) {
      highlights.push("Strong culture values alignment");
    }

    if (employer.company_size === '1-10' || employer.company_size === '11-50') {
      if (candidate.openness > 60) {
        highlights.push("Thrives in dynamic, fast-paced environments");
      }
    }

    return highlights.slice(0, 4);
  };

  const generateInsights = (
    candidate: OCEANScores,
    employer: RoleData['employers'],
    role: RoleData
  ): string[] => {
    const insights: string[] = [];
    const idealOcean = {
      openness: employer.openness_preference || 50,
      conscientiousness: employer.conscientiousness_preference || 50,
      extraversion: employer.extraversion_preference || 50,
      agreeableness: employer.agreeableness_preference || 50,
      neuroticism: employer.neuroticism_preference || 50,
    };

    if (candidate.openness > idealOcean.openness + 15) {
      insights.push("Your creative drive could bring fresh perspectives to this team");
    }
    if (candidate.conscientiousness > idealOcean.conscientiousness + 10) {
      insights.push("Your attention to detail exceeds expectations for this role");
    }
    if (candidate.extraversion < idealOcean.extraversion - 15) {
      insights.push("This role may involve more social interaction than you prefer");
    }

    if (employer.industry === 'Technology') {
      insights.push("Tech industry aligns well with innovation-driven personalities");
    }
    if (employer.industry === 'Healthcare') {
      insights.push("Healthcare sector values empathy and conscientiousness");
    }

    if (role.work_style === 'remote' && candidate.openness > 60) {
      insights.push("Remote work can complement your independent working style");
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

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const formatNum = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
      return `$${n}`;
    };
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `From ${formatNum(min)}`;
    return `Up to ${formatNum(max!)}`;
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
            Take our personality assessment to discover your unique traits and find roles that match your values and work style.
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
                {agentThinking ? agentMessage : `${matches.length} roles analyzed`}
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
                <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
                <p style={{ color: 'var(--color-textMuted)' }}>
                  No active roles available yet. Check back soon!
                </p>
              </div>
            ) : (
              matches.map((match, index) => (
                <button
                  key={match.role.id}
                  onClick={() => setSelectedMatch(match)}
                  className={cn(
                    "w-full p-5 rounded-2xl text-left transition-all",
                    selectedMatch?.role.id === match.role.id
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
                            {match.role.title}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                            {match.role.employers.company_name || 'Company'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {match.role.employers.industry && (
                              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                {match.role.employers.industry}
                              </span>
                            )}
                            {match.role.location && (
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                <MapPin className="w-3 h-3" />
                                {match.role.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-xl font-bold"
                            style={{ color: getMatchColor(match.overallMatchScore) }}
                          >
                            {match.overallMatchScore}%
                          </div>
                          <div
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${getMatchColor(match.overallMatchScore)}20`,
                              color: getMatchColor(match.overallMatchScore),
                            }}
                          >
                            {getMatchLabel(match.overallMatchScore)}
                          </div>
                        </div>
                      </div>

                      {/* Match Breakdown Mini */}
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {match.traitMatchScore}% Traits
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                            {match.cultureMatchScore}% Culture
                          </span>
                        </div>
                        {match.breakdown.workStyleFit && (
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                              {match.breakdown.workStyleFit}% Work Style
                            </span>
                          </div>
                        )}
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
                    {selectedMatch.role.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {selectedMatch.role.employers.company_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    {selectedMatch.role.employers.industry}
                  </p>
                  <div
                    className="text-3xl font-bold mt-3"
                    style={{ color: getMatchColor(selectedMatch.overallMatchScore) }}
                  >
                    {selectedMatch.overallMatchScore}%
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    Overall Match
                  </p>
                </div>

                {/* Detailed Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                    Compatibility Breakdown
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Trait Match', value: selectedMatch.traitMatchScore, icon: Heart, color: 'var(--color-accent)' },
                      { label: 'Culture Fit', value: selectedMatch.cultureMatchScore, icon: Star, color: 'var(--color-warning)' },
                      { label: 'Work Style', value: selectedMatch.breakdown.workStyleFit, icon: Zap, color: 'var(--color-success)' },
                      { label: 'Values Alignment', value: selectedMatch.breakdown.valuesFit, icon: TrendingUp, color: 'var(--color-accent)' },
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
                {selectedMatch.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                      Insights
                    </h4>
                    <ul className="space-y-2">
                      {selectedMatch.insights.map((insight, i) => (
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

                {/* Role & Company Info */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="space-y-2 text-sm">
                    {selectedMatch.role.location && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-4 h-4" />
                        {selectedMatch.role.location}
                      </div>
                    )}
                    {selectedMatch.role.work_style && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <Briefcase className="w-4 h-4" />
                        {selectedMatch.role.work_style.charAt(0).toUpperCase() + selectedMatch.role.work_style.slice(1)}
                      </div>
                    )}
                    {formatSalary(selectedMatch.role.salary_min, selectedMatch.role.salary_max) && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <span className="w-4 h-4 text-center">$</span>
                        {formatSalary(selectedMatch.role.salary_min, selectedMatch.role.salary_max)}
                      </div>
                    )}
                    {selectedMatch.role.employers.company_size && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <Users className="w-4 h-4" />
                        {selectedMatch.role.employers.company_size} employees
                      </div>
                    )}
                    {selectedMatch.role.employers.company_website && (
                      <a
                        href={selectedMatch.role.employers.company_website}
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
                  Express Interest
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
                <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-textMuted)' }} />
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
