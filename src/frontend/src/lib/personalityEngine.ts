/**
 * Amber Personality Engine
 *
 * A sophisticated scoring system that derives:
 * - OCEAN (Big Five) personality scores
 * - Trait constellations (clusters of related traits)
 * - Work style preferences
 * - Culture fit predictions
 *
 * The engine maps scenario-based responses to personality dimensions
 * using weighted scoring and trait correlation matrices.
 */

// ============================================
// TYPES
// ============================================

export interface AssessmentResponse {
  questionId: string;
  answerId?: string;        // For multiple choice
  sliderValue?: number;     // For slider questions
  rankingOrder?: string[];  // For ranking questions
  reflectionText?: string;  // For open-ended questions
  timestamp: number;
}

export interface OCEANScores {
  openness: number;           // 0-100: Creativity, curiosity, openness to experience
  conscientiousness: number;  // 0-100: Organization, dependability, self-discipline
  extraversion: number;       // 0-100: Sociability, assertiveness, positive emotions
  agreeableness: number;      // 0-100: Cooperation, trust, altruism
  neuroticism: number;        // 0-100: Emotional stability (inverted: low = stable)
}

export interface TraitConstellation {
  name: string;
  description: string;
  icon: string;
  strength: number;  // 0-100
  traits: string[];
}

export interface WorkStyleProfile {
  collaborationStyle: 'solo' | 'pair' | 'team' | 'fluid';
  decisionStyle: 'intuitive' | 'analytical' | 'collaborative' | 'decisive';
  communicationStyle: 'direct' | 'diplomatic' | 'expressive' | 'reserved';
  pacePreference: 'steady' | 'intense' | 'flexible' | 'rhythmic';
  structureNeed: 'high' | 'moderate' | 'low' | 'contextual';
}

export interface MotivationDrivers {
  primary: string;
  secondary: string;
  tertiary: string;
  scores: Record<string, number>;
}

export interface CandidateProfile {
  id: string;
  ocean: OCEANScores;
  constellations: TraitConstellation[];
  workStyle: WorkStyleProfile;
  motivations: MotivationDrivers;
  traitScores: Record<string, number>;
  personalitySummary: string;
  strengthAreas: string[];
  growthAreas: string[];
  idealEnvironment: string[];
  calculatedAt: number;
}

export interface EmployerCultureProfile {
  id: string;
  cultureType: string;
  cultureDescription: string;
  valuesPriority: string[];
  idealCandidateOCEAN: OCEANScores;
  idealCandidateTraits: Record<string, number>;
  teamDynamics: string;
  decisionCulture: string;
  innovationLevel: number;
  workIntensity: number;
  hierarchyLevel: number;
  transparencyLevel: number;
  calculatedAt: number;
}

export interface MatchScore {
  overall: number;
  breakdown: {
    oceanFit: number;
    traitFit: number;
    valueFit: number;
    workStyleFit: number;
  };
  strengths: string[];
  potentialChallenges: string[];
  compatibilityInsights: string[];
}

// ============================================
// TRAIT TO OCEAN MAPPING MATRIX
// ============================================

/**
 * Trait-to-OCEAN correlation matrix.
 *
 * Maps granular personality traits (e.g., "collaboration", "innovation") to
 * their correlations with each Big Five dimension. Values range from -1 to 1:
 *   - Positive: higher trait score pushes the OCEAN dimension up
 *   - Negative: higher trait score pushes the OCEAN dimension down
 *
 * Example: "collaboration" has extraversion: 0.6, agreeableness: 0.7, meaning
 * a high collaboration score contributes positively to both E and A dimensions.
 *
 * This matrix is the bridge between the assessment questions (which measure
 * granular traits) and the OCEAN model (which the matching engine uses).
 */
