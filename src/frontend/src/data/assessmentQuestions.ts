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
// WORK VALUES & MOTIVATION QUESTIONS
// Based on Self-Determination Theory (Deci & Ryan, 2000)
// and Holland's RIASEC→OCEAN mappings (Larson et al., 2002)
// ============================================

export const workValuesQuestions: AssessmentQuestion[] = [
  {
    id: 'wv1',
    type: 'tradeoff',
    category: 'Purpose',
    question: 'If you had to choose, which would you prioritize?',
    options: [
      {
        id: 'wv1a',
        text: 'Meaningful work',
        description: 'A role where you feel you\'re making a real difference, even if the pay is modest.',
        traitScores: { purpose: 95, intrinsic_motivation: 85, impact: 80 }
      },
      {
        id: 'wv1b',
        text: 'Financial security',
        description: 'A well-paying role that provides stability, even if the work isn\'t deeply fulfilling.',
        traitScores: { financial_security: 95, stability: 85, pragmatism: 80 }
      }
    ],
    traits: ['purpose', 'financial_security', 'intrinsic_motivation']
  },

  {
    id: 'wv2',
    type: 'scenario',
    category: 'Work Style',
    question: 'Imagine your ideal workday. Which sounds most appealing?',
    description: 'Pick the one that energizes you most.',
    options: [
      {
        id: 'wv2a',
        text: 'Creative exploration',
        description: 'Brainstorming sessions, prototyping, and exploring uncharted ideas all day.',
        traitScores: { creativity: 90, innovation: 85, self_direction: 80 }
      },
      {
        id: 'wv2b',
        text: 'Structured execution',
        description: 'Clear priorities, focused deep work, and checking off well-defined goals.',
        traitScores: { structure: 90, planning: 85, process: 80 }
      },
      {
        id: 'wv2c',
        text: 'Collaborative building',
        description: 'Pair programming, team discussions, and building something together.',
        traitScores: { collaboration: 90, cooperation: 85, connection: 80 }
      },
      {
        id: 'wv2d',
        text: 'Mentoring & leading',
        description: 'Coaching others, setting strategy, and seeing your team grow.',
        traitScores: { leadership: 90, empathy: 80, impact: 85 }
      }
    ],
    traits: ['creativity', 'structure', 'collaboration', 'leadership']
  },

  {
    id: 'wv3',
    type: 'tradeoff',
    category: 'Growth',
    question: 'Which career path appeals to you more?',
    options: [
      {
        id: 'wv3a',
        text: 'Rapid growth with risk',
        description: 'Fast advancement, big challenges, but uncertain outcomes.',
        traitScores: { risk: 90, growth: 95, courage: 80 }
      },
      {
        id: 'wv3b',
        text: 'Steady progression',
        description: 'Predictable advancement, building expertise over time, low stress.',
        traitScores: { stability: 90, mastery: 85, patience: 80 }
      }
    ],
    traits: ['risk', 'stability', 'growth', 'mastery']
  },

  {
    id: 'wv4',
    type: 'scenario',
    category: 'Recognition',
    question: 'Which form of recognition would mean the most to you?',
    options: [
      {
        id: 'wv4a',
        text: 'Public praise',
        description: 'Being highlighted in an all-hands meeting for your contributions.',
        traitScores: { recognition: 95, social: 80, ambition: 75 }
      },
      {
        id: 'wv4b',
        text: 'Quiet acknowledgment',
        description: 'A thoughtful private message from your manager recognizing your effort.',
        traitScores: { depth: 80, empathy: 85, diplomacy: 75 }
      },
      {
        id: 'wv4c',
        text: 'More responsibility',
        description: 'Being trusted with a bigger project or more autonomy.',
        traitScores: { autonomy: 90, growth: 85, ownership: 80 }
      },
      {
        id: 'wv4d',
        text: 'Tangible reward',
        description: 'A bonus, raise, or promotion that reflects your value.',
        traitScores: { financial_security: 85, achievement: 90, pragmatism: 80 }
      }
    ],
    traits: ['recognition', 'autonomy', 'achievement', 'depth']
  },

  {
    id: 'wv5',
    type: 'slider',
    category: 'Teamwork',
    question: 'In your ideal work environment, how do people interact?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Cooperative - everyone supports each other',
      maxLabel: 'Competitive - healthy rivalry drives results',
      trait: 'competition'
    },
    traits: ['competition', 'cooperation']
  },

  {
    id: 'wv6',
    type: 'scenario',
    category: 'Mission',
    question: 'Which type of company mission resonates most with you?',
    options: [
      {
        id: 'wv6a',
        text: 'Change the world',
        description: 'Tackling big societal problems like climate, health, or education.',
        traitScores: { purpose: 95, impact: 90, courage: 75 }
      },
      {
        id: 'wv6b',
        text: 'Build the future',
        description: 'Pushing the boundaries of technology and innovation.',
        traitScores: { innovation: 95, creativity: 85, risk: 80 }
      },
      {
        id: 'wv6c',
        text: 'Empower people',
        description: 'Creating tools and services that make people\'s lives better.',
        traitScores: { empathy: 90, connection: 85, collaboration: 80 }
      },
      {
        id: 'wv6d',
        text: 'Deliver excellence',
        description: 'Being the best at what you do, setting the industry standard.',
        traitScores: { quality: 95, mastery: 90, achievement: 85 }
      }
    ],
    traits: ['purpose', 'innovation', 'empathy', 'quality']
  },

  {
    id: 'wv7',
    type: 'tradeoff',
    category: 'Expertise',
    question: 'If you could only develop one way, which would you choose?',
    options: [
      {
        id: 'wv7a',
        text: 'Deep expertise',
        description: 'Become the go-to expert in one specific domain.',
        traitScores: { depth: 95, mastery: 90, focus: 85 }
      },
      {
        id: 'wv7b',
        text: 'Broad versatility',
        description: 'Build skills across many areas, connecting dots others miss.',
        traitScores: { versatility: 95, curiosity: 90, breadth: 85 }
      }
    ],
    traits: ['depth', 'versatility', 'mastery', 'curiosity']
  },

  {
    id: 'wv8',
    type: 'slider',
    category: 'Intensity',
    question: 'What work intensity feels right for you?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Sustainable pace - balance and well-being',
      maxLabel: 'All-in intensity - push hard, achieve more',
      trait: 'intensity'
    },
    traits: ['intensity', 'boundaries']
  },
];

