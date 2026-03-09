import { useState, useEffect } from 'react';
import { Heart, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../ui/Avatar';
import { getHobbyById, type Hobby } from '../../data/hobbies';

export type FeedFilter = 'all' | 'job_seekers' | 'employers' | 'with_photos' | 'recent';

interface PhotoWithCaption {
  url: string;
  caption: string;
}

interface FeedUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'job_seeker' | 'employer' | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  hobbies: string[];
  catalog_photos: string[];
  catalog_photos_data: PhotoWithCaption[];
}

interface FeedPost {
  id: string;
  user: FeedUser;
  photo: string | null;
  caption: string | null;
  photoIndex: number;
  totalPhotos: number;
  isHobbiesOnly: boolean;
}

interface NetworkFeedProps {
  filter?: FeedFilter;
}

export function NetworkFeed({ filter = 'all' }: NetworkFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFeed();
  }, [user, filter]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      // Fetch all candidates with their profile info using a join
      const { data: candidates, error } = await supabase
        .from('candidates')
        .select(`
          user_id,
          bio,
          headline,
          location,
          hobbies,
          catalog_photos,
          profiles:user_id (
            full_name,
            avatar_url,
            role
          )
        `)
        .neq('user_id', user?.id || '')
        .limit(100);

      // Fetch caption data separately (column may not exist yet)
      let captionMap: Record<string, PhotoWithCaption[]> = {};
      try {
        const { data: captionData } = await supabase
          .from('candidates')
          .select('user_id, catalog_photos_data')
          .neq('user_id', user?.id || '');

        if (captionData) {
          captionData.forEach((c: any) => {
            if (c.catalog_photos_data) {
              captionMap[c.user_id] = c.catalog_photos_data;
            }
          });
        }
      } catch {
        // Column doesn't exist yet, captions will be empty
      }

      if (error) {
        console.error('Error fetching candidates:', error);
        throw error;
      }

      // Transform data into feed posts
      const feedPosts: FeedPost[] = [];

      candidates?.forEach((candidate: any) => {
        const photos = candidate.catalog_photos || [];
        const photosData: PhotoWithCaption[] = captionMap[candidate.user_id] || [];
        const hobbies = candidate.hobbies || [];
        const profile = candidate.profiles;

        // Skip if no photos AND no hobbies
        if (photos.length === 0 && hobbies.length === 0) return;

        const userInfo: FeedUser = {
          user_id: candidate.user_id,
          full_name: profile?.full_name || 'User',
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || null,
          headline: candidate.headline,
          location: candidate.location,
          bio: candidate.bio,
          hobbies: hobbies,
          catalog_photos: photos,
          catalog_photos_data: photosData,
        };

        if (photos.length > 0) {
          // Create a post for each photo
          photos.forEach((photo: string, index: number) => {
            // Try to find caption from photosData
            const photoData = photosData.find((p: PhotoWithCaption) => p.url === photo);
            const caption = photoData?.caption || null;

            feedPosts.push({
              id: `${candidate.user_id}-photo-${index}`,
              user: userInfo,
              photo,
              caption,
              photoIndex: index,
              totalPhotos: photos.length,
              isHobbiesOnly: false,
            });
          });
        } else if (hobbies.length > 0) {
          // Create a single post for users with only hobbies
          feedPosts.push({
            id: `${candidate.user_id}-hobbies`,
            user: userInfo,
            photo: null,
            caption: null,
            photoIndex: 0,
            totalPhotos: 0,
            isHobbiesOnly: true,
          });
        }
      });

      // Apply filters
      let filteredPosts = feedPosts;

      switch (filter) {
        case 'job_seekers':
          filteredPosts = feedPosts.filter(p => p.user.role === 'job_seeker');
          break;
        case 'employers':
          filteredPosts = feedPosts.filter(p => p.user.role === 'employer');
          break;
        case 'with_photos':
          filteredPosts = feedPosts.filter(p => p.photo !== null);
          break;
        case 'recent':
          // Keep original order (most recent first based on query)
          break;
        case 'all':
        default:
          // Shuffle posts for variety
          filteredPosts = feedPosts.sort(() => Math.random() - 0.5);
          break;
      }

      setPosts(filteredPosts);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map(i => (
          <div key={i} className="bento-card p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="flex-1">
                <div className="h-4 w-24 rounded mb-1" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
              </div>
            </div>
            <div className="aspect-square rounded-lg" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <Users className="w-8 h-8" style={{ color: 'var(--color-textMuted)' }} />
        </div>
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          No posts yet
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-textMuted)' }}>
          Be the first to share your photos and hobbies!
        </p>
        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          Click Edit on your profile above to add photos and hobbies.
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post, index) => (
        <FeedPostCard
          key={post.id}
          post={post}
          index={index}
          isLiked={likedPosts.has(post.id)}
          onLike={() => toggleLike(post.id)}
        />
      ))}
    </>
  );
}

function FeedPostCard({
  post,
  index,
  isLiked,
  onLike,
}: {
  post: FeedPost;
  index: number;
  isLiked: boolean;
  onLike: () => void;
}) {
  const userHobbies = post.user.hobbies
    .map(id => {
      if (id.startsWith('custom:')) {
        const name = id.replace('custom:', '').replace(/-/g, ' ');
        return { id, name: name.charAt(0).toUpperCase() + name.slice(1), emoji: '✨', category: 'social' as const };
      }
      return getHobbyById(id);
    })
    .filter(Boolean) as Hobby[];

  const displayHobbies = post.isHobbiesOnly ? userHobbies : userHobbies.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.3 }}
      className="bento-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar
          src={post.user.avatar_url}
          fallback={post.user.full_name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {post.user.full_name}
            </p>
            {post.user.role && (
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: post.user.role === 'employer' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: post.user.role === 'employer' ? '#3b82f6' : '#22c55e',
                }}
              >
                {post.user.role === 'employer' ? 'Employer' : 'Job Seeker'}
              </span>
            )}
          </div>
          {post.user.headline && (
            <p className="text-xs truncate" style={{ color: 'var(--color-textMuted)' }}>
              {post.user.headline}
            </p>
          )}
          {post.user.location && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
              <MapPin className="w-3 h-3" />
              {post.user.location}
            </div>
          )}
        </div>
      </div>

      {/* Photo (if available) */}
      {post.photo && (
        <div className="relative aspect-square bg-black/5">
          <img
            src={post.photo}
            alt={`Photo by ${post.user.full_name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {post.totalPhotos > 1 && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
            >
              {post.photoIndex + 1}/{post.totalPhotos}
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-3">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            {post.caption}
          </p>
        </div>
      )}

      {/* Actions - Heart only */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: isLiked ? '#ef4444' : 'var(--color-textSecondary)' }}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Hobbies */}
      {displayHobbies.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {displayHobbies.map(hobby => (
              <span
                key={hobby.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-textSecondary)' }}
              >
                {hobby.name}
              </span>
            ))}
            {!post.isHobbiesOnly && post.user.hobbies.length > 4 && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-textMuted)' }}
              >
                +{post.user.hobbies.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bio snippet */}
      {post.user.bio && (post.photoIndex === 0 || post.isHobbiesOnly) && (
        <div className="px-4 pb-4">
          <p className="text-sm line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
            {post.user.bio}
          </p>
        </div>
      )}
    </motion.div>
  );
}
