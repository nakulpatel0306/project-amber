interface PersonalityFact {
  title: string;
  description: string;
  source?: string;
  relevantTraits: string[];
}

const ALL_FACTS: PersonalityFact[] = [
  // Openness facts
  {
    title: 'Creative minds need variety',
    description: 'People high in Openness thrive in roles that offer diverse challenges and opportunities for creative expression.',
    source: 'Journal of Personality Psychology',
    relevantTraits: ['openness'],
  },
  {
    title: 'Innovation comes from exploration',
    description: 'High Openness correlates with entrepreneurial success and the ability to identify novel solutions to complex problems.',
    source: 'Harvard Business Review',
    relevantTraits: ['openness'],
  },
  {
    title: 'Curiosity drives engagement',
    description: 'Employees high in Openness report 23% higher job satisfaction when given opportunities to learn new skills.',
    relevantTraits: ['openness'],
  },

  // Conscientiousness facts
  {
    title: 'Structure breeds success',
    description: 'Conscientiousness is the strongest personality predictor of job performance across virtually all occupations.',
    source: 'Journal of Applied Psychology',
    relevantTraits: ['conscientiousness'],
  },
  {
    title: 'Planning pays off',
    description: 'Teams with high average Conscientiousness complete projects 31% faster with fewer errors.',
    relevantTraits: ['conscientiousness'],
  },
  {
    title: 'Details matter',
    description: 'High Conscientiousness individuals are 40% more likely to meet deadlines consistently.',
    relevantTraits: ['conscientiousness'],
  },

  // Extraversion facts
  {
    title: 'Energy is contagious',
    description: 'Extraverted leaders tend to energize their teams, leading to 15% higher team engagement scores.',
    source: 'Leadership Quarterly',
    relevantTraits: ['extraversion'],
  },
  {
    title: 'Collaboration thrives with connection',
    description: 'Extraverts excel in roles requiring frequent interpersonal interaction and team coordination.',
    relevantTraits: ['extraversion'],
  },
  {
    title: 'Network effects',
    description: 'High Extraversion correlates with larger professional networks and more career advancement opportunities.',
    relevantTraits: ['extraversion'],
  },

  // Agreeableness facts
  {
    title: 'Harmony drives productivity',
    description: 'Teams with higher average Agreeableness report 27% fewer interpersonal conflicts.',
    relevantTraits: ['agreeableness'],
  },
  {
    title: 'Empathy in leadership',
    description: 'Agreeable managers have teams with 35% higher retention rates due to stronger emotional support.',
    source: 'Journal of Organizational Behavior',
    relevantTraits: ['agreeableness'],
  },
  {
    title: 'Customer satisfaction connection',
    description: 'High Agreeableness in customer-facing roles correlates with 20% higher customer satisfaction scores.',
    relevantTraits: ['agreeableness'],
  },

  // Neuroticism/Stability facts
  {
    title: 'Stability under pressure',
    description: 'Low Neuroticism (high Stability) predicts better performance in high-stress environments.',
    relevantTraits: ['neuroticism'],
  },
  {
    title: 'Resilience matters',
    description: 'Emotionally stable individuals recover from setbacks 2x faster than those with high Neuroticism.',
    source: 'Psychological Science',
    relevantTraits: ['neuroticism'],
  },
  {
    title: 'Calm decision-making',
    description: 'Leaders with high emotional stability make more consistent decisions under pressure.',
    relevantTraits: ['neuroticism'],
  },

  // General facts
  {
    title: 'Personality diversity strengthens teams',
    description: 'Teams with diverse personality profiles outperform homogeneous teams on complex problem-solving by 35%.',
    source: 'MIT Sloan Management Review',
    relevantTraits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
  },
  {
    title: 'Culture fit vs. culture add',
    description: 'The best hires often complement existing team personalities rather than mirror them exactly.',
    relevantTraits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
  },
  {
    title: 'Self-awareness accelerates growth',
    description: 'Candidates who understand their personality traits adapt 40% faster to new roles.',
    relevantTraits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
  },
];

export function getFactsForProfile(
  scores: Record<string, number>,
  count: number = 3
): PersonalityFact[] {
  // Find the dominant traits (top 2)
  const sortedTraits = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([trait]) => trait.toLowerCase());

  // Filter facts relevant to dominant traits
  const relevantFacts = ALL_FACTS.filter(fact =>
    fact.relevantTraits.some(trait => sortedTraits.includes(trait))
  );

  // Shuffle and return requested count
  const shuffled = [...relevantFacts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAllFacts(): PersonalityFact[] {
  return ALL_FACTS;
}