const traitToOceanMatrix: Record<string, Partial<Record<keyof OCEANScores, number>>> = {
  // Collaboration & Social traits
  collaboration: { extraversion: 0.6, agreeableness: 0.7 },
  independence: { extraversion: -0.3, openness: 0.2 },
  social: { extraversion: 0.9, agreeableness: 0.4 },
  leadership: { extraversion: 0.7, conscientiousness: 0.4, openness: 0.3 },
  support: { agreeableness: 0.8, conscientiousness: 0.3 },

  // Structure & Organization traits
  structure: { conscientiousness: 0.9, openness: -0.3 },
  organization: { conscientiousness: 0.9 },
  planning: { conscientiousness: 0.8, neuroticism: -0.2 },
  flexibility: { openness: 0.7, conscientiousness: -0.3 },
  spontaneity: { openness: 0.6, conscientiousness: -0.4 },

  // Innovation & Creativity traits
  innovation: { openness: 0.9, conscientiousness: -0.2 },
  creativity: { openness: 0.9 },
  curiosity: { openness: 0.8 },
  pragmatism: { conscientiousness: 0.5, openness: -0.2 },

  // Risk & Ambition traits
  risk: { openness: 0.5, conscientiousness: -0.3, extraversion: 0.3 },
  ambition: { conscientiousness: 0.5, extraversion: 0.4 },
  achievement: { conscientiousness: 0.6, extraversion: 0.3 },
  stability: { conscientiousness: 0.4, neuroticism: -0.5, openness: -0.3 },
  caution: { conscientiousness: 0.4, neuroticism: 0.3 },

  // Communication traits
  directness: { extraversion: 0.4, agreeableness: -0.3 },
  diplomacy: { agreeableness: 0.7, conscientiousness: 0.3 },
  assertiveness: { extraversion: 0.7, agreeableness: -0.2 },
  empathy: { agreeableness: 0.8, openness: 0.3 },

  // Emotional traits
  intensity: { extraversion: 0.5, neuroticism: 0.3 },
  patience: { agreeableness: 0.5, neuroticism: -0.4, conscientiousness: 0.3 },
  resilience: { neuroticism: -0.7, conscientiousness: 0.4 },

  // Values & Motivation traits
  impact: { openness: 0.4, conscientiousness: 0.3 },
  growth: { openness: 0.6, conscientiousness: 0.4 },
  recognition: { extraversion: 0.5, neuroticism: 0.2 },
  connection: { extraversion: 0.6, agreeableness: 0.7 },
  autonomy: { openness: 0.4, extraversion: -0.2 },

  // Work style traits
  depth: { conscientiousness: 0.5, openness: 0.4 },
  breadth: { openness: 0.7, conscientiousness: -0.2 },
  focus: { conscientiousness: 0.7, neuroticism: -0.3 },
  mastery: { conscientiousness: 0.7, openness: 0.3 },

  // Accountability traits
  honesty: { agreeableness: 0.4, conscientiousness: 0.6 },
  accountability: { conscientiousness: 0.8, agreeableness: 0.3 },
  ownership: { conscientiousness: 0.7, extraversion: 0.2 },

  // Analytical traits
  analytical: { conscientiousness: 0.5, openness: 0.4 },
  strategic: { openness: 0.5, conscientiousness: 0.4 },
  thoroughness: { conscientiousness: 0.8 },

  // Work Values traits (SDT-based: Deci & Ryan, 2000)
  purpose: { openness: 0.4, agreeableness: 0.3, conscientiousness: 0.2 },
  intrinsic_motivation: { openness: 0.5, conscientiousness: 0.3 },
  financial_security: { conscientiousness: 0.4, neuroticism: 0.3 },
  self_direction: { openness: 0.5, extraversion: -0.2 },
  cooperation: { agreeableness: 0.8, extraversion: 0.3 },
  competition: { extraversion: 0.5, agreeableness: -0.4 },
  versatility: { openness: 0.6, conscientiousness: -0.2 },

  // Situational Judgment traits (McDaniel et al., 2007)
  courage: { extraversion: 0.4, agreeableness: -0.2, neuroticism: -0.5 },
  emotional_stability: { neuroticism: -0.9 },
  emotional_regulation: { neuroticism: -0.7, conscientiousness: 0.3 },
  optimism: { extraversion: 0.5, neuroticism: -0.6 },
  initiative: { extraversion: 0.4, conscientiousness: 0.5, openness: 0.3 },
  emotional_expression: { extraversion: 0.6, agreeableness: 0.3, neuroticism: 0.2 },
  process: { conscientiousness: 0.7, openness: -0.2 },
  boundaries: { conscientiousness: 0.3, agreeableness: -0.2, neuroticism: -0.3 },

  // Cognitive Pattern traits (based on cognitive psychology)
  intuition: { openness: 0.5, extraversion: 0.2, conscientiousness: -0.2 },
  multitasking: { extraversion: 0.3, openness: 0.2, conscientiousness: -0.3 },
  complexity_tolerance: { openness: 0.7, conscientiousness: 0.3 },
  openness: { openness: 0.9 },
};

// ============================================
// TRAIT CONSTELLATIONS
// ============================================

