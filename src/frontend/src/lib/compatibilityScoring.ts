/**
 * Compatibility Scoring Engine for Project Amber (TypeScript)
 *
 * This module calculates compatibility scores between candidates and employers/roles
 * using the Big Five (OCEAN) personality model.
 */

export interface OCEANScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface EmployerPreferences extends OCEANScores {
  cultureValues?: string[];
}

export interface RoleRequirements {
  required_openness_min?: number | null;
  required_openness_max?: number | null;
  required_conscientiousness_min?: number | null;
  required_conscientiousness_max?: number | null;
  required_extraversion_min?: number | null;
  required_extraversion_max?: number | null;
  required_agreeableness_min?: number | null;
  required_agreeableness_max?: number | null;
  required_neuroticism_min?: number | null;
  required_neuroticism_max?: number | null;
  work_style?: string | null;
}

export interface CompatibilityInput {
  candidateOCEAN: OCEANScores;
  employerPreferences: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    cultureValues?: string[];
  };
  candidateWorkStyle?: string;
  roleWorkStyle?: string;
  roleRequirements?: RoleRequirements;
}

export interface CompatibilityResult {
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
}

// Culture values to OCEAN correlation mapping
const CULTURE_OCEAN_MAP: Record<string, Partial<Record<keyof OCEANScores, number>>> = {
  innovation: { openness: 0.8, conscientiousness: -0.2 },
  transparency: { extraversion: 0.3, agreeableness: 0.4 },
  collaboration: { extraversion: 0.5, agreeableness: 0.7 },
  autonomy: { openness: 0.4, extraversion: -0.3 },
  growth: { openness: 0.6, conscientiousness: 0.4 },
  impact: { conscientiousness: 0.5, openness: 0.3 },
  balance: { neuroticism: -0.5, conscientiousness: 0.2 },
  diversity: { openness: 0.7, agreeableness: 0.5 },
  customer: { conscientiousness: 0.4, agreeableness: 0.3 },
  excellence: { conscientiousness: 0.8 },
  agility: { openness: 0.5, conscientiousness: -0.1 },
  integrity: { conscientiousness: 0.5, agreeableness: 0.4 },
  creativity: { openness: 0.9 },
  stability: { conscientiousness: 0.6, neuroticism: -0.4 },
  speed: { openness: 0.3, conscientiousness: -0.2 },
  quality: { conscientiousness: 0.8, openness: 0.2 },
  mission: { conscientiousness: 0.4, agreeableness: 0.5 },
  empathy: { agreeableness: 0.9 },
  risk: { openness: 0.6, neuroticism: -0.3 },
  trust: { agreeableness: 0.6, conscientiousness: 0.3 },
};

/**
 * Calculate trait match using weighted Euclidean distance
 */
function calculateTraitMatch(
  candidate: OCEANScores,
  employer: OCEANScores
): { score: number; breakdown: Record<string, number> } {
  const traits: (keyof OCEANScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];

  const breakdown: Record<string, number> = {};
  let sumSqDiff = 0;

  for (const trait of traits) {
    const diff = Math.abs(candidate[trait] - employer[trait]);
    const fit = Math.max(0, 100 - diff);
    breakdown[`${trait}Fit`] = Math.round(fit);
    sumSqDiff += diff ** 2;
  }

  // Weighted Euclidean distance (each dim 0-100 range)
  const maxPossible = 5 * 100 ** 2;
  const distanceRatio = Math.sqrt(sumSqDiff) / Math.sqrt(maxPossible);
  const score = Math.max(0, Math.min(100, (1 - distanceRatio) * 100));

  return { score: Math.round(score), breakdown };
}

/**
 * Calculate role-specific fit based on required trait ranges
 */
function calculateRoleFit(
  candidate: OCEANScores,
  role: RoleRequirements
): { score: number; breakdown: Record<string, number> } {
  const traits: (keyof OCEANScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];

  const scores: number[] = [];
  const breakdown: Record<string, number> = {};

  for (const trait of traits) {
    const minKey = `required_${trait}_min` as keyof RoleRequirements;
    const maxKey = `required_${trait}_max` as keyof RoleRequirements;
    const minVal = role[minKey] as number | null | undefined;
    const maxVal = role[maxKey] as number | null | undefined;

    if (minVal == null && maxVal == null) {
      scores.push(100);
      breakdown[`${trait}RoleFit`] = 100;
      continue;
    }

    const effectiveMin = minVal ?? 0;
    const effectiveMax = maxVal ?? 100;
    const candidateVal = candidate[trait];

    if (effectiveMin <= candidateVal && candidateVal <= effectiveMax) {
      scores.push(100);
      breakdown[`${trait}RoleFit`] = 100;
    } else {
      const distance = Math.min(
        Math.abs(candidateVal - effectiveMin),
        Math.abs(candidateVal - effectiveMax)
      );
      const penalty = Math.min(distance * 2, 100);
      const fit = Math.max(0, 100 - penalty);
      scores.push(fit);
      breakdown[`${trait}RoleFit`] = Math.round(fit);
    }
  }

  const overall = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  return { score: Math.round(overall), breakdown };
}

