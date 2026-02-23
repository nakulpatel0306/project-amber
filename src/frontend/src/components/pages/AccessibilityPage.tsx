import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Accessibility,
  Monitor,
  Keyboard,
  Eye,
  MessageSquare,
  Palette,
  Mail,
  Heart,
  Wrench,
} from "lucide-react";

interface CommitmentItem {
  icon: React.ElementType;
  color: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

const COMMITMENTS: CommitmentItem[] = [
  {
    icon: Heart,
    color: "#EF4444",
    title: "Our Commitment",
    paragraphs: [
      "We are committed to making The Amber Project accessible to everyone, regardless of ability. Everyone deserves equal access to personality-driven job matching and the opportunities it creates.",
      "We are working toward WCAG 2.1 Level AA compliance across the entire platform. Accessibility is not an afterthought. It is a core part of how we build.",
    ],
  },
  {
    icon: Monitor,
    color: "#8B5CF6",
    title: "Screen Reader Support",
    paragraphs: [
      "The platform is built with semantic HTML and ARIA labels to work with popular screen readers like NVDA, JAWS, and VoiceOver. Assessment questions and results are structured for clear screen reader navigation.",
    ],
    bullets: [
      "Dynamic content updates, such as match scores loading or notifications, are announced to assistive technology.",
      "Images and icons include appropriate alt text or are marked as decorative when they do not convey meaning.",
    ],
  },
  {
    icon: Keyboard,
    color: "#10B981",
    title: "Keyboard Navigation",
    paragraphs: [
      "All core features are accessible via keyboard. You can complete assessments, browse matches, and manage coffee chats without a mouse. Tab navigation follows a logical, predictable sequence throughout every page.",
    ],
    bullets: [
      "Focus indicators are clearly visible on all interactive elements so you always know where you are.",
      "Modal dialogs trap focus appropriately and can be dismissed with the Escape key.",
    ],
  },
  {
    icon: Eye,
    color: "#F59E0B",
    title: "Visual Design",
    paragraphs: [
      "We use high contrast ratios for text readability across all themes, and scalable fonts that respect browser zoom settings up to 200% without loss of content or functionality.",
    ],
    bullets: [
      "Color is never the sole indicator of meaning. Status indicators always include text labels or icons.",
      "Clear visual hierarchy and consistent layout patterns throughout the platform.",
    ],
  },
  {
    icon: Palette,
    color: "#EC4899",
    title: "Theme Support",
    paragraphs: [
      "Light and dark themes are available, and your preference is saved and persisted across sessions. Both themes are designed with accessibility contrast ratios in mind.",
      "Font sizes scale with your browser's text size settings. Animations respect the prefers-reduced-motion setting for users who are sensitive to motion.",
    ],
  },
  {
    icon: MessageSquare,
    color: "#06B6D4",
    title: "Accessible Assessments",
    paragraphs: [
      "Personality assessment questions are designed to be clear and straightforward. There are no time limits on assessments, so take as long as you need. Questions can be navigated with keyboard or screen reader.",
    ],
    bullets: [
      "Results are presented in both visual and text formats so everyone can understand their personality profile.",
      "Progress is clearly communicated throughout multi-step flows.",
    ],
  },
  {
    icon: Wrench,
    color: "#6366F1",
    title: "Ongoing Improvements",
    paragraphs: [
      "We are actively working to improve accessibility across the platform. We regularly review our design and code for accessibility issues. If you encounter any barriers or have suggestions, please let us know. We take every report seriously.",
    ],
  },
];

export function AccessibilityPage() {
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
            style={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
          >
            <Accessibility className="w-5 h-5" style={{ color: "#06B6D4" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#06B6D4" }}
          >
            Inclusion
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Accessibility
        </h1>
        <p
          className="text-base sm:text-lg max-w-2xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          The Amber Project is for everyone. We are committed to making our
          platform usable by people of all abilities and continuously improving
          our accessibility standards.
        </p>
        <p
          className="text-xs mt-3"
          style={{ color: "var(--color-textMuted)" }}
        >
          Conformance target: WCAG 2.1 Level AA
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
          {COMMITMENTS.map((section) => {
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

        {/* Feedback */}
        <div
          className="rounded-2xl p-8 text-center mt-10"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(6, 182, 212, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#06B6D4" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Found A Barrier?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If you encounter any accessibility issues or have suggestions for
            improvement, please let us know. We take every report seriously.
          </p>
          <a
            href="mailto:amberfounders@gmail.com?subject=Accessibility Feedback"
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
