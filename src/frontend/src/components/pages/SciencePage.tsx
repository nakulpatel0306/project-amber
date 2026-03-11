import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Users,
  BookOpen,
  Shield,
  Mail,
  Zap,
  Target,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

const oceanTraits = [
  {
    letter: "O",
    label: "Openness",
    color: "#8B5CF6",
    description: "Creativity, curiosity, and willingness to explore new ideas",
  },
  {
    letter: "C",
    label: "Conscientiousness",
    color: "#10B981",
    description: "Organization, dependability, and follow-through",
  },
  {
    letter: "E",
    label: "Extraversion",
    color: "#F59E0B",
    description: "Sociability, assertiveness, and energy from others",
  },
  {
    letter: "A",
    label: "Agreeableness",
    color: "#EC4899",
    description: "Cooperation, trust, and empathy toward others",
  },
  {
    letter: "N",
    label: "Stability",
    color: "#06B6D4",
    description: "Emotional resilience and composure under pressure",
  },
];

const matchScores = [
  {
    label: "Trait Match",
    color: "#8B5CF6",
    description:
      "How closely your OCEAN profile aligns with the employer's ideal personality range for the role.",
  },
  {
    label: "Culture Match",
    color: "#F59E0B",
    description:
      "How well your stated values and working style preferences align with the company's culture.",
  },
  {
    label: "Composite Score",
    color: "#10B981",
    description:
      "A weighted overall score normalized to 0 to 100, combining trait and culture signals into one clear number.",
  },
];

const assessmentSteps = [
  {
    step: "01",
    title: "10 Core Questions",
    description:
      "Grouped into work style, communication, and values. Four response options per question capture meaningful personality differentiation.",
    color: "#8B5CF6",
  },
  {
    step: "02",
    title: "OCEAN Scoring",
    description:
      "Each answer maps to specific trait weightings across all five dimensions. Your profile emerges as a unique combination of continuous scores.",
    color: "#10B981",
  },
  {
    step: "03",
    title: "Archetype Classification",
    description:
      "Your scores map to one of 8 personality archetypes, giving you an intuitive, human way to understand your results.",
    color: "#F59E0B",
  },
  {
    step: "04",
    title: "Bidirectional Matching",
    description:
      "The Ember engine compares your profile against employer culture data and produces three distinct compatibility scores.",
    color: "#EC4899",
  },
];

