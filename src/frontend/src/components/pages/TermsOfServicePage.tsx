import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  UserCheck,
  AlertTriangle,
  Scale,
  Ban,
  RefreshCw,
  Handshake,
  Mail,
} from "lucide-react";

interface TermsSection {
  icon: React.ElementType;
  color: string;
  title: string;
  content: string[];
}

const SECTIONS: TermsSection[] = [
  {
    icon: UserCheck,
    color: "#8B5CF6",
    title: "Your Account",
    content: [
      "You must be at least 16 years old to create an Amber account.",
      "You are responsible for maintaining the security of your account credentials. Do not share your password with anyone.",
      "You agree to provide accurate information during registration and to keep your profile up to date.",
      "One account per person. Creating multiple accounts to manipulate matches or game the system is not permitted.",
    ],
  },
  {
    icon: Handshake,
    color: "#10B981",
    title: "How You Can Use Amber",
    content: [
      "Candidates may use Amber to take personality assessments, view compatibility matches, and connect with employers through coffee chats.",
      "Employers may use Amber to create culture profiles, browse candidate compatibility scores, post roles, and initiate coffee chats.",
      "All interactions on Amber — including coffee chats — should be professional, respectful, and conducted in good faith.",
      "You may not use Amber to harvest data, scrape profiles, or build competing products.",
    ],
  },
  {
    icon: Ban,
    color: "#EF4444",
    title: "Prohibited Conduct",
    content: [
      "Misrepresenting your identity, qualifications, or intentions on the platform.",
      "Harassing, discriminating against, or sending inappropriate messages to other users.",
      "Attempting to reverse-engineer, decompile, or extract the source code of Amber's matching algorithms.",
      "Using automated scripts, bots, or scrapers to access the platform.",
      "Submitting intentionally false assessment responses to manipulate your personality profile or match results.",
    ],
  },
  {
    icon: Scale,
    color: "#F59E0B",
    title: "Intellectual Property",
    content: [
      "Amber's platform, branding, matching algorithms, and assessment content are owned by Amber and protected by intellectual property laws.",
      "Your personality data and profile content belong to you. We do not claim ownership of your personal information.",
      "By submitting feedback, feature requests, or suggestions, you grant Amber a non-exclusive right to use those ideas to improve the platform.",
    ],
  },
  {
    icon: AlertTriangle,
    color: "#EC4899",
    title: "Disclaimers & Limitations",
    content: [
      "Amber provides personality-based compatibility insights, not guarantees of job placement or cultural fit. Matching scores are informational tools, not promises.",
      "We do our best to keep the platform available 24/7, but we cannot guarantee uninterrupted access. Scheduled maintenance and unforeseen outages may occur.",
      "Amber is not a recruitment agency. We facilitate connections between candidates and employers but are not a party to any employment agreements.",
      "To the maximum extent permitted by law, Amber's liability is limited to the fees you have paid (if any) in the 12 months preceding a claim.",
    ],
  },
  {
    icon: RefreshCw,
    color: "#06B6D4",
    title: "Changes & Termination",
    content: [
      "We may update these terms from time to time. When we make material changes, we'll notify you via email or an in-app notice.",
      "You can stop using Amber and delete your account at any time from Settings > Account.",
      "We reserve the right to suspend or terminate accounts that violate these terms, with notice where possible.",
      "These terms are governed by the laws of Ontario, Canada. Any disputes will be resolved in the courts of Ontario.",
    ],
  },
];

export function TermsOfServicePage() {
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
            <FileText className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B5CF6" }}
          >
            Legal
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Terms of Service
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          The ground rules for using Amber — written in plain language so you
          actually know what you're agreeing to.
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
            style={{ background: "rgba(139, 92, 246, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Questions about these terms?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If anything is unclear, don't hesitate to reach out.
          </p>
          <a
            href="mailto:legal@tryamber.com?subject=Terms of Service Question"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            legal@tryamber.com
          </a>
        </div>
      </div>
    </div>
  );
}