/**
 * Calculate work style compatibility
 */
function calculateWorkStyleFit(
  candidateStyle?: string,
  roleStyle?: string
): number {
  if (!candidateStyle || !roleStyle) return 75;

  if (candidateStyle === roleStyle) return 100;
  if (candidateStyle === 'flexible' || roleStyle === 'flexible') return 85;
  if (
    (candidateStyle === 'hybrid' && (roleStyle === 'remote' || roleStyle === 'onsite')) ||
    (roleStyle === 'hybrid' && (candidateStyle === 'remote' || candidateStyle === 'onsite'))
  ) {
    return 65;
  }
  return 40;
}

/**
 * Calculate culture values alignment via OCEAN correlation
 */
function calculateValuesAlignment(
  candidate: OCEANScores,
  cultureValues?: string[]
): number {
  if (!cultureValues || cultureValues.length === 0) return 75;

  const valueScores: number[] = [];

  for (const value of cultureValues) {
    const correlations = CULTURE_OCEAN_MAP[value.toLowerCase()];
    if (!correlations) continue;

    let alignment = 0;
    let weightSum = 0;

    for (const [trait, weight] of Object.entries(correlations)) {
      const candidateVal = candidate[trait as keyof OCEANScores] ?? 50;
      if (weight > 0) {
        alignment += candidateVal * Math.abs(weight);
      } else {
        alignment += (100 - candidateVal) * Math.abs(weight);
      }
      weightSum += Math.abs(weight);
    }

    if (weightSum > 0) {
      valueScores.push(alignment / weightSum);
    }
  }

  if (valueScores.length === 0) return 75;
  return valueScores.reduce((a, b) => a + b, 0) / valueScores.length;
}

/**
 * Calculate full compatibility between a candidate and employer/role
 */
export function calculateCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { candidateOCEAN, employerPreferences, candidateWorkStyle, roleRequirements } = input;

  // Convert employer preferences to OCEANScores
  const employerOCEAN: OCEANScores = {
    openness: employerPreferences.openness,
    conscientiousness: employerPreferences.conscientiousness,
    extraversion: employerPreferences.extraversion,
    agreeableness: employerPreferences.agreeableness,
    neuroticism: employerPreferences.neuroticism,
  };

  // Calculate trait match
  const { score: traitMatchScore, breakdown: traitBreakdown } = calculateTraitMatch(
    candidateOCEAN,
    employerOCEAN
  );

  // Calculate work style fit
  const workStyleFit = calculateWorkStyleFit(
    candidateWorkStyle,
    roleRequirements?.work_style ?? input.roleWorkStyle
  );

  // Calculate values alignment
  const valuesFit = calculateValuesAlignment(
    candidateOCEAN,
    employerPreferences.cultureValues
  );

  // Calculate role fit if requirements provided
  let roleFit: number | undefined;
  if (roleRequirements) {
    const { score } = calculateRoleFit(candidateOCEAN, roleRequirements);
    roleFit = score;
  }

  // Calculate culture match (weighted average)
  const cultureWeights = [
    { score: workStyleFit, weight: 0.3 },
    { score: valuesFit, weight: 0.5 },
  ];
  if (roleFit !== undefined) {
    cultureWeights.push({ score: roleFit, weight: 0.2 });
  }

  const totalWeight = cultureWeights.reduce((sum, w) => sum + w.weight, 0);
  const cultureMatchScore = Math.round(
    cultureWeights.reduce((sum, w) => sum + w.score * w.weight, 0) / totalWeight
  );

  // Calculate overall score (50% trait, 50% culture)
  const overallMatchScore = Math.round(traitMatchScore * 0.5 + cultureMatchScore * 0.5);

  return {
    traitMatchScore,
    cultureMatchScore,
    overallMatchScore,
    breakdown: {
      opennessFit: traitBreakdown.opennessFit,
      conscientiousnessFit: traitBreakdown.conscientiousnessFit,
      extraversionFit: traitBreakdown.extraversionFit,
      agreeablenessFit: traitBreakdown.agreeablenessFit,
      neuroticismFit: traitBreakdown.neuroticismFit,
      workStyleFit: Math.round(workStyleFit),
      valuesFit: Math.round(valuesFit),
      roleFit,
    },
  };
}

/**
 * Simple distance-based score (used for quick calculations)
 */
export function calculateSimpleMatchScore(
  candidateOCEAN: OCEANScores,
  employerOCEAN: Partial<OCEANScores>
): number {
  const traits: (keyof OCEANScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];

  let totalDiff = 0;
  let count = 0;

  for (const trait of traits) {
    const candidateVal = candidateOCEAN[trait];
    const employerVal = employerOCEAN[trait];
    if (candidateVal != null && employerVal != null) {
      totalDiff += Math.abs(candidateVal - employerVal);
      count++;
    }
  }

  if (count === 0) return 50;

  const maxDiff = count * 100;
  return Math.round((1 - totalDiff / maxDiff) * 100);
}
