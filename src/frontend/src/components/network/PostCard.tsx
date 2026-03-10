import { useState, useRef, useCallback } from 'react';
import {
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Flag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { getHobbyById } from '../../data/hobbies';
import { formatDistanceToNowStrict } from 'date-fns';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PostUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'job_seeker' | 'employer' | null;
  headline: string | null;
  location: string | null;
  companyName: string | null;
}

export interface FeedPost {
  id: string;
  user: PostUser;
  images: string[];
  caption: string | null;
  hobbyTags: string[];
  source: 'activity_post' | 'catalog';
  activityPostId?: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: FeedPost;
  isOwn: boolean;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveTag(tag: string): { label: string; isPersonality: boolean; color?: string } | null {
  const traitColors = ['#8B5CF6', '#F59E0B', '#06B6D4'];

  if (tag.startsWith('personality:')) {
    const name = tag.replace('personality:', '');
    // Stable color from first char
    const idx = name.charCodeAt(0) % traitColors.length;
    return { label: name, isPersonality: true, color: traitColors[idx] };
  }

  if (tag.startsWith('custom:')) {
    const name = tag.replace('custom:', '').replace(/-/g, ' ');
    return { label: name.charAt(0).toUpperCase() + name.slice(1), isPersonality: false };
  }

  const hobby = getHobbyById(tag);
  if (hobby) return { label: hobby.name, isPersonality: false };

  return null;
}

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: false });
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PostCard({ post, isOwn, onLike, onDelete }: PostCardProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasMultiple = post.images.length > 1;
  const resolvedTags = post.hobbyTags.map(resolveTag).filter(Boolean) as { label: string; isPersonality: boolean; color?: string }[];
  const visibleTags = showAllTags ? resolvedTags : resolvedTags.slice(0, 4);
  const hiddenTagCount = resolvedTags.length - 4;

  // Avatar ring color
  const ringColor = post.user.role === 'employer' ? '#3b82f6' : post.user.role === 'job_seeker' ? '#22c55e' : 'var(--color-border)';

  // Role badge
  const roleBadge = post.user.role === 'employer'
    ? { label: post.user.companyName ? `@ ${post.user.companyName}` : 'Employer', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
    : post.user.role === 'job_seeker'
      ? { label: 'Job Seeker', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' }
      : null;

  const handleLike = useCallback(() => {
    setLikeAnimating(true);
    onLike(post.id);
    setTimeout(() => setLikeAnimating(false), 400);
  }, [post.id, onLike]);

  const prevImage = () => setCarouselIdx(i => Math.max(0, i - 1));
  const nextImage = () => setCarouselIdx(i => Math.min(post.images.length - 1, i + 1));

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3 p-4">
        {/* Avatar with colored ring */}
        <div
          className="rounded-full p-[2px] flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${ringColor}, ${ringColor}80)` }}
        >
          <div className="rounded-full overflow-hidden bg-[var(--color-background)] p-[1px]">
            <Avatar src={post.user.avatar_url} fallback={post.user.full_name} size="md" />
          </div>
        </div>

        {/* Name + Role + Location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
              {post.user.full_name}
            </span>
            {roleBadge && (
              <span
                className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0"
                style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}
              >
                {roleBadge.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {post.user.location && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {post.user.location}
              </span>
            )}
            {post.user.location && post.createdAt && <span>&middot;</span>}
            {post.createdAt && <span className="flex-shrink-0">{timeAgo(post.createdAt)}</span>}
          </div>
        </div>

        {/* Overflow Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 py-1 rounded-xl shadow-lg z-20 min-w-[140px] border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {isOwn && (
                <button
                  onClick={() => { onDelete(post.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-surfaceHover)]"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-[var(--color-surfaceHover)]"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Image Carousel ---- */}
      {post.images.length > 0 && (
        <div className="relative bg-black/5 select-none">
          <img
            src={post.images[carouselIdx]}
            alt={`Post by ${post.user.full_name}`}
            className="w-full aspect-square object-cover"
            loading="lazy"
            draggable={false}
          />

          {/* Arrows */}
          {hasMultiple && carouselIdx > 0 && (
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasMultiple && carouselIdx < post.images.length - 1 && (
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Counter */}
          {hasMultiple && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
              {carouselIdx + 1}/{post.images.length}
            </div>
          )}

          {/* Dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIdx(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: i === carouselIdx ? 'var(--color-accent)' : 'var(--color-border)',
                    transform: i === carouselIdx ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Double-tap like animation */}
          <AnimatePresence>
            {likeAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ---- Action Bar ---- */}
      <div className="flex items-center px-4 py-2.5">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
        >
          <Heart
            className={`w-[22px] h-[22px] transition-all duration-200 ${likeAnimating ? 'scale-125' : 'scale-100'}`}
            color={post.isLiked ? '#ef4444' : 'var(--color-textSecondary)'}
            fill={post.isLiked ? '#ef4444' : 'none'}
          />
          {post.likeCount > 0 && (
            <span className="text-xs font-medium" style={{ color: post.isLiked ? '#ef4444' : 'var(--color-textSecondary)' }}>
              {post.likeCount}
            </span>
          )}
        </button>
      </div>

      {/* ---- Caption ---- */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            <span className="font-semibold mr-1.5">{post.user.full_name.split(' ')[0]}</span>
            {captionExpanded || post.caption.length <= 120 ? (
              post.caption
            ) : (
              <>
                {post.caption.slice(0, 120)}...
                <button
                  onClick={() => setCaptionExpanded(true)}
                  className="ml-1 font-medium"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  more
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {/* ---- Hobby / Interest Tags ---- */}
      {resolvedTags.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag, i) =>
              tag.isPersonality ? (
                <span
                  key={`t-${i}`}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    border: `1px solid ${tag.color}30`,
                  }}
                >
                  {tag.label}
                </span>
              ) : (
                <span
                  key={`t-${i}`}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-textSecondary)' }}
                >
                  {tag.label}
                </span>
              ),
            )}
            {!showAllTags && hiddenTagCount > 0 && (
              <button
                onClick={() => setShowAllTags(true)}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
              >
                +{hiddenTagCount} more
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
