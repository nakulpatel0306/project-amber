import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AssessmentResultsTemplate } from './AssessmentResultsTemplate';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

interface VisualQuestion {
  id: string;
  title: string;
  instruction: string;
  svg: React.ReactNode;
  options: {
    id: string;
    label: string;
    description: string;
    traits: Record<string, number>;
  }[];
}

const VISUAL_QUESTIONS: VisualQuestion[] = [
  {
    id: 'pattern-perception',
    title: 'Pattern Recognition',
    instruction: 'Look at this image. What do you notice first?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Grid of circles with one section more organized */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => {
            const isOrdered = col < 5;
            const offsetX = isOrdered ? 0 : (Math.random() - 0.5) * 12;
            const offsetY = isOrdered ? 0 : (Math.random() - 0.5) * 12;
            const baseSize = isOrdered ? 8 : 6 + Math.random() * 6;
            return (
              <circle
                key={`${row}-${col}`}
                cx={25 + col * 38 + offsetX}
                cy={20 + row * 35 + offsetY}
                r={baseSize}
                fill={isOrdered ? '#8B5CF6' : '#F59E0B'}
                opacity={0.6 + Math.random() * 0.4}
              />
            );
          })
        )}
        {/* Dividing line (subtle) */}
        <line x1="200" y1="0" x2="200" y2="300" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
      </svg>
    ),
    options: [
      {
        id: 'order',
        label: 'The Organized Pattern',
        description: 'The neat, aligned circles on the left caught my eye first',
        traits: { conscientiousness: 15, openness: -5 },
      },
      {
        id: 'chaos',
        label: 'The Scattered Elements',
        description: 'The colorful, scattered dots on the right drew my attention',
        traits: { openness: 15, conscientiousness: -5 },
      },
      {
        id: 'contrast',
        label: 'The Contrast Between Both',
        description: 'I immediately noticed the difference between the two halves',
        traits: { openness: 10, conscientiousness: 10 },
      },
      {
        id: 'whole',
        label: 'The Overall Composition',
        description: 'I saw it as one unified image before noticing the parts',
        traits: { agreeableness: 10, openness: 5 },
      },
    ],
  },
  {
    id: 'depth-perception',
    title: 'Depth & Focus',
    instruction: 'What stands out to you in this image?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Background: large faded shapes */}
        <rect x="50" y="40" width="120" height="120" rx="20" fill="#10B981" opacity="0.15" />
        <circle cx="300" cy="180" r="80" fill="#EC4899" opacity="0.12" />
        <rect x="180" y="30" width="100" height="180" rx="15" fill="#F59E0B" opacity="0.1" transform="rotate(15, 230, 120)" />
        {/* Midground: medium shapes */}
        <circle cx="150" cy="150" r="40" fill="#8B5CF6" opacity="0.3" />
        <rect x="220" y="100" width="80" height="80" rx="12" fill="#06B6D4" opacity="0.3" />
        {/* Foreground: small vivid shapes */}
        <circle cx="180" cy="140" r="15" fill="#F59E0B" opacity="0.9" />
        <rect x="250" y="130" width="30" height="30" rx="6" fill="#EC4899" opacity="0.9" />
        <circle cx="130" cy="180" r="10" fill="#10B981" opacity="0.9" />
        {/* Small detail: tiny triangle */}
        <polygon points="320,80 330,100 310,100" fill="#8B5CF6" opacity="0.85" />
      </svg>
    ),
    options: [
      {
        id: 'foreground',
        label: 'The Small, Bright Shapes',
        description: 'The vivid, detailed elements in the foreground caught my eye',
        traits: { conscientiousness: 10, neuroticism_inv: 5 },
      },
      {
        id: 'background',
        label: 'The Large, Soft Shapes',
        description: 'The big, subtle background shapes are what I noticed',
        traits: { openness: 10, extraversion: 5 },
      },
      {
        id: 'layers',
        label: 'The Layering Effect',
        description: 'I noticed how shapes overlap and create depth',
        traits: { openness: 12, conscientiousness: 8 },
      },
      {
        id: 'colors',
        label: 'The Color Relationships',
        description: 'The way different colors interact stood out most',
        traits: { openness: 15, agreeableness: 5 },
      },
    ],
  },
  {
    id: 'social-scene',
    title: 'Social Perception',
    instruction: 'Look at this scene. What draws your attention?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Environment: buildings/structures */}
        <rect x="20" y="80" width="60" height="180" rx="4" fill="var(--color-border)" opacity="0.3" />
        <rect x="90" y="120" width="50" height="140" rx="4" fill="var(--color-border)" opacity="0.25" />
        <rect x="300" y="60" width="80" height="200" rx="4" fill="var(--color-border)" opacity="0.3" />
        {/* Windows */}
        {[30, 50, 70].map(y => [30, 55].map(x => (
          <rect key={`w-${x}-${y}`} x={x} y={80 + y} width="10" height="12" rx="2" fill="#F59E0B" opacity="0.4" />
        )))}
        {/* People: abstract figures */}
        {/* Person 1 - walking */}
        <circle cx="170" cy="180" r="12" fill="#8B5CF6" />
        <line x1="170" y1="192" x2="170" y2="230" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        <line x1="170" y1="210" x2="158" y2="225" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="210" x2="182" y2="225" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="200" x2="155" y2="210" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
        {/* Person 2 - standing */}
        <circle cx="220" cy="185" r="11" fill="#EC4899" />
        <line x1="220" y1="196" x2="220" y2="232" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
        <line x1="220" y1="215" x2="210" y2="230" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="220" y1="215" x2="230" y2="230" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="220" y1="205" x2="235" y2="198" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
        {/* Person 3 - sitting */}
        <circle cx="260" cy="195" r="10" fill="#10B981" />
        <line x1="260" y1="205" x2="260" y2="225" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <line x1="260" y1="225" x2="250" y2="240" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="260" y1="225" x2="270" y2="240" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        {/* Connection line between person 2 and 3 */}
        <line x1="230" y1="200" x2="252" y2="200" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
        {/* Ground */}
        <line x1="0" y1="260" x2="400" y2="260" stroke="var(--color-border)" strokeWidth="1" />
        {/* Objects on ground */}
        <rect x="140" y="245" width="25" height="15" rx="3" fill="#F59E0B" opacity="0.6" />
        <circle cx="380" cy="250" r="8" fill="#06B6D4" opacity="0.5" />
      </svg>
    ),
    options: [
      {
        id: 'people',
        label: 'The People',
        description: 'The human figures and their postures caught my attention first',
        traits: { extraversion: 12, agreeableness: 10 },
      },
      {
        id: 'interaction',
        label: 'The Connection Between Them',
        description: 'I noticed the relationship and interaction between the figures',
        traits: { agreeableness: 15, extraversion: 5 },
      },
      {
        id: 'environment',
        label: 'The Buildings & Setting',
        description: 'The architectural elements and environment stood out',
        traits: { conscientiousness: 10, openness: 8 },
      },
      {
        id: 'objects',
        label: 'The Small Details & Objects',
        description: 'I noticed the smaller objects and details in the scene',
        traits: { conscientiousness: 12, openness: 5 },
      },
    ],
  },
  {
    id: 'completion-tendency',
    title: 'Completion & Imagination',
    instruction: 'What do you see in these incomplete shapes?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Incomplete circle (3/4) */}
        <path
          d="M 100 150 A 50 50 0 1 1 100 100"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Incomplete square (missing one side) */}
        <path
          d="M 210 100 L 290 100 L 290 200 L 210 200"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Incomplete triangle */}
        <path
          d="M 340 200 L 370 120 L 400 200"
          fill="none"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Dots suggesting a hidden shape */}
        {[0, 40, 80, 120, 160].map((x, i) => (
          <circle
            key={`dot-${i}`}
            cx={70 + x}
            cy={250}
            r="4"
            fill="#EC4899"
            opacity={0.4 + i * 0.15}
          />
        ))}
        {/* Scattered fragments */}
        <line x1="30" y1="50" x2="60" y2="50" stroke="var(--color-border)" strokeWidth="2" opacity="0.4" />
        <line x1="45" y1="35" x2="45" y2="65" stroke="var(--color-border)" strokeWidth="2" opacity="0.4" />
      </svg>
    ),
    options: [
      {
        id: 'complete',
        label: 'Complete Shapes',
        description: 'I mentally completed the shapes - a circle, square, and triangle',
        traits: { conscientiousness: 12, openness: 5 },
      },
      {
        id: 'abstract',
        label: 'Abstract Art',
        description: 'I saw them as artistic, expressive lines - not trying to be shapes',
        traits: { openness: 15, agreeableness: 3 },
      },
      {
        id: 'story',
        label: 'A Progression or Story',
        description: 'I saw a sequence or narrative connecting the elements',
        traits: { openness: 12, extraversion: 8 },
      },
      {
        id: 'gaps',
        label: 'The Missing Pieces',
        description: 'I focused on what\'s absent - the gaps and open ends',
        traits: { neuroticism_inv: 10, conscientiousness: 8 },
      },
    ],
  },
  {
    id: 'movement-energy',
    title: 'Energy & Movement',
    instruction: 'How does this image make you feel?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Swirling lines suggesting movement */}
        <path
          d="M 50 150 Q 100 50 200 150 Q 300 250 350 150"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="3"
          opacity="0.6"
        />
        <path
          d="M 30 180 Q 120 80 220 170 Q 320 260 380 140"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          opacity="0.5"
        />
        <path
          d="M 70 120 Q 150 30 230 130 Q 310 230 370 170"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          opacity="0.4"
        />
        {/* Central burst */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const len = 20 + (i % 3) * 15;
          return (
            <line
              key={`ray-${i}`}
              x1={200}
              y1={150}
              x2={200 + Math.cos(angle) * len}
              y2={150 + Math.sin(angle) * len}
              stroke="#EC4899"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.3 + (i % 3) * 0.2}
            />
          );
        })}
        <circle cx="200" cy="150" r="8" fill="#EC4899" opacity="0.7" />
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle
            key={`p-${i}`}
            cx={30 + Math.random() * 340}
            cy={20 + Math.random() * 260}
            r={2 + Math.random() * 3}
            fill="#06B6D4"
            opacity={0.2 + Math.random() * 0.4}
          />
        ))}
      </svg>
    ),
    options: [
      {
        id: 'energized',
        label: 'Energized & Excited',
        description: 'The movement and dynamism makes me feel energized',
        traits: { extraversion: 15, openness: 5 },
      },
      {
        id: 'calm',
        label: 'Calm & Flowing',
        description: 'I see a peaceful, rhythmic flow that feels calming',
        traits: { agreeableness: 10, neuroticism_inv: 10 },
      },
      {
        id: 'curious',
        label: 'Curious & Intrigued',
        description: 'I want to understand the pattern and where it leads',
        traits: { openness: 15, conscientiousness: 5 },
      },
      {
        id: 'focused',
        label: 'Drawn to the Center',
        description: 'My eyes go straight to the central point of convergence',
        traits: { conscientiousness: 10, neuroticism_inv: 8 },
      },
    ],
  },
  {
    id: 'color-emotion',
    title: 'Color & Emotion',
    instruction: 'Which color arrangement feels most "right" to you?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Option A: Warm gradient, organized */}
        <rect x="20" y="30" width="170" height="110" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        {[0, 1, 2, 3, 4].map(i => (
          <rect
            key={`warm-${i}`}
            x={30 + i * 32}
            y={45}
            width={28}
            height={80}
            rx="6"
            fill={['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706', '#B45309'][i]}
            opacity={0.85}
          />
        ))}
        {/* Option B: Cool palette, scattered */}
        <rect x="210" y="30" width="170" height="110" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        <circle cx="250" cy="70" r="20" fill="#06B6D4" opacity="0.7" />
        <circle cx="310" cy="90" r="25" fill="#8B5CF6" opacity="0.6" />
        <circle cx="280" cy="55" r="15" fill="#3B82F6" opacity="0.8" />
        <circle cx="350" cy="75" r="18" fill="#6366F1" opacity="0.5" />
        <circle cx="330" cy="115" r="12" fill="#14B8A6" opacity="0.7" />
        {/* Option C: Complementary contrasts */}
        <rect x="20" y="160" width="170" height="110" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        <rect x="35" y="175" width="60" height="80" rx="8" fill="#EC4899" opacity="0.8" />
        <rect x="105" y="175" width="60" height="80" rx="8" fill="#10B981" opacity="0.8" />
        <circle cx="95" cy="215" r="20" fill="#F59E0B" opacity="0.6" />
        {/* Option D: Monochrome depth */}
        <rect x="210" y="160" width="170" height="110" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect
            key={`mono-${i}`}
            x={220 + i * 10}
            y={175 + i * 5}
            width={150 - i * 20}
            height={80 - i * 8}
            rx="4"
            fill={`rgba(139, 92, 246, ${0.15 + i * 0.15})`}
          />
        ))}
      </svg>
    ),
    options: [
      {
        id: 'warm-ordered',
        label: 'Warm & Organized',
        description: 'The structured warm gradient feels harmonious and intentional',
        traits: { conscientiousness: 12, agreeableness: 5 },
      },
      {
        id: 'cool-scattered',
        label: 'Cool & Expressive',
        description: 'The scattered cool tones feel creative and freeing',
        traits: { openness: 15, extraversion: 3 },
      },
      {
        id: 'complementary',
        label: 'Bold Contrasts',
        description: 'The complementary colors create exciting visual tension',
        traits: { extraversion: 10, openness: 8 },
      },
      {
        id: 'monochrome',
        label: 'Subtle Depth',
        description: 'The monochrome layers feel sophisticated and calming',
        traits: { conscientiousness: 8, neuroticism_inv: 10 },
      },
    ],
  },
  {
    id: 'spatial-orientation',
    title: 'Spatial Orientation',
    instruction: 'How do these shapes relate to each other?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Central cluster of shapes with varying spatial relationships */}
        {/* Large circle - container/context */}
        <circle cx="200" cy="150" r="100" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="8 4" opacity="0.3" />
        {/* Triangle pointing up */}
        <polygon points="200,60 240,130 160,130" fill="#F59E0B" opacity="0.6" />
        {/* Small circles orbiting */}
        <circle cx="130" cy="180" r="25" fill="#EC4899" opacity="0.5" />
        <circle cx="270" cy="180" r="25" fill="#10B981" opacity="0.5" />
        {/* Connecting lines */}
        <line x1="155" y1="180" x2="245" y2="180" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        <line x1="200" y1="130" x2="130" y2="180" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        <line x1="200" y1="130" x2="270" y2="180" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        {/* Small detail squares */}
        <rect x="185" y="200" width="30" height="30" rx="4" fill="#06B6D4" opacity="0.6" transform="rotate(45, 200, 215)" />
        {/* Outer floating elements */}
        <circle cx="80" cy="80" r="8" fill="#8B5CF6" opacity="0.4" />
        <circle cx="320" cy="80" r="8" fill="#8B5CF6" opacity="0.4" />
        <circle cx="80" cy="250" r="6" fill="#8B5CF6" opacity="0.3" />
        <circle cx="320" cy="250" r="6" fill="#8B5CF6" opacity="0.3" />
      </svg>
    ),
    options: [
      {
        id: 'hierarchy',
        label: 'A Hierarchy',
        description: 'The triangle leads, the circles support — there\'s a clear structure',
        traits: { conscientiousness: 12, extraversion: 5 },
      },
      {
        id: 'network',
        label: 'A Connected Network',
        description: 'They\'re all linked together, forming a web of relationships',
        traits: { agreeableness: 12, extraversion: 8 },
      },
      {
        id: 'system',
        label: 'A System in Motion',
        description: 'The shapes are orbiting and interacting, like a living system',
        traits: { openness: 12, conscientiousness: 5 },
      },
      {
        id: 'independent',
        label: 'Independent Elements',
        description: 'Each shape exists on its own — the connections are incidental',
        traits: { openness: 8, neuroticism_inv: 8 },
      },
    ],
  },
  {
    id: 'symmetry-balance',
    title: 'Symmetry & Balance',
    instruction: 'Which composition do you prefer?',
    svg: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Left: Perfect symmetry */}
        <rect x="10" y="20" width="180" height="260" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        <line x1="100" y1="35" x2="100" y2="265" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        <circle cx="60" cy="80" r="20" fill="#8B5CF6" opacity="0.5" />
        <circle cx="140" cy="80" r="20" fill="#8B5CF6" opacity="0.5" />
        <rect x="50" y="120" width="20" height="40" rx="4" fill="#10B981" opacity="0.5" />
        <rect x="130" y="120" width="20" height="40" rx="4" fill="#10B981" opacity="0.5" />
        <polygon points="60,200 80,230 40,230" fill="#F59E0B" opacity="0.5" />
        <polygon points="140,200 160,230 120,230" fill="#F59E0B" opacity="0.5" />
        {/* Right: Asymmetric but balanced */}
        <rect x="210" y="20" width="180" height="260" rx="12" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        <circle cx="260" cy="70" r="35" fill="#EC4899" opacity="0.4" />
        <rect x="320" y="90" width="50" height="50" rx="8" fill="#06B6D4" opacity="0.5" />
        <circle cx="250" cy="170" r="12" fill="#F59E0B" opacity="0.6" />
        <rect x="280" y="180" width="80" height="20" rx="4" fill="#8B5CF6" opacity="0.4" />
        <polygon points="240,230 270,250 230,260" fill="#10B981" opacity="0.5" />
        <circle cx="340" cy="240" r="15" fill="#EC4899" opacity="0.3" />
      </svg>
    ),
    options: [
      {
        id: 'symmetry',
        label: 'Perfect Symmetry',
        description: 'The mirrored, balanced composition on the left feels more satisfying',
        traits: { conscientiousness: 15, neuroticism_inv: 5 },
      },
      {
        id: 'asymmetry',
        label: 'Dynamic Asymmetry',
        description: 'The varied, asymmetric layout on the right feels more interesting',
        traits: { openness: 15, extraversion: 5 },
      },
      {
        id: 'both',
        label: 'Both Are Appealing',
        description: 'I appreciate both — order and creative variety each have their place',
        traits: { agreeableness: 10, openness: 5, conscientiousness: 5 },
      },
      {
        id: 'neither',
        label: 'Neither Stands Out',
        description: 'I don\'t feel strongly drawn to either arrangement',
        traits: { neuroticism_inv: 8, openness: 5 },
      },
    ],
  },
];