const constellationDefinitions: Array<{
  name: string;
  description: string;
  icon: string;
  requiredTraits: string[];
  weights: Record<string, number>;
}> = [
  {
    name: 'The Innovator',
    description: 'Thrives on new ideas, challenges conventions, sees possibilities others miss',
    icon: 'lightbulb',
    requiredTraits: ['innovation', 'creativity', 'risk', 'openness'],
    weights: { innovation: 0.35, creativity: 0.25, risk: 0.2, curiosity: 0.2 }
  },
  {
    name: 'The Architect',
    description: 'Builds systems, thinks long-term, creates order from chaos',
    icon: 'layers',
    requiredTraits: ['structure', 'planning', 'analytical', 'thoroughness'],
    weights: { structure: 0.3, planning: 0.25, analytical: 0.25, organization: 0.2 }
  },
  {
    name: 'The Catalyst',
    description: 'Energizes teams, drives momentum, makes things happen',
    icon: 'zap',
    requiredTraits: ['leadership', 'intensity', 'assertiveness', 'ambition'],
    weights: { leadership: 0.3, intensity: 0.25, assertiveness: 0.25, drive: 0.2 }
  },
  {
    name: 'The Harmonizer',
    description: 'Bridges differences, builds consensus, nurtures relationships',
    icon: 'heart',
    requiredTraits: ['diplomacy', 'empathy', 'collaboration', 'support'],
    weights: { diplomacy: 0.3, empathy: 0.25, collaboration: 0.25, connection: 0.2 }
  },
  {
    name: 'The Craftsperson',
    description: 'Pursues excellence, masters their domain, quality over quantity',
    icon: 'target',
    requiredTraits: ['depth', 'quality', 'mastery', 'focus'],
    weights: { depth: 0.3, quality: 0.25, mastery: 0.25, precision: 0.2 }
  },
  {
    name: 'The Explorer',
    description: 'Seeks new frontiers, adapts quickly, comfortable with uncertainty',
    icon: 'compass',
    requiredTraits: ['flexibility', 'adaptability', 'curiosity', 'risk'],
    weights: { flexibility: 0.3, adaptability: 0.25, curiosity: 0.25, adventure: 0.2 }
  },
  {
    name: 'The Anchor',
    description: 'Provides stability, reliable foundation, steady in storms',
    icon: 'anchor',
    requiredTraits: ['stability', 'reliability', 'consistency', 'patience'],
    weights: { stability: 0.3, reliability: 0.25, consistency: 0.25, support: 0.2 }
  },
  {
    name: 'The Strategist',
    description: 'Sees the big picture, thinks several moves ahead, connects dots',
    icon: 'brain',
    requiredTraits: ['strategic', 'analytical', 'vision', 'planning'],
    weights: { strategic: 0.35, analytical: 0.25, vision: 0.2, planning: 0.2 }
  }
];

// ============================================
// SCORING ENGINE
// ============================================

