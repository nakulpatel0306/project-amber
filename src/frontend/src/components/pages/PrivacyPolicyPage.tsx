import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Trash2,
  Globe,
  Mail,
} from "lucide-react";

interface PolicySection {
  icon: React.ElementType;
  color: string;
  title: string;
  content: string[];
}

const SECTIONS: PolicySection[] = [
  {
    icon: Database,
    color: "#8B5CF6",
    title: "What We Collect",
    content: [
      "Account information — your name, email address, and role (candidate or employer) when you sign up.",
      "Personality assessment responses — your answers to the Big Five questionnaire and any additional assessments you choose to take.",
      "Profile data — work preferences, location, and any information you add to your profile.",
      "Usage data — pages visited, features used, and session duration to improve our platform. We do not track you across other websites.",
    ],
  },
  {
    icon: Lock,
    color: "#10B981",
    title: "How We Protect Your Data",
    content: [
      "All data is encrypted in transit (TLS 1.3) and at rest using industry-standard encryption.",
      "Authentication is handled through Supabase with secure JWT tokens — we never store your password in plain text.",
      "Our infrastructure runs on secure, SOC 2-compliant cloud providers.",
      "We conduct regular security reviews and follow OWASP best practices in our codebase.",
    ],
  },
  {
    icon: Eye,
    color: "#F59E0B",
    title: "Who Can See Your Information",
    content: [
      "Your raw personality trait scores are visible only to you. Employers never see your Big Five scores directly.",
      "Employers see compatibility percentages and high-level fit summaries — not the underlying data.",
      "You control your profile visibility. You can hide your profile from employer searches at any time in Settings.",
      "We never sell, rent, or share your personal data with third-party advertisers.",
    ],
  },
  {
    icon: UserCheck,
    color: "#EC4899",
    title: "Your Rights & Choices",
    content: [
      "Access — you can view all data we hold about you from your Settings page at any time.",
      "Correction — you can update your profile information and retake assessments whenever you choose.",
      "Portability — you can request an export of your data in a standard format.",
      "Objection — you can opt out of non-essential communications and marketing emails.",
    ],
  },
  {
    icon: Trash2,
    color: "#EF4444",
    title: "Data Deletion",
    content: [
      "You can delete your account and all associated data at any time from Settings > Account > Delete Account.",
      "When you delete your account, we permanently remove your personality data, assessment responses, and profile information.",
      "Some anonymized, aggregated data (e.g., platform-wide trait distributions) may be retained for research purposes but can never be linked back to you.",
      "Deletion requests are processed within 30 days in compliance with applicable privacy regulations.",
    ],
  },
  {
    icon: Globe,
    color: "#06B6D4",
    title: "Cookies & Analytics",
    content: [
      "We use essential cookies for authentication and session management — these are required for the platform to function.",
      "We use privacy-friendly analytics to understand how the platform is used. We do not use invasive tracking pixels or third-party ad trackers.",
      "You can manage cookie preferences in your browser settings at any time.",
    ],
  },
];

export function PrivacyPolicyPage() {
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
            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
          >
            <Shield className="w-5 h-5" style={{ color: "#10B981" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#10B981" }}
          >
            Legal
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Privacy Policy
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Your personality data is deeply personal. Here's exactly how we
          handle it — no legal jargon, just plain language.
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

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl p-6"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${section.color}15` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: section.color }}
                    />
                  </div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-2.5">
                  {section.content.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed"
                    >
                      <span
                        className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                        style={{ background: section.color }}
                      />
                      <span style={{ color: "var(--color-textSecondary)" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div
          className="rounded-2xl p-8 text-center mt-10"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(16, 185, 129, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#10B981" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Questions about your data?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            We take privacy seriously. If you have any questions, concerns, or
            data requests, reach out and we'll respond within 48 hours.
          </p>
          <a
            href="mailto:privacy@tryamber.com?subject=Privacy Inquiry"
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
