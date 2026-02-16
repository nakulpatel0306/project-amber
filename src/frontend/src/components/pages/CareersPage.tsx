import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Megaphone,
  GraduationCap,
  Code,
  ArrowRight,
  Sparkles,
  Heart,
  Zap,
  Coffee,
} from "lucide-react";

interface JobListing {
  title: string;
  team: string;
  location: string;
  type: string;
  icon: React.ElementType;
  color: string;
  description: string;
  responsibilities: string[];
}

const OPEN_ROLES: JobListing[] = [
  {
    title: "Student Brand Ambassador",
    team: "Marketing",
    location: "Remote (Canada)",
    type: "Part-time",
    icon: GraduationCap,
    color: "#8B5CF6",
    description:
      "Represent Amber on your campus and help us reach the next generation of job seekers. You'll run events, create social content, and be the face of culture-first hiring at your university.",
    responsibilities: [
      "Host campus events, workshops, and info sessions about personality-based hiring",
      "Create authentic social media content showcasing student career journeys",
      "Collect feedback from students and share insights with our product team",
      "Grow our campus community and drive sign-ups through word-of-mouth",
    ],
  },
  {
    title: "Marketing & Growth Lead",
    team: "Marketing",
    location: "Toronto, ON / Remote",
    type: "Full-time",
    icon: Megaphone,
    color: "#EC4899",
    description:
      "Own our go-to-market strategy and build the engine that connects Amber with candidates and employers. You'll blend storytelling with data to grow a brand people love.",
    responsibilities: [
      "Develop and execute content strategy across blog, social, and email channels",
      "Run growth experiments — SEO, paid acquisition, partnerships, and referrals",
      "Build and manage our ambassador and campus programs",
      "Track performance metrics and optimize conversion funnels",
    ],
  },
  {
    title: "Full-Stack Developer",
    team: "Engineering",
    location: "Toronto, ON / Remote",
    type: "Full-time",
    icon: Code,
    color: "#10B981",
    description:
      "Help us build the platform that's redefining how people find jobs. You'll work across our React frontend and Python backend, shipping features that directly impact matching quality and user experience.",
    responsibilities: [
      "Build and maintain features across our React/TypeScript frontend and FastAPI backend",
      "Improve our matching algorithm and compatibility scoring engine",
      "Design and implement APIs, database schemas, and integrations",
      "Collaborate closely with design and product to ship fast and iterate",
    ],
  },
];

interface PerkData {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
}

const PERKS: PerkData[] = [
  {
    icon: Heart,
    color: "#EC4899",
    title: "Culture We Actually Believe In",
    description:
      "We build culture-matching software — so of course we practice what we preach. You'll work with people who genuinely care.",
  },
  {
    icon: Zap,
    color: "#F59E0B",
    title: "Real Impact, Early Stage",
    description:
      "Every line of code, every campaign, every idea shapes the product. You're not a cog — you're a co-builder.",
  },
  {
    icon: Sparkles,
    color: "#8B5CF6",
    title: "Learn Relentlessly",
    description:
      "We're a small team that moves fast. You'll wear multiple hats, pick up new skills weekly, and grow faster than at any big company.",
  },
  {
    icon: Coffee,
    color: "#06B6D4",
    title: "Flexible & Remote-Friendly",
    description:
      "Work from wherever you do your best thinking. We care about output, not hours logged in a specific chair.",
  },
];

export function CareersPage() {
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
            style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          >
            <Briefcase className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B5CF6" }}
          >
            Join the Team
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Careers at Amber
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          We're building the future of hiring — and we need curious, driven
          people who believe work should feel like belonging.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Perks */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#D97706" }}
          >
            Why Amber
          </span>
          <h2
            className="text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)" }}
          >
            What it's like here
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${perk.color}15` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: perk.color }}
                    />
                  </div>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {perk.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {perk.description}
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

      {/* Open Roles */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#10B981" }}
          >
            Open Positions
          </span>
          <h2
            className="text-2xl font-bold mt-2"
            style={{ color: "var(--color-text)" }}
          >
            Find your role
          </h2>
        </div>

        <div className="space-y-6">
          {OPEN_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="rounded-2xl p-6"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${role.color}15` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: role.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="text-base font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {role.title}
                      </h3>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "var(--color-textMuted)" }}
                      >
                        {role.team}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "var(--color-backgroundSecondary)",
                        color: "var(--color-textSecondary)",
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      {role.location}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "var(--color-backgroundSecondary)",
                        color: "var(--color-textSecondary)",
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {role.type}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {role.description}
                </p>

                {/* Responsibilities */}
                <ul className="space-y-1.5 mb-5">
                  {role.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span
                        className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                        style={{ background: role.color }}
                      />
                      <span
                        style={{ color: "var(--color-textSecondary)" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Apply */}
                <a
                  href={`mailto:careers@tryamber.com?subject=Application: ${role.title}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: `${role.color}15`,
                    color: role.color,
                  }}
                >
                  Apply Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
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

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            Don't see the right role?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            We're always looking for exceptional people. Send us a note and tell
            us what you'd bring to Amber.
          </p>
          <a
            href="mailto:careers@tryamber.com?subject=General Interest"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            Say Hello
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
