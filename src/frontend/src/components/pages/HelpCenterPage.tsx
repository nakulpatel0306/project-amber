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
      { question: "How do I create an account?", answer: "Sign up with your email or Google account. It takes less than a minute to get started." },
      { question: "What happens after I sign up?", answer: "You'll be guided through a brief onboarding to set up your profile, then you can take the personality assessment." },
      { question: "Is Amber free to use?", answer: "Yes! Job seekers can use Amber for free. Premium features are available for power users and employers." },
    ],
  },
  {
    title: "Assessments",
    icon: ClipboardCheck,
    color: "#10B981",
    faqs: [
      { question: "How long does the assessment take?", answer: "The core Big Five assessment takes about 15 minutes. Additional assessments are 5-10 minutes each." },
      { question: "Can I retake the assessment?", answer: "Yes, you can retake it anytime. We recommend waiting at least 30 days between attempts for the most accurate results." },
      { question: "Are there right or wrong answers?", answer: "No! The assessment measures your natural preferences and tendencies. Be honest for the best matches." },
      { question: "What is the Big Five model?", answer: "The Big Five (OCEAN) is the most scientifically validated personality framework, measuring Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism." },
    ],
  },
  {
    title: "Matching & Jobs",
    icon: Users,
    color: "#F59E0B",
    faqs: [
      { question: "How does matching work?", answer: "Our AI compares your personality profile with company culture data to calculate compatibility scores across multiple dimensions." },
      { question: "What does the match percentage mean?", answer: "It represents how well your personality traits align with a company's culture profile. Higher scores indicate stronger culture fit." },
      { question: "Can I see who viewed my profile?", answer: "Premium users can see which companies have viewed their profile and shown interest." },
    ],
  },
  {
    title: "Coffee Chats",
    icon: Coffee,
    color: "#EC4899",
    faqs: [
      { question: "What is a coffee chat?", answer: "A casual 15-30 minute conversation with a team member. No formal interview questions \u2014 just genuine conversation to explore mutual interest." },
      { question: "How do I schedule one?", answer: "Once you match with a company, either side can request a coffee chat. You'll pick a time that works for both." },
      { question: "What should I expect?", answer: "Think of it as meeting a potential colleague for coffee. Ask about team culture, daily work, and what they enjoy about their role." },
    ],
  },
  {
    title: "Account & Billing",
    icon: Settings,
    color: "#06B6D4",
    faqs: [
      { question: "How do I upgrade to Premium?", answer: "Go to Settings \u2192 Subscription and choose the plan that works for you. You can start with a free trial." },
      { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period." },
      { question: "How do I update my profile?", answer: "Navigate to Settings \u2192 Profile to update your information, preferences, and visibility settings." },
    ],
  },
  {
    title: "Privacy & Data",
    icon: Shield,
    color: "#6366F1",
    faqs: [
      { question: "Who can see my personality data?", answer: "Only you. Employers see compatibility scores but never your raw personality data unless you explicitly share it." },
      { question: "Can I delete my account?", answer: "Yes, you can delete your account and all associated data from Settings \u2192 Account \u2192 Delete Account." },
      { question: "How is my data protected?", answer: "We use industry-standard encryption, secure servers, and never sell your personal information to third parties." },
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
          Back to Home
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
            Still need help?
          </h3>
          <p
            className="text-sm mb-5 max-w-sm"
            style={{ color: "var(--color-textSecondary)" }}
          >
            Our support team is here for you. We'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:support@tryamber.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accentText)",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
