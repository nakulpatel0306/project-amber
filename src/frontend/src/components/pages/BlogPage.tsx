import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Tag,
  Mail,
} from "lucide-react";
import { BLOG_POSTS, CATEGORY_COLORS } from "../../data/blogPosts";

const CATEGORY_COUNTS: Record<string, number> = BLOG_POSTS.reduce(
  (acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

export function BlogPage() {
  const [email, setEmail] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = activeCategory
    ? BLOG_POSTS.filter((post) => post.category === activeCategory)
    : BLOG_POSTS;

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
            <BookOpen className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Blog
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          Insights and Updates
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl"
          style={{ color: "var(--color-textSecondary)" }}
        >
          Personality science, career growth, and culture-first hiring.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: "var(--color-border)" }} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Blog Post Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="h-1 w-full"
                    style={{
                      background:
                        CATEGORY_COLORS[post.category] || "var(--color-accent)",
                    }}
                  />

                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit mb-3"
                      style={{
                        background: `${CATEGORY_COLORS[post.category]}15`,
                        color: CATEGORY_COLORS[post.category],
                      }}
                    >
                      <Tag size={10} />
                      {post.category}
                    </span>

                    <h2
                      className="text-base font-semibold mb-2 leading-snug"
                      style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
                    >
                      {post.title}
                    </h2>

                    <div
                      className="flex items-center gap-3 text-[11px] mb-3"
                      style={{ color: "var(--color-textMuted)" }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {post.readTime}
                      </span>
                    </div>

                    <p
                      className="text-sm leading-relaxed flex-1 mb-4"
                      style={{ color: "var(--color-textSecondary)" }}
                    >
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium group"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Read more
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
            {/* Categories */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
              >
                Categories
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-150"
                    style={{
                      background: activeCategory === null
                        ? "var(--color-accent)"
                        : "var(--color-backgroundSecondary)",
                      color: activeCategory === null
                        ? "var(--color-accentText)"
                        : "var(--color-text)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span>All Posts</span>
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: activeCategory === null ? "var(--color-surfaceHover)" : "var(--color-border)",
                        color: activeCategory === null ? "var(--color-accentText)" : "var(--color-textSecondary)",
                      }}
                    >
                      {BLOG_POSTS.length}
                    </span>
                  </button>
                </li>
                {Object.entries(CATEGORY_COLORS).map(([category, color]) => {
                  const isActive = activeCategory === category;
                  return (
                    <li key={category}>
                      <button
                        onClick={() => setActiveCategory(isActive ? null : category)}
                        className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-150"
                        style={{
                          background: isActive ? `${color}20` : "var(--color-backgroundSecondary)",
                          color: "var(--color-text)",
                          border: isActive ? `1px solid ${color}40` : "1px solid transparent",
                          cursor: "pointer",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: color }}
                          />
                          {category}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}15`, color }}
                        >
                          {CATEGORY_COUNTS[category] || 0}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Newsletter CTA */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "var(--color-accent)" }}
              >
                <Mail size={18} style={{ color: "var(--color-accentText)" }} />
              </div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
              >
                Stay Updated
              </h3>
              <p
                className="text-xs mb-4 leading-relaxed"
                style={{ color: "var(--color-textSecondary)" }}
              >
                Get personality science, career advice, and product updates in your inbox.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--color-backgroundSecondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  className="w-full rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accentText)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
