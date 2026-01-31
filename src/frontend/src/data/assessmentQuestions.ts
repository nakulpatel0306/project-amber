// Amber Assessment Questions
// A unique, thought-provoking assessment that reveals personality through scenarios,
// metaphors, and dilemmas rather than typical agree/disagree statements

export interface AssessmentQuestion {
  id: string;
  type: 'scenario' | 'metaphor' | 'tradeoff' | 'ranking' | 'reflection' | 'slider';
  category: string;
  question: string;
  description?: string;
  options?: AssessmentOption[];
  sliderConfig?: SliderConfig;
  traits: string[]; // Which traits this question measures
}

export interface AssessmentOption {
  id: string;
  text: string;
  description?: string;
  imageHint?: string; // For metaphor questions
  traitScores: Record<string, number>; // e.g., { collaboration: 80, structure: 30 }
}

export interface SliderConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  trait: string;
}

// ============================================
// CANDIDATE ASSESSMENT QUESTIONS
// ============================================

export const candidateQuestions: AssessmentQuestion[] = [
  // === SCENARIO: THE UNEXPECTED PROJECT ===
  {
    id: 'c1',
    type: 'scenario',
    category: 'Work Style',
    question: "It's Friday afternoon. A major client just called with an urgent request that could land a huge contract. Your team has plans for the weekend.",
    description: "What's your natural first instinct?",
    options: [
      {
        id: 'c1a',
        text: 'Rally the team',
        description: "Call an emergency meeting. If everyone chips in, we can make it happen and celebrate together after.",
        traitScores: { collaboration: 90, intensity: 70, leadership: 80 }
      },
      {
        id: 'c1b',
        text: 'Take it on yourself',
        description: "Tell the team to keep their plans. You'll pull an all-nighter and handle it solo.",
        traitScores: { independence: 90, intensity: 85, ownership: 90 }
      },
      {
        id: 'c1c',
        text: 'Negotiate the timeline',
        description: "Call the client back. There's usually more flexibility than the initial panic suggests.",
        traitScores: { diplomacy: 90, boundaries: 80, strategic: 85 }
      },
      {
        id: 'c1d',
        text: 'Assess and delegate',
        description: "Break it into pieces. See who's available and assign based on strengths.",
        traitScores: { organization: 90, leadership: 75, analytical: 80 }
      }
    ],
    traits: ['collaboration', 'intensity', 'leadership', 'independence', 'boundaries']
  },

  // === METAPHOR: YOUR IDEAL WORKSPACE ===
  {
    id: 'c2',
    type: 'metaphor',
    category: 'Environment',
    question: 'If your ideal work environment was a place in nature, which would it be?',
    description: 'Trust your gut - which image resonates most?',
    options: [
      {
        id: 'c2a',
        text: 'A bustling beehive',
        imageHint: 'beehive',
        description: 'Constant activity, everyone has a role, collective purpose',
        traitScores: { collaboration: 95, structure: 80, social: 90 }
      },
      {
        id: 'c2b',
        text: 'A mountain peak',
        imageHint: 'mountain',
        description: 'Challenging climb, clear goals, breathtaking views from the top',
        traitScores: { ambition: 95, independence: 80, achievement: 90 }
      },
      {
        id: 'c2c',
        text: 'A flowing river',
        imageHint: 'river',
        description: 'Constant movement, adapting to terrain, finding the path of least resistance',
        traitScores: { adaptability: 95, creativity: 75, flexibility: 90 }
      },
      {
        id: 'c2d',
        text: 'A deep forest',
        imageHint: 'forest',
        description: 'Rich ecosystem, interconnected but space to grow, wisdom in stillness',
        traitScores: { depth: 90, independence: 70, reflection: 85 }
      }
    ],
    traits: ['collaboration', 'ambition', 'adaptability', 'independence']
  },

  // === TRADEOFF: THE IMPOSSIBLE CHOICE ===
  {
    id: 'c3',
    type: 'tradeoff',
    category: 'Values',
    question: 'You can only optimize for one. Which matters more?',
    options: [
      {
        id: 'c3a',
        text: 'Moving fast',
        description: 'Launch now, iterate later. Speed wins.',
        traitScores: { speed: 95, risk: 80, action: 90 }
      },
      {
        id: 'c3b',
        text: 'Getting it right',
        description: 'Quality over speed. Do it once, do it well.',
        traitScores: { quality: 95, patience: 80, precision: 90 }
      }
    ],
    traits: ['speed', 'quality', 'risk']
  },

  // === SCENARIO: THE FEEDBACK MOMENT ===
  {
    id: 'c4',
    type: 'scenario',
    category: 'Communication',
    question: "A colleague's work has a significant flaw that others haven't noticed. If not addressed, it could cause problems later.",
    description: "What's your approach?",
    options: [
      {
        id: 'c4a',
        text: 'Direct conversation',
        description: "Pull them aside immediately. 'Hey, I noticed something we should fix.'",
        traitScores: { directness: 95, courage: 85, honesty: 90 }
      },
      {
        id: 'c4b',
        text: 'Thoughtful framing',
        description: "Wait for the right moment. Frame it as a question: 'Have you considered...'",
        traitScores: { diplomacy: 90, empathy: 85, patience: 80 }
      },
      {
        id: 'c4c',
        text: 'Fix it yourself',
        description: "Just quietly fix it. No need to make it a thing.",
        traitScores: { independence: 85, avoidance: 60, efficiency: 75 }
      },
      {
        id: 'c4d',
        text: 'Escalate appropriately',
        description: "Mention it to the team lead. It's their job to handle these conversations.",
        traitScores: { process: 80, hierarchy: 75, caution: 70 }
      }
    ],
    traits: ['directness', 'diplomacy', 'independence', 'hierarchy']
  },

  // === SLIDER: ENERGY SOURCE ===
  {
    id: 'c5',
    type: 'slider',
    category: 'Energy',
    question: 'After an intense week, what recharges you more?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Solo time - books, walks, thinking',
      maxLabel: 'Social time - friends, events, conversations',
      trait: 'extraversion'
    },
    traits: ['extraversion']
  },

  // === RANKING: VALUE PRIORITIES ===
  {
    id: 'c6',
    type: 'ranking',
    category: 'Motivation',
    question: 'Rank what matters most to you in a job (drag to reorder)',
    description: 'Be honest - there are no wrong answers',
    options: [
      { id: 'c6a', text: 'Impact', description: 'Making a real difference in the world', traitScores: { impact: 100 } },
      { id: 'c6b', text: 'Growth', description: 'Learning and advancing your skills', traitScores: { growth: 100 } },
      { id: 'c6c', text: 'Stability', description: 'Security and predictability', traitScores: { stability: 100 } },
      { id: 'c6d', text: 'Recognition', description: 'Being valued and acknowledged', traitScores: { recognition: 100 } },
      { id: 'c6e', text: 'Connection', description: 'Meaningful relationships with colleagues', traitScores: { connection: 100 } },
      { id: 'c6f', text: 'Autonomy', description: 'Freedom to work your way', traitScores: { autonomy: 100 } }
    ],
    traits: ['impact', 'growth', 'stability', 'recognition', 'connection', 'autonomy']
  },

  // === SCENARIO: THE DISAGREEMENT ===
  {
    id: 'c7',
    type: 'scenario',
    category: 'Conflict',
    question: "You strongly disagree with a decision your manager just made. It affects your team's work directly.",
    options: [
      {
        id: 'c7a',
        text: 'Speak up immediately',
        description: "Express your concerns in the meeting. Important to address it while everyone is present.",
        traitScores: { assertiveness: 95, courage: 90, directness: 85 }
      },
      {
        id: 'c7b',
        text: 'Request a private chat',
        description: "Ask to discuss it one-on-one after the meeting. More productive without an audience.",
        traitScores: { diplomacy: 90, respect: 85, strategy: 80 }
      },
      {
        id: 'c7c',
        text: 'Gather allies first',
        description: "Talk to teammates who share your concerns. Present a unified perspective.",
        traitScores: { coalition: 85, strategy: 80, influence: 75 }
      },
      {
        id: 'c7d',
        text: 'Trust the process',
        description: "They probably have context you don't. Give it a chance to work.",
        traitScores: { trust: 80, patience: 85, adaptability: 75 }
      }
    ],
    traits: ['assertiveness', 'diplomacy', 'trust', 'strategy']
  },

  // === METAPHOR: YOUR WORK RHYTHM ===
  {
    id: 'c8',
    type: 'metaphor',
    category: 'Pace',
    question: 'Which musical rhythm best describes how you like to work?',
    options: [
      {
        id: 'c8a',
        text: 'Jazz improvisation',
        description: 'Spontaneous, responsive, creating in the moment',
        traitScores: { flexibility: 95, creativity: 90, spontaneity: 85 }
      },
      {
        id: 'c8b',
        text: 'Classical symphony',
        description: 'Structured, building to crescendos, every note intentional',
        traitScores: { structure: 95, planning: 90, precision: 85 }
      },
      {
        id: 'c8c',
        text: 'Electronic beats',
        description: 'Steady rhythm, building layers, optimizing the groove',
        traitScores: { consistency: 90, iteration: 85, focus: 80 }
      },
      {
        id: 'c8d',
        text: 'Rock anthem',
        description: 'High energy, emotional peaks, memorable moments',
        traitScores: { intensity: 95, passion: 90, impact: 85 }
      }
    ],
    traits: ['flexibility', 'structure', 'consistency', 'intensity']
  },

  // === TRADEOFF: INNOVATION VS RELIABILITY ===
  {
    id: 'c9',
    type: 'tradeoff',
    category: 'Approach',
    question: 'When solving a problem, which approach calls to you?',
    options: [
      {
        id: 'c9a',
        text: 'Find something new',
        description: "There might be a better way no one's tried yet.",
        traitScores: { innovation: 95, risk: 80, creativity: 90 }
      },
      {
        id: 'c9b',
        text: 'Use what works',
        description: "Don't reinvent the wheel. Build on proven approaches.",
        traitScores: { pragmatism: 95, reliability: 85, efficiency: 80 }
      }
    ],
    traits: ['innovation', 'pragmatism', 'risk']
  },

  // === SLIDER: PLANNING SPECTRUM ===
  {
    id: 'c10',
    type: 'slider',
    category: 'Planning',
    question: 'When starting a new project, where do you fall?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Dive in and figure it out',
      maxLabel: 'Plan everything first',
      trait: 'planning'
    },
    traits: ['planning']
  },

  // === SCENARIO: THE OPPORTUNITY ===
  {
    id: 'c11',
    type: 'scenario',
    category: 'Growth',
    question: "You're offered a role in a completely new field. More money, but you'd be starting from scratch. Your current role has a clear promotion path.",
    options: [
      {
        id: 'c11a',
        text: 'Take the leap',
        description: "Growth happens outside comfort zones. The learning opportunity is worth the risk.",
        traitScores: { risk: 95, growth: 90, adventure: 85 }
      },
      {
        id: 'c11b',
        text: 'Stay the course',
        description: "Building mastery in your field is underrated. Depth over breadth.",
        traitScores: { stability: 85, mastery: 90, patience: 80 }
      },
      {
        id: 'c11c',
        text: 'Negotiate a hybrid',
        description: "Can you try it part-time first? Test before fully committing.",
        traitScores: { strategy: 90, caution: 80, flexibility: 85 }
      },
      {
        id: 'c11d',
        text: 'Need more information',
        description: "Too many unknowns. Research thoroughly before deciding.",
        traitScores: { analytical: 90, caution: 85, thoroughness: 80 }
      }
    ],
    traits: ['risk', 'stability', 'growth', 'analytical']
  },

  // === REFLECTION: PEAK MOMENT ===
  {
    id: 'c12',
    type: 'reflection',
    category: 'Identity',
    question: "Think of a moment at work when you felt most alive. What were you doing?",
    description: "Write 1-2 sentences. There's no right answer - we're looking for what energizes you.",
    traits: ['passion', 'motivation', 'values']
  },

  // === METAPHOR: TEAM ROLE ===
  {
    id: 'c13',
    type: 'metaphor',
    category: 'Collaboration',
    question: 'In a band, which role do you naturally gravitate toward?',
    options: [
      {
        id: 'c13a',
        text: 'Lead vocalist',
        description: 'Front and center, carrying the melody, connecting with the audience',
        traitScores: { leadership: 95, visibility: 90, influence: 85 }
      },
      {
        id: 'c13b',
        text: 'Lead guitarist',
        description: 'Technical excellence, standout solos, recognized expertise',
        traitScores: { expertise: 95, independence: 85, recognition: 80 }
      },
      {
        id: 'c13c',
        text: 'Bassist',
        description: 'The foundation, holding everything together, felt more than heard',
        traitScores: { support: 95, reliability: 90, humility: 85 }
      },
      {
        id: 'c13d',
        text: 'Drummer',
        description: 'Setting the pace, high energy, driving the whole group forward',
        traitScores: { drive: 95, energy: 90, consistency: 85 }
      }
    ],
    traits: ['leadership', 'expertise', 'support', 'drive']
  },

  // === TRADEOFF: DEPTH VS BREADTH ===
  {
    id: 'c14',
    type: 'tradeoff',
    category: 'Learning',
    question: 'Given unlimited time to learn, which appeals more?',
    options: [
      {
        id: 'c14a',
        text: 'Master one thing',
        description: 'Become world-class at a single skill. True expertise.',
        traitScores: { depth: 95, focus: 90, mastery: 85 }
      },
      {
        id: 'c14b',
        text: 'Learn many things',
        description: 'Develop broad knowledge across domains. Connect ideas.',
        traitScores: { breadth: 95, curiosity: 90, versatility: 85 }
      }
    ],
    traits: ['depth', 'breadth', 'focus', 'curiosity']
  },

  // === SCENARIO: THE MISTAKE ===
  {
    id: 'c15',
    type: 'scenario',
    category: 'Accountability',
    question: "You made a mistake that cost the company money. No one has noticed yet.",
    options: [
      {
        id: 'c15a',
        text: 'Immediate disclosure',
        description: "Go to your manager right away. Better they hear it from you.",
        traitScores: { honesty: 95, accountability: 90, courage: 85 }
      },
      {
        id: 'c15b',
        text: 'Fix first, then tell',
        description: "Solve the problem, then report it along with your solution.",
        traitScores: { ownership: 90, problem_solving: 85, initiative: 80 }
      },
      {
        id: 'c15c',
        text: 'Assess the situation',
        description: "Understand the full impact first. No point causing alarm if it's minor.",
        traitScores: { analytical: 85, caution: 80, strategic: 75 }
      },
      {
        id: 'c15d',
        text: 'Learn and prevent',
        description: "Focus on making sure it doesn't happen again. Document for yourself.",
        traitScores: { learning: 80, prevention: 85, independence: 70 }
      }
    ],
    traits: ['honesty', 'accountability', 'ownership', 'analytical']
  },

  // === SLIDER: WORK-LIFE INTEGRATION ===
  {
    id: 'c16',
    type: 'slider',
    category: 'Balance',
    question: 'How do you think about work and life?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Clear separation - work stays at work',
      maxLabel: 'Fully integrated - work is part of life',
      trait: 'integration'
    },
    traits: ['integration']
  }
];

