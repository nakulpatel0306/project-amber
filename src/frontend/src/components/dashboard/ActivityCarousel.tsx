import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ActivityPost {
  id: string;
  image_url: string;
  caption: string;
  hobby_tags: string[];
  user_name: string;
  user_role: string;
}

const MOCK_POSTS: ActivityPost[] = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=500&fit=crop&q=80',
    caption: 'Made pasta from scratch for the first time. Took forever but totally worth it.',
    hobby_tags: ['cooking', 'homemade'],
    user_name: 'Priya Sharma',
    user_role: 'Product Designer',
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=500&fit=crop&q=80',
    caption: 'Golden hour at the summit. 6 miles up, zero regrets.',
    hobby_tags: ['hiking', 'nature'],
    user_name: 'Marcus Johnson',
    user_role: 'Software Engineer',
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=500&fit=crop&q=80',
    caption: 'Finally nailing this Chopin piece after weeks of practice.',
    hobby_tags: ['piano', 'classical'],
    user_name: 'Anika Patel',
    user_role: 'Data Scientist',
  },
  {
    id: '4',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop&q=80',
    caption: 'Morning yoga before the city wakes up. This rooftop spot is everything.',
    hobby_tags: ['yoga', 'wellness'],
    user_name: 'Elena Voss',
    user_role: 'UX Researcher',
  },
  {
    id: '5',
    image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=500&fit=crop&q=80',
    caption: 'Street photography walk through the old quarter. Every corner tells a story.',
    hobby_tags: ['photography', 'street'],
    user_name: 'Kai Nakamura',
    user_role: 'Brand Strategist',
  },
  {
    id: '6',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=500&fit=crop&q=80',
    caption: 'Weekend hackathon with the crew. Built something wild in 48 hours.',
    hobby_tags: ['coding', 'hackathon'],
    user_name: 'Jordan Okafor',
    user_role: 'Full-Stack Dev',
  },
];

export function ActivityCarousel() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ActivityPost[]>(MOCK_POSTS);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Try fetching real data — fall back to mock
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_posts')
          .select('id, image_url, caption, hobby_tags, profiles:user_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error || !data || data.length === 0) return; // keep mock data

        setPosts(
          data.map((p: Record<string, unknown>) => {
            const profile = p.profiles as Record<string, unknown> | null;
            return {
              id: p.id as string,
              image_url: p.image_url as string,
              caption: (p.caption as string) || '',
              hobby_tags: (p.hobby_tags as string[]) || [],
              user_name: (profile?.full_name as string) || 'Anonymous',
              user_role: '',
            };
          })
        );
      } catch {
        // keep mock data on any failure
      }
    };

    fetchPosts();
  }, [user]);

  const handleFlip = (id: string) => {
    setFlippedId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      {/* Section header */}
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        Recent Activity
      </h3>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
        style={{ color: 'var(--color-textMuted)' }}
      >
        What people are up to outside of work
      </p>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hidden pb-2"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="activity-card-container flex-shrink-0 w-52 h-64 cursor-pointer"
            onClick={() => handleFlip(post.id)}
          >
            <div
              className={`activity-card-inner ${flippedId === post.id ? 'flipped' : ''}`}
            >
              {/* FRONT */}
              <div className="activity-card-front rounded-xl overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
                {/* Name + role overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  }}
                >
                  <p className="text-white text-xs font-semibold">{post.user_name}</p>
                  {post.user_role && (
                    <p className="text-white/70 text-[10px]">{post.user_role}</p>
                  )}
                </div>
              </div>

              {/* BACK */}
              <div className="activity-card-back rounded-xl overflow-hidden">
                {/* Blurred image background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${post.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(12px) brightness(0.3)',
                  }}
                />
                {/* Content */}
                <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                  <p className="text-white text-xs leading-relaxed">
                    {post.caption}
                  </p>
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.hobby_tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/60 text-[10px]">{post.user_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