export function SciencePage() {
  return (
    <div style={{ background: "var(--color-background)" }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-textMuted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B5CF6" }}
          >
            Research
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          The Science Behind Amber
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Built on 40+ years of peer-reviewed personality research. Every match
          is grounded in science, not guesswork.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Key Stats Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "40+", label: "Years of Research", color: "#8B5CF6" },
            { value: "10", label: "Core Questions", color: "#10B981" },
            { value: "3", label: "Match Scores", color: "#F59E0B" },
            { value: "8", label: "Archetypes", color: "#EC4899" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 text-center"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="text-[11px] uppercase tracking-wider font-medium"
                style={{ color: "var(--color-textMuted)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Big Five Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139, 92, 246, 0.1)" }}
          >
            <Brain className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            The Big Five (OCEAN) Model
          </h2>
        </div>
        <p
          className="text-sm leading-relaxed max-w-3xl mb-8 ml-12"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Amber is built on the most validated personality framework in modern
          psychology. Replicated across cultures, demographics, and industries
          for over 40 years, the Big Five measures personality on continuous
          scales rather than sorting you into binary types. Unlike tools such as
          MBTI, every score is backed by peer-reviewed research.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {oceanTraits.map((trait) => (
            <div
              key={trait.letter}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                style={{ background: trait.color }}
              />
              <div className="flex items-center gap-2.5 mb-2 mt-1">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                  style={{
                    backgroundColor: `${trait.color}15`,
                    color: trait.color,
                  }}
                >
                  {trait.letter}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {trait.label}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-textMuted)" }}
              >
                {trait.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* How It Works - Step Flow */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#10B981" }}
          >
            The Process
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            From Questions To Compatibility
          </h2>
          <p
            className="text-sm mt-2 max-w-lg mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Under 15 minutes. No trick questions. Just honest answers that map
            to real science.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {assessmentSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-5 flex gap-4"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                className="text-2xl font-bold leading-none mt-0.5 flex-shrink-0"
                style={{ color: `${item.color}30` }}
              >
                {item.step}
              </span>
              <div>
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-sm leading-relaxed text-center mt-6 max-w-2xl mx-auto"
          style={{ color: "var(--color-textMuted)" }}
        >
          Supplementary assessments are also available for deeper insight: work
          values, visual perception, situational judgment, and cognitive
          patterns.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Matching Algorithm */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#F59E0B" }}
          >
            The Ember Engine
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Three Scores, One Clear Picture
          </h2>
          <p
            className="text-sm mt-2 max-w-lg mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Your personality profile is matched bidirectionally with employer
            culture data. Every score is deterministic and fully traceable. No
            black box.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {matchScores.map((score) => (
            <div
              key={score.label}
              className="rounded-2xl p-5 text-center"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${score.color}15` }}
              >
                {score.label === "Trait Match" && (
                  <Target className="w-5 h-5" style={{ color: score.color }} />
                )}
                {score.label === "Culture Match" && (
                  <Users className="w-5 h-5" style={{ color: score.color }} />
                )}
                {score.label === "Composite Score" && (
                  <Zap className="w-5 h-5" style={{ color: score.color }} />
                )}
              </div>
              <h3
                className="text-sm font-semibold mb-1.5"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
              >
                {score.label}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-textSecondary)" }}
              >
                {score.description}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(236, 72, 153, 0.1)" }}
          >
            <MessageSquare
              className="w-4.5 h-4.5"
              style={{ color: "#EC4899" }}
            />
          </div>
          <div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              Ember AI Insights
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Beyond the numbers, the Ember AI agent generates natural language
              explanations of each match: what works, what to watch for, and how
              to show up well. It turns raw scores into actionable understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Research */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(236, 72, 153, 0.1)" }}
          >
            <BookOpen className="w-4.5 h-4.5" style={{ color: "#EC4899" }} />
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Research And Validation
          </h2>
        </div>

        <p
          className="text-sm leading-relaxed max-w-3xl mb-6 ml-12"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Every aspect of Amber is grounded in peer-reviewed organizational
          psychology. The science comes first, and the AI helps people understand
          and apply it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: CheckCircle2,
              color: "#8B5CF6",
              title: "Person-Organization Fit",
              text: "Meta-analysis by Kristof-Brown, Zimmerman, and Johnson (2005) confirms person-organization fit predicts job satisfaction, commitment, and retention.",
            },
            {
              icon: CheckCircle2,
              color: "#10B981",
              title: "Personality Over Credentials",
              text: "Personality fit with a role and organization predicts outcomes better than skills or credentials alone, especially in early-career and startup environments.",
            },
            {
              icon: CheckCircle2,
              color: "#F59E0B",
              title: "Culture Misalignment",
              text: "Culture misalignment is one of the most frequently cited reasons for early employee turnover, especially in small teams where every hire matters.",
            },
            {
              icon: CheckCircle2,
              color: "#EC4899",
              title: "The Hidden Job Market",
              text: "Studies suggest 70 to 85 percent of jobs are filled through relationships, not formal applications. Amber makes that process accessible to everyone.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: item.color }}
                  />
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Privacy card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(139, 92, 246, 0.1)" }}
          >
            <Shield className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Your Data, Your Control
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            All personality data is stored securely with Row Level Security
            enforced at the database level. Employers see compatibility scores
            and summaries, never your raw assessment responses. You can delete
            your data at any time.
          </p>
          <a
            href="mailto:amberfounders@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            <Mail className="w-4 h-4" />
            amberfounders@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
