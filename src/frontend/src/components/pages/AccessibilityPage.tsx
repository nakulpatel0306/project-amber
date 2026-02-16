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
} from "lucide-react";

interface CommitmentItem {
  icon: React.ElementType;
  color: string;
  title: string;
  content: string[];
}

const COMMITMENTS: CommitmentItem[] = [
  {
    icon: Monitor,
    color: "#8B5CF6",
    title: "Screen Reader Support",
    content: [
      "All interactive elements have descriptive ARIA labels so screen readers can convey their purpose.",
      "Page structure uses semantic HTML — headings, landmarks, and regions are properly nested for easy navigation.",
      "Dynamic content updates (like match scores loading or toast notifications) are announced to assistive technology.",
      "Images and icons include appropriate alt text or are marked as decorative when they don't convey meaning.",
    ],
  },
  {
    icon: Keyboard,
    color: "#10B981",
    title: "Keyboard Navigation",
    content: [
      "Every feature on Amber can be accessed using a keyboard alone — no mouse required.",
      "Focus indicators are clearly visible on all interactive elements so you always know where you are.",
      "Tab order follows a logical, predictable sequence throughout every page.",
      "Modal dialogs trap focus appropriately and can be dismissed with the Escape key.",
    ],
  },
  {
    icon: Eye,
    color: "#F59E0B",
    title: "Visual Design",
    content: [
      "Text meets WCAG AA contrast ratios across all themes (light, dark, and custom).",
      "The interface works at up to 200% browser zoom without loss of content or functionality.",
      "We avoid conveying information through color alone — status indicators always include text labels or icons.",
      "Animations respect the prefers-reduced-motion setting and can be minimized for users who are sensitive to motion.",
    ],
  },
  {
    icon: Palette,
    color: "#EC4899",
    title: "Themes & Customization",
    content: [
      "Multiple theme options (including dark mode) let you choose the visual presentation that works best for you.",
      "Font sizes scale with your browser's text size settings.",
      "High-contrast elements ensure readability regardless of ambient lighting or display quality.",
    ],
  },
  {
    icon: MessageSquare,
    color: "#06B6D4",
    title: "Assessments & Interactive Content",
    content: [
      "Personality assessment sliders are fully keyboard-accessible and announce their current value to screen readers.",
      "There are no time limits on assessments — take as long as you need.",
      "Progress is clearly communicated throughout multi-step flows so you always know how far along you are.",
      "Error messages are descriptive and associated with the relevant form fields.",
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
          Back to Home
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
          Amber is for everyone. We're committed to making our platform usable
          by people of all abilities and continuously improving our
          accessibility standards.
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
            Found a barrier?
          </h3>
          <p
            className="text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-textSecondary)" }}
          >
            If you encounter any accessibility issues or have suggestions for
            improvement, please let us know. We take every report seriously and
            respond within 48 hours.
          </p>
          <a
            href="mailto:accessibility@tryamber.com?subject=Accessibility Feedback"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            accessibility@tryamber.com
          </a>
        </div>
      </div>
    </div>
  );
}
