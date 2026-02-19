/**
 * Personality Archetypes for Project Amber
 *
 * Client-side port of the archetype classification logic from ember_agent.py.
 * Used as a fallback when the backend is unavailable, and for displaying
 * archetype details in the UI without an API call.
 *
 * The determineArchetype() function uses a rule-based decision tree
 * (checking OCEAN score thresholds) rather than the backend's distance-based
 * scoring approach. Both produce equivalent results for most profiles.
 */

export interface Archetype {
  key: string;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
  idealEnvironments: string[];
  idealCultures: string[];
}

export const ARCHETYPES: Record<string, Archetype> = {
  the_innovator: {
    key: 'the_innovator',
    name: 'The Innovator',
    emoji: 'lightbulb',
    description: 'Creative thinker who thrives on new ideas and unconventional solutions',
    strengths: ['Creative problem-solving', 'Adaptability', 'Visionary thinking'],
    idealEnvironments: ['Startups', 'R&D teams', 'Creative agencies'],
    idealCultures: ['Innovation', 'Creativity', 'Risk', 'Agility'],
  },
  the_architect: {
    key: 'the_architect',
    name: 'The Architect',
    emoji: 'layers',
    description: 'Systematic builder who creates order from complexity',
    strengths: ['Organization', 'Process design', 'Quality assurance'],
    idealEnvironments: ['Engineering teams', 'Operations', 'Project management'],
    idealCultures: ['Excellence', 'Quality', 'Stability', 'Integrity'],
  },
  the_connector: {
    key: 'the_connector',
    name: 'The Connector',
    emoji: 'heart',
    description: 'Natural relationship builder who brings people together',
    strengths: ['Networking', 'Team building', 'Communication'],
    idealEnvironments: ['Sales', 'HR', 'Community management'],
    idealCultures: ['Collaboration', 'Empathy', 'Trust', 'Diversity'],
  },
  the_catalyst: {
    key: 'the_catalyst',
    name: 'The Catalyst',
    emoji: 'zap',
    description: 'Bold leader who drives change and inspires action',
    strengths: ['Leadership', 'Strategic thinking', 'Influence'],
    idealEnvironments: ['Management', 'Consulting', 'Entrepreneurship'],
    idealCultures: ['Speed', 'Autonomy', 'Growth', 'Impact'],
  },
  the_craftsperson: {
    key: 'the_craftsperson',
    name: 'The Craftsperson',
    emoji: 'target',
    description: 'Detail-oriented perfectionist who takes pride in quality work',
    strengths: ['Precision', 'Deep expertise', 'Reliability'],
    idealEnvironments: ['Specialized roles', 'Research', 'Technical writing'],
    idealCultures: ['Quality', 'Excellence', 'Stability', 'Integrity'],
  },
  the_harmonizer: {
    key: 'the_harmonizer',
    name: 'The Harmonizer',
    emoji: 'music',
    description: 'Empathetic mediator who creates balance and resolves conflict',
    strengths: ['Conflict resolution', 'Empathy', 'Team cohesion'],
    idealEnvironments: ['Support roles', 'Counseling', 'Team leads'],
    idealCultures: ['Collaboration', 'Empathy', 'Balance', 'Mission'],
  },
  the_explorer: {
    key: 'the_explorer',
    name: 'The Explorer',
    emoji: 'compass',
    description: 'Curious adventurer who adapts quickly and embraces the unknown',
    strengths: ['Adaptability', 'Curiosity', 'Resilience'],
    idealEnvironments: ['Travel', 'Consulting', 'Diverse teams'],
    idealCultures: ['Innovation', 'Autonomy', 'Risk', 'Growth'],
  },
  the_strategist: {
    key: 'the_strategist',
    name: 'The Strategist',
    emoji: 'brain',
    description: 'Analytical thinker who plans ahead and sees the big picture',
    strengths: ['Analysis', 'Planning', 'Decision-making'],
    idealEnvironments: ['Strategy', 'Analytics', 'Finance'],
    idealCultures: ['Excellence', 'Growth', 'Impact', 'Quality'],
  },
};

interface OCEANInput {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

/**
 * Classify a candidate into a personality archetype based on OCEAN scores.
 * Uses a priority-ordered decision tree: the first matching rule wins.
 * Falls back to "The Explorer" if no strong pattern is detected.
 */
export function determineArchetype(ocean: OCEANInput): Archetype & { confidence: number } {
  const o = ocean.openness;
  const c = ocean.conscientiousness;
  const e = ocean.extraversion;
  const a = ocean.agreeableness;
  const n = ocean.neuroticism;

  // Default archetype if no strong OCEAN pattern is detected
  let key = 'the_explorer';
  let confidence = 70;

  if (o >= 80 && c <= 55) {
    key = 'the_innovator';
    confidence = 85;
  } else if (c >= 80 && e <= 50) {
    key = 'the_craftsperson';
    confidence = 85;
  } else if (e >= 80 && a >= 75) {
    key = 'the_connector';
    confidence = 90;
  } else if (e >= 75 && a <= 50) {
    key = 'the_catalyst';
    confidence = 80;
  } else if (c >= 80 && o >= 60) {
    key = 'the_strategist';
    confidence = 85;
  } else if (a >= 80 && n <= 35) {
    key = 'the_harmonizer';
    confidence = 85;
  } else if (c >= 80) {
    key = 'the_architect';
    confidence = 80;
  } else if (o >= 70 && n <= 40) {
    key = 'the_explorer';
    confidence = 80;
  }

  return { ...ARCHETYPES[key], confidence };
}

/**
 * Look up an archetype by its display name (e.g., "The Innovator")
 */
export function getArchetypeByName(name: string): Archetype | null {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return ARCHETYPES[key] || null;
}