export class PersonalityEngine {
  private responses: AssessmentResponse[] = [];
  private traitScores: Record<string, number[]> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.responses = [];
    this.traitScores = {};
  }

  /**
   * Process a single response and update trait scores
   */
  processResponse(
    response: AssessmentResponse,
    questionData: {
      type: string;
      options?: Array<{ id: string; traitScores: Record<string, number> }>;
      sliderConfig?: { trait: string };
    }
  ): void {
    this.responses.push(response);

    if (questionData.type === 'slider' && response.sliderValue !== undefined) {
      const trait = questionData.sliderConfig?.trait;
      if (trait) {
        this.addTraitScore(trait, response.sliderValue);
      }
    } else if (questionData.type === 'ranking' && response.rankingOrder) {
      // For rankings, assign decreasing scores based on position
      response.rankingOrder.forEach((optionId, index) => {
        const option = questionData.options?.find(o => o.id === optionId);
        if (option) {
          const positionScore = 100 - (index * (100 / response.rankingOrder!.length));
          Object.entries(option.traitScores).forEach(([trait, _]) => {
            this.addTraitScore(trait, positionScore);
          });
        }
      });
    } else if (response.answerId && questionData.options) {
      const selectedOption = questionData.options.find(o => o.id === response.answerId);
      if (selectedOption) {
        Object.entries(selectedOption.traitScores).forEach(([trait, score]) => {
          this.addTraitScore(trait, score);
        });
      }
    }
  }

  private addTraitScore(trait: string, score: number): void {
    if (!this.traitScores[trait]) {
      this.traitScores[trait] = [];
    }
    this.traitScores[trait].push(score);
  }

  /**
   * Calculate aggregated trait scores
   */
  getAggregatedTraitScores(): Record<string, number> {
    const aggregated: Record<string, number> = {};

    Object.entries(this.traitScores).forEach(([trait, scores]) => {
      if (scores.length > 0) {
        // Use weighted average favoring recent responses slightly
        const weightedSum = scores.reduce((sum, score, index) => {
          const weight = 1 + (index * 0.1); // Later responses weighted slightly more
          return sum + (score * weight);
        }, 0);
        const totalWeight = scores.reduce((sum, _, index) => sum + (1 + index * 0.1), 0);
        aggregated[trait] = Math.round(weightedSum / totalWeight);
      }
    });

    return aggregated;
  }

  /**
   * Calculate OCEAN scores from trait scores
   */
  calculateOCEAN(): OCEANScores {
    const traitScores = this.getAggregatedTraitScores();

    const ocean: OCEANScores = {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    };

    const oceanContributions: Record<keyof OCEANScores, number[]> = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      neuroticism: []
    };

    // Map each trait to OCEAN dimensions
    Object.entries(traitScores).forEach(([trait, score]) => {
      const mapping = traitToOceanMatrix[trait];
      if (mapping) {
        Object.entries(mapping).forEach(([oceanDim, correlation]) => {
          const dimension = oceanDim as keyof OCEANScores;
          // Apply correlation: positive correlation means trait pushes score up
          const contribution = 50 + ((score - 50) * (correlation as number));
          oceanContributions[dimension].push(contribution);
        });
      }
    });

    // Average contributions for each OCEAN dimension
    Object.entries(oceanContributions).forEach(([dim, contributions]) => {
      if (contributions.length > 0) {
        const avg = contributions.reduce((a, b) => a + b, 0) / contributions.length;
        ocean[dim as keyof OCEANScores] = Math.round(Math.max(0, Math.min(100, avg)));
      }
    });

    return ocean;
  }

  /**
   * Identify trait constellations
   */
  calculateConstellations(): TraitConstellation[] {
    const traitScores = this.getAggregatedTraitScores();
    const constellations: TraitConstellation[] = [];

    constellationDefinitions.forEach(def => {
      let totalScore = 0;
      let validTraits = 0;

      Object.entries(def.weights).forEach(([trait, weight]) => {
        const score = traitScores[trait];
        if (score !== undefined) {
          totalScore += score * weight;
          validTraits++;
        }
      });

      if (validTraits > 0) {
        const normalizedScore = totalScore / Object.values(def.weights).reduce((a, b) => a + b, 0);

        if (normalizedScore >= 60) { // Threshold for constellation activation
          constellations.push({
            name: def.name,
            description: def.description,
            icon: def.icon,
            strength: Math.round(normalizedScore),
            traits: def.requiredTraits
          });
        }
      }
    });

    // Sort by strength and return top constellations
    return constellations.sort((a, b) => b.strength - a.strength).slice(0, 3);
  }

  /**
   * Determine work style profile
   */
  calculateWorkStyle(): WorkStyleProfile {
    const traits = this.getAggregatedTraitScores();

    // Collaboration style
    const collabScore = (traits.collaboration || 50) - (traits.independence || 50);
    let collaborationStyle: WorkStyleProfile['collaborationStyle'];
    if (collabScore < -20) collaborationStyle = 'solo';
    else if (collabScore < 10) collaborationStyle = 'pair';
    else if (collabScore < 30) collaborationStyle = 'fluid';
    else collaborationStyle = 'team';

    // Decision style
    const analyticalScore = traits.analytical || 50;
    const collaborativeDecision = traits.collaboration || 50;
    let decisionStyle: WorkStyleProfile['decisionStyle'];
    if (analyticalScore > 70) decisionStyle = 'analytical';
    else if (collaborativeDecision > 70) decisionStyle = 'collaborative';
    else if (traits.assertiveness && traits.assertiveness > 70) decisionStyle = 'decisive';
    else decisionStyle = 'intuitive';

    // Communication style
    const directScore = traits.directness || 50;
    const diplomatScore = traits.diplomacy || 50;
    let communicationStyle: WorkStyleProfile['communicationStyle'];
    if (directScore > 70) communicationStyle = 'direct';
    else if (diplomatScore > 70) communicationStyle = 'diplomatic';
    else if (traits.social && traits.social > 70) communicationStyle = 'expressive';
    else communicationStyle = 'reserved';

    // Pace preference
    const intensityScore = traits.intensity || 50;
    let pacePreference: WorkStyleProfile['pacePreference'];
    if (intensityScore > 70) pacePreference = 'intense';
    else if (intensityScore < 30) pacePreference = 'steady';
    else if (traits.flexibility && traits.flexibility > 60) pacePreference = 'flexible';
    else pacePreference = 'rhythmic';

    // Structure need
    const structureScore = traits.structure || 50;
    let structureNeed: WorkStyleProfile['structureNeed'];
    if (structureScore > 70) structureNeed = 'high';
    else if (structureScore < 30) structureNeed = 'low';
    else if (traits.flexibility && traits.flexibility > 60) structureNeed = 'contextual';
    else structureNeed = 'moderate';

    return {
      collaborationStyle,
      decisionStyle,
      communicationStyle,
      pacePreference,
      structureNeed
    };
  }

  /**
   * Calculate motivation drivers
   */
  calculateMotivations(): MotivationDrivers {
    const traits = this.getAggregatedTraitScores();

    const motivationTraits = {
      impact: traits.impact || 50,
      growth: traits.growth || 50,
      stability: traits.stability || 50,
      recognition: traits.recognition || 50,
      connection: traits.connection || 50,
      autonomy: traits.autonomy || 50
    };

    // Sort by score
    const sorted = Object.entries(motivationTraits)
      .sort((a, b) => b[1] - a[1]);

    return {
      primary: sorted[0][0],
      secondary: sorted[1][0],
      tertiary: sorted[2][0],
      scores: motivationTraits
    };
  }

  /**
   * Generate personality summary text
   */
  generateSummary(ocean: OCEANScores, constellations: TraitConstellation[]): string {
    const traits = this.getAggregatedTraitScores();

    const summaryParts: string[] = [];

    // Opening based on dominant OCEAN trait
    const dominantOcean = Object.entries(ocean)
      .sort((a, b) => b[1] - a[1])[0];

    const oceanDescriptions: Record<string, string> = {
      openness: "You're a creative thinker who embraces new ideas and experiences.",
      conscientiousness: "You're organized and dependable, with a strong sense of purpose.",
      extraversion: "You draw energy from people and thrive in collaborative environments.",
      agreeableness: "You value harmony and are naturally attuned to others' needs.",
      neuroticism: "You feel things deeply and bring emotional intelligence to your work."
    };

    summaryParts.push(oceanDescriptions[dominantOcean[0]] || '');

    // Add constellation flavor
    if (constellations.length > 0) {
      const topConstellation = constellations[0];
      summaryParts.push(`As "${topConstellation.name}", ${topConstellation.description.toLowerCase()}.`);
    }

    // Add work style insight
    if (traits.collaboration && traits.collaboration > 70) {
      summaryParts.push("You do your best work alongside others.");
    } else if (traits.independence && traits.independence > 70) {
      summaryParts.push("You excel when given autonomy to work independently.");
    }

    return summaryParts.join(' ');
  }

  /**
   * Identify strength and growth areas
   */
  identifyStrengthsAndGrowth(): { strengths: string[]; growth: string[] } {
    const traits = this.getAggregatedTraitScores();
    const sorted = Object.entries(traits).sort((a, b) => b[1] - a[1]);

    const traitLabels: Record<string, string> = {
      collaboration: 'Team collaboration',
      leadership: 'Taking initiative',
      innovation: 'Creative problem-solving',
      analytical: 'Data-driven decisions',
      diplomacy: 'Building consensus',
      directness: 'Clear communication',
      structure: 'Organization',
      flexibility: 'Adaptability',
      empathy: 'Understanding others',
      resilience: 'Handling pressure'
    };

    const strengths = sorted.slice(0, 4)
      .filter(([_, score]) => score >= 70)
      .map(([trait, _]) => traitLabels[trait] || trait);

    const growth = sorted.slice(-3)
      .filter(([_, score]) => score < 50)
      .map(([trait, _]) => traitLabels[trait] || trait);

    return { strengths, growth };
  }

  /**
   * Generate full candidate profile
   */
  generateCandidateProfile(userId: string): CandidateProfile {
    const ocean = this.calculateOCEAN();
    const constellations = this.calculateConstellations();
    const workStyle = this.calculateWorkStyle();
    const motivations = this.calculateMotivations();
    const { strengths, growth } = this.identifyStrengthsAndGrowth();
    const summary = this.generateSummary(ocean, constellations);

    // Ideal environment based on traits
    const idealEnvironment: string[] = [];
    const traits = this.getAggregatedTraitScores();

    if (traits.collaboration > 60) idealEnvironment.push('Collaborative team dynamics');
    if (traits.independence > 60) idealEnvironment.push('Autonomous work opportunities');
    if (traits.structure > 60) idealEnvironment.push('Clear processes and expectations');
    if (traits.flexibility > 60) idealEnvironment.push('Flexible and adaptive culture');
    if (traits.innovation > 60) idealEnvironment.push('Innovation-focused environment');
    if (traits.stability > 60) idealEnvironment.push('Established, stable organization');

    return {
      id: userId,
      ocean,
      constellations,
      workStyle,
      motivations,
      traitScores: this.getAggregatedTraitScores(),
      personalitySummary: summary,
      strengthAreas: strengths,
      growthAreas: growth,
      idealEnvironment,
      calculatedAt: Date.now()
    };
  }
}