// ============================================
// SITUATIONAL JUDGMENT QUESTIONS
// Based on SJT methodology (McDaniel et al., 2007)
// Targets A and N heavily — underrepresented in core assessment
// ============================================

export const situationalJudgmentQuestions: AssessmentQuestion[] = [
  {
    id: 'sj1',
    type: 'scenario',
    category: 'Conflict',
    question: 'Two team members are in a heated disagreement about the technical approach for a project. It\'s slowing everyone down.',
    description: 'What do you do?',
    options: [
      {
        id: 'sj1a',
        text: 'Mediate directly',
        description: 'Bring them together, listen to both sides, and help find common ground.',
        traitScores: { diplomacy: 90, empathy: 85, leadership: 80 }
      },
      {
        id: 'sj1b',
        text: 'Let them work it out',
        description: 'Adults should resolve their own conflicts. Step in only if it escalates.',
        traitScores: { independence: 80, boundaries: 85, patience: 75 }
      },
      {
        id: 'sj1c',
        text: 'Propose a compromise',
        description: 'Suggest a middle-ground approach that incorporates both perspectives.',
        traitScores: { cooperation: 90, creativity: 75, diplomacy: 80 }
      },
      {
        id: 'sj1d',
        text: 'Escalate to leadership',
        description: 'Flag it to the team lead. This is above your pay grade.',
        traitScores: { process: 85, caution: 80, hierarchy: 75 }
      }
    ],
    traits: ['diplomacy', 'empathy', 'cooperation', 'independence']
  },

  {
    id: 'sj2',
    type: 'scenario',
    category: 'Ethics',
    question: 'You discover that a popular feature your team shipped has a subtle bug that benefits the company financially but disadvantages some users.',
    description: 'How do you handle it?',
    options: [
      {
        id: 'sj2a',
        text: 'Report immediately',
        description: 'Flag it to your manager and push for an immediate fix, even if it hurts revenue.',
        traitScores: { honesty: 95, accountability: 90, courage: 85 }
      },
      {
        id: 'sj2b',
        text: 'Quantify the impact',
        description: 'Analyze how many users are affected and how much revenue is involved before deciding.',
        traitScores: { analytical: 90, caution: 80, thoroughness: 85 }
      },
      {
        id: 'sj2c',
        text: 'Fix it quietly',
        description: 'Submit a bug fix without making a big deal about it. Problem solved.',
        traitScores: { independence: 80, ownership: 85, efficiency: 75 }
      },
      {
        id: 'sj2d',
        text: 'Raise it with the team',
        description: 'Bring it up in the next team meeting as a discussion point about priorities.',
        traitScores: { collaboration: 85, diplomacy: 80, honesty: 75 }
      }
    ],
    traits: ['honesty', 'accountability', 'analytical', 'courage']
  },

  {
    id: 'sj3',
    type: 'scenario',
    category: 'Pressure',
    question: 'A critical deadline is 2 days away. The project is behind schedule. Your manager asks if you can deliver on time.',
    description: 'What do you say?',
    options: [
      {
        id: 'sj3a',
        text: 'Commit and deliver',
        description: '"Yes, I\'ll make it happen." Then work extra hours to meet the deadline.',
        traitScores: { intensity: 90, ownership: 85, courage: 80 }
      },
      {
        id: 'sj3b',
        text: 'Be transparent',
        description: '"Honestly, we need 2 more days. Here\'s what I can deliver by the deadline."',
        traitScores: { honesty: 95, boundaries: 85, emotional_regulation: 80 }
      },
      {
        id: 'sj3c',
        text: 'Negotiate scope',
        description: '"We can ship the core features on time if we defer these lower-priority items."',
        traitScores: { strategic: 90, diplomacy: 85, pragmatism: 80 }
      },
      {
        id: 'sj3d',
        text: 'Rally the team',
        description: '"Let me check with the team. If we redistribute work, we might pull it off."',
        traitScores: { collaboration: 90, leadership: 80, optimism: 75 }
      }
    ],
    traits: ['honesty', 'intensity', 'strategic', 'collaboration']
  },

  {
    id: 'sj4',
    type: 'scenario',
    category: 'Resilience',
    question: 'In a review meeting, a senior leader harshly criticizes your work in front of the entire team. Some of their points are valid, but the delivery feels personal.',
    description: 'How do you respond?',
    options: [
      {
        id: 'sj4a',
        text: 'Stay composed',
        description: 'Take notes, thank them for the feedback, and process it later privately.',
        traitScores: { emotional_regulation: 95, patience: 85, resilience: 80 }
      },
      {
        id: 'sj4b',
        text: 'Push back respectfully',
        description: 'Acknowledge valid points but address the delivery: "I appreciate the feedback, though I\'d prefer to discuss this 1:1."',
        traitScores: { assertiveness: 90, courage: 85, boundaries: 80 }
      },
      {
        id: 'sj4c',
        text: 'Seek support afterward',
        description: 'Talk to a trusted colleague or your direct manager about the interaction.',
        traitScores: { connection: 85, empathy: 80, emotional_expression: 75 }
      },
      {
        id: 'sj4d',
        text: 'Channel it into improvement',
        description: 'Use the criticism as fuel. Come back next meeting with dramatically improved work.',
        traitScores: { resilience: 90, ambition: 85, initiative: 80 }
      }
    ],
    traits: ['emotional_regulation', 'resilience', 'assertiveness', 'connection']
  },

  {
    id: 'sj5',
    type: 'scenario',
    category: 'Support',
    question: 'A colleague who joined recently is clearly struggling with their workload. They haven\'t asked for help, but you can see they\'re stressed.',
    description: 'What do you do?',
    options: [
      {
        id: 'sj5a',
        text: 'Offer help proactively',
        description: '"Hey, I\'ve got some bandwidth. Can I take anything off your plate?"',
        traitScores: { empathy: 95, collaboration: 85, initiative: 80 }
      },
      {
        id: 'sj5b',
        text: 'Respect their autonomy',
        description: 'They\'ll ask if they need help. Stepping in unsolicited might undermine their confidence.',
        traitScores: { boundaries: 85, independence: 80, patience: 75 }
      },
      {
        id: 'sj5c',
        text: 'Mention it to your manager',
        description: 'Let the team lead know so they can check in and redistribute if needed.',
        traitScores: { process: 85, caution: 80, accountability: 75 }
      },
      {
        id: 'sj5d',
        text: 'Share knowledge casually',
        description: 'Without making it a "help" moment, share tips and resources that might make their work easier.',
        traitScores: { diplomacy: 90, empathy: 80, cooperation: 85 }
      }
    ],
    traits: ['empathy', 'collaboration', 'boundaries', 'diplomacy']
  },

  {
    id: 'sj6',
    type: 'tradeoff',
    category: 'Communication',
    question: 'When delivering difficult news to a stakeholder, which do you lean toward?',
    options: [
      {
        id: 'sj6a',
        text: 'Honest and direct',
        description: 'Tell them exactly what happened and why. No sugarcoating.',
        traitScores: { honesty: 95, directness: 90, courage: 85 }
      },
      {
        id: 'sj6b',
        text: 'Thoughtful and diplomatic',
        description: 'Frame the news carefully, focusing on solutions and next steps.',
        traitScores: { diplomacy: 95, empathy: 85, strategic: 80 }
      }
    ],
    traits: ['honesty', 'diplomacy', 'courage', 'empathy']
  },

  {
    id: 'sj7',
    type: 'scenario',
    category: 'Ownership',
    question: 'A task falls through the cracks — it\'s not clearly assigned to anyone. The deadline is tomorrow.',
    description: 'What do you do?',
    options: [
      {
        id: 'sj7a',
        text: 'Pick it up yourself',
        description: 'Someone needs to own it. You step up and get it done.',
        traitScores: { initiative: 95, ownership: 90, intensity: 80 }
      },
      {
        id: 'sj7b',
        text: 'Flag it to the team',
        description: 'Send a message: "Hey team, this is unassigned. Who can take it?"',
        traitScores: { collaboration: 85, process: 80, leadership: 75 }
      },
      {
        id: 'sj7c',
        text: 'Escalate to the lead',
        description: 'This is a process failure. Alert the team lead so they can assign it properly.',
        traitScores: { process: 90, analytical: 80, caution: 75 }
      },
      {
        id: 'sj7d',
        text: 'Assess and divide',
        description: 'Break the task into parts and coordinate with available teammates to split the work.',
        traitScores: { organization: 90, collaboration: 85, strategic: 80 }
      }
    ],
    traits: ['initiative', 'ownership', 'collaboration', 'process']
  },

  {
    id: 'sj8',
    type: 'slider',
    category: 'Expression',
    question: 'How comfortable are you expressing emotions at work?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Keep it professional - emotions stay private',
      maxLabel: 'Be authentic - share how you feel openly',
      trait: 'emotional_expression'
    },
    traits: ['emotional_expression']
  },
];

