import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import { BLOG_POSTS, CATEGORY_COLORS } from "../../data/blogPosts";

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Article Not Found
          </h1>
          <p className="mb-6" style={{ color: "var(--color-textSecondary)" }}>
            The article you are looking for does not exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const nextPost = BLOG_POSTS[currentIndex + 1] || null;
  const prevPost = BLOG_POSTS[currentIndex - 1] || null;
  const categoryColor = CATEGORY_COLORS[post.category] || "var(--color-accent)";

  return (
    <div style={{ background: "var(--color-background)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-textMuted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>

        {/* Meta */}
        <div
          className="flex items-center gap-4 text-sm mb-8"
          style={{ color: "var(--color-textMuted)" }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {post.readTime}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: `${categoryColor}15`,
              color: categoryColor,
            }}
          >
            <Tag size={10} />
            {post.category}
          </span>
        </div>

        {/* Accent divider */}
        <div
          className="h-0.5 w-16 rounded-full mb-8"
          style={{ backgroundColor: categoryColor }}
        />

        {/* Article body */}
        <div className="space-y-5">
          {post.content.map((paragraph, i) => (
            <p
              key={i}
              className="text-base leading-relaxed"
              style={{ color: "var(--color-textSecondary)" }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-px my-10"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        {/* Prev / Next navigation */}
        <div className="flex items-stretch gap-4">
          {prevPost ? (
            <Link
              to={`/blog/${prevPost.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="flex-1 p-4 rounded-xl transition-shadow hover:shadow-md"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                className="text-xs font-medium flex items-center gap-1 mb-1"
                style={{ color: "var(--color-textMuted)" }}
              >
                <ArrowLeft size={12} />
                Previous
              </span>
              <span
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--color-text)" }}
              >
                {prevPost.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <Link
              to={`/blog/${nextPost.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="flex-1 p-4 rounded-xl text-right transition-shadow hover:shadow-md"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                className="text-xs font-medium flex items-center gap-1 justify-end mb-1"
                style={{ color: "var(--color-textMuted)" }}
              >
                Next
                <ArrowRight size={12} />
              </span>
              <span
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--color-text)" }}
              >
                {nextPost.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
