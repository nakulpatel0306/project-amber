import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Heart,
  Target,
  Lightbulb,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface TimelineEntry {
  marker: string;
  title: string;
  text: string;
  color: string;
}

const JOURNEY: TimelineEntry[] = [
  {
    marker: "The Problem",
    title: "Hiring was broken — and everyone knew it",
    text: "Resumes tell you what someone has done, not who they are. We watched brilliant people land at companies where they never felt at home, and talented teams pass on candidates who would have thrived. Culture fit wasn't a metric — it was a gut feeling. We thought: what if science could do better?",
    color: "#EF4444",
  },
  {
    marker: "The Spark",
    title: "A late-night conversation that changed everything",
    text: "It started in a university dorm room in Toronto. Two friends debating why personality psychology — the most validated branch of behavioral science — was completely absent from recruiting. The Big Five model can predict job satisfaction, team performance, and tenure. Yet no one was using it. That night, the first prototype of Amber was born.",
    color: "#F59E0B",
  },
  {
    marker: "The Build",
    title: "From research paper to real product",
    text: "We spent months buried in psychometric research, consulting with I/O psychologists, and building an assessment engine that was both rigorous and human. We tested with hundreds of real candidates and employers, iterating relentlessly until the matching algorithm actually worked — not just statistically, but in the way people experienced their matches.",
    color: "#8B5CF6",
  },
  {
    marker: "Today",
    title: "Where personality meets opportunity",
    text: "Amber is a culture-first matching platform that connects people to workplaces where they'll genuinely belong. We don't just match skills to job descriptions — we match humans to cultures. Through the Big Five personality model, AI-powered compatibility scoring, and casual coffee chats, we're building a world where every hire feels like the right one.",
    color: "#10B981",
  },
];

interface ValueData {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
}

const VALUES: ValueData[] = [
  {
    icon: Heart,
    color: "#EC4899",
    title: "People Over Profiles",
    description:
      "Behind every application is a real person with unique strengths, values, and aspirations. We design for humans, not data points.",
  },
  {
    icon: Target,
    color: "#10B981",
    title: "Science, Not Gut Feelings",
    description:
      "Every decision in our platform is backed by peer-reviewed research. The Big Five isn't trendy — it's the most validated personality model in existence.",
  },
  {
    icon: Lightbulb,
    color: "#F59E0B",
    title: "Radical Transparency",
    description:
      "You own your personality data. Employers see compatibility scores, never your raw traits — unless you choose to share them.",
  },
  {
    icon: Users,
    color: "#8B5CF6",
    title: "Belonging By Design",
    description:
      "We believe the right culture fit isn't about conformity — it's about finding a place where your unique personality is an asset, not a friction.",
  },
];

export function AboutPage() {
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
            style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
          >
            <Flame className="w-5 h-5" style={{ color: "#D97706" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#D97706" }}
          >
            Our Story
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          About Amber
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          We're on a mission to make every hire feel like the right one — by
          putting personality science at the heart of recruiting.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Origin story timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[19px] top-2 bottom-2 w-px hidden sm:block"
            style={{ background: "var(--color-border)" }}
          />

          <div className="space-y-10">
            {JOURNEY.map((step) => (
              <div key={step.marker} className="relative flex gap-5">
                {/* Dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 hidden sm:flex"
                  style={{ background: `${step.color}15` }}
                >
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: step.color }}
                  >
                    {step.marker.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl p-6"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-3"
                    style={{ background: `${step.color}15`, color: step.color }}
                  >
                    {step.marker}
                  </span>

                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-textSecondary)" }}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Values */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#D97706" }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#D97706" }}
            >
              What We Stand For
            </span>
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Our Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-2xl p-6"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${value.color}15` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: value.color }}
                    />
                  </div>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {value.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {value.description}
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

      {/* Quick facts + CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          {[
            { stat: "Toronto, ON", label: "Headquarters" },
            { stat: "2025", label: "Founded" },
            { stat: "Big Five", label: "Powered By" },
            { stat: "Free", label: "For Job Seekers" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-5 text-center"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-lg font-bold mb-0.5"
                style={{ color: "var(--color-text)" }}
              >
                {item.stat}
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

        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Ready to find where you belong?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Take the personality assessment and discover companies that match
            who you really are.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
