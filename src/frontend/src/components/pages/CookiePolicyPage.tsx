import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cookie,
  ShieldCheck,
  BarChart3,
  Settings,
  Info,
  Mail,
  Clock,
  Globe,
  RefreshCw,
  Layers,
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
    title: "Strictly Necessary Cookies",
    required: true,
    description:
      "These cookies are essential for the platform to function. Without them, you would not be able to log in, navigate between pages, or use core features. These cookies do not collect personal information that could be used for marketing and cannot be switched off.",
    examples: [
      "Session cookies that maintain your logged-in state as you move through the platform.",
      "Security cookies that help protect your account from unauthorized access and support authentication through Supabase.",
      "CSRF tokens that protect against cross-site request forgery attacks.",
    ],
  },
  {
    icon: Settings,
    color: "#F59E0B",
    title: "Functional Cookies",
    required: false,
    description:
      "These cookies allow the platform to remember choices you have made and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we use.",
    examples: [
      "Theme preference: remembers whether you have selected the Amber Light or Amber Dark theme.",
      "Onboarding state: remembers where you are in the onboarding process if you navigate away and return.",
    ],
  },
  {
    icon: BarChart3,
    color: "#8B5CF6",
    title: "Analytics Cookies",
    required: false,
    description:
      "We may use anonymized analytics to understand how users interact with the platform, which features are most used, and where people encounter problems. Currently, The Amber Project uses basic server-side logging rather than third-party analytics scripts. If we introduce third-party analytics tools in the future, we will update this policy and obtain your consent where required.",
    examples: [
      "Page views and feature usage patterns (anonymized).",
      "Performance metrics like page load times and error rates.",
      "No third-party advertising cookies are used.",
    ],
  },
  {
    icon: Layers,
    color: "#EC4899",
    title: "Third-Party Cookies",
    required: false,
    description:
      "Some features of the platform involve third-party services that may set their own cookies. We do not use third-party advertising cookies and do not allow any third party to use cookies on our platform for the purpose of targeting you with advertisements.",
    examples: [
      "Stripe: if you make a payment, Stripe may set cookies to support the checkout process and prevent fraud.",
      "Supabase: our authentication provider may set cookies related to your login session.",
    ],
  },
];

const COOKIE_DURATIONS = [
  { type: "Session cookies", duration: "Expire when you close your browser" },
  {
    type: "Authentication tokens",
    duration: "Up to 7 days, or until you log out",
  },
  { type: "Theme and preference cookies", duration: "Up to 12 months" },
  { type: "Onboarding state cookies", duration: "Up to 30 days" },
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
          Back To Home
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
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          Cookie Policy
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          A clear breakdown of what cookies The Amber Project uses, why we use
          them, and how you can control them. This policy should be read
          alongside our Privacy Policy.
        </p>
        <p
          className="text-xs mt-3"
          style={{ color: "var(--color-textMuted)" }}
        >
          Last updated: January 2026
        </p>
      </div>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What Are Cookies */}
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
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              What Are Cookies
            </h2>
          </div>
          <div className="space-y-3">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Cookies are small text files that are stored on your device when
              you visit a website or web application. They are widely used to
              make websites work more efficiently, to remember your preferences,
              and to provide information to the owners of the site about how
              their platform is being used.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Cookies can be session cookies, which are deleted when you close
              your browser, or persistent cookies, which remain on your device
              for a set period of time. The Amber Project uses cookies and
              similar technologies to keep the platform running, remember your
              preferences, keep your session secure, and understand how people
              use the platform. We do not use cookies to serve advertising.
            </p>
          </div>
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
                      style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
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

        {/* Cookie Duration */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(99, 102, 241, 0.1)" }}
            >
              <Clock className="w-4 h-4" style={{ color: "#6366F1" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              Cookie Duration
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Different cookies remain on your device for different lengths of
            time depending on their purpose.
          </p>
          <ul className="space-y-2.5">
            {COOKIE_DURATIONS.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <span
                  className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "#6366F1" }}
                />
                <span style={{ color: "var(--color-textSecondary)" }}>
                  <strong style={{ color: "var(--color-text)" }}>
                    {item.type}:
                  </strong>{" "}
                  {item.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Managing Your Cookie Preferences */}
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
              style={{ background: "rgba(236, 72, 153, 0.1)" }}
            >
              <Settings className="w-4 h-4" style={{ color: "#EC4899" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              Managing Your Cookie Preferences
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Most browsers allow you to control cookies through their settings.
            You can usually find these in the Privacy or Security section.
            Please note that blocking strictly necessary cookies will prevent
            you from logging in and using the core features of the platform.
          </p>
          <ul className="space-y-2.5">
            {[
              "Google Chrome: Settings > Privacy and Security > Cookies and other site data",
              "Mozilla Firefox: Settings > Privacy and Security > Cookies and Site Data",
              "Safari: Preferences > Privacy > Manage Website Data",
              "Microsoft Edge: Settings > Cookies and site permissions",
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

        {/* Do Not Track */}
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
              <Globe className="w-4 h-4" style={{ color: "#06B6D4" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              Do Not Track
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Some browsers include a Do Not Track feature that signals to
            websites that you do not want your online activities tracked. The
            platform currently does not respond to Do Not Track signals because
            there is no consistent industry standard for how these signals
            should be interpreted. We will revisit this as standards develop.
          </p>
        </div>

        {/* Changes To This Policy */}
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
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <RefreshCw className="w-4 h-4" style={{ color: "#F59E0B" }} />
            </div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
            >
              Changes To This Policy
            </h2>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-textSecondary)" }}
          >
            We may update this Cookie Policy from time to time, particularly as
            we add new features or third-party integrations to the platform.
            When we make significant changes, we will update the date at the
            top of this document and notify you through the platform or by
            email. Your continued use of the platform following any update
            constitutes acceptance of the revised policy.
          </p>
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
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Questions About Cookies?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If you have any questions about how we use cookies, get in touch.
          </p>
          <a
            href="mailto:amberfounders@gmail.com?subject=Cookie Policy Question"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            amberfounders@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
