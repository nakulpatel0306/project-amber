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
  Mail,
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
    title: "We Have All Felt It",
    text: "We are university students. We have sat in the same lectures, stressed about the same assignments, and wondered at some point whether any of it was actually going to matter when it came time to find a job. Some of the most impressive people we know are not the ones with the highest grades. They are the ones who have a certain energy about them, who walk into a room and people just want to talk to them.",
    color: "#EF4444",
  },
  {
    marker: "The Insight",
    title: "Personality Opens Doors That Resumes Cannot",
    text: "We have friends who struggled in school, who would have been filtered out by any resume screener, but who are genuinely thriving in their careers right now. What did they do differently? They networked. They showed up. They let their personality lead. They got conversations, impressed people, built real relationships, and got opportunities that the traditional system would have completely missed.",
    color: "#F59E0B",
  },
  {
    marker: "The Gap",
    title: "Not Everyone Has The Same Access",
    text: "The problem is that not everyone knows how to do that. Not everyone has the connections to get into the right rooms. A lot of genuinely great people are stuck waiting for a job board to reply to them, which it almost never does. The system rewards people who already have networks, not people who deserve a chance.",
    color: "#8B5CF6",
  },
  {
    marker: "Amber",
    title: "We Built This Because We Are Those People",
    text: "We built Amber because we are those people. And we know a lot of others who are too. Amber is a culture-first matching platform that connects people to workplaces where they will genuinely belong. Through the Big Five personality model, AI-powered compatibility scoring, and casual coffee chats, we are building a world where every hire starts with a real conversation.",
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
    title: "People Over Paper",
    description:
      "Your resume is not who you are. The most important things about you as a potential teammate do not show up in a Word document. We think those things should come first.",
  },
  {
    icon: Target,
    color: "#10B981",
    title: "Culture Is Not A Perk",
    description:
      "Where you work shapes who you become. A bad culture fit is not just uncomfortable, it can genuinely hold someone back. And the right one can unlock something in a person that they did not even know was there.",
  },
  {
    icon: Users,
    color: "#8B5CF6",
    title: "Networking Should Not Require A Network",
    description:
      "Right now, networking mostly benefits people who already have connections. Amber creates the kind of warm, personality-driven introductions that used to be reserved for people with the right alumni network, and makes them available to everyone.",
  },
  {
    icon: Lightbulb,
    color: "#F59E0B",
    title: "Honesty Over Hype",
    description:
      "We are not going to inflate your match score to make you feel good. We tell you exactly why you matched with someone, what might be tricky, and what to keep in mind. That honesty is what makes the platform worth trusting.",
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
          Back To Home
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
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          About The Amber Project
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Help people find places where they actually belong, and help companies
          find people who will genuinely thrive there.
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
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
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

      {/* Vision */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#D97706" }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#D97706" }}
            >
              What We Are Building Toward
            </span>
          </div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Our Vision
          </h2>
        </div>
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-textSecondary)" }}
          >
            A hiring process that actually starts with a conversation. Where the
            first step is not submitting a form into the void but sitting down
            for a coffee chat with someone who already knows you might be a great
            fit. Where students do not feel invisible just because they are not
            at a target school. Where startups can build the culture they
            genuinely want, not just hire whoever applied first.
          </p>
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
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
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
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
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

      {/* Founders */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-4 h-4" style={{ color: "#D97706" }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#D97706" }}
            >
              The Team
            </span>
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Meet The Founders
          </h2>
          <p
            className="text-sm max-w-lg mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            University students in Toronto who built Amber because the hiring
            system was not working for people like us, or the people we know.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { name: "Nakul Patel", color: "#EF4444" },
            { name: "Arsh Patel", color: "#8B5CF6" },
            { name: "Neel Patel", color: "#10B981" },
          ].map((founder) => (
            <div
              key={founder.name}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${founder.color}15` }}
              >
                <span
                  className="text-base font-bold"
                  style={{ color: founder.color }}
                >
                  {founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
              >
                {founder.name}
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-textMuted)" }}
              >
                Co-Founder
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

      {/* Quick facts + CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          {[
            { stat: "Toronto, ON", label: "Headquarters" },
            { stat: "2026", label: "Founded" },
            { stat: "Big Five (OCEAN)", label: "Powered By" },
            { stat: "Free", label: "For Candidates" },
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
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Ready To Find Where You Belong?
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

        {/* Contact */}
        <div className="text-center mt-8">
          <a
            href="mailto:amberfounders@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-textMuted)" }}
          >
            <Mail className="w-4 h-4" />
            amberfounders@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
