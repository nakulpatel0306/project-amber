import { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

export function ProfileSection() {
  const { user, profile, updateProfile, isCandidate } = useAuth();
  const { success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('File too large', 'Please choose an image under 2MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid file type', 'Please choose an image file.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile({ avatar_url: publicUrl });

      success('Avatar updated', 'Your profile photo has been changed.');
    } catch (err) {
      showError('Upload failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          manage your personal information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-medium"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
                  color: 'var(--color-accentText)',
                }}
              >
                {(formData.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <label
            className={`
              absolute -bottom-1 -right-1 w-8 h-8 rounded-full
              flex items-center justify-center cursor-pointer
              transition-transform hover:scale-105
              ${isUploading ? 'opacity-50 cursor-wait' : ''}
            `}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accentText)',
            }}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            profile photo
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            click the camera icon to upload (max 2mb)
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <Input
          label="full name"
          type="text"
          value={formData.full_name}
          onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          placeholder="Enter your name"
          leftIcon={<User className="w-4 h-4" />}
          disabled={!isEditing}
        />

        <Input
          label="email"
          type="email"
          value={user?.email || ''}
          disabled
          hint="email cannot be changed"
        />

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            account type
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
            account type cannot be changed
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              save changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>edit profile</Button>
        )}
      </div>
    </div>
  );
}