// ============================================
// EMPLOYER ASSESSMENT QUESTIONS
// ============================================

export const employerQuestions: AssessmentQuestion[] = [
  // === SCENARIO: THE HIRE ===
  {
    id: 'e1',
    type: 'scenario',
    category: 'Hiring Values',
    question: "Two final candidates: One has perfect skills but average culture fit. The other has great culture fit but needs some skill development.",
    options: [
      {
        id: 'e1a',
        text: 'Hire for skills',
        description: "Skills are hard to teach. Culture can adapt over time.",
        traitScores: { skills_focus: 95, efficiency: 85, pragmatism: 80 }
      },
      {
        id: 'e1b',
        text: 'Hire for culture',
        description: "Culture is who they are. Skills can be developed.",
        traitScores: { culture_focus: 95, development: 85, long_term: 80 }
      },
      {
        id: 'e1c',
        text: 'Keep looking',
        description: "Don't compromise. The right person has both.",
        traitScores: { high_bar: 95, patience: 80, perfectionism: 75 }
      },
      {
        id: 'e1d',
        text: 'Hire both differently',
        description: "Skill person for urgent role, culture person for growth track.",
        traitScores: { flexibility: 90, strategic: 85, pragmatism: 80 }
      }
    ],
    traits: ['skills_focus', 'culture_focus', 'high_bar', 'flexibility']
  },

  // === METAPHOR: COMPANY PERSONALITY ===
  {
    id: 'e2',
    type: 'metaphor',
    category: 'Culture',
    question: 'If your company was a place to visit, what would it be?',
    options: [
      {
        id: 'e2a',
        text: 'A startup garage',
        description: 'Scrappy, inventive, building something from nothing',
        traitScores: { innovation: 95, scrappiness: 90, risk: 85 }
      },
      {
        id: 'e2b',
        text: 'A research library',
        description: 'Deep thinking, expertise, thoughtful decisions',
        traitScores: { depth: 95, expertise: 90, deliberation: 85 }
      },
      {
        id: 'e2c',
        text: 'A sports stadium',
        description: 'High energy, competition, celebrating wins together',
        traitScores: { competition: 95, energy: 90, celebration: 85 }
      },
      {
        id: 'e2d',
        text: 'A cozy coffee shop',
        description: 'Warm relationships, comfortable pace, meaningful conversations',
        traitScores: { warmth: 95, connection: 90, comfort: 85 }
      }
    ],
    traits: ['innovation', 'depth', 'competition', 'warmth']
  },

  // === TRADEOFF: SPEED VS CONSENSUS ===
  {
    id: 'e3',
    type: 'tradeoff',
    category: 'Decision Making',
    question: 'When making important decisions, which do you prioritize?',
    options: [
      {
        id: 'e3a',
        text: 'Move fast',
        description: "Strong opinions, loosely held. Decide and iterate.",
        traitScores: { speed: 95, autonomy: 85, action: 90 }
      },
      {
        id: 'e3b',
        text: 'Build consensus',
        description: "Bring everyone along. Decisions stick when people buy in.",
        traitScores: { consensus: 95, inclusion: 85, thoroughness: 80 }
      }
    ],
    traits: ['speed', 'consensus', 'autonomy', 'inclusion']
  },

  // === SCENARIO: THE UNDERPERFORMER ===
  {
    id: 'e4',
    type: 'scenario',
    category: 'Management',
    question: "A team member is consistently underperforming. They're well-liked and have been with the company for years.",
    options: [
      {
        id: 'e4a',
        text: 'Direct conversation',
        description: "Clear expectations, specific timeline. They deserve honesty.",
        traitScores: { directness: 95, fairness: 85, clarity: 90 }
      },
      {
        id: 'e4b',
        text: 'Find their strength',
        description: "Maybe they're in the wrong role. Explore where they could thrive.",
        traitScores: { development: 90, empathy: 85, creative_solutions: 80 }
      },
      {
        id: 'e4c',
        text: 'Increase support',
        description: "Give them more resources, mentorship, training first.",
        traitScores: { support: 90, patience: 85, investment: 80 }
      },
      {
        id: 'e4d',
        text: 'Make the hard call',
        description: "Sometimes the kindest thing is a clean break.",
        traitScores: { decisiveness: 95, results: 85, tough_love: 80 }
      }
    ],
    traits: ['directness', 'development', 'support', 'decisiveness']
  },

  // === SLIDER: HIERARCHY ===
  {
    id: 'e5',
    type: 'slider',
    category: 'Structure',
    question: 'How is your organization structured?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Flat - everyone contributes ideas equally',
      maxLabel: 'Hierarchical - clear chain of command',
      trait: 'hierarchy'
    },
    traits: ['hierarchy']
  },

  // === RANKING: CULTURE PRIORITIES ===
  {
    id: 'e6',
    type: 'ranking',
    category: 'Values',
    question: 'Rank what your company values most (drag to reorder)',
    options: [
      { id: 'e6a', text: 'Results', description: 'Outcomes matter most', traitScores: { results: 100 } },
      { id: 'e6b', text: 'Innovation', description: 'New ideas and approaches', traitScores: { innovation: 100 } },
      { id: 'e6c', text: 'Collaboration', description: 'Working together effectively', traitScores: { collaboration: 100 } },
      { id: 'e6d', text: 'Excellence', description: 'Highest quality in everything', traitScores: { excellence: 100 } },
      { id: 'e6e', text: 'Growth', description: 'Developing people and business', traitScores: { growth: 100 } },
      { id: 'e6f', text: 'Integrity', description: 'Doing the right thing always', traitScores: { integrity: 100 } }
    ],
    traits: ['results', 'innovation', 'collaboration', 'excellence', 'growth', 'integrity']
  },

  // === SCENARIO: THE OPPORTUNITY COST ===
  {
    id: 'e7',
    type: 'scenario',
    category: 'Strategy',
    question: "A promising new market opportunity emerged, but pursuing it means pulling resources from a successful existing product.",
    options: [
      {
        id: 'e7a',
        text: 'Go all in',
        description: "Fortune favors the bold. The new opportunity could be transformative.",
        traitScores: { risk: 95, vision: 90, boldness: 85 }
      },
      {
        id: 'e7b',
        text: 'Protect what works',
        description: "Don't kill the golden goose. New opportunities will come.",
        traitScores: { stability: 90, prudence: 85, protection: 80 }
      },
      {
        id: 'e7c',
        text: 'Test and learn',
        description: "Small bet first. Prove it works before going big.",
        traitScores: { analytical: 90, measured: 85, learning: 80 }
      },
      {
        id: 'e7d',
        text: 'Build capacity',
        description: "Find a way to do both. Hire, partner, get creative.",
        traitScores: { growth: 90, ambition: 85, resourcefulness: 80 }
      }
    ],
    traits: ['risk', 'stability', 'analytical', 'growth']
  },

  // === METAPHOR: MEETING STYLE ===
  {
    id: 'e8',
    type: 'metaphor',
    category: 'Communication',
    question: 'What does a typical meeting feel like at your company?',
    options: [
      {
        id: 'e8a',
        text: 'A debate club',
        description: 'Ideas clash, best arguments win, vigorous discussion',
        traitScores: { debate: 95, meritocracy: 90, intellectual: 85 }
      },
      {
        id: 'e8b',
        text: 'A jazz session',
        description: 'Riffing on ideas, building together, improvisation',
        traitScores: { creativity: 95, collaboration: 90, spontaneity: 85 }
      },
      {
        id: 'e8c',
        text: 'A briefing',
        description: 'Efficient updates, clear action items, minimal fluff',
        traitScores: { efficiency: 95, clarity: 90, action: 85 }
      },
      {
        id: 'e8d',
        text: 'A campfire',
        description: 'Stories shared, relationships built, collective wisdom',
        traitScores: { connection: 95, storytelling: 90, warmth: 85 }
      }
    ],
    traits: ['debate', 'creativity', 'efficiency', 'connection']
  },

  // === TRADEOFF: EXPERIENCE VS POTENTIAL ===
  {
    id: 'e9',
    type: 'tradeoff',
    category: 'Hiring',
    question: 'What do you weight more heavily when hiring?',
    options: [
      {
        id: 'e9a',
        text: 'Proven experience',
        description: "They've done this before. Reduced risk, faster ramp-up.",
        traitScores: { experience: 95, risk_averse: 85, predictability: 80 }
      },
      {
        id: 'e9b',
        text: 'Raw potential',
        description: "Hungry and capable. They'll grow into it and beyond.",
        traitScores: { potential: 95, development: 85, optimism: 80 }
      }
    ],
    traits: ['experience', 'potential', 'risk_averse', 'development']
  },

  // === SLIDER: FEEDBACK CULTURE ===
  {
    id: 'e10',
    type: 'slider',
    category: 'Feedback',
    question: 'How does feedback typically flow at your company?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Formal reviews - structured, scheduled',
      maxLabel: 'Continuous - real-time, in the moment',
      trait: 'feedback_style'
    },
    traits: ['feedback_style']
  },

  // === SCENARIO: THE CRISIS ===
  {
    id: 'e11',
    type: 'scenario',
    category: 'Leadership',
    question: "A major project just failed publicly. Team morale is low, stakeholders are upset.",
    options: [
      {
        id: 'e11a',
        text: 'Own it publicly',
        description: "Take responsibility. Shield the team, address stakeholders directly.",
        traitScores: { accountability: 95, leadership: 90, protection: 85 }
      },
      {
        id: 'e11b',
        text: 'Analyze first',
        description: "Understand what happened before responding. Data over emotion.",
        traitScores: { analytical: 90, measured: 85, thoroughness: 80 }
      },
      {
        id: 'e11c',
        text: 'Rally the team',
        description: "Focus internally first. Morale matters more than PR right now.",
        traitScores: { people_first: 95, empathy: 90, team: 85 }
      },
      {
        id: 'e11d',
        text: 'Move forward fast',
        description: "Don't dwell. Quickly pivot to what's next.",
        traitScores: { resilience: 90, action: 85, forward: 80 }
      }
    ],
    traits: ['accountability', 'analytical', 'people_first', 'resilience']
  },

  // === REFLECTION: CULTURE MOMENT ===
  {
    id: 'e12',
    type: 'reflection',
    category: 'Identity',
    question: "Describe a moment when your company culture was at its best.",
    description: "Write 1-2 sentences. What happened? What made it special?",
    traits: ['culture', 'values', 'pride']
  },

  // === SLIDER: WORK INTENSITY ===
  {
    id: 'e13',
    type: 'slider',
    category: 'Pace',
    question: 'What pace does your company operate at?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Sustainable - marathon pace, long-term focus',
      maxLabel: 'Intense - sprint pace, high urgency',
      trait: 'intensity'
    },
    traits: ['intensity']
  },

  // === SCENARIO: THE REMOTE QUESTION ===
  {
    id: 'e14',
    type: 'scenario',
    category: 'Flexibility',
    question: "Your best performer wants to go fully remote. Team collaboration is important to your culture.",
    options: [
      {
        id: 'e14a',
        text: 'Full flexibility',
        description: "Results matter, not location. Make it work.",
        traitScores: { flexibility: 95, trust: 90, results: 85 }
      },
      {
        id: 'e14b',
        text: 'Hybrid compromise',
        description: "Find middle ground. Some in-person time is valuable.",
        traitScores: { balance: 90, pragmatism: 85, collaboration: 80 }
      },
      {
        id: 'e14c',
        text: 'Hold the line',
        description: "Culture requires presence. Equal rules for everyone.",
        traitScores: { consistency: 90, fairness: 85, culture: 80 }
      },
      {
        id: 'e14d',
        text: 'Case by case',
        description: "Top performers earn special arrangements.",
        traitScores: { meritocracy: 85, flexibility: 80, pragmatism: 75 }
      }
    ],
    traits: ['flexibility', 'balance', 'consistency', 'meritocracy']
  },

  // === TRADEOFF: TRANSPARENCY ===
  {
    id: 'e15',
    type: 'tradeoff',
    category: 'Communication',
    question: 'How much information should employees have access to?',
    options: [
      {
        id: 'e15a',
        text: 'Radical transparency',
        description: "Share everything. Financials, strategies, challenges. Trust breeds trust.",
        traitScores: { transparency: 95, trust: 90, openness: 85 }
      },
      {
        id: 'e15b',
        text: 'Need to know',
        description: "Share what's relevant. Too much information creates noise and anxiety.",
        traitScores: { discretion: 90, focus: 85, protection: 80 }
      }
    ],
    traits: ['transparency', 'discretion', 'trust', 'focus']
  },

  // === SLIDER: INNOVATION APPETITE ===
  {
    id: 'e16',
    type: 'slider',
    category: 'Innovation',
    question: "How does your company approach innovation?",
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Optimize - perfect what works',
      maxLabel: 'Disrupt - constantly reinvent',
      trait: 'innovation'
    },
    traits: ['innovation']
  }
];