// ============================================
// COGNITIVE PATTERNS ASSESSMENT QUESTIONS
// ============================================

export const cognitivePatternQuestions: AssessmentQuestion[] = [
  // CP1: Problem-solving approach
  {
    id: 'cp1',
    type: 'scenario',
    category: 'Problem Solving',
    question: "You encounter a complex bug that's been stumping the team for days. How do you approach it?",
    description: 'Choose the approach that feels most natural to you.',
    options: [
      {
        id: 'cp1a',
        text: 'Systematic elimination',
        description: 'Isolate variables one by one, test each hypothesis methodically until you find the root cause.',
        traitScores: { analytical: 95, thoroughness: 90, process: 85 }
      },
      {
        id: 'cp1b',
        text: 'Intuitive pattern matching',
        description: "Trust your gut — you've seen patterns like this before. Jump to likely causes and test your hunch.",
        traitScores: { curiosity: 85, intuition: 90, risk: 70 }
      },
      {
        id: 'cp1c',
        text: 'Rubber duck it',
        description: 'Talk it through with someone. Explaining the problem out loud often reveals the answer.',
        traitScores: { collaboration: 90, social: 80, empathy: 70 }
      },
      {
        id: 'cp1d',
        text: 'Step away and reframe',
        description: 'Take a walk, work on something else. Fresh eyes see what tired ones miss.',
        traitScores: { creativity: 85, flexibility: 90, resilience: 80 }
      }
    ],
    traits: ['analytical', 'intuition', 'collaboration', 'creativity']
  },

  // CP2: Information processing style
  {
    id: 'cp2',
    type: 'scenario',
    category: 'Learning Style',
    question: "You need to learn a completely new technology stack for an upcoming project. How do you start?",
    description: 'What does your learning process look like?',
    options: [
      {
        id: 'cp2a',
        text: 'Read the docs first',
        description: 'Start with official documentation and tutorials. Build a mental model before touching code.',
        traitScores: { thoroughness: 95, structure: 85, planning: 80 }
      },
      {
        id: 'cp2b',
        text: 'Build something immediately',
        description: 'Clone a starter repo and start hacking. You learn best by doing, not reading.',
        traitScores: { risk: 85, intensity: 80, pragmatism: 90 }
      },
      {
        id: 'cp2c',
        text: 'Find a course or mentor',
        description: 'Look for a structured learning path or someone who already knows it well.',
        traitScores: { structure: 90, collaboration: 80, growth: 85 }
      },
      {
        id: 'cp2d',
        text: 'Explore the ecosystem',
        description: 'Browse GitHub repos, read blog posts, watch conference talks. Understand the landscape first.',
        traitScores: { curiosity: 95, breadth: 90, openness: 85 }
      }
    ],
    traits: ['thoroughness', 'pragmatism', 'curiosity', 'structure']
  },

  // CP3: Decision-making under uncertainty
  {
    id: 'cp3',
    type: 'tradeoff',
    category: 'Decision Making',
    question: "When making a decision with incomplete information, which approach do you lean toward?",
    description: 'Pick the option that resonates more with how you naturally decide.',
    options: [
      {
        id: 'cp3a',
        text: 'Gather more data',
        description: 'Delay the decision until you have enough information to be confident. Better slow and right than fast and wrong.',
        traitScores: { analytical: 90, caution: 85, thoroughness: 80 }
      },
      {
        id: 'cp3b',
        text: 'Decide and iterate',
        description: "Make the best decision you can now and adjust as you learn more. Speed beats perfection.",
        traitScores: { risk: 85, intensity: 80, flexibility: 90 }
      }
    ],
    traits: ['analytical', 'risk', 'caution', 'flexibility']
  },

  // CP4: Abstraction preference
  {
    id: 'cp4',
    type: 'scenario',
    category: 'Thinking Style',
    question: 'When explaining a complex concept to a colleague, which technique do you reach for first?',
    description: 'How do you make the abstract concrete?',
    options: [
      {
        id: 'cp4a',
        text: 'Draw a diagram',
        description: 'Visual mapping — boxes, arrows, flowcharts. A picture clarifies what words cannot.',
        traitScores: { strategic: 85, organization: 80, creativity: 75 }
      },
      {
        id: 'cp4b',
        text: 'Tell a story or analogy',
        description: '"It\'s like when..." — connect the new concept to something familiar.',
        traitScores: { empathy: 85, creativity: 90, social: 80 }
      },
      {
        id: 'cp4c',
        text: 'Walk through step by step',
        description: 'Break it into sequential pieces. First this happens, then this, then this...',
        traitScores: { structure: 90, thoroughness: 85, process: 80 }
      },
      {
        id: 'cp4d',
        text: 'Show running code or examples',
        description: 'Concrete demonstrations beat abstract explanations every time.',
        traitScores: { pragmatism: 95, depth: 80, directness: 85 }
      }
    ],
    traits: ['strategic', 'creativity', 'structure', 'pragmatism']
  },

  // CP5: Focus spectrum slider
  {
    id: 'cp5',
    type: 'slider',
    category: 'Focus',
    question: 'Where do you fall on the focus spectrum?',
    description: 'There\'s no right answer — both ends have strengths.',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Deep focus on one thing at a time',
      maxLabel: 'Juggling multiple threads simultaneously',
      trait: 'multitasking',
    },
    traits: ['focus', 'flexibility', 'intensity']
  },

  // CP6: Feedback processing
  {
    id: 'cp6',
    type: 'scenario',
    category: 'Self-Awareness',
    question: 'After completing a big project, what do you instinctively do first?',
    description: 'How do you process outcomes?',
    options: [
      {
        id: 'cp6a',
        text: 'Retrospective analysis',
        description: 'Review what went well, what didn\'t, document the learnings for next time.',
        traitScores: { analytical: 90, growth: 85, thoroughness: 80 }
      },
      {
        id: 'cp6b',
        text: 'Celebrate and move on',
        description: 'Ship it, high-fives, next project. Momentum matters more than post-mortems.',
        traitScores: { intensity: 85, ambition: 80, resilience: 75 }
      },
      {
        id: 'cp6c',
        text: 'Gather team feedback',
        description: 'Ask the team how they felt, what they\'d change, what landed. The human side matters.',
        traitScores: { empathy: 90, collaboration: 85, leadership: 80 }
      },
      {
        id: 'cp6d',
        text: 'Compare to initial goals',
        description: 'Pull up the original spec. Did we hit the targets? What\'s the data say?',
        traitScores: { accountability: 90, analytical: 85, focus: 80 }
      }
    ],
    traits: ['analytical', 'ambition', 'empathy', 'accountability']
  },

  // CP7: Creativity vs structure tradeoff
  {
    id: 'cp7',
    type: 'tradeoff',
    category: 'Innovation',
    question: 'When starting a new feature or product, which feels more natural?',
    options: [
      {
        id: 'cp7a',
        text: 'Blueprint first',
        description: 'Design the architecture, define the spec, plan the milestones. Then build with confidence.',
        traitScores: { planning: 95, structure: 90, thoroughness: 85 }
      },
      {
        id: 'cp7b',
        text: 'Prototype first',
        description: 'Build a rough version fast. Let the design emerge from what you learn by doing.',
        traitScores: { innovation: 90, risk: 85, creativity: 90 }
      }
    ],
    traits: ['planning', 'innovation', 'structure', 'creativity']
  },

  // CP8: Cognitive load slider
  {
    id: 'cp8',
    type: 'slider',
    category: 'Complexity',
    question: 'How do you feel about complexity?',
    description: 'Where do you sit on this spectrum?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Simplify everything — less is more',
      maxLabel: 'Embrace complexity — nuance matters',
      trait: 'complexity_tolerance',
    },
    traits: ['thoroughness', 'openness', 'pragmatism']
  },
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

