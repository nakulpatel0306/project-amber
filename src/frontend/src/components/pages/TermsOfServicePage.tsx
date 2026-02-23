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
  Shield,
  Coffee,
  CreditCard,
  Brain,
  Gavel,
} from "lucide-react";

interface TermsSection {
  icon: React.ElementType;
  color: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

const SECTIONS: TermsSection[] = [
  {
    icon: Handshake,
    color: "#8B5CF6",
    title: "Who We Are",
    paragraphs: [
      "The Amber Project is a culture-first job matching platform that connects job seekers and employers based on personality compatibility and cultural alignment. The platform is operated by The Amber Project, currently based in Ontario, Canada.",
      "By using the platform, you agree that these Terms form a legally binding agreement between you and The Amber Project.",
    ],
  },
  {
    icon: UserCheck,
    color: "#10B981",
    title: "Eligibility And Your Account",
    paragraphs: [
      "You must be at least 16 years of age to use the platform. You agree to provide accurate information during registration and to keep your account information up to date.",
      "The platform offers two types of accounts: Job Seeker and Employer. You may not use a Job Seeker account for employer purposes or vice versa. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify us immediately if you become aware of any unauthorized use of your account.",
    ],
  },
  {
    icon: Ban,
    color: "#EF4444",
    title: "Permitted And Prohibited Conduct",
    paragraphs: [
      "You may use the platform for its intended purpose: connecting with potential employers or candidates based on personality and culture fit, completing personality assessments, scheduling and attending coffee chats, and managing your profile.",
      "You agree not to:",
    ],
    bullets: [
      "Provide false, misleading, or inaccurate information in your profile, assessment responses, or any communications.",
      "Impersonate any person or entity or misrepresent your affiliation.",
      "Use the platform to harass, threaten, or harm any other user.",
      "Scrape, copy, or otherwise extract data from the platform without our written permission.",
      "Use automated tools, bots, or scripts to interact with the platform without our prior written consent.",
    ],
  },
  {
    icon: Brain,
    color: "#EC4899",
    title: "Personality Assessments",
    paragraphs: [
      "The platform includes personality assessments based on the Big Five (OCEAN) model. These are provided for the purpose of facilitating compatibility matching, not clinical psychological evaluations. No assessment result should be taken as a definitive or complete description of your personality.",
      "Amber does not guarantee any particular outcome from using the platform, including employment or hiring success. Employers agree not to use personality data as the sole basis for any hiring decision and acknowledge that assessments are one input among many.",
    ],
  },
  {
    icon: Coffee,
    color: "#F59E0B",
    title: "Coffee Chats",
    paragraphs: [
      "The platform facilitates informal introductory conversations between job seekers and employers, referred to as coffee chats. These are voluntary and informal. Amber is not a party to any coffee chat and is not responsible for what is said or agreed upon during them.",
      "You agree to treat other users with respect during coffee chats. You may report any coffee chat that involved harassment, discrimination, or other inappropriate conduct using the feedback mechanism on the platform.",
    ],
  },
  {
    icon: Scale,
    color: "#8B5CF6",
    title: "Content And Intellectual Property",
    paragraphs: [
      "By submitting content to the platform, including profile information, assessment responses, messages, and feedback, you grant The Amber Project a non-exclusive, worldwide, royalty-free licence to use, store, display, and process that content for the purpose of operating and improving the platform.",
      "You retain ownership of your content. We will not sell your individual profile content to third parties. All content on the platform that is not submitted by users, including the design, code, text, graphics, logos, and assessment frameworks, is owned by or licenced to The Amber Project and is protected by applicable intellectual property laws.",
    ],
  },
  {
    icon: Shield,
    color: "#06B6D4",
    title: "Third-Party Services",
    paragraphs: [
      "The platform uses third-party services to operate:",
    ],
    bullets: [
      "Supabase for database hosting and authentication.",
      "Stripe for payment processing.",
      "OpenAI for certain AI-powered features.",
    ],
    closingParagraphs: [
      "Your use of these features is also subject to those providers' terms of service and privacy policies. We are not responsible for the practices or content of third-party services.",
    ],
  },
  {
    icon: CreditCard,
    color: "#10B981",
    title: "Payments And Subscriptions",
    paragraphs: [
      "Certain features of the platform may require a paid subscription. All payments are processed securely through Stripe. By subscribing, you authorize Amber to charge your payment method on the billing cycle you select.",
      "Subscriptions automatically renew unless you cancel before the renewal date. Refunds are handled on a case-by-case basis at Amber's discretion. We reserve the right to change pricing with reasonable advance notice.",
    ],
  },
  {
    icon: AlertTriangle,
    color: "#EF4444",
    title: "Disclaimers And Limitation Of Liability",
    paragraphs: [
      "The platform is provided on an as-is and as-available basis without warranties of any kind, either express or implied. We do not warrant that the platform will be error-free, uninterrupted, or free of viruses or other harmful components.",
      "We make no guarantees regarding the accuracy of personality match scores, the quality of any coffee chat, or any employment outcome resulting from use of the platform.",
      "To the fullest extent permitted by law, The Amber Project shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the platform. Our total liability for any claim shall not exceed the amount you paid to us in the twelve months preceding the claim, or one hundred Canadian dollars, whichever is greater.",
    ],
  },
  {
    icon: RefreshCw,
    color: "#F59E0B",
    title: "Termination And Changes",
    paragraphs: [
      "You may close your account at any time through your account settings. We reserve the right to suspend or terminate your account at any time if we believe you have violated these Terms or if your continued use is harmful to other users or to the platform.",
      "We may update these Terms from time to time. When we do, we will update the date at the top and notify you by email or through a notice on the platform. Your continued use of the platform after any update constitutes your acceptance of the revised Terms.",
    ],
  },
  {
    icon: Gavel,
    color: "#8B5CF6",
    title: "Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of the Province of Ontario, Canada. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ontario. We encourage you to contact us first to resolve any dispute informally before initiating legal proceedings.",
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
          Back To Home
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
          The ground rules for using The Amber Project, written in plain
          language so you actually know what you are agreeing to.
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
                    style={{ color: "var(--color-text)" }}
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

                  {section.closingParagraphs?.map((paragraph, idx) => (
                    <p
                      key={`cp-${idx}`}
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      {paragraph}
                    </p>
                  ))}
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
            style={{ background: "rgba(139, 92, 246, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Questions About These Terms?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If anything is unclear, do not hesitate to reach out.
          </p>
          <a
            href="mailto:amberfounders@gmail.com?subject=Terms of Service Question"
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