interface TraitAccumulator {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism_inv: number;
}

export function VisualPerceptionAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [_isSaving, setIsSaving] = useState(false);

  const question = VISUAL_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + (answers[question?.id] ? 1 : 0)) / VISUAL_QUESTIONS.length) * 100;

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestion < VISUAL_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsSaving(true);

    // Calculate trait scores from answers
    const traitScores: TraitAccumulator = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism_inv: 0,
    };

    for (const q of VISUAL_QUESTIONS) {
      const selectedOption = q.options.find(o => o.id === answers[q.id]);
      if (selectedOption) {
        for (const [trait, value] of Object.entries(selectedOption.traits)) {
          if (trait in traitScores) {
            traitScores[trait as keyof TraitAccumulator] += value;
          }
        }
      }
    }

    // Save to Supabase
    if (user) {
      try {
        // 1. Create assessment record
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            assessment_type: 'visual_perception',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (assessmentError) throw assessmentError;

        // 2. Save individual responses to assessment_responses
        const questionCodeMap: Record<string, string> = {
          'pattern-perception': 'vp1',
          'depth-perception': 'vp2',
          'social-scene': 'vp3',
          'completion-tendency': 'vp4',
          'movement-energy': 'vp5',
        };

        const responses = Object.entries(answers).map(([questionId, answerId]) => ({
          assessment_id: assessment.id,
          user_id: user.id,
          question_code: questionCodeMap[questionId],
          answer: { selected: answerId },
          answered_at: new Date().toISOString(),
        }));

        const { error: responsesError } = await supabase
          .from('assessment_responses')
          .insert(responses);

        if (responsesError) throw responsesError;

        // 3. Update candidates table with summary data
        await supabase
          .from('candidates')
          .update({
            visual_perception_data: {
              assessment_id: assessment.id,
              answers,
              trait_modifiers: traitScores,
              completed_at: new Date().toISOString(),
            },
          })
          .eq('user_id', user.id);

        showSuccess('Assessment Complete!', 'Your visual perception results have been added to your profile.');
      } catch (err) {
        console.error('Error saving visual perception data:', err);
      }
    }

    setIsSaving(false);
  };

  // Results view
  if (isComplete) {
    const traitScores: TraitAccumulator = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism_inv: 0,
    };

    for (const q of VISUAL_QUESTIONS) {
      const selectedOption = q.options.find(o => o.id === answers[q.id]);
      if (selectedOption) {
        for (const [trait, value] of Object.entries(selectedOption.traits)) {
          if (trait in traitScores) {
            traitScores[trait as keyof TraitAccumulator] += value;
          }
        }
      }
    }

    const maxPossible = 50;
    const dimensions = [
      { key: 'openness', label: 'Openness', value: Math.min(100, (traitScores.openness / maxPossible) * 100), color: '#8B5CF6', progressColor: 'purple' },
      { key: 'conscientiousness', label: 'Conscientiousness', value: Math.min(100, (traitScores.conscientiousness / maxPossible) * 100), color: '#10B981', progressColor: 'green' },
      { key: 'extraversion', label: 'Extraversion', value: Math.min(100, (traitScores.extraversion / maxPossible) * 100), color: '#F59E0B', progressColor: 'amber' },
      { key: 'agreeableness', label: 'Agreeableness', value: Math.min(100, (traitScores.agreeableness / maxPossible) * 100), color: '#EC4899', progressColor: 'pink' },
      { key: 'neuroticism', label: 'Emotional Stability', value: Math.min(100, (traitScores.neuroticism_inv / maxPossible) * 100), color: '#06B6D4', progressColor: 'cyan' },
    ];

    return (
      <AssessmentResultsTemplate
        title="Visual Perception Results"
        subtitle="Here's what your visual perception style reveals about your personality"
        dimensions={dimensions}
        enhancedMessage="These visual perception modifiers have been applied to your personality profile, making your matches more accurate. The more assessments you complete, the better your results."
        icon={<Eye className="w-10 h-10 text-white" />}
        accentColor="#8B5CF6"
      />
    );
  }

  // Question view
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
            >
              <Eye className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                Visual Perception Test
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Question {currentQuestion + 1} of {VISUAL_QUESTIONS.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/insights')}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Exit
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full mb-8 overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: '#8B5CF6' }}
          />
        </div>

        {/* Question card */}
        <div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {question.title}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            {question.instruction}
          </p>

          {/* Visual */}
          <div
            className="w-full h-64 rounded-xl mb-6 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            {question.svg}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map(option => {
              const isSelected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'var(--color-background)',
                    border: isSelected ? '2px solid #8B5CF6' : '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        borderColor: isSelected ? '#8B5CF6' : 'var(--color-border)',
                        backgroundColor: isSelected ? '#8B5CF6' : 'transparent',
                      }}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                        {option.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[question.id]}
            rightIcon={
              currentQuestion === VISUAL_QUESTIONS.length - 1
                ? <CheckCircle2 className="w-4 h-4" />
                : <ArrowRight className="w-4 h-4" />
            }
          >
            {currentQuestion === VISUAL_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