// ============================================
// EMPLOYER SUPPLEMENTARY: TEAM DYNAMICS
// ============================================

export const teamDynamicsQuestions: AssessmentQuestion[] = [
  {
    id: 'td1',
    type: 'scenario',
    category: 'Collaboration',
    question: 'Two departments disagree on the direction of a cross-functional project. Progress has stalled.',
    description: 'How does your organization typically handle this?',
    options: [
      {
        id: 'td1a',
        text: 'Facilitate a joint workshop',
        description: 'Bring both sides together, map out shared goals, and co-create the path forward.',
        traitScores: { collaboration: 90, empathy: 80, diplomacy: 85 }
      },
      {
        id: 'td1b',
        text: 'Escalate to leadership',
        description: 'A senior leader makes the call. Clear authority breaks the tie quickly.',
        traitScores: { hierarchy: 90, decisiveness: 85, process: 80 }
      },
      {
        id: 'td1c',
        text: 'Let them debate it out',
        description: 'Healthy conflict produces better outcomes. The best argument should win.',
        traitScores: { debate: 90, transparency: 80, independence: 75 }
      },
      {
        id: 'td1d',
        text: 'Run a structured experiment',
        description: 'Test both approaches on a small scale. Let data settle the disagreement.',
        traitScores: { analytical: 90, innovation: 80, pragmatism: 85 }
      }
    ],
    traits: ['collaboration', 'hierarchy', 'debate', 'analytical']
  },

  {
    id: 'td2',
    type: 'slider',
    category: 'Team Style',
    question: 'Where does your team culture fall on the collaboration spectrum?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Deep independent work — people own their domains',
      maxLabel: 'Constant collaboration — everything is a team effort',
      trait: 'collaboration'
    },
    traits: ['collaboration']
  },

  {
    id: 'td3',
    type: 'scenario',
    category: 'Conflict',
    question: 'Two team members have a personal friction that\'s starting to affect the team\'s output.',
    description: 'What happens next?',
    options: [
      {
        id: 'td3a',
        text: 'Manager mediates directly',
        description: 'The manager sits them down, listens to both sides, and helps them find resolution.',
        traitScores: { empathy: 90, leadership: 85, diplomacy: 80 }
      },
      {
        id: 'td3b',
        text: 'Peer accountability',
        description: 'The team itself addresses it. Culture of candor means everyone speaks up.',
        traitScores: { trust: 90, transparency: 85, collaboration: 80 }
      },
      {
        id: 'td3c',
        text: 'HR steps in',
        description: 'A neutral third party handles interpersonal issues. Keep it professional.',
        traitScores: { process: 85, consistency: 80, hierarchy: 75 }
      },
      {
        id: 'td3d',
        text: 'Reassign and separate',
        description: 'Not every dynamic works. Move people to where they can be productive.',
        traitScores: { pragmatism: 85, decisiveness: 80, efficiency: 75 }
      }
    ],
    traits: ['empathy', 'trust', 'process', 'pragmatism']
  },

  {
    id: 'td4',
    type: 'metaphor',
    category: 'Communication',
    question: 'If your team\'s meeting culture was a meal, what would it be?',
    options: [
      {
        id: 'td4a',
        text: 'A potluck dinner',
        description: 'Everyone brings something to the table. Diverse, collaborative, sometimes messy.',
        traitScores: { collaboration: 95, creativity: 80, connection: 85 }
      },
      {
        id: 'td4b',
        text: 'A chef\'s tasting menu',
        description: 'Curated, intentional, every course has a purpose. Structured but high-quality.',
        traitScores: { structure: 90, quality: 85, efficiency: 80 }
      },
      {
        id: 'td4c',
        text: 'A quick espresso',
        description: 'Short, focused, energizing. Get the essentials and get back to work.',
        traitScores: { efficiency: 95, intensity: 80, pragmatism: 85 }
      },
      {
        id: 'td4d',
        text: 'A family dinner',
        description: 'Relaxed, relationship-building, catching up on everything — work and personal.',
        traitScores: { connection: 95, empathy: 85, trust: 80 }
      }
    ],
    traits: ['collaboration', 'structure', 'efficiency', 'connection']
  },

  {
    id: 'td5',
    type: 'tradeoff',
    category: 'Hiring',
    question: 'When building a team, what do you prioritize?',
    options: [
      {
        id: 'td5a',
        text: 'Complementary differences',
        description: 'Diverse thinking styles, backgrounds, and skills create stronger teams.',
        traitScores: { innovation: 90, curiosity: 85, flexibility: 80 }
      },
      {
        id: 'td5b',
        text: 'Cultural alignment',
        description: 'Shared values and communication styles create frictionless collaboration.',
        traitScores: { consistency: 90, trust: 85, collaboration: 80 }
      }
    ],
    traits: ['innovation', 'consistency', 'trust', 'flexibility']
  },

  {
    id: 'td6',
    type: 'scenario',
    category: 'Transparency',
    question: 'The company is facing a significant challenge — a major client is at risk. How much does the team know?',
    options: [
      {
        id: 'td6a',
        text: 'Full transparency',
        description: 'Share the situation openly. The team deserves to know and can contribute solutions.',
        traitScores: { transparency: 95, trust: 90, collaboration: 80 }
      },
      {
        id: 'td6b',
        text: 'Leadership handles it',
        description: 'Shield the team from unnecessary stress. Share what\'s needed, when it\'s needed.',
        traitScores: { hierarchy: 85, stability: 80, process: 75 }
      },
      {
        id: 'td6c',
        text: 'Share with key people',
        description: 'Brief senior ICs and team leads. They can cascade information appropriately.',
        traitScores: { strategic: 85, trust: 75, hierarchy: 70 }
      },
      {
        id: 'td6d',
        text: 'Share after a plan exists',
        description: 'Don\'t raise alarm without a solution. Share the problem alongside the action plan.',
        traitScores: { stability: 90, leadership: 80, pragmatism: 85 }
      }
    ],
    traits: ['transparency', 'hierarchy', 'strategic', 'stability']
  },

  {
    id: 'td7',
    type: 'tradeoff',
    category: 'Accountability',
    question: 'How does accountability work best on your teams?',
    options: [
      {
        id: 'td7a',
        text: 'Peer-driven accountability',
        description: 'Team members hold each other to commitments. Distributed ownership.',
        traitScores: { trust: 90, collaboration: 85, transparency: 80 }
      },
      {
        id: 'td7b',
        text: 'Manager-led accountability',
        description: 'Clear reporting lines. Managers set expectations and track progress.',
        traitScores: { hierarchy: 90, structure: 85, consistency: 80 }
      }
    ],
    traits: ['trust', 'hierarchy', 'collaboration', 'structure']
  },

  {
    id: 'td8',
    type: 'slider',
    category: 'Bonding',
    question: 'How much does your company invest in non-work social bonding?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Keep it professional — work relationships stay at work',
      maxLabel: 'Invest heavily — retreats, socials, team traditions',
      trait: 'connection'
    },
    traits: ['connection']
  },
];

