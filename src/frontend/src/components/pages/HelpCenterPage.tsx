import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  ClipboardCheck,
  Users,
  Coffee,
  Settings,
  Shield,
  ChevronDown,
  Mail,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface Category {
  title: string;
  icon: React.ElementType;
  color: string;
  faqs: FAQItem[];
}

const categories: Category[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    color: "#8B5CF6",
    faqs: [
      { question: "How do I create an account?", answer: "Sign up with your email, Google, or GitHub account. It takes less than a minute to get started." },
      { question: "What happens after I sign up?", answer: "You will be guided through a brief onboarding to set up your profile, then you can take the personality assessment to start seeing your matches." },
      { question: "Is Amber free to use?", answer: "Yes. Candidates can use Amber completely free. Employers may have paid features available in the future." },
      { question: "Is there a mobile app?", answer: "Not yet. Amber is a web application that works on any device with a browser. We built it this way so you can access it from anywhere without downloading anything." },
    ],
  },
  {
    title: "Assessments",
    icon: ClipboardCheck,
    color: "#10B981",
    faqs: [
      { question: "How long does the assessment take?", answer: "The core personality assessment is 10 questions and takes under 15 minutes. Supplementary assessments covering work values, visual perception, situational judgment, and cognitive patterns are available if you want to go deeper." },
      { question: "Can I retake the assessment?", answer: "Yes, you can retake it anytime. We recommend waiting at least 30 days between attempts for the most accurate results." },
      { question: "Are there right or wrong answers?", answer: "No. The assessment measures your natural preferences and tendencies using the Big Five (OCEAN) personality model. Be honest for the best matches." },
      { question: "What is an archetype?", answer: "Based on your OCEAN scores, you are mapped to one of eight personality archetypes: The Innovator, The Architect, The Connector, The Catalyst, The Craftsperson, The Harmonizer, The Explorer, or The Strategist. Archetypes make your results more intuitive and easier to understand." },
    ],
  },
  {
    title: "Matching And Jobs",
    icon: Users,
    color: "#F59E0B",
    faqs: [
      { question: "How does matching work?", answer: "Our matching engine, called Ember, compares your personality profile with employer culture data. It produces three scores: a trait match score, a culture match score, and an overall weighted composite score, all on a 0 to 100 scale." },
      { question: "What does the match percentage mean?", answer: "It represents how well your personality traits align with a company's culture profile. Higher scores indicate stronger culture fit. Ember also provides a plain-English explanation of each match, including what works and what to watch for." },
      { question: "Can employers see my raw assessment data?", answer: "No. Employers see compatibility scores and summaries, never your raw personality responses. Your data is protected by Row Level Security at the database level." },
    ],
  },
  {
    title: "Coffee Chats",
    icon: Coffee,
    color: "#EC4899",
    faqs: [
      { question: "What is a coffee chat?", answer: "A casual introductory conversation with someone from a company you matched with. No formal interview questions, just genuine conversation to explore mutual interest." },
      { question: "Who can start a coffee chat?", answer: "Both candidates and employers can initiate coffee chats. Candidates can request a chat with any company in their match list, and employers can invite any candidate who has completed their assessment." },
      { question: "What happens after a coffee chat?", answer: "Both sides leave a rating and written feedback. This helps both parties reflect on the conversation and helps us understand which matches are converting into genuine connections." },
    ],
  },
  {
    title: "Account And Settings",
    icon: Settings,
    color: "#06B6D4",
    faqs: [
      { question: "How do I update my profile?", answer: "Navigate to Settings to update your information, preferences, and visibility settings." },
      { question: "Can I switch between light and dark mode?", answer: "Yes. Amber supports both light and dark themes. Your preference is saved and persisted across sessions." },
      { question: "How do I delete my account?", answer: "You can delete your account and all associated data from Settings > Account. Your data will be removed within 90 days of account closure." },
    ],
  },
  {
    title: "Privacy And Data",
    icon: Shield,
    color: "#6366F1",
    faqs: [
      { question: "Who can see my personality data?", answer: "Only you can see your raw personality data. Employers see compatibility scores and summaries, never your raw assessment responses." },
      { question: "How is my data protected?", answer: "We use Row Level Security enforced at the database level through Supabase, encrypted data transmission over HTTPS, and strict access controls. We never sell your personal information to third parties." },
      { question: "Can I export my data?", answer: "Yes. You have the right to request a copy of your personal data in a structured, machine-readable format. Contact us at amberfounders@gmail.com." },
    ],
  },
];

export function HelpCenterPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const query = search.trim().toLowerCase();
  const filtered = query
    ? categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (f) =>
              f.question.toLowerCase().includes(query) ||
              f.answer.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : categories;

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
            <HelpCircle className="w-5 h-5" style={{ color: "#10B981" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#10B981" }}
          >
            Support
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Help Center
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl mb-6"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Find answers to common questions and get the support you need.
        </p>

        {/* Search bar */}
        <div className="max-w-md relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--color-textMuted)" }}
          />
          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: "var(--color-border)" }} />

      {/* FAQ Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center mb-5"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--color-textSecondary)" }}>
              No results found for "{search}". Try a different search term.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${category.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                  </div>
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {category.title}
                  </h2>
                </div>

                <div>
                  {category.faqs.map((faq, index) => {
                    const key = `${category.title}-${index}`;
                    const isOpen = !!openItems[key];

                    return (
                      <div
                        key={key}
                        style={{
                          borderBottom:
                            index < category.faqs.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between py-2.5 text-left gap-2"
                          style={{ color: "var(--color-text)" }}
                        >
                          <span className="text-xs font-medium leading-snug">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                            style={{
                              color: "var(--color-textMuted)",
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </button>
                        {isOpen && (
                          <div
                            className="pb-2.5 text-xs leading-relaxed"
                            style={{ color: "var(--color-textSecondary)" }}
                          >
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div
          className="mt-10 rounded-2xl p-8 flex flex-col items-center text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: "rgba(245, 158, 11, 0.1)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Still Need Help?
          </h3>
          <p
            className="text-sm mb-5 max-w-sm"
            style={{ color: "var(--color-textSecondary)" }}
          >
            We are here for you. Reach out and we will get back to you as soon as we can.
          </p>
          <a
            href="mailto:amberfounders@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            amberfounders@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
