import { useState, useEffect, useCallback } from 'react';
import { Users, Edit3, Plus, RefreshCw, AlertCircle, Link2, Camera, Sparkles, Eye, EyeOff, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ProfileEditModal } from './ProfileEditModal';
import { NewPostModal } from './NewPostModal';
import { PostCard, type FeedPost } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { FilterBar, type FeedFilter, type LayoutMode } from './FilterBar';

/* ------------------------------------------------------------------ */
/*  Mock data — shown when the DB has no posts                         */
/* ------------------------------------------------------------------ */

const MOCK_POSTS: FeedPost[] = [
  {
    id: 'mock-1',
    user: { user_id: 'm1', full_name: 'Priya Sharma', avatar_url: null, role: 'job_seeker', headline: 'Product Designer', location: 'San Francisco, CA', companyName: null },
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop&q=80'],
    caption: 'Made pasta from scratch for the first time. Took forever but totally worth it. There\'s something meditative about kneading dough after a long day of wireframing.',
    hobbyTags: ['cooking', 'personality:Creative'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    likeCount: 24,
    isLiked: false,
  },
  {
    id: 'mock-2',
    user: { user_id: 'm2', full_name: 'Marcus Johnson', avatar_url: null, role: 'job_seeker', headline: 'Software Engineer', location: 'Austin, TX', companyName: null },
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=600&fit=crop&q=80'],
    caption: 'Golden hour at the summit. 6 miles up, zero regrets. Nothing clears your head like a good hike after sprint planning.',
    hobbyTags: ['hiking', 'personality:Adventurer'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    likeCount: 42,
    isLiked: false,
  },
  {
    id: 'mock-3',
    user: { user_id: 'm3', full_name: 'Anika Patel', avatar_url: null, role: 'employer', headline: 'Head of People', location: 'New York, NY', companyName: 'Shopify' },
    images: ['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=600&fit=crop&q=80'],
    caption: 'Finally nailing this Chopin piece after weeks of practice. Music is the ultimate stress relief — our team actually has a jam session every Friday.',
    hobbyTags: ['piano', 'personality:Strategist'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    likeCount: 31,
    isLiked: false,
  },
  {
    id: 'mock-4',
    user: { user_id: 'm4', full_name: 'Elena Voss', avatar_url: null, role: 'job_seeker', headline: 'UX Researcher', location: 'Seattle, WA', companyName: null },
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop&q=80'],
    caption: 'Morning yoga before the city wakes up. This rooftop spot is everything. Finding balance is the real productivity hack.',
    hobbyTags: ['yoga', 'personality:Architect'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    likeCount: 18,
    isLiked: false,
  },
  {
    id: 'mock-5',
    user: { user_id: 'm5', full_name: 'Kai Nakamura', avatar_url: null, role: 'employer', headline: 'Brand Strategist', location: 'Los Angeles, CA', companyName: 'Google' },
    images: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=600&fit=crop&q=80'],
    caption: 'Street photography walk through the old quarter. Every corner tells a story. The best ideas come when you stop looking at screens.',
    hobbyTags: ['photography', 'personality:Visionary'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    likeCount: 56,
    isLiked: false,
  },
  {
    id: 'mock-6',
    user: { user_id: 'm6', full_name: 'Jordan Okafor', avatar_url: null, role: 'job_seeker', headline: 'Full-Stack Developer', location: 'Chicago, IL', companyName: null },
    images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=600&fit=crop&q=80'],
    caption: 'Weekend hackathon with the crew. Built something wild in 48 hours. Nothing beats the energy of shipping something real with people who care.',
    hobbyTags: ['coding', 'personality:Builder'],
    source: 'activity_post',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    likeCount: 37,
    isLiked: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: empty-state messages per filter                            */
/* ------------------------------------------------------------------ */

const EMPTY_MESSAGES: Record<FeedFilter, { title: string; sub: string }> = {
  all: { title: 'No posts yet', sub: 'Be the first to share your hobbies and interests!' },
  job_seekers: { title: 'No job seeker posts', sub: 'Job seekers haven\'t posted yet. Start the conversation!' },
  employers: { title: 'No employer posts', sub: 'No employer culture posts yet. Be the first to showcase your team.' },
  connections: { title: 'Nothing from connections', sub: 'Connect with more people to see their posts here.' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NetworkHub() {
  const { profile, user } = useAuth();
  const { accepted } = useConnections();
  const { success: showSuccess, error: showError } = useToast();

  // Profile data
  const [myHobbies, setMyHobbies] = useState<string[]>([]);
  const [myPhotos, setMyPhotos] = useState<string[]>([]);
  const [myLikes, setMyLikes] = useState(0);

  // Feed state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // UI state
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [layout, setLayout] = useState<LayoutMode>('grid-3');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  // Profile visibility
  const [profileVisible, setProfileVisible] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Load profile
  useEffect(() => { loadMyProfile(); }, [user]);

  // Load feed when filter changes
  useEffect(() => { loadFeed(); }, [user, filter]);

  const loadMyProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('candidates')
      .select('hobbies, catalog_photos')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setMyHobbies(data.hobbies || []);
      setMyPhotos(data.catalog_photos || []);
    }

    // Load visibility setting
    try {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('profile_visible')
        .eq('user_id', user.id)
        .single();
      if (settings) {
        setProfileVisible(settings.profile_visible);
      }
    } catch {
      // No settings row yet — default to visible
    }

    // Load total likes received on user's posts
    try {
      const { data: myPosts } = await supabase
        .from('activity_posts')
        .select('like_count')
        .eq('user_id', user.id);
      const totalLikes = (myPosts || []).reduce((sum, p) => sum + (p.like_count || 0), 0);
      setMyLikes(totalLikes);
    } catch {
      // Table doesn't exist yet
    }
  };

  const toggleVisibility = async () => {
    if (!user) return;
    setSavingVisibility(true);
    const newValue = !profileVisible;
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: user.id, profile_visible: newValue },
          { onConflict: 'user_id' }
        );
      if (error) {
        // Table may not exist - just update local state
        console.warn('user_settings table may not exist:', error);
      }
      setProfileVisible(newValue);
      showSuccess('Updated', newValue ? 'Profile visible in feed' : 'Profile hidden from feed');
    } catch {
      // Still update local state even if DB fails
      setProfileVisible(newValue);
      showSuccess('Updated', newValue ? 'Profile visible in feed' : 'Profile hidden from feed');
    } finally {
      setSavingVisibility(false);
    }
  };

  const loadFeed = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setHasError(false);

    try {
      // 1. activity_posts with like_count (table may not exist)
      let activityData: any[] = [];
      try {
        const { data, error: apError } = await supabase
          .from('activity_posts')
          .select('id, user_id, image_url, caption, hobby_tags, like_count, created_at, profiles:user_id(full_name, avatar_url, role)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!apError && data) {
          activityData = data;
        }
      } catch {
        // Table doesn't exist yet
      }

      // 1b. Load user's likes (table may not exist)
      let userLikedIds = new Set<string>();
      try {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likes) {
          userLikedIds = new Set(likes.map((l: any) => l.post_id));
        }
      } catch {
        // Table doesn't exist yet
      }

      // 2. Employer company names
      let companyMap: Record<string, string> = {};
      try {
        const { data: employers } = await supabase
          .from('employers')
          .select('user_id, company_name');
        if (employers) {
          employers.forEach((e: any) => { if (e.company_name) companyMap[e.user_id] = e.company_name; });
        }
      } catch { /* table may not exist */ }

      // 3. Hidden users (table may not exist)
      let hiddenIds = new Set<string>();
      try {
        const { data: hiddenSettings } = await supabase
          .from('user_settings')
          .select('user_id')
          .eq('profile_visible', false);
        hiddenIds = new Set((hiddenSettings || []).map((s: any) => s.user_id));
      } catch {
        // Table doesn't exist yet
      }

      // 4. Catalog candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select(`user_id, bio, headline, location, hobbies, catalog_photos, profiles:user_id(full_name, avatar_url, role)`)
        .neq('user_id', user.id)
        .limit(100);

      // Caption data
      let captionMap: Record<string, { url: string; caption: string }[]> = {};
      try {
        const { data: cd } = await supabase
          .from('candidates')
          .select('user_id, catalog_photos_data')
          .neq('user_id', user.id);
        cd?.forEach((c: any) => { if (c.catalog_photos_data) captionMap[c.user_id] = c.catalog_photos_data; });
      } catch { /* column may not exist */ }

      // Build feed posts
      const feedPosts: FeedPost[] = [];

      // Activity posts
      if (activityData) {
        for (const ap of activityData as any[]) {
          const p = ap.profiles;
          feedPosts.push({
            id: `ap-${ap.id}`,
            user: {
              user_id: ap.user_id,
              full_name: p?.full_name || 'User',
              avatar_url: p?.avatar_url || null,
              role: p?.role || null,
              headline: null,
              location: null,
              companyName: companyMap[ap.user_id] || null,
            },
            images: [ap.image_url],
            caption: ap.caption,
            hobbyTags: ap.hobby_tags || [],
            source: 'activity_post',
            activityPostId: ap.id,
            createdAt: ap.created_at,
            likeCount: ap.like_count || 0,
            isLiked: userLikedIds.has(ap.id),
          });
        }
      }

      // Catalog posts (no like functionality for catalog posts)
      candidates?.forEach((c: any) => {
        if (hiddenIds.has(c.user_id)) return;
        const photos: string[] = c.catalog_photos || [];
        const hobbies: string[] = c.hobbies || [];
        const p = c.profiles;
        if (photos.length === 0 && hobbies.length === 0) return;

        const cpData = captionMap[c.user_id] || [];

        if (photos.length > 0) {
          const photoData = cpData.find((pd: any) => pd.url === photos[0]);
          feedPosts.push({
            id: `cat-${c.user_id}`,
            user: {
              user_id: c.user_id,
              full_name: p?.full_name || 'User',
              avatar_url: p?.avatar_url || null,
              role: p?.role || null,
              headline: c.headline,
              location: c.location,
              companyName: companyMap[c.user_id] || null,
            },
            images: photos,
            caption: photoData?.caption || c.bio || null,
            hobbyTags: hobbies,
            source: 'catalog',
            createdAt: new Date(Date.now() - Math.random() * 48 * 3600000).toISOString(),
            likeCount: 0,
            isLiked: false,
          });
        }
      });

      // Use mock data if DB is empty
      const result = feedPosts.length > 0 ? feedPosts : MOCK_POSTS;

      // Filter
      let filtered = result;
      switch (filter) {
        case 'job_seekers':
          filtered = result.filter(p => p.user.role === 'job_seeker');
          break;
        case 'employers':
          filtered = result.filter(p => p.user.role === 'employer');
          break;
        case 'connections':
          {
            const connIds = new Set(accepted.flatMap(c => [c.sender_id, c.receiver_id]));
            filtered = result.filter(p => connIds.has(p.user.user_id));
          }
          break;
      }

      // Sort by latest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPosts(filtered);
    } catch (err) {
      console.error('Error loading feed:', err);
      setHasError(true);
      setPosts(MOCK_POSTS);
    } finally {
      setIsLoading(false);
    }
  }, [user, filter, accepted]);

  /* ---- Actions ---- */

  const handleLike = useCallback(async (postId: string) => {
    // Find the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = post.isLiked;

    // Optimistic UI update - always update the UI immediately
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !isCurrentlyLiked, likeCount: isCurrentlyLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1 }
        : p
    ));

    // Only persist to DB if this is a real activity post with a DB ID
    if (user && post.source === 'activity_post' && post.activityPostId) {
      const activityPostId = post.activityPostId;

      // Persist to DB
      try {
        if (isCurrentlyLiked) {
          await supabase
            .from('post_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', activityPostId);
        } else {
          await supabase
            .from('post_likes')
            .insert({ user_id: user.id, post_id: activityPostId });
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to update like:', err);
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: isCurrentlyLiked, likeCount: isCurrentlyLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) }
            : p
        ));
      }
    }
  }, [user, posts]);

  const handleDelete = useCallback(async (postId: string) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.source === 'activity_post' && post.activityPostId) {
        const { error } = await supabase.from('activity_posts').delete().eq('id', post.activityPostId);
        if (error) throw error;
      }

      setPosts(prev => prev.filter(p => p.id !== postId));
      showSuccess('Deleted', 'Post removed');
    } catch {
      showError('Error', 'Failed to delete post');
    }
  }, [user, posts, showSuccess, showError]);

  /* ---- Layout class ---- */

  const gridClass = (() => {
    switch (layout) {
      case 'grid-3': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
      case 'grid-2': return 'grid grid-cols-1 md:grid-cols-2 gap-5';
      case 'feed': return 'max-w-[600px] mx-auto space-y-5';
      case 'masonry': return 'columns-1 md:columns-2 lg:columns-3 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid';
      default: return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
    }
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* ======== HEADER — matches Ember / Insights bento-card style ======== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="bento-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: avatar + text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              src={profile?.avatar_url}
              fallback={profile?.full_name || 'User'}
              size="lg"
              className="!rounded-xl hidden sm:block flex-shrink-0"
            />
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                Your Local Café
              </h1>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Discover People Through Hobbies, Interests & Personality
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                {([
                  { label: 'Connections', value: accepted.length, color: '#f59e0b', Icon: Link2 },
                  { label: 'Posts', value: myPhotos.length, color: '#8B5CF6', Icon: Camera },
                  { label: 'Hobbies', value: myHobbies.length, color: '#06B6D4', Icon: Sparkles },
                  { label: 'Likes', value: myLikes, color: '#ef4444', Icon: Heart },
                ] as const).map(stat => (
                  <span
                    key={stat.label}
                    className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                      border: `1px solid ${stat.color}30`,
                      color: 'var(--color-text)',
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.Icon className="w-3 h-3" style={{ color: stat.color }} />
                    </span>
                    <span className="font-extrabold tabular-nums" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <span style={{ color: 'var(--color-textSecondary)' }}>{stat.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowNewPost(true)}
            >
              New Post
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={profileVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              onClick={toggleVisibility}
              disabled={savingVisibility}
              style={{
                color: profileVisible ? 'var(--color-accent)' : 'var(--color-textMuted)',
              }}
            >
              {profileVisible ? 'Visible' : 'Hidden'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ======== FILTER BAR ======== */}
      <FilterBar
        filter={filter}
        layout={layout}
        onFilterChange={setFilter}
        onLayoutChange={setLayout}
      />

      {/* ======== FEED ======== */}
      <div className="mt-6">
        {/* Error banner */}
        {hasError && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-6 border"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>
              Couldn't load the latest posts. Showing sample content.
            </p>
            <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadFeed}>
              Retry
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            /* ---- Skeleton Loading ---- */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={gridClass}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </motion.div>
          ) : posts.length === 0 ? (
            /* ---- Empty State ---- */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <Users className="w-8 h-8" style={{ color: 'var(--color-textMuted)' }} />
              </div>
              <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {EMPTY_MESSAGES[filter].title}
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
                {EMPTY_MESSAGES[filter].sub}
              </p>
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewPost(true)}>
                Create a Post
              </Button>
            </motion.div>
          ) : (
            /* ---- Posts Grid ---- */
            <motion.div
              key={`feed-${layout}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={gridClass}
            >
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <PostCard
                    post={post}
                    isOwn={post.user.user_id === user?.id}
                    onLike={handleLike}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ======== MODALS ======== */}
      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); loadMyProfile(); }}
        />
      )}

      <AnimatePresence>
        {showNewPost && (
          <NewPostModal
            isOpen={showNewPost}
            onClose={() => { setShowNewPost(false); loadFeed(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
