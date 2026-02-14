import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  BarChart3,
  Users,
  BookOpen,
  Shield,
  CheckCircle2,
} from 'lucide-react';

const oceanTraits = [
  { letter: 'O', label: 'Openness', color: '#8B5CF6', description: 'Creativity, curiosity, and openness to new experiences' },
  { letter: 'C', label: 'Conscientiousness', color: '#10B981', description: 'Organization, dependability, and self-discipline' },
  { letter: 'E', label: 'Extraversion', color: '#F59E0B', description: 'Sociability, assertiveness, and positive emotions' },
  { letter: 'A', label: 'Agreeableness', color: '#EC4899', description: 'Cooperation, trust, and empathy' },
  { letter: 'N', label: 'Stability', color: '#06B6D4', description: 'Emotional resilience and stress management' },
];

interface SectionData {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
  bullets: string[];
}

const sections: SectionData[] = [
  {
    icon: Brain,
    color: '#8B5CF6',
    title: 'The Big Five (OCEAN) Model',
    description:
      'Amber is built on the Big Five personality model — the most validated and widely accepted personality framework in modern psychology.',
    bullets: [
      'The most validated personality framework in psychology, backed by 40+ years of peer-reviewed research',
      'Five core dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (Stability)',
      'Predicts job performance, team dynamics, and cultural fit more accurately than any other personality model',
      'Used by leading organizations and research institutions worldwide',
    ],
  },
  {
    icon: BarChart3,
    color: '#10B981',
    title: 'How We Measure',
    description:
      'Our assessment captures your personality with precision and nuance using slider-based responses that reveal the full spectrum of your traits.',
    bullets: [
      '48 carefully crafted questions spanning all five personality dimensions',
      'Slider-based responses capture nuance that binary yes/no questions miss',
      'Takes approximately 15 minutes to complete',
      'High internal consistency (Cronbach\'s alpha > 0.80) across all trait scales',
      'Strong test-retest consistency ensures stable and meaningful results',
    ],
  },
  {
    icon: Users,
    color: '#F59E0B',
    title: 'Culture Matching Algorithm',
    description:
      'Your personality profile is only half the equation. Our matching algorithm combines individual traits with organizational culture data.',
    bullets: [
      'Personality-to-culture fit scoring that goes beyond surface-level keyword matching',
      'Team dynamic analysis evaluates how your traits complement existing team members',
      'Values alignment weighting ensures shared principles between you and the organization',
      'Compatibility percentage reflects multi-dimensional fit across personality, values, and work style',
    ],
  },
  {
    icon: BookOpen,
    color: '#EC4899',
    title: 'Research & Validation',
    description:
      'Every aspect of Amber is grounded in peer-reviewed organizational psychology. We build on established research and continuously validate our methods.',
    bullets: [
      'Grounded in peer-reviewed organizational psychology and psychometric theory',
      'Builds on person-environment (P-E) fit theory',
      'Incorporates concepts from Holland\'s theory of vocational personalities',
      'Assessment design follows APA best practices',
      'Continuously validated through ongoing research and real-world outcomes',
    ],
  },
];

export function SciencePage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#8B5CF6' }}
          >
            Research
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          The Science Behind Amber
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          Built on 40+ years of peer-reviewed personality research. Every match is grounded in science, not guesswork.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <article
              key={section.title}
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <SectionIcon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-semibold mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {section.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 ml-1">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: section.color }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>

              {section.title === 'The Big Five (OCEAN) Model' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                  {oceanTraits.map((trait) => (
                    <div
                      key={trait.letter}
                      className="rounded-xl border p-3 flex flex-col gap-1.5"
                      style={{
                        backgroundColor: 'var(--color-backgroundSecondary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                          style={{
                            backgroundColor: `${trait.color}20`,
                            color: trait.color,
                          }}
                        >
                          {trait.letter}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {trait.label}
                        </span>
                      </div>
                      <p
                        className="text-xs leading-snug"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        {trait.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}

        {/* Privacy card */}
        <div
          className="rounded-2xl border p-6 sm:p-8 text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              <Shield className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Your Data, Your Control
          </h3>
          <p
            className="text-sm max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--color-textMuted)' }}
          >
            All assessment data is encrypted and stored securely. You control
            who sees your personality profile, and you can delete your data at
            any time.
          </p>
        </div>
      </div>
    </div>
  );
}
