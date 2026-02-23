import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Newspaper,
  Mail,
  Quote,
  ArrowRight,
  Flame,
  Target,
  Users,
  Brain,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Coffee,
} from "lucide-react";

interface KeyFact {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
}

const KEY_FACTS: KeyFact[] = [
  {
    icon: Brain,
    color: "#8B5CF6",
    title: "Big Five Personality Model",
    description:
      "Amber is built on the most scientifically validated personality framework in modern psychology, backed by over 40 years of peer-reviewed research.",
  },
  {
    icon: Target,
    color: "#10B981",
    title: "Culture-First Matching",
    description:
      "We match candidates to companies based on personality compatibility and culture fit, not just keywords on a resume. Matching starts with who you are, not what is on your resume.",
  },
  {
    icon: Users,
    color: "#F59E0B",
    title: "Coffee Chat Model",
    description:
      "Instead of formal interviews, Amber facilitates casual coffee chats between candidates and team members to explore genuine fit.",
  },
];

interface IndustryInsight {
  stat: string;
  label: string;
  source: string;
  color: string;
}

const INDUSTRY_INSIGHTS: IndustryInsight[] = [
  {
    stat: "46%",
    label: "of new hires fail within 18 months — 89% of those due to poor culture fit, not lack of skills",
    source: "Leadership IQ",
    color: "#EF4444",
  },
  {
    stat: "73%",
    label: "of professionals have left a job because of poor culture fit",
    source: "Robert Half",
    color: "#F59E0B",
  },
  {
    stat: "2x",
    label: "higher retention when employees feel a strong sense of belonging at work",
    source: "BetterUp",
    color: "#10B981",
  },
  {
    stat: "$4,700",
    label: "average cost-per-hire in the US — a bad hire can cost up to 30% of their annual salary",
    source: "SHRM",
    color: "#8B5CF6",
  },
];

interface TalkingPoint {
  icon: React.ElementType;
  color: string;
  title: string;
  text: string;
}

const TALKING_POINTS: TalkingPoint[] = [
  {
    icon: Lightbulb,
    color: "#F59E0B",
    title: "The Problem We Solve",
    text: "Traditional hiring optimizes for skills and experience but ignores personality and culture, the strongest predictor of long-term job satisfaction and retention. Studies suggest 70 to 85 percent of jobs are filled through relationships, not applications. Amber makes that process accessible to everyone.",
  },
  {
    icon: BarChart3,
    color: "#10B981",
    title: "Our Approach",
    text: "A 10-question core assessment maps to the Big Five (OCEAN) model. The Ember matching engine produces trait match, culture match, and overall composite scores. Eight personality archetypes make results human and intuitive.",
  },
  {
    icon: Coffee,
    color: "#EC4899",
    title: "Beyond the Algorithm",
    text: "Both candidates and employers can initiate coffee chats. No formal interviews, just real human connection. After each chat, both sides leave ratings and feedback to keep the community honest.",
  },
  {
    icon: TrendingUp,
    color: "#8B5CF6",
    title: "Where We Are Going",
    text: "The Amber Project is building toward a world where every job search starts with self-understanding. Built specifically for university students and startups, with plans for a public job board, in-app messaging, and employer analytics.",
  },
];

export function PressPage() {
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
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
          >
            <Newspaper className="w-5 h-5" style={{ color: "#06B6D4" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#06B6D4" }}
          >
            Newsroom
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Press & Media
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Everything journalists, bloggers, and partners need to tell The
          Amber Project story.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Company Snapshot */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl p-6 sm:p-8 mb-12"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <Flame className="w-4 h-4" style={{ color: "#D97706" }} />
            </div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Company Snapshot
            </h2>
          </div>

          <div
            className="rounded-xl p-5 mb-5"
            style={{ background: "var(--color-backgroundSecondary)" }}
          >
            <div className="flex items-start gap-3">
              <Quote
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-textMuted)" }}
              />
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: "var(--color-textSecondary)" }}
              >
                The Amber Project is a culture-first job matching platform that
                uses the Big Five personality model and AI to connect people
                with workplaces where they genuinely belong. Founded in Toronto
                in 2025 by university students Nakul Patel, Arsh Patel, and
                Neel Patel, Amber replaces resume-driven hiring with
                science-backed personality compatibility. Free for candidates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Founded", value: "2025" },
              { label: "HQ", value: "Toronto, ON" },
              { label: "Focus", value: "Culture-First Hiring" },
              { label: "Team", value: "3 Co-Founders" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p
                  className="text-base font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.value}
                </p>
                <p
                  className="text-[11px] uppercase tracking-wider font-medium"
                  style={{ color: "var(--color-textMuted)" }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Amber Different */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#8B5CF6" }}
            >
              Key Facts
            </span>
            <h2
              className="text-2xl font-bold mt-2"
              style={{ color: "var(--color-text)" }}
            >
              What Makes Amber Different
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {KEY_FACTS.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.title}
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${fact.color}15` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: fact.color }}
                      />
                    </div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {fact.title}
                    </h3>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-textSecondary)" }}
                  >
                    {fact.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Industry Insights */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#F59E0B" }}
          >
            Why This Matters
          </span>
          <h2
            className="text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)" }}
          >
            The Hiring Problem in Numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {INDUSTRY_INSIGHTS.map((insight) => (
            <div
              key={insight.stat}
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-3xl font-bold mb-1"
                style={{ color: insight.color }}
              >
                {insight.stat}
              </p>
              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: "var(--color-textSecondary)" }}
              >
                {insight.label}
              </p>
              <p
                className="text-[11px] font-medium"
                style={{ color: "var(--color-textMuted)" }}
              >
                Source: {insight.source}
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

      {/* Story Angles / Talking Points */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#10B981" }}
          >
            For Journalists
          </span>
          <h2
            className="text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)" }}
          >
            Story Angles & Talking Points
          </h2>
        </div>

        <div className="space-y-5 mb-12">
          {TALKING_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-2xl p-6 flex gap-4"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${point.color}15` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: point.color }}
                  />
                </div>
                <div>
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    {point.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-textSecondary)" }}
                  >
                    {point.text}
                  </p>
                </div>
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

      {/* Media Contact CTA */}
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
            style={{ background: "rgba(6, 182, 212, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#06B6D4" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Media Inquiries
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Writing a story about personality-based hiring, culture tech, or
            the future of recruiting? We would love to chat.
          </p>
          <a
            href="mailto:amberfounders@gmail.com?subject=Media Inquiry"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
