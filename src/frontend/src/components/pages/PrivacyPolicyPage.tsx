import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Clock,
  Globe,
  Mail,
  Brain,
  Users,
  Baby,
  RefreshCw,
} from "lucide-react";

interface PolicySection {
  icon: React.ElementType;
  color: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

const SECTIONS: PolicySection[] = [
  {
    icon: Shield,
    color: "#8B5CF6",
    title: "Who Is Responsible For Your Data",
    paragraphs: [
      "The Amber Project, operated by its founding team in Ontario, Canada, is the data controller responsible for your personal information. We determine how and why your personal data is processed, and we take that responsibility seriously.",
    ],
  },
  {
    icon: Database,
    color: "#10B981",
    title: "What Information We Collect",
    paragraphs: [
      "We collect different types of information depending on how you use the platform. Payment information is processed through Stripe, and we do not store your full card details.",
    ],
    bullets: [
      "Account information: your name, email address, password, and role (job seeker or employer).",
      "Profile information: headline, bio, location, years of experience, work preferences, salary expectations, and social links such as LinkedIn, GitHub, and portfolio URLs.",
      "Employer information: company name, description, size, industry, and culture quiz responses.",
      "Personality assessment responses: your answers to the Big Five (OCEAN) questions and any supplementary assessments you choose to complete.",
      "Coffee chat activity: messages, scheduling preferences, ratings, and written feedback.",
      "Usage data collected automatically: pages you visit, features you use, device and browser information, IP address, authentication data, and cookie data.",
    ],
  },
  {
    icon: Eye,
    color: "#F59E0B",
    title: "How We Use Your Information",
    paragraphs: [
      "We use your information to operate the platform and deliver the best possible experience. This includes creating and managing your account, calculating personality match scores, operating the Ember AI matching agent, and facilitating coffee chat scheduling between matched users.",
      "Your data also helps us send notifications about matches and platform updates, process payments, manage subscriptions, and improve our matching algorithms using anonymized data.",
      "We do not use your personality assessment data for any purpose outside of operating the platform without your explicit consent. We do not sell your individual profile data to advertisers or third-party marketers.",
    ],
  },
  {
    icon: Brain,
    color: "#EC4899",
    title: "Personality And Sensitive Data",
    paragraphs: [
      "We recognize that personality assessment data is sensitive. Your OCEAN scores, archetype classification, and assessment responses are used solely to generate match scores and insights within the platform. This data is stored securely in our database with access controls limiting who can read it.",
      "Personality data is shared with employers only in the form of aggregated match scores and compatibility summaries, never as raw assessment responses. It is never sold to third parties and is retained only for as long as your account is active or as required by law.",
      "If you are an employer, you agree that you will not use personality data provided through the platform as the sole or determinative basis for any hiring decision.",
    ],
  },
  {
    icon: Users,
    color: "#06B6D4",
    title: "How We Share Your Information",
    paragraphs: [
      "Job seeker profiles, including personality scores and compatibility summaries, are visible to matched employers. Employers' culture profiles and role details are visible to matched job seekers.",
      "We work with the following service providers to operate the platform:",
    ],
    bullets: [
      "Supabase for database hosting and authentication.",
      "Stripe for payment processing.",
      "OpenAI for AI-powered matching insights, processed under their data processing terms.",
    ],
  },
  {
    icon: Clock,
    color: "#EF4444",
    title: "Data Retention And Deletion",
    paragraphs: [
      "We retain your personal information for as long as your account is active. If you close your account, we will delete or anonymize your data within 90 days, except where we are required by law to retain it longer.",
      "Anonymized and aggregated data may be retained indefinitely for the purpose of improving our matching algorithms. This data cannot be used to identify you individually. You can delete your account and all associated data at any time from Settings > Account.",
    ],
  },
  {
    icon: UserCheck,
    color: "#8B5CF6",
    title: "Your Rights",
    paragraphs: [
      "You have the following rights over your personal data:",
    ],
    bullets: [
      "Access: request a copy of the personal data we hold about you.",
      "Correction: ask us to correct inaccurate or incomplete data.",
      "Deletion: ask us to delete your personal data, subject to certain legal exceptions.",
      "Portability: receive your data in a structured, machine-readable format.",
      "Objection: object to certain types of processing, including direct marketing.",
      "Withdrawal of consent: withdraw your consent at any time where we rely on it to process your data.",
    ],
  },
  {
    icon: Lock,
    color: "#10B981",
    title: "Data Security",
    paragraphs: [
      "We take the security of your data seriously and have implemented the following measures:",
    ],
    bullets: [
      "Encrypted data transmission over HTTPS.",
      "Access controls limiting which team members can access personal data.",
      "Row Level Security policies enforced at the database level through Supabase.",
      "Regular review of our security practices.",
    ],
  },
  {
    icon: Baby,
    color: "#F59E0B",
    title: "Children's Privacy",
    paragraphs: [
      "The platform is not intended for use by anyone under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16 without parental consent, we will delete that information promptly.",
    ],
  },
  {
    icon: Globe,
    color: "#06B6D4",
    title: "International Users",
    paragraphs: [
      "The Amber Project is based in Ontario, Canada. If you are accessing the platform from outside Canada, your information will be transferred to and processed in Canada. By using the platform, you consent to that transfer. We take appropriate steps to ensure your data is handled securely regardless of where it is processed.",
    ],
  },
  {
    icon: RefreshCw,
    color: "#EC4899",
    title: "Changes To This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email or through a notice on the platform and update the date at the top of this document. Your continued use of the platform after any update constitutes acceptance of the revised policy.",
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
          Back To Home
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
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          Privacy Policy
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Your privacy matters to us. This Privacy Policy explains what
          information we collect, how we use it, who we share it with, and what
          rights you have over your data.
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
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {section.paragraphs?.map((paragraph, idx) => (
                    <p
                      key={`p-${idx}`}
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-2 pl-1">
                      {section.bullets.map((item, idx) => (
                        <li
                          key={`b-${idx}`}
                          className="flex items-start gap-2.5 text-sm leading-relaxed"
                        >
                          <span
                            className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                            style={{ background: section.color }}
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

                  {/* Extra closing paragraphs for sections that need text after bullets */}
                  {section.title === "How We Share Your Information" && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      We may also disclose your information if required by law,
                      court order, or government authority. If The Amber Project
                      is acquired or merged, your information may be
                      transferred. We will notify you before your data becomes
                      subject to a different privacy policy.
                    </p>
                  )}

                  {section.title === "Your Rights" && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      To exercise any of these rights, contact us at
                      amberfounders@gmail.com. We will respond within 30 days.
                    </p>
                  )}

                  {section.title === "Data Security" && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      No method of transmission over the internet is completely
                      secure. We cannot guarantee absolute security, but we are
                      committed to protecting your data and will notify you
                      promptly in the event of a breach.
                    </p>
                  )}
                </div>
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
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Questions About Your Data?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            We take privacy seriously. If you have any questions, concerns, or
            data requests, reach out and we will respond within 30 days.
          </p>
          <a
            href="mailto:amberfounders@gmail.com?subject=Privacy Inquiry"
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
