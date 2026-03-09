import { useState, useEffect, useRef } from 'react';
import { Users, Sun, Moon, Image as ImageIcon, Sparkles, Edit3, ChevronDown, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { NetworkFeed, type FeedFilter } from './NetworkFeed';
import { NotificationDropdown } from '../layout/NotificationDropdown';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ProfileEditModal } from './ProfileEditModal';
import { getHobbyById, type Hobby } from '../../data/hobbies';

export function NetworkHub() {
  const { isDark, toggleTheme } = useTheme();
  const { profile, user } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const [myHobbies, setMyHobbies] = useState<string[]>([]);
  const [myPhotos, setMyPhotos] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions: { value: FeedFilter; label: string }[] = [
    { value: 'all', label: 'All Posts' },
    { value: 'job_seekers', label: 'Job Seekers' },
    { value: 'employers', label: 'Employers' },
    { value: 'with_photos', label: 'With Photos' },
    { value: 'recent', label: 'Most Recent' },
  ];

  useEffect(() => {
    loadMyProfile();
  }, [user]);

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
  };

  const selectedHobbies = myHobbies.slice(0, 5).map(id => {
    if (id.startsWith('custom:')) {
      const name = id.replace('custom:', '').replace(/-/g, ' ');
      return { id, name: name.charAt(0).toUpperCase() + name.slice(1), emoji: '✨', category: 'social' as const };
    }
    return getHobbyById(id);
  }).filter(Boolean) as Hobby[];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bento-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                Hey {firstName}, see what others are up to!
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
                Explore the community and share your personality
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NotificationDropdown />
          </div>
        </div>
      </div>

      {/* My Profile Card */}
      <div className="bento-card p-5" style={{ border: '2px solid var(--color-accent)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            My Profile
          </h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </Button>
        </div>

        <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
          {/* Avatar & Info */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar src={profile?.avatar_url} fallback={profile?.full_name || 'User'} size="lg" />
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile?.full_name || 'Your Name'}</p>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {myPhotos.length} photos · {myHobbies.length} hobbies
              </p>
            </div>
          </div>

          {/* Photos Preview */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-textMuted)' }}>Photos</span>
            </div>
            {myPhotos.length > 0 ? (
              <div className="flex gap-2">
                {myPhotos.slice(0, 4).map((photo, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {myPhotos.length > 4 && (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
                  >
                    +{myPhotos.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>No photos yet</p>
            )}
          </div>

          {/* Hobbies Preview */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-textMuted)' }}>Hobbies</span>
            </div>
            {selectedHobbies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedHobbies.map(hobby => (
                  <span
                    key={hobby.id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {hobby.name}
                  </span>
                ))}
                {myHobbies.length > 5 && (
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-textMuted)' }}
                  >
                    +{myHobbies.length - 5}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>No hobbies yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Community Feed
          </h2>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <Filter className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
              {filterOptions.find(f => f.value === filter)?.label}
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            </button>
            {showFilterDropdown && (
              <div
                className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[150px]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surfaceHover)]"
                    style={{
                      color: filter === option.value ? 'var(--color-accent)' : 'var(--color-text)',
                      fontWeight: filter === option.value ? 600 : 400,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NetworkFeed filter={filter} />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            loadMyProfile();
          }}
        />
      )}
    </div>
  );
}