// ============================================
// EMPLOYER SUPPLEMENTARY: LEADERSHIP & MANAGEMENT
// ============================================

export const leadershipStyleQuestions: AssessmentQuestion[] = [
  {
    id: 'ls1',
    type: 'scenario',
    category: 'Onboarding',
    question: 'A new employee just started. What do their first 90 days look like?',
    description: 'Choose the approach closest to your company\'s style.',
    options: [
      {
        id: 'ls1a',
        text: 'Structured program',
        description: 'Detailed onboarding plan, assigned buddy, clear milestones at 30/60/90 days.',
        traitScores: { structure: 95, investment: 85, process: 80 }
      },
      {
        id: 'ls1b',
        text: 'Sink or swim',
        description: 'Throw them into real projects fast. The best people figure it out quickly.',
        traitScores: { intensity: 90, independence: 85, risk: 80 }
      },
      {
        id: 'ls1c',
        text: 'Mentorship-focused',
        description: 'Pair them with a senior mentor. Learning through relationships and shadowing.',
        traitScores: { empathy: 90, investment: 85, collaboration: 80 }
      },
      {
        id: 'ls1d',
        text: 'Self-directed exploration',
        description: 'Give them access to everything, let them find their niche. Autonomy from day one.',
        traitScores: { trust: 90, flexibility: 85, innovation: 75 }
      }
    ],
    traits: ['structure', 'intensity', 'empathy', 'trust']
  },

  {
    id: 'ls2',
    type: 'slider',
    category: 'Authority',
    question: 'How is decision-making authority distributed?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Top-down — leaders decide, teams execute',
      maxLabel: 'Distributed — teams closest to the work decide',
      trait: 'trust'
    },
    traits: ['trust', 'hierarchy']
  },

  {
    id: 'ls3',
    type: 'scenario',
    category: 'Feedback',
    question: 'An employee delivered work that\'s below your quality standard. How does the feedback conversation go?',
    options: [
      {
        id: 'ls3a',
        text: 'Direct and immediate',
        description: '"This doesn\'t meet our bar. Here\'s specifically what needs to change."',
        traitScores: { directness: 95, quality: 85, intensity: 80 }
      },
      {
        id: 'ls3b',
        text: 'Coaching approach',
        description: '"Walk me through your thinking. What would you do differently next time?"',
        traitScores: { empathy: 90, investment: 85, reflection: 80 }
      },
      {
        id: 'ls3c',
        text: 'Peer review handles it',
        description: 'The team\'s code/work review process catches quality issues before they need escalation.',
        traitScores: { collaboration: 85, process: 80, trust: 75 }
      },
      {
        id: 'ls3d',
        text: 'Data-driven review',
        description: 'Reference specific metrics, benchmarks, and past performance. Let the data speak.',
        traitScores: { analytical: 90, quality: 85, consistency: 80 }
      }
    ],
    traits: ['directness', 'empathy', 'collaboration', 'analytical']
  },

  {
    id: 'ls4',
    type: 'metaphor',
    category: 'Management',
    question: 'If your ideal manager was a role, what would they be?',
    options: [
      {
        id: 'ls4a',
        text: 'A coach',
        description: 'Develops individuals, gives feedback, helps people reach their potential.',
        traitScores: { empathy: 95, investment: 90, growth: 85 }
      },
      {
        id: 'ls4b',
        text: 'A captain',
        description: 'Leads from the front, makes tough calls, inspires through action.',
        traitScores: { leadership: 95, intensity: 85, courage: 80 }
      },
      {
        id: 'ls4c',
        text: 'An architect',
        description: 'Designs systems, removes obstacles, builds the environment for success.',
        traitScores: { strategic: 95, structure: 85, analytical: 80 }
      },
      {
        id: 'ls4d',
        text: 'A gardener',
        description: 'Creates conditions for growth, nurtures talent, patient with development.',
        traitScores: { trust: 90, investment: 90, patience: 85 }
      }
    ],
    traits: ['empathy', 'leadership', 'strategic', 'trust']
  },

  {
    id: 'ls5',
    type: 'tradeoff',
    category: 'Innovation',
    question: 'When it comes to how teams work, which do you encourage more?',
    options: [
      {
        id: 'ls5a',
        text: 'Encourage experimentation',
        description: 'Try new approaches, challenge conventions, accept some failures along the way.',
        traitScores: { innovation: 95, risk: 85, flexibility: 80 }
      },
      {
        id: 'ls5b',
        text: 'Protect what works',
        description: 'Refine proven processes, maintain consistency, innovate carefully.',
        traitScores: { consistency: 90, quality: 85, stability: 80 }
      }
    ],
    traits: ['innovation', 'consistency', 'risk', 'stability']
  },

  {
    id: 'ls6',
    type: 'scenario',
    category: 'Performance',
    question: 'How does your performance review process work?',
    options: [
      {
        id: 'ls6a',
        text: 'Continuous feedback',
        description: 'Weekly 1:1s, real-time recognition, no surprises. The "annual review" is just a summary.',
        traitScores: { transparency: 90, investment: 85, trust: 80 }
      },
      {
        id: 'ls6b',
        text: 'Structured cycles',
        description: 'Quarterly or bi-annual formal reviews with clear rubrics and calibration.',
        traitScores: { structure: 90, consistency: 85, process: 80 }
      },
      {
        id: 'ls6c',
        text: '360-degree feedback',
        description: 'Input from peers, reports, and managers. A full picture of impact.',
        traitScores: { collaboration: 85, transparency: 80, empathy: 75 }
      },
      {
        id: 'ls6d',
        text: 'Results speak for themselves',
        description: 'Focus on output metrics. If you deliver, the numbers show it.',
        traitScores: { intensity: 85, independence: 80, pragmatism: 75 }
      }
    ],
    traits: ['transparency', 'structure', 'collaboration', 'intensity']
  },

  {
    id: 'ls7',
    type: 'tradeoff',
    category: 'Failure',
    question: 'When a project fails, which response do you value more?',
    options: [
      {
        id: 'ls7a',
        text: 'Celebrate the learning',
        description: 'Failure is tuition. Extract lessons, share them widely, move forward.',
        traitScores: { innovation: 90, trust: 85, reflection: 80 }
      },
      {
        id: 'ls7b',
        text: 'Analyze root cause',
        description: 'Conduct a thorough post-mortem. Understand exactly what went wrong to prevent repetition.',
        traitScores: { analytical: 90, quality: 85, consistency: 80 }
      }
    ],
    traits: ['innovation', 'analytical', 'trust', 'quality']
  },

  {
    id: 'ls8',
    type: 'slider',
    category: 'Accessibility',
    question: 'How accessible are senior leaders to individual contributors?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Formal layers — communication flows through hierarchy',
      maxLabel: 'Open door — anyone can reach anyone',
      trait: 'transparency'
    },
    traits: ['transparency', 'hierarchy']
  },
];

