import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Bug,
  Wrench,
  Rocket,
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: "feature" | "improvement" | "fix";
  items: string[];
}

const TYPE_CONFIG = {
  feature: { label: "New Feature", color: "#8B5CF6", icon: Sparkles },
  improvement: { label: "Improvement", color: "#10B981", icon: Zap },
  fix: { label: "Bug Fix", color: "#F59E0B", icon: Bug },
};

// Static fallback used when the GitHub API returns nothing or errors
const FALLBACK_CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.4.0",
    date: "February 10, 2026",
    title: "Culture Matching 2.0",
    type: "feature",
    items: [
      "Completely redesigned matching algorithm with multi-dimensional scoring",
      "Richer company culture profiles with team-level data",
      "New compatibility breakdown showing trait-by-trait fit analysis",
      "Improved match accuracy by 34% based on user outcome data",
    ],
  },
  {
    version: "2.3.2",
    date: "January 28, 2026",
    title: "Coffee Chat Enhancements",
    type: "improvement",
    items: [
      "Added calendar sync for Google Calendar and Outlook",
      "Automatic timezone detection for scheduling across regions",
      "New chat preparation tips based on personality compatibility",
      "Improved notification timing for upcoming coffee chats",
    ],
  },
  {
    version: "2.3.1",
    date: "January 15, 2026",
    title: "Assessment Reliability Update",
    type: "fix",
    items: [
      "Fixed edge case where slider responses weren't saved on slow connections",
      "Resolved inconsistency in trait score rounding for borderline results",
      "Improved progress bar accuracy during assessment flow",
    ],
  },
  {
    version: "2.3.0",
    date: "January 3, 2026",
    title: "Ember AI Assistant",
    type: "feature",
    items: [
      "Introduced Ember, your AI personality coach powered by your Big Five profile",
      "Personalized career guidance based on trait strengths and growth areas",
      "Interview preparation tailored to your personality type",
      "Smart conversation starters for coffee chats",
    ],
  },
  {
    version: "2.2.0",
    date: "December 12, 2025",
    title: "Advanced Assessments",
    type: "feature",
    items: [
      "Added four new assessment types: Visual Perception, Work Values, Situational Judgment, and Cognitive Patterns",
      "Each assessment takes 5-10 minutes and enriches your personality profile",
      "New assessment hub with progress tracking and completion badges",
    ],
  },
  {
    version: "2.1.1",
    date: "November 20, 2025",
    title: "Dashboard Improvements",
    type: "improvement",
    items: [
      "Redesigned candidate dashboard with real-time match updates",
      "New leaderboard showing top personality-culture fits",
      "Employer dashboard now shows candidate engagement metrics",
      "Faster page loads with optimized data fetching",
    ],
  },
  {
    version: "2.1.0",
    date: "November 5, 2025",
    title: "Employer Tools",
    type: "feature",
    items: [
      "Launch of employer culture assessment for teams",
      "Browse and filter candidates by personality compatibility",
      "Candidate recommendations updated daily",
      "Role creation with culture-fit requirements",
    ],
  },
  {
    version: "2.0.0",
    date: "October 15, 2025",
    title: "Amber 2.0 Launch",
    type: "feature",
    items: [
      "Complete platform redesign with new visual identity",
      "Big Five personality assessment with slider-based responses",
      "Culture-first job matching powered by AI",
      "Coffee chat scheduling for casual employer-candidate conversations",
      "Dark mode and multiple theme options",
    ],
  },
];

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
}

function classifyType(title: string): "feature" | "improvement" | "fix" {
  const lower = title.toLowerCase();
  if (lower.includes("fix") || lower.includes("bug") || lower.includes("patch")) return "fix";
  if (lower.includes("improv") || lower.includes("enhance") || lower.includes("update") || lower.includes("refactor")) return "improvement";
  return "feature";
}

function parseBody(body: string): string[] {
  if (!body) return [];
  return body
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").replace(/^#+\s*/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("<!--"));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function releasesToEntries(releases: GitHubRelease[]): ChangelogEntry[] {
  return releases.map((r) => ({
    version: r.tag_name.replace(/^v/, ""),
    date: formatDate(r.published_at),
    title: r.name || r.tag_name,
    type: classifyType(r.name || r.tag_name),
    items: parseBody(r.body),
  }));
}

export function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchReleases() {
      try {
        const res = await fetch(
          "https://api.github.com/repos/nakulpatel0306/project-amber/releases"
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data: GitHubRelease[] = await res.json();
        if (!cancelled) {
          if (data.length > 0) {
            setEntries(releasesToEntries(data));
          } else {
            setEntries(FALLBACK_CHANGELOG);
          }
        }
      } catch {
        if (!cancelled) setEntries(FALLBACK_CHANGELOG);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReleases();
    return () => { cancelled = true; };
  }, []);

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
            <Rocket className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B5CF6" }}
          >
            What's New
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Changelog
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Everything new, improved, and fixed across the Amber platform.
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 animate-pulse hidden sm:block"
                  style={{ background: "var(--color-backgroundSecondary)" }}
                />
                <div
                  className="flex-1 rounded-2xl p-5 animate-pulse"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    height: 140,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] top-2 bottom-2 w-px hidden sm:block"
              style={{ background: "var(--color-border)" }}
            />

            <div className="space-y-8">
              {entries.map((entry) => {
                const config = TYPE_CONFIG[entry.type];
                const Icon = config.icon;

                return (
                  <div key={entry.version} className="relative flex gap-5">
                    {/* Timeline dot */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 hidden sm:flex"
                      style={{ background: `${config.color}15` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: config.color }}
                      />
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 rounded-2xl p-5"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            background: `${config.color}15`,
                            color: config.color,
                          }}
                        >
                          {config.label}
                        </span>
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          style={{
                            background: "var(--color-backgroundSecondary)",
                            color: "var(--color-textSecondary)",
                          }}
                        >
                          v{entry.version}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--color-textMuted)" }}
                        >
                          {entry.date}
                        </span>
                      </div>

                      <h3
                        className="text-base font-semibold mb-3"
                        style={{ color: "var(--color-text)" }}
                      >
                        {entry.title}
                      </h3>

                      {entry.items.length > 0 && (
                        <ul className="space-y-1.5">
                          {entry.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Wrench
                                className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                                style={{ color: "var(--color-textMuted)" }}
                              />
                              <span
                                style={{ color: "var(--color-textSecondary)" }}
                              >
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