// ============================================
// TRAIT DEFINITIONS
// ============================================

export const traitDefinitions = {
  // Core personality traits
  collaboration: { name: 'Collaboration', description: 'Preference for working with others' },
  independence: { name: 'Independence', description: 'Preference for working autonomously' },
  structure: { name: 'Structure', description: 'Need for organization and clear processes' },
  flexibility: { name: 'Flexibility', description: 'Comfort with ambiguity and change' },
  risk: { name: 'Risk Tolerance', description: 'Willingness to take chances' },
  stability: { name: 'Stability', description: 'Preference for predictability' },
  innovation: { name: 'Innovation', description: 'Drive to create new things' },
  pragmatism: { name: 'Pragmatism', description: 'Focus on practical solutions' },
  directness: { name: 'Directness', description: 'Communication style clarity' },
  diplomacy: { name: 'Diplomacy', description: 'Tactful communication approach' },
  leadership: { name: 'Leadership', description: 'Natural tendency to lead' },
  support: { name: 'Support', description: 'Natural tendency to support others' },
  depth: { name: 'Depth', description: 'Focus on deep expertise' },
  breadth: { name: 'Breadth', description: 'Focus on broad knowledge' },
  intensity: { name: 'Intensity', description: 'Preferred work pace' },
  extraversion: { name: 'Extraversion', description: 'Energy from social interaction' },
  planning: { name: 'Planning', description: 'Preference for advance planning' },

  // Motivation drivers
  impact: { name: 'Impact', description: 'Driven by making a difference' },
  growth: { name: 'Growth', description: 'Driven by learning and development' },
  recognition: { name: 'Recognition', description: 'Driven by acknowledgment' },
  connection: { name: 'Connection', description: 'Driven by relationships' },
  autonomy: { name: 'Autonomy', description: 'Driven by freedom' },

  // Work values
  quality: { name: 'Quality', description: 'Commitment to excellence' },
  speed: { name: 'Speed', description: 'Bias toward action' },
  honesty: { name: 'Honesty', description: 'Commitment to truth' },
  accountability: { name: 'Accountability', description: 'Ownership of outcomes' }
};

export type TraitKey = keyof typeof traitDefinitions;
