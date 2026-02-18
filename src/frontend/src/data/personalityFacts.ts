export interface PersonalityFact {
  dimension: string;
  threshold: 'high' | 'low' | 'any';
  fact: string;
}

export const PERSONALITY_FACTS: PersonalityFact[] = [
  // Openness
  { dimension: 'openness', threshold: 'high', fact: 'People high in openness are 60% more likely to pursue creative hobbies and have broader musical tastes across genres.' },
  { dimension: 'openness', threshold: 'high', fact: 'High openness correlates with bilingualism — open individuals are 40% more likely to learn a second language.' },
  { dimension: 'openness', threshold: 'low', fact: 'People lower in openness tend to be experts in their domain — they go deep rather than wide, which predicts mastery.' },
  { dimension: 'openness', threshold: 'any', fact: 'Openness is the trait most associated with intellectual curiosity. It predicts interest in science, art, and philosophy.' },

  // Conscientiousness
  { dimension: 'conscientiousness', threshold: 'high', fact: 'Conscientiousness is the single strongest personality predictor of job performance — it accounts for 15-20% of work success.' },
  { dimension: 'conscientiousness', threshold: 'high', fact: 'Highly conscientious people live an average of 2-3 years longer, likely due to healthier habits and consistent routines.' },
  { dimension: 'conscientiousness', threshold: 'low', fact: 'People lower in conscientiousness often excel in creative and entrepreneurial roles where flexibility matters more than structure.' },
  { dimension: 'conscientiousness', threshold: 'any', fact: 'Conscientiousness increases with age — most people become more organized and responsible through their 20s and 30s.' },

  // Extraversion
  { dimension: 'extraversion', threshold: 'high', fact: 'Extraverts tend to experience more positive emotions and report higher life satisfaction, but introverts show more emotional stability.' },
  { dimension: 'extraversion', threshold: 'high', fact: 'Extraverts make up about 50-74% of the population, but many of the world\'s most successful leaders are ambiverts.' },
  { dimension: 'extraversion', threshold: 'low', fact: 'Introverts make up roughly 25-50% of the population and tend to outperform extraverts in roles requiring deep concentration.' },
  { dimension: 'extraversion', threshold: 'any', fact: 'Extraversion is the most visible personality trait — people can accurately judge someone\'s extraversion level within seconds.' },

  // Agreeableness
  { dimension: 'agreeableness', threshold: 'high', fact: 'Highly agreeable people are better at reading social cues and emotions, making them natural mediators and counselors.' },
  { dimension: 'agreeableness', threshold: 'high', fact: 'Agreeableness is the strongest predictor of team cohesion — agreeable team members reduce conflict by up to 35%.' },
  { dimension: 'agreeableness', threshold: 'low', fact: 'People lower in agreeableness often excel in negotiation and competitive roles where directness is an advantage.' },
  { dimension: 'agreeableness', threshold: 'any', fact: 'Agreeableness is the most gender-differentiated trait — women score slightly higher on average across all cultures studied.' },

  // Neuroticism / Stability
  { dimension: 'neuroticism', threshold: 'high', fact: 'Emotional sensitivity (higher neuroticism) correlates with greater creativity and artistic ability.' },
  { dimension: 'neuroticism', threshold: 'low', fact: 'Emotionally stable individuals recover from setbacks 50% faster and maintain consistent performance under pressure.' },
  { dimension: 'neuroticism', threshold: 'low', fact: 'Low neuroticism is the strongest personality predictor of leadership effectiveness in high-stress environments.' },
  { dimension: 'neuroticism', threshold: 'any', fact: 'Emotional stability tends to increase with age — people generally become calmer and more resilient through their 30s and 40s.' },
];

export function getFactsForProfile(scores: Record<string, number>, count: number = 4): string[] {
  const facts: string[] = [];
  const dimensions = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  for (const [dim, score] of dimensions) {
    const dimKey = dim === 'neuroticism' ? 'neuroticism' : dim;
    const threshold = score >= 65 ? 'high' : score <= 35 ? 'low' : 'any';

    const matching = PERSONALITY_FACTS.filter(
      f => f.dimension === dimKey && (f.threshold === threshold || f.threshold === 'any')
    );

    if (matching.length > 0) {
      const randomFact = matching[Math.floor(Math.random() * matching.length)];
      if (!facts.includes(randomFact.fact)) {
        facts.push(randomFact.fact);
      }
    }

    if (facts.length >= count) break;
  }

  // Fill remaining with random facts
  while (facts.length < count) {
    const randomFact = PERSONALITY_FACTS[Math.floor(Math.random() * PERSONALITY_FACTS.length)];
    if (!facts.includes(randomFact.fact)) {
      facts.push(randomFact.fact);
    }
  }

  return facts.slice(0, count);
}
