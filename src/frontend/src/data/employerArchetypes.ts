interface Archetype {
  name: string;
  description: string;
  strengths: string[];
  idealCandidates: string[];
  blindspots: string[];
  traits: {
    openness: [number, number];
    conscientiousness: [number, number];
    extraversion: [number, number];
    agreeableness: [number, number];
    neuroticism: [number, number];
  };
}

interface ArchetypeResult {
  primary: Archetype;
  secondary: Archetype;
  tertiary: Archetype;
}

const EMPLOYER_ARCHETYPES: Archetype[] = [
  {
    name: 'The Innovator',
    description: 'Thrives on creativity and pushing boundaries. Values experimentation and embraces calculated risks.',
    strengths: ['Creative Problem Solving', 'Adaptability', 'Vision', 'Risk-Taking'],
    idealCandidates: ['Creative thinkers', 'Self-starters', 'Experimenters', 'Visionaries'],
    blindspots: ['May overlook process', 'Can be too abstract', 'Impatience with routine'],
    traits: {
      openness: [70, 100],
      conscientiousness: [30, 70],
      extraversion: [40, 80],
      agreeableness: [40, 70],
      neuroticism: [20, 50],
    },
  },
  {
    name: 'The Optimizer',
    description: 'Focused on efficiency and excellence. Values structure, processes, and continuous improvement.',
    strengths: ['Process Excellence', 'Quality Focus', 'Reliability', 'Detail Orientation'],
    idealCandidates: ['Detail-oriented', 'Process-driven', 'Quality-focused', 'Methodical'],
    blindspots: ['May resist change', 'Can be inflexible', 'Over-emphasis on perfection'],
    traits: {
      openness: [30, 60],
      conscientiousness: [70, 100],
      extraversion: [30, 60],
      agreeableness: [50, 80],
      neuroticism: [20, 50],
    },
  },
  {
    name: 'The Collaborator',
    description: 'Prioritizes teamwork and relationships. Builds strong cultures through connection and empathy.',
    strengths: ['Team Building', 'Communication', 'Empathy', 'Conflict Resolution'],
    idealCandidates: ['Team players', 'Communicators', 'Relationship builders', 'Supportive'],
    blindspots: ['May avoid conflict', 'Can prioritize harmony over results', 'Decision paralysis'],
    traits: {
      openness: [40, 70],
      conscientiousness: [50, 80],
      extraversion: [50, 90],
      agreeableness: [70, 100],
      neuroticism: [30, 60],
    },
  },
  {
    name: 'The Driver',
    description: 'Results-oriented and ambitious. Values achievement, competition, and high performance.',
    strengths: ['Goal Achievement', 'Decisiveness', 'Competitiveness', 'Leadership'],
    idealCandidates: ['High achievers', 'Self-motivated', 'Competitive', 'Goal-oriented'],
    blindspots: ['May push too hard', 'Can overlook wellbeing', 'Impatience with underperformers'],
    traits: {
      openness: [40, 70],
      conscientiousness: [60, 90],
      extraversion: [60, 100],
      agreeableness: [30, 60],
      neuroticism: [20, 50],
    },
  },
  {
    name: 'The Stabilizer',
    description: 'Values consistency and reliability. Creates secure environments with clear expectations.',
    strengths: ['Predictability', 'Trust Building', 'Risk Management', 'Stability'],
    idealCandidates: ['Dependable', 'Consistent', 'Risk-aware', 'Long-term thinkers'],
    blindspots: ['May resist innovation', 'Can be too cautious', 'Slow to adapt'],
    traits: {
      openness: [20, 50],
      conscientiousness: [60, 90],
      extraversion: [30, 60],
      agreeableness: [50, 80],
      neuroticism: [10, 40],
    },
  },
  {
    name: 'The Visionary',
    description: 'Big-picture thinker with ambitious goals. Inspires others with compelling visions of the future.',
    strengths: ['Strategic Thinking', 'Inspiration', 'Long-term Planning', 'Innovation'],
    idealCandidates: ['Strategic minds', 'Inspired doers', 'Future-focused', 'Ambitious'],
    blindspots: ['May neglect details', 'Can be unrealistic', 'Impatience with execution'],
    traits: {
      openness: [70, 100],
      conscientiousness: [40, 70],
      extraversion: [60, 90],
      agreeableness: [40, 70],
      neuroticism: [20, 50],
    },
  },
  {
    name: 'The Nurturer',
    description: 'Focused on growth and development. Creates supportive environments where people thrive.',
    strengths: ['Mentorship', 'Development', 'Patience', 'Supportiveness'],
    idealCandidates: ['Growth-minded', 'Coachable', 'Collaborative', 'Patient learners'],
    blindspots: ['May be too accommodating', 'Can avoid tough feedback', 'Slow decisions'],
    traits: {
      openness: [50, 80],
      conscientiousness: [50, 80],
      extraversion: [40, 70],
      agreeableness: [70, 100],
      neuroticism: [30, 60],
    },
  },
  {
    name: 'The Challenger',
    description: 'Pushes boundaries and questions the status quo. Values debate and intellectual rigor.',
    strengths: ['Critical Thinking', 'Debate', 'Innovation', 'High Standards'],
    idealCandidates: ['Critical thinkers', 'Debaters', 'Resilient', 'Independent'],
    blindspots: ['May seem confrontational', 'Can be dismissive', 'Intimidating environment'],
    traits: {
      openness: [60, 90],
      conscientiousness: [50, 80],
      extraversion: [50, 80],
      agreeableness: [20, 50],
      neuroticism: [30, 60],
    },
  },
];

function calculateArchetypeScore(
  archetype: Archetype,
  scores: Record<string, number>
): number {
  let totalScore = 0;
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  for (const trait of traits) {
    const score = scores[trait] || 50;
    const [min, max] = archetype.traits[trait as keyof typeof archetype.traits];
    const midpoint = (min + max) / 2;
    const range = (max - min) / 2;

    // Calculate how well the score fits within the archetype's range
    if (score >= min && score <= max) {
      // Perfect fit - calculate distance from midpoint
      const distanceFromMid = Math.abs(score - midpoint);
      totalScore += 100 - (distanceFromMid / range) * 30;
    } else {
      // Outside range - penalize based on distance
      const distance = score < min ? min - score : score - max;
      totalScore += Math.max(0, 70 - distance);
    }
  }

  return totalScore / traits.length;
}

export function determineEmployerArchetype(
  scores: Record<string, number>
): ArchetypeResult {
  const archetypeScores = EMPLOYER_ARCHETYPES.map((archetype) => ({
    archetype,
    score: calculateArchetypeScore(archetype, scores),
  }));

  // Sort by score descending
  archetypeScores.sort((a, b) => b.score - a.score);

  return {
    primary: archetypeScores[0].archetype,
    secondary: archetypeScores[1].archetype,
    tertiary: archetypeScores[2].archetype,
  };
}

export function getAllArchetypes(): Archetype[] {
  return EMPLOYER_ARCHETYPES;
}