// ============================================
// EMPLOYER SUPPLEMENTARY: GROWTH & DEVELOPMENT
// ============================================

export const growthPhilosophyQuestions: AssessmentQuestion[] = [
  {
    id: 'gd1',
    type: 'scenario',
    category: 'Learning',
    question: 'An employee wants to attend a 3-day conference during a busy sprint.',
    description: 'What\'s the company\'s default response?',
    options: [
      {
        id: 'gd1a',
        text: 'Approve it enthusiastically',
        description: 'Learning comes first. The sprint can adjust. They\'ll come back energized.',
        traitScores: { investment: 95, trust: 85, flexibility: 80 }
      },
      {
        id: 'gd1b',
        text: 'Approve with conditions',
        description: 'Go, but ensure your deliverables are covered. Planning ahead is the trade-off.',
        traitScores: { quality: 85, structure: 80, investment: 75 }
      },
      {
        id: 'gd1c',
        text: 'Suggest a different time',
        description: 'The sprint matters. Find a conference that doesn\'t conflict with commitments.',
        traitScores: { consistency: 85, process: 80, stability: 75 }
      },
      {
        id: 'gd1d',
        text: 'Virtual alternative',
        description: 'Attend remotely or watch recordings. No need to leave the sprint.',
        traitScores: { pragmatism: 85, efficiency: 80, intensity: 70 }
      }
    ],
    traits: ['investment', 'quality', 'consistency', 'pragmatism']
  },

  {
    id: 'gd2',
    type: 'tradeoff',
    category: 'Career',
    question: 'How do career paths work at your company?',
    options: [
      {
        id: 'gd2a',
        text: 'Defined career ladder',
        description: 'Clear levels, criteria, and timelines. People know exactly what it takes to advance.',
        traitScores: { structure: 95, consistency: 85, process: 80 }
      },
      {
        id: 'gd2b',
        text: 'Organic growth paths',
        description: 'Roles evolve with the person. Create your own path based on impact and interest.',
        traitScores: { flexibility: 90, trust: 85, innovation: 80 }
      }
    ],
    traits: ['structure', 'flexibility', 'consistency', 'trust']
  },

  {
    id: 'gd3',
    type: 'scenario',
    category: 'Mentorship',
    question: 'How does mentorship work at your company?',
    options: [
      {
        id: 'gd3a',
        text: 'Formal mentorship program',
        description: 'Structured pairing, regular check-ins, defined goals for the mentorship.',
        traitScores: { structure: 90, investment: 85, process: 80 }
      },
      {
        id: 'gd3b',
        text: 'Organic relationships',
        description: 'People naturally find mentors. The best mentorships form spontaneously.',
        traitScores: { trust: 85, flexibility: 80, connection: 75 }
      },
      {
        id: 'gd3c',
        text: 'Learning communities',
        description: 'Guilds, study groups, and communities of practice. Collective learning over 1:1.',
        traitScores: { collaboration: 90, innovation: 80, connection: 85 }
      },
      {
        id: 'gd3d',
        text: 'External coaching',
        description: 'Invest in professional coaches and external training for high-potential people.',
        traitScores: { investment: 95, quality: 85, growth: 80 }
      }
    ],
    traits: ['structure', 'trust', 'collaboration', 'investment']
  },

  {
    id: 'gd4',
    type: 'slider',
    category: 'Investment',
    question: 'How much does your company invest in learning & development?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Learn on the job — experience is the best teacher',
      maxLabel: 'Heavy investment — dedicated budget, time, and programs',
      trait: 'investment'
    },
    traits: ['investment']
  },

  {
    id: 'gd5',
    type: 'scenario',
    category: 'Promotion',
    question: 'Two candidates for a promotion: one is a consistent, reliable performer; the other took bold risks with mixed but impressive results.',
    description: 'Who gets the role?',
    options: [
      {
        id: 'gd5a',
        text: 'The consistent performer',
        description: 'Reliability and trust are the foundation. Consistency earns advancement.',
        traitScores: { consistency: 95, quality: 85, stability: 80 }
      },
      {
        id: 'gd5b',
        text: 'The bold risk-taker',
        description: 'We need people who push boundaries. The upside of their wins outweighs the misses.',
        traitScores: { innovation: 90, risk: 85, intensity: 80 }
      },
      {
        id: 'gd5c',
        text: 'Depends on the role',
        description: 'Match the person to the position. Some roles need consistency, others need boldness.',
        traitScores: { strategic: 85, pragmatism: 80, analytical: 75 }
      },
      {
        id: 'gd5d',
        text: 'Create two paths',
        description: 'Promote both — one into a leadership track, the other into a specialist track.',
        traitScores: { investment: 85, empathy: 80, flexibility: 75 }
      }
    ],
    traits: ['consistency', 'innovation', 'strategic', 'investment']
  },

  {
    id: 'gd6',
    type: 'tradeoff',
    category: 'Development',
    question: 'What\'s your philosophy on professional development?',
    options: [
      {
        id: 'gd6a',
        text: 'Sharpen strengths',
        description: 'Double down on what people are already great at. Maximize natural talent.',
        traitScores: { quality: 90, depth: 85, intensity: 80 }
      },
      {
        id: 'gd6b',
        text: 'Fill gaps',
        description: 'Well-rounded professionals are more versatile. Address weaknesses to build balance.',
        traitScores: { growth: 90, flexibility: 85, investment: 80 }
      }
    ],
    traits: ['quality', 'growth', 'depth', 'flexibility']
  },

  {
    id: 'gd7',
    type: 'metaphor',
    category: 'Knowledge',
    question: 'How does knowledge flow through your organization?',
    options: [
      {
        id: 'gd7a',
        text: 'A library',
        description: 'Well-documented, searchable, self-serve. Knowledge lives in systems.',
        traitScores: { structure: 90, process: 85, consistency: 80 }
      },
      {
        id: 'gd7b',
        text: 'A conversation',
        description: 'Knowledge lives in people. Ask anyone, anytime. Oral tradition.',
        traitScores: { collaboration: 90, trust: 85, connection: 80 }
      },
      {
        id: 'gd7c',
        text: 'A broadcast',
        description: 'Regular all-hands, newsletters, demo days. Top-down knowledge sharing.',
        traitScores: { transparency: 85, leadership: 80, hierarchy: 75 }
      },
      {
        id: 'gd7d',
        text: 'A marketplace',
        description: 'Internal talks, blog posts, wikis. Anyone can teach, anyone can learn.',
        traitScores: { innovation: 85, collaboration: 80, trust: 75 }
      }
    ],
    traits: ['structure', 'collaboration', 'transparency', 'innovation']
  },

  {
    id: 'gd8',
    type: 'slider',
    category: 'Time',
    question: 'How much dedicated time do employees get for learning and development?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'No dedicated time — growth happens within daily work',
      maxLabel: 'Significant time — 10-20% of work time for development',
      trait: 'investment'
    },
    traits: ['investment']
  },
];