// ============================================
// COMBINED MULTI-ASSESSMENT SCORING
// ============================================

/**
 * Combines OCEAN scores from multiple assessments using weighted averaging.
 *
 * The core personality assessment provides the base OCEAN scores (55% weight).
 * Supplementary assessments refine the profile with additional data:
 *   - Visual Perception: 10% (perceptual modifiers, applied additively)
 *   - Work Values: 12% (motivational supplement)
 *   - Situational Judgment: 12% (behavioral supplement)
 *   - Cognitive Patterns: 11% (cognitive style supplement)
 *
 * If a supplementary assessment has not been taken, its weight is redistributed
 * proportionally among the available assessments. This means a candidate who has
 * only completed the core assessment gets the same results as if they had a 100%
 * weight on core — no penalty for skipping supplementary assessments.
 */
export function calculateCombinedOCEAN(
  coreScores: OCEANScores,
  supplementaryScores?: {
    visualPerception?: Partial<Record<keyof OCEANScores, number>>;
    workValues?: OCEANScores;
    situationalJudgment?: OCEANScores;
    cognitivePatterns?: OCEANScores;
  }
): OCEANScores {
  const weights = {
    core: 0.55,
    visual: 0.1,
    workValues: 0.12,
    situationalJudgment: 0.12,
    cognitivePatterns: 0.11,
  };

  // Determine which supplementary assessments are available
  const hasVisual = !!supplementaryScores?.visualPerception;
  const hasWorkValues = !!supplementaryScores?.workValues;
  const hasSJ = !!supplementaryScores?.situationalJudgment;
  const hasCP = !!supplementaryScores?.cognitivePatterns;

  // Calculate total weight of unavailable assessments to redistribute
  let redistributeWeight = 0;
  if (!hasVisual) redistributeWeight += weights.visual;
  if (!hasWorkValues) redistributeWeight += weights.workValues;
  if (!hasSJ) redistributeWeight += weights.situationalJudgment;
  if (!hasCP) redistributeWeight += weights.cognitivePatterns;

  // Calculate total weight of available assessments (excluding core)
  const availableSupplementary = (hasVisual ? weights.visual : 0)
    + (hasWorkValues ? weights.workValues : 0)
    + (hasSJ ? weights.situationalJudgment : 0)
    + (hasCP ? weights.cognitivePatterns : 0);

  // Redistribute proportionally
  const totalAvailable = weights.core + availableSupplementary;
  const coreWeight = weights.core + (availableSupplementary === 0 ? redistributeWeight : redistributeWeight * (weights.core / totalAvailable));
  const visualWeight = hasVisual ? weights.visual + (redistributeWeight * (weights.visual / totalAvailable)) : 0;
  const workValuesWeight = hasWorkValues ? weights.workValues + (redistributeWeight * (weights.workValues / totalAvailable)) : 0;
  const sjWeight = hasSJ ? weights.situationalJudgment + (redistributeWeight * (weights.situationalJudgment / totalAvailable)) : 0;
  const cpWeight = hasCP ? weights.cognitivePatterns + (redistributeWeight * (weights.cognitivePatterns / totalAvailable)) : 0;

  const dimensions: (keyof OCEANScores)[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  const combined: OCEANScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  for (const dim of dimensions) {
    let score = coreScores[dim] * coreWeight;

    if (hasVisual && supplementaryScores!.visualPerception![dim] !== undefined) {
      // Visual perception provides modifiers (additive), not absolute scores
      // Apply as a modifier to the core score, scaled by weight
      score += supplementaryScores!.visualPerception![dim]! * visualWeight * 2;
    }
    if (hasWorkValues) {
      score += supplementaryScores!.workValues![dim] * workValuesWeight;
    }
    if (hasSJ) {
      score += supplementaryScores!.situationalJudgment![dim] * sjWeight;
    }
    if (hasCP) {
      score += supplementaryScores!.cognitivePatterns![dim] * cpWeight;
    }

    combined[dim] = Math.round(Math.max(0, Math.min(100, score)));
  }

  return combined;
}

// ============================================
// EMPLOYER CULTURE ENGINE
// ============================================

export class CultureEngine {
  private responses: AssessmentResponse[] = [];
  private cultureScores: Record<string, number[]> = {};

  reset(): void {
    this.responses = [];
    this.cultureScores = {};
  }

  processResponse(
    response: AssessmentResponse,
    questionData: {
      type: string;
      options?: Array<{ id: string; traitScores: Record<string, number> }>;
      sliderConfig?: { trait: string };
    }
  ): void {
    this.responses.push(response);

    if (questionData.type === 'slider' && response.sliderValue !== undefined) {
      const trait = questionData.sliderConfig?.trait;
      if (trait) {
        this.addCultureScore(trait, response.sliderValue);
      }
    } else if (questionData.type === 'ranking' && response.rankingOrder) {
      response.rankingOrder.forEach((optionId, index) => {
        const option = questionData.options?.find(o => o.id === optionId);
        if (option) {
          const positionScore = 100 - (index * (100 / response.rankingOrder!.length));
          Object.entries(option.traitScores).forEach(([trait, _]) => {
            this.addCultureScore(trait, positionScore);
          });
        }
      });
    } else if (response.answerId && questionData.options) {
      const selectedOption = questionData.options.find(o => o.id === response.answerId);
      if (selectedOption) {
        Object.entries(selectedOption.traitScores).forEach(([trait, score]) => {
          this.addCultureScore(trait, score);
        });
      }
    }
  }

  private addCultureScore(trait: string, score: number): void {
    if (!this.cultureScores[trait]) {
      this.cultureScores[trait] = [];
    }
    this.cultureScores[trait].push(score);
  }

  getAggregatedScores(): Record<string, number> {
    const aggregated: Record<string, number> = {};
    Object.entries(this.cultureScores).forEach(([trait, scores]) => {
      if (scores.length > 0) {
        aggregated[trait] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    });
    return aggregated;
  }

  /**
   * Determine ideal candidate OCEAN profile based on culture
   */
  calculateIdealCandidateOCEAN(): OCEANScores {
    const scores = this.getAggregatedScores();

    return {
      openness: Math.round(
        (scores.innovation || 50) * 0.4 +
        (scores.creativity || 50) * 0.3 +
        (100 - (scores.stability || 50)) * 0.3
      ),
      conscientiousness: Math.round(
        (scores.results || 50) * 0.3 +
        (scores.excellence || 50) * 0.3 +
        (scores.efficiency || 50) * 0.2 +
        (scores.thoroughness || 50) * 0.2
      ),
      extraversion: Math.round(
        (scores.collaboration || 50) * 0.4 +
        (scores.energy || 50) * 0.3 +
        (scores.competition || 50) * 0.3
      ),
      agreeableness: Math.round(
        (scores.warmth || 50) * 0.4 +
        (scores.connection || 50) * 0.3 +
        (scores.consensus || 50) * 0.3
      ),
      neuroticism: Math.round(
        100 - (
          (scores.resilience || 50) * 0.5 +
          (scores.intensity || 50) * 0.5
        )
      )
    };
  }

  /**
   * Determine culture type
   */
  determineCultureType(): { type: string; description: string } {
    const scores = this.getAggregatedScores();

    const types = [
      {
        name: 'Innovator Culture',
        description: 'Fast-paced, creative environment that values new ideas and calculated risks',
        score: (scores.innovation || 0) + (scores.risk || 0) + (scores.creativity || 0)
      },
      {
        name: 'Achievement Culture',
        description: 'Results-driven environment that celebrates excellence and competition',
        score: (scores.results || 0) + (scores.competition || 0) + (scores.excellence || 0)
      },
      {
        name: 'Collaborative Culture',
        description: 'Team-focused environment that values consensus and relationships',
        score: (scores.collaboration || 0) + (scores.consensus || 0) + (scores.connection || 0)
      },
      {
        name: 'Structured Culture',
        description: 'Process-oriented environment that values stability and clarity',
        score: (scores.efficiency || 0) + (scores.hierarchy || 0) + (scores.stability || 0)
      }
    ];

    const dominant = types.sort((a, b) => b.score - a.score)[0];
    return { type: dominant.name, description: dominant.description };
  }

  /**
   * Generate full employer culture profile
   */
  generateCultureProfile(userId: string): EmployerCultureProfile {
    const scores = this.getAggregatedScores();
    const { type, description } = this.determineCultureType();
    const idealOCEAN = this.calculateIdealCandidateOCEAN();

    // Determine values priority
    const valueScores = {
      results: scores.results || 50,
      innovation: scores.innovation || 50,
      collaboration: scores.collaboration || 50,
      excellence: scores.excellence || 50,
      growth: scores.growth || 50,
      integrity: scores.integrity || 50
    };

    const valuesPriority = Object.entries(valueScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([v]) => v);

    return {
      id: userId,
      cultureType: type,
      cultureDescription: description,
      valuesPriority,
      idealCandidateOCEAN: idealOCEAN,
      idealCandidateTraits: scores,
      teamDynamics: scores.collaboration > 70 ? 'Highly Collaborative' :
                    scores.collaboration < 40 ? 'Independent Contributors' : 'Balanced',
      decisionCulture: scores.consensus > 70 ? 'Consensus-Driven' :
                       scores.speed > 70 ? 'Fast & Decisive' : 'Balanced',
      innovationLevel: scores.innovation || 50,
      workIntensity: scores.intensity || 50,
      hierarchyLevel: scores.hierarchy || 50,
      transparencyLevel: scores.transparency || 50,
      calculatedAt: Date.now()
    };
  }
}

// ============================================
// MATCHING ENGINE
// ============================================

export class MatchingEngine {
  /**
   * Calculate match score between candidate and employer
   */
  static calculateMatch(
    candidate: CandidateProfile,
    employer: EmployerCultureProfile
  ): MatchScore {
    // OCEAN fit (0-100)
    const oceanFit = this.calculateOceanFit(candidate.ocean, employer.idealCandidateOCEAN);

    // Trait fit (0-100)
    const traitFit = this.calculateTraitFit(candidate.traitScores, employer.idealCandidateTraits);

    // Value fit (0-100)
    const valueFit = this.calculateValueFit(candidate.motivations.scores, employer.valuesPriority);

    // Work style fit (0-100)
    const workStyleFit = this.calculateWorkStyleFit(candidate.workStyle, employer);

    // Overall weighted score
    const overall = Math.round(
      oceanFit * 0.3 +
      traitFit * 0.25 +
      valueFit * 0.25 +
      workStyleFit * 0.2
    );

    // Generate insights
    const { strengths, challenges, insights } = this.generateMatchInsights(
      candidate, employer, { oceanFit, traitFit, valueFit, workStyleFit }
    );

    return {
      overall,
      breakdown: { oceanFit, traitFit, valueFit, workStyleFit },
      strengths,
      potentialChallenges: challenges,
      compatibilityInsights: insights
    };
  }

  private static calculateOceanFit(candidate: OCEANScores, ideal: OCEANScores): number {
    const dimensions: (keyof OCEANScores)[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    let totalFit = 0;
    dimensions.forEach(dim => {
      const diff = Math.abs(candidate[dim] - ideal[dim]);
      totalFit += 100 - diff;
    });

    return Math.round(totalFit / dimensions.length);
  }

  private static calculateTraitFit(candidateTraits: Record<string, number>, employerTraits: Record<string, number>): number {
    const commonTraits = Object.keys(candidateTraits).filter(t => employerTraits[t] !== undefined);

    if (commonTraits.length === 0) return 50;

    let totalFit = 0;
    commonTraits.forEach(trait => {
      const diff = Math.abs(candidateTraits[trait] - employerTraits[trait]);
      totalFit += 100 - diff;
    });

    return Math.round(totalFit / commonTraits.length);
  }

  private static calculateValueFit(candidateMotivations: Record<string, number>, employerValues: string[]): number {
    let totalFit = 0;
    let count = 0;

    employerValues.forEach((value, index) => {
      const weight = 1 - (index * 0.2); // First value weighted more
      const candidateScore = candidateMotivations[value] || 50;
      totalFit += candidateScore * weight;
      count += weight;
    });

    return Math.round(totalFit / count);
  }

  private static calculateWorkStyleFit(workStyle: WorkStyleProfile, employer: EmployerCultureProfile): number {
    let fit = 50;

    // Collaboration style fit
    if (workStyle.collaborationStyle === 'team' && employer.teamDynamics === 'Highly Collaborative') fit += 15;
    if (workStyle.collaborationStyle === 'solo' && employer.teamDynamics === 'Independent Contributors') fit += 15;

    // Pace fit
    if (workStyle.pacePreference === 'intense' && employer.workIntensity > 70) fit += 10;
    if (workStyle.pacePreference === 'steady' && employer.workIntensity < 40) fit += 10;

    // Structure fit
    if (workStyle.structureNeed === 'high' && employer.hierarchyLevel > 60) fit += 10;
    if (workStyle.structureNeed === 'low' && employer.hierarchyLevel < 40) fit += 10;

    return Math.min(100, Math.max(0, fit));
  }

  private static generateMatchInsights(
    candidate: CandidateProfile,
    employer: EmployerCultureProfile,
    scores: { oceanFit: number; traitFit: number; valueFit: number; workStyleFit: number }
  ): { strengths: string[]; challenges: string[]; insights: string[] } {
    const strengths: string[] = [];
    const challenges: string[] = [];
    const insights: string[] = [];

    if (scores.oceanFit > 80) strengths.push('Strong personality alignment with company culture');
    if (scores.valueFit > 80) strengths.push('Shared values and priorities');
    if (scores.workStyleFit > 80) strengths.push('Compatible work style');

    if (scores.oceanFit < 50) challenges.push('Personality style may require adaptation');
    if (scores.valueFit < 50) challenges.push('Different motivational drivers');
    if (scores.workStyleFit < 50) challenges.push('Work style preferences differ');

    // Add specific insights based on constellations
    if (candidate.constellations.some(c => c.name === 'The Innovator') && employer.innovationLevel > 70) {
      insights.push('Your creative drive aligns well with their innovation focus');
    }

    if (candidate.constellations.some(c => c.name === 'The Harmonizer') && employer.teamDynamics === 'Highly Collaborative') {
      insights.push('Your collaborative nature fits their team-oriented culture');
    }

    return { strengths, challenges, insights };
  }
}

// Export singleton instances for use across the app
export const personalityEngine = new PersonalityEngine();
export const cultureEngine = new CultureEngine();
