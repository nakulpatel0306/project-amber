interface PersonalityFact {
  title: string;
  description: string;
  source: string;
  relevantTraits: string[];
}

const ALL_FACTS: PersonalityFact[] = [
  // Openness facts
  {
    title: 'Creative minds need variety',
    description: 'People high in Openness thrive in roles that offer diverse challenges and opportunities for creative expression.',
    source: 'Journal of Research in Personality, 2011',
    relevantTraits: ['openness'],
  },
  {
    title: 'Innovation comes from exploration',
    description: 'High Openness correlates with entrepreneurial success and the ability to identify novel solutions to complex problems.',
    source: 'Harvard Business Review, 2017',
    relevantTraits: ['openness'],
  },
  {
    title: 'Curiosity drives engagement',
    description: 'Employees high in Openness report significantly higher job satisfaction when given opportunities to learn new skills.',
    source: 'Journal of Vocational Behavior, 2014',
    relevantTraits: ['openness'],
  },

  // Conscientiousness facts
  {
    title: 'Structure breeds success',
    description: 'Conscientiousness is the strongest personality predictor of job performance across virtually all occupations.',
    source: 'Journal of Applied Psychology, Barrick & Mount, 1991',
    relevantTraits: ['conscientiousness'],
  },
  {
    title: 'Planning pays off',
    description: 'Higher team Conscientiousness is consistently linked to better project outcomes and fewer errors.',
    source: 'Personnel Psychology, 2007',
    relevantTraits: ['conscientiousness'],
  },
  {
    title: 'Details matter',
    description: 'Conscientious individuals are significantly more likely to meet deadlines and maintain consistent output quality.',
    source: 'Journal of Personality and Social Psychology, 2004',
    relevantTraits: ['conscientiousness'],
  },

  // Extraversion facts
  {
    title: 'Energy is contagious',
    description: 'Extraverted leaders tend to energize their teams, leading to measurably higher team engagement scores.',
    source: 'The Leadership Quarterly, Judge et al., 2002',
    relevantTraits: ['extraversion'],
  },
  {
    title: 'Collaboration thrives with connection',
    description: 'Extraverts excel in roles requiring frequent interpersonal interaction and team coordination.',
    source: 'Academy of Management Journal, 2005',
    relevantTraits: ['extraversion'],
  },
  {
    title: 'Network effects',
    description: 'High Extraversion correlates with larger professional networks and more career advancement opportunities.',
    source: 'Journal of Organizational Behavior, 2009',
    relevantTraits: ['extraversion'],
  },

  // Agreeableness facts
  {
    title: 'Harmony drives productivity',
    description: 'Teams with higher average Agreeableness experience significantly fewer interpersonal conflicts.',
    source: 'Journal of Applied Psychology, 2008',
    relevantTraits: ['agreeableness'],
  },
  {
    title: 'Empathy in leadership',
    description: 'Agreeable managers build teams with higher retention rates due to stronger emotional support and trust.',
    source: 'Journal of Organizational Behavior, 2012',
    relevantTraits: ['agreeableness'],
  },
  {
    title: 'Customer satisfaction connection',
    description: 'High Agreeableness in customer-facing roles correlates with higher customer satisfaction scores.',
    source: 'Journal of Marketing, 2010',
    relevantTraits: ['agreeableness'],
  },

  // Neuroticism/Stability facts
  {
    title: 'Stability under pressure',
    description: 'Low Neuroticism (high Stability) is a reliable predictor of sustained performance in high-stress environments.',
    source: 'Psychological Bulletin, Salgado, 1997',
    relevantTraits: ['neuroticism'],
  },
  {
    title: 'Resilience matters',
    description: 'Emotionally stable individuals recover from workplace setbacks significantly faster than their peers.',
    source: 'Psychological Science, 2013',
    relevantTraits: ['neuroticism'],
  },
  {
    title: 'Calm decision-making',
    description: 'Leaders with high emotional stability make more consistent and rational decisions under pressure.',
    source: 'Journal of Management, 2010',
    relevantTraits: ['neuroticism'],
  },

  // General facts
  {
    title: 'Personality diversity strengthens teams',
    description: 'Teams with diverse personality profiles outperform homogeneous teams on complex, creative problem-solving tasks.',
    source: 'MIT Sloan Management Review, 2019',
    relevantTraits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
  },
  {
    title: 'Culture fit vs. culture add',
    description: 'Research shows the best hires often complement existing team personalities rather than mirror them exactly.',
    source: 'Harvard Business Review, 2018',
    relevantTraits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
  },
  {
    title: 'Self-awareness accelerates growth',
    description: 'Employees who understand their personality traits adapt faster to new roles and report higher job satisfaction.',
    source: 'Annual Review of Organizational Psychology, 2017',
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
