export interface EmployerArchetype {
  key: string;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
  idealCandidates: string[];
  culture: string[];
  blindspots: string[];
}

export const EMPLOYER_ARCHETYPES: Record<string, EmployerArchetype> = {
  the_greenhouse: {
    key: 'the_greenhouse',
    name: 'The Greenhouse',
    emoji: 'sprout',
    description: 'A nurturing, growth-focused culture that puts people first. Your organization invests deeply in development, mentorship, and creating psychologically safe environments where talent can flourish.',
    strengths: ['Employee development', 'Mentorship culture', 'Psychological safety', 'Work-life balance'],
    idealCandidates: ['Growth-minded learners', 'Collaborative spirits', 'Long-term thinkers'],
    culture: ['Regular 1-on-1s and feedback', 'Learning budgets', 'Flexible work arrangements', 'Team celebrations'],
    blindspots: ['May avoid difficult decisions', 'Risk of slow decision-making', 'Can over-prioritize harmony'],
  },
  the_engine_room: {
    key: 'the_engine_room',
    name: 'The Engine Room',
    emoji: 'flame',
    description: 'A results-driven, high-performance culture that celebrates excellence. Your organization values efficiency, accountability, and measurable outcomes with clear goals and competitive energy.',
    strengths: ['Clear metrics', 'High accountability', 'Fast execution', 'Performance recognition'],
    idealCandidates: ['Driven achievers', 'Competitive spirits', 'Self-starters'],
    culture: ['OKRs and goal-tracking', 'Performance bonuses', 'Rapid promotion paths', 'Results over process'],
    blindspots: ['Risk of burnout', 'May undervalue collaboration', 'Can feel high-pressure'],
  },
  the_frontier: {
    key: 'the_frontier',
    name: 'The Frontier',
    emoji: 'mountain',
    description: 'An innovative, risk-taking culture that pushes boundaries. Your organization embraces experimentation, values bold ideas, and sees failure as a stepping stone to breakthrough solutions.',
    strengths: ['Innovation-first mindset', 'Embraces risk', 'Creative freedom', 'Boundary-pushing'],
    idealCandidates: ['Creative visionaries', 'Risk-tolerant explorers', 'Entrepreneurial thinkers'],
    culture: ['Hackathons and innovation days', 'Flat hierarchy', 'Rapid prototyping', 'Fail-fast mentality'],
    blindspots: ['May lack structure', 'Can be chaotic', 'Risk of unclear direction'],
  },
};

export function determineEmployerArchetype(scores: {
  innovation?: number;
  collaboration?: number;
  results?: number;
  warmth?: number;
  growth?: number;
  excellence?: number;
}): { primary: EmployerArchetype; secondary: EmployerArchetype; tertiary: EmployerArchetype } {
  const archetypeScores = {
    the_greenhouse: (scores.warmth || 50) * 0.35 + (scores.collaboration || 50) * 0.35 + (scores.growth || 50) * 0.3,
    the_engine_room: (scores.results || 50) * 0.35 + (scores.excellence || 50) * 0.35 + (scores.growth || 50) * 0.3,
    the_frontier: (scores.innovation || 50) * 0.4 + (scores.growth || 50) * 0.3 + (scores.results || 50) * 0.3,
  };

  const sorted = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1]);

  return {
    primary: EMPLOYER_ARCHETYPES[sorted[0][0]],
    secondary: EMPLOYER_ARCHETYPES[sorted[1][0]],
    tertiary: EMPLOYER_ARCHETYPES[sorted[2][0]],
  };
}
