import { useState, useEffect } from 'react';
import { User, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AvatarPicker, getAvatarDisplay } from '../ui/AvatarPicker';

// Parse avatar_url to determine if it's an emoji avatar or image URL
function parseAvatarUrl(avatarUrl: string | null): { type: 'emoji' | 'image' | 'none'; avatarId?: string; colorId?: string; url?: string } {
  if (!avatarUrl) return { type: 'none' };
  if (avatarUrl.startsWith('emoji:')) {
    const [, avatarId, colorId] = avatarUrl.split(':');
    return { type: 'emoji', avatarId, colorId };
  }
  return { type: 'image', url: avatarUrl };
}

// Create avatar_url string from emoji selection
function createEmojiAvatarUrl(avatarId: string, colorId: string): string {
  return `emoji:${avatarId}:${colorId}`;
}

export function ProfileSection() {
  const { user, profile, updateProfile, isCandidate } = useAuth();
  const { success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  // Sync formData when profile loads or changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      success('Profile updated', 'Your changes have been saved.');
      setIsEditing(false);
    } catch (err) {
      showError('Failed to update', 'Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    });
    setIsEditing(false);
  };

  const handleAvatarSelect = async (avatarId: string, colorId: string) => {
    const newAvatarUrl = createEmojiAvatarUrl(avatarId, colorId);
    setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));

    try {
      await updateProfile({ avatar_url: newAvatarUrl });
      success('Avatar updated', 'Your new look is saved!');
    } catch (err) {
      showError('Update failed', 'Please try again.');
    }

    setShowAvatarPicker(false);
  };

  // Parse current avatar
  const avatarData = parseAvatarUrl(formData.avatar_url);

  // Render avatar based on type
  const renderAvatar = () => {
    if (avatarData.type === 'emoji' && avatarData.avatarId && avatarData.colorId) {
      const { emoji, gradient } = getAvatarDisplay(avatarData.avatarId, avatarData.colorId);
      return (
        <div
          className="w-full h-full flex items-center justify-center text-4xl"
          style={{ background: gradient }}
        >
          {emoji}
        </div>
      );
    }

    if (avatarData.type === 'image' && avatarData.url) {
      return (
        <img
          src={avatarData.url}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      );
    }

    // Default fallback - show initial
    return (
      <div
        className="w-full h-full flex items-center justify-center text-2xl font-medium"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
          color: 'white',
        }}
      >
        {(formData.full_name || user?.email || '?')[0].toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Manage your personal information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            {renderAvatar()}
          </div>
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Profile Avatar
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            Click to choose a fun avatar
          </p>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAvatarPicker(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl p-6 shadow-xl"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-lg font-semibold mb-4 text-center"
                style={{ color: 'var(--color-text)' }}
              >
                Choose Your Avatar
              </h3>
              <AvatarPicker
                selectedAvatar={avatarData.type === 'emoji' ? avatarData.avatarId || null : null}
                selectedColor={avatarData.type === 'emoji' ? avatarData.colorId || null : null}
                onSelect={handleAvatarSelect}
                onClose={() => setShowAvatarPicker(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={formData.full_name}
          onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          placeholder="Enter your name"
          leftIcon={<User className="w-4 h-4" />}
          disabled={!isEditing}
        />

        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          disabled
          hint="Email cannot be changed"
        />

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Account Type
          </p>
          <div
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-textSecondary)',
            }}
          >
            {isCandidate ? 'Job Seeker' : 'Employer'}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
            Account type cannot be changed
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}
