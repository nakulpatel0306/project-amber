import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cookie,
  ShieldCheck,
  BarChart3,
  Settings,
  Info,
  Mail,
} from "lucide-react";

interface CookieCategory {
  icon: React.ElementType;
  color: string;
  title: string;
  required: boolean;
  description: string;
  examples: string[];
}

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    icon: ShieldCheck,
    color: "#10B981",
    title: "Essential Cookies",
    required: true,
    description:
      "These cookies are strictly necessary for Amber to function. Without them, you wouldn't be able to log in, stay authenticated, or use core features. They cannot be disabled.",
    examples: [
      "Session token — keeps you logged in as you navigate the platform",
      "CSRF token — protects your account against cross-site request forgery attacks",
      "Cookie consent — remembers your cookie preferences so we don't keep asking",
    ],
  },
  {
    icon: BarChart3,
    color: "#8B5CF6",
    title: "Analytics Cookies",
    required: false,
    description:
      "These help us understand how people use Amber so we can improve the experience. We use privacy-friendly analytics — no invasive tracking, no third-party ad networks, no selling your data.",
    examples: [
      "Page views — which pages are visited most so we know where to focus improvements",
      "Feature usage — which tools (assessments, matching, coffee chats) are most popular",
      "Performance metrics — page load times and error rates so we can fix issues quickly",
    ],
  },
  {
    icon: Settings,
    color: "#F59E0B",
    title: "Preference Cookies",
    required: false,
    description:
      "These remember choices you've made so the platform feels personalized. They make your experience smoother but aren't required for Amber to work.",
    examples: [
      "Theme preference — remembers whether you chose light mode, dark mode, or another theme",
      "Sidebar state — keeps your navigation layout how you left it",
      "Dismissed notices — prevents showing the same banners and tips repeatedly",
    ],
  },
];

export function CookiePolicyPage() {
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
            <Cookie className="w-5 h-5" style={{ color: "#F59E0B" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#F59E0B" }}
          >
            Legal
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Cookie Policy
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          A clear breakdown of what cookies Amber uses, why we use them, and
          how you can control them.
        </p>
        <p
          className="text-xs mt-3"
          style={{ color: "var(--color-textMuted)" }}
        >
          Last updated: February 14, 2026
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* What Are Cookies */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(6, 182, 212, 0.1)" }}
            >
              <Info className="w-4 h-4" style={{ color: "#06B6D4" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              What Are Cookies?
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Cookies are small text files stored on your device when you visit a
            website. They help the site remember your preferences, keep you
            logged in, and understand how you use the platform. Amber uses a
            minimal set of cookies — only what's needed to provide a secure,
            functional experience.
          </p>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-8 mb-10">
          {COOKIE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="rounded-2xl p-6"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${cat.color}15` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <h2
                      className="text-base font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {cat.title}
                    </h2>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: cat.required
                        ? "rgba(16, 185, 129, 0.1)"
                        : "var(--color-backgroundSecondary)",
                      color: cat.required
                        ? "#10B981"
                        : "var(--color-textMuted)",
                    }}
                  >
                    {cat.required ? "Required" : "Optional"}
                  </span>
                </div>

                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--color-textSecondary)" }}
                >
                  {cat.description}
                </p>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--color-backgroundSecondary)" }}
                >
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider mb-2.5"
                    style={{ color: "var(--color-textMuted)" }}
                  >
                    Examples
                  </p>
                  <ul className="space-y-2">
                    {cat.examples.map((ex, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm leading-relaxed"
                      >
                        <span
                          className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span
                          style={{ color: "var(--color-textSecondary)" }}
                        >
                          {ex}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Managing Cookies */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(236, 72, 153, 0.1)" }}
            >
              <Settings className="w-4 h-4" style={{ color: "#EC4899" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Managing Your Cookies
            </h2>
          </div>
          <ul className="space-y-2.5">
            {[
              "You can clear cookies at any time through your browser settings. Note that clearing essential cookies will log you out.",
              "Most browsers let you block third-party cookies while allowing first-party cookies. Amber only uses first-party cookies.",
              "Disabling analytics and preference cookies won't affect your ability to use Amber — core functionality remains fully intact.",
              "For more details on managing cookies in your browser, visit your browser's help documentation.",
            ].map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <span
                  className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "#EC4899" }}
                />
                <span style={{ color: "var(--color-textSecondary)" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(245, 158, 11, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#F59E0B" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Questions about cookies?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If you have any questions about how we use cookies, get in touch.
          </p>
          <a
            href="mailto:privacy@tryamber.com?subject=Cookie Policy Question"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            privacy@tryamber.com
          </a>
        </div>
      </div>
    </div>
  );
}