// ============================================
// EMPLOYER SUPPLEMENTARY: WORK ENVIRONMENT & PACE
// ============================================

export const workEnvironmentQuestions: AssessmentQuestion[] = [
  {
    id: 'we1',
    type: 'scenario',
    category: 'Location',
    question: 'Describe a typical workday at your company.',
    description: 'Which best represents your current setup?',
    options: [
      {
        id: 'we1a',
        text: 'Fully remote',
        description: 'Work from anywhere. Async-first communication, flexible schedules.',
        traitScores: { flexibility: 95, trust: 90, independence: 85 }
      },
      {
        id: 'we1b',
        text: 'Hybrid with core days',
        description: 'In-office 2-3 days for collaboration, remote for focused work.',
        traitScores: { collaboration: 80, flexibility: 75, structure: 70 }
      },
      {
        id: 'we1c',
        text: 'Office-first',
        description: 'Most people are in the office most days. Energy from being together.',
        traitScores: { collaboration: 90, connection: 85, energy: 80 }
      },
      {
        id: 'we1d',
        text: 'Results-only',
        description: 'No set hours or location. Deliver outcomes, and the rest is up to you.',
        traitScores: { trust: 95, independence: 90, flexibility: 85 }
      }
    ],
    traits: ['flexibility', 'collaboration', 'trust', 'independence']
  },

  {
    id: 'we2',
    type: 'slider',
    category: 'Pace',
    question: 'What\'s the typical work intensity at your company?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Sustainable marathon — steady pace, long-term thinking',
      maxLabel: 'Startup sprint — fast, intense, urgent',
      trait: 'energy'
    },
    traits: ['energy', 'intensity']
  },

  {
    id: 'we3',
    type: 'scenario',
    category: 'Boundaries',
    question: 'It\'s 8 PM on a weeknight. Someone posts a non-urgent question in the team Slack. What\'s the cultural expectation?',
    options: [
      {
        id: 'we3a',
        text: 'Respond if you see it',
        description: 'We\'re always-on. Quick responses show commitment and keep things moving.',
        traitScores: { intensity: 90, energy: 85, collaboration: 75 }
      },
      {
        id: 'we3b',
        text: 'Next business day',
        description: 'Off-hours are off-hours. A healthy boundary protects everyone\'s well-being.',
        traitScores: { boundaries: 95, stability: 85, consistency: 80 }
      },
      {
        id: 'we3c',
        text: 'Your choice, no judgment',
        description: 'Some people are night owls, some aren\'t. No expectation either way.',
        traitScores: { trust: 90, flexibility: 85, independence: 80 }
      },
      {
        id: 'we3d',
        text: 'Use scheduled send',
        description: 'Write it now, deliver it tomorrow. Respect async rhythms.',
        traitScores: { empathy: 85, process: 80, boundaries: 75 }
      }
    ],
    traits: ['intensity', 'boundaries', 'trust', 'empathy']
  },

  {
    id: 'we4',
    type: 'metaphor',
    category: 'Space',
    question: 'If your workspace had a personality, what would it be?',
    options: [
      {
        id: 'we4a',
        text: 'A coworking space',
        description: 'Open, flexible, buzzing with energy. Serendipitous connections happen.',
        traitScores: { collaboration: 90, energy: 85, innovation: 80 }
      },
      {
        id: 'we4b',
        text: 'A library',
        description: 'Quiet, focused, respectful of deep work. Thoughtful and intentional.',
        traitScores: { reflection: 90, quality: 85, boundaries: 80 }
      },
      {
        id: 'we4c',
        text: 'A living room',
        description: 'Warm, comfortable, casual. People feel at home and bring their whole selves.',
        traitScores: { connection: 95, trust: 85, empathy: 80 }
      },
      {
        id: 'we4d',
        text: 'A mission control',
        description: 'Focused, urgent, data everywhere. Every screen shows progress toward the goal.',
        traitScores: { intensity: 95, energy: 90, analytical: 80 }
      }
    ],
    traits: ['collaboration', 'reflection', 'connection', 'intensity']
  },

  {
    id: 'we5',
    type: 'tradeoff',
    category: 'Flexibility',
    question: 'Which schedule philosophy do you lean toward?',
    options: [
      {
        id: 'we5a',
        text: 'Flexible hours',
        description: 'Work when you\'re at your best. Early birds and night owls both welcome.',
        traitScores: { flexibility: 95, trust: 85, independence: 80 }
      },
      {
        id: 'we5b',
        text: 'Core hours',
        description: 'Everyone overlaps for key hours. Ensures collaboration windows exist.',
        traitScores: { collaboration: 85, structure: 80, consistency: 75 }
      }
    ],
    traits: ['flexibility', 'collaboration', 'trust', 'structure']
  },

  {
    id: 'we6',
    type: 'scenario',
    category: 'Urgency',
    question: 'A product launch is 2 weeks behind schedule. What happens?',
    options: [
      {
        id: 'we6a',
        text: 'Push through',
        description: 'The team rallies, works extra hours, and ships on the original date.',
        traitScores: { intensity: 95, energy: 90, leadership: 80 }
      },
      {
        id: 'we6b',
        text: 'Cut scope',
        description: 'Ship the MVP on time. The rest can follow in a fast-follow release.',
        traitScores: { pragmatism: 90, strategic: 85, efficiency: 80 }
      },
      {
        id: 'we6c',
        text: 'Adjust the date',
        description: 'Quality over speed. Move the date and ship something we\'re proud of.',
        traitScores: { quality: 90, stability: 85, boundaries: 80 }
      },
      {
        id: 'we6d',
        text: 'Diagnose first',
        description: 'Understand WHY we\'re behind. Fix the process, then decide on timeline.',
        traitScores: { analytical: 90, reflection: 85, process: 80 }
      }
    ],
    traits: ['intensity', 'pragmatism', 'quality', 'analytical']
  },

  {
    id: 'we7',
    type: 'tradeoff',
    category: 'Communication',
    question: 'What\'s your company\'s communication default?',
    options: [
      {
        id: 'we7a',
        text: 'Written-first async',
        description: 'Document decisions, write proposals, comment threads. Thoughtful and inclusive.',
        traitScores: { reflection: 90, structure: 85, boundaries: 80 }
      },
      {
        id: 'we7b',
        text: 'Talk-first sync',
        description: 'Jump on a call, hash it out live. Fast resolution and real-time energy.',
        traitScores: { energy: 90, collaboration: 85, intensity: 80 }
      }
    ],
    traits: ['reflection', 'energy', 'structure', 'collaboration']
  },

  {
    id: 'we8',
    type: 'slider',
    category: 'Recovery',
    question: 'After a major milestone or launch, what happens?',
    sliderConfig: {
      min: 0,
      max: 100,
      minLabel: 'Straight to the next thing — momentum matters',
      maxLabel: 'Deliberate cooldown — rest, retro, then recharge',
      trait: 'reflection'
    },
    traits: ['reflection', 'boundaries']
  },
];
