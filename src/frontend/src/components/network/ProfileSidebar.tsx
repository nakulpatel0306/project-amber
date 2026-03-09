import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Plus,
  X,
  Edit3,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Check,
  Loader2,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { HOBBIES, HOBBY_CATEGORIES, getHobbyById, type Hobby, type HobbyCategory } from '../../data/hobbies';
import { seedMyProfile } from '../../utils/seedTestData';

interface CatalogData {
  hobbies: string[];
  photos: string[];
  bio: string | null;
  headline: string | null;
  location: string | null;
}

export function ProfileSidebar() {
  const { user, profile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [catalogData, setCatalogData] = useState<CatalogData>({
    hobbies: [],
    photos: [],
    bio: null,
    headline: null,
    location: null,
  });

  const [showHobbyModal, setShowHobbyModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HobbyCategory>('creative');
  const [tempSelectedHobbies, setTempSelectedHobbies] = useState<string[]>([]);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    loadCatalogData();
  }, [user]);

  const loadCatalogData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('hobbies, catalog_photos, bio, headline, location')
        .eq('user_id', user.id)
        .single();

      if (candidate) {
        setCatalogData({
          hobbies: candidate.hobbies || [],
          photos: candidate.catalog_photos || [],
          bio: candidate.bio,
          headline: candidate.headline,
          location: candidate.location,
        });
      }
    } catch (err) {
      console.error('Error loading catalog data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedTestData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const result = await seedMyProfile(user.id, { photoCount: 4, hobbyCount: 6 });
      if (result.success) {
        showSuccess('Test Data Added', 'Random photos and hobbies have been added');
        loadCatalogData();
      } else {
        showError('Error', result.error || 'Failed to seed test data');
      }
    } catch (err) {
      console.error('Error seeding test data:', err);
      showError('Error', 'Failed to seed test data');
    } finally {
      setIsSeeding(false);
    }
  };

  const saveHobbies = async (hobbies: string[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ hobbies })
        .eq('user_id', user.id);

      if (error) throw error;

      setCatalogData(prev => ({ ...prev, hobbies }));
      showSuccess('Hobbies Updated', 'Your hobbies have been saved');
    } catch (err) {
      console.error('Error saving hobbies:', err);
      showError('Error', 'Failed to save hobbies');
    } finally {
      setIsSaving(false);
    }
  };

  const removeHobby = (hobbyId: string) => {
    const newHobbies = catalogData.hobbies.filter(h => h !== hobbyId);
    saveHobbies(newHobbies);
  };

  const handleHobbyModalSave = () => {
    saveHobbies(tempSelectedHobbies);
    setShowHobbyModal(false);
  };

  const toggleHobbySelection = (hobbyId: string) => {
    setTempSelectedHobbies(prev => {
      if (prev.includes(hobbyId)) {
        return prev.filter(h => h !== hobbyId);
      }
      if (prev.length >= 10) {
        showError('Limit Reached', 'You can select up to 10 hobbies');
        return prev;
      }
      return [...prev, hobbyId];
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (catalogData.photos.length >= 6) {
      showError('Limit Reached', 'You can upload up to 6 photos');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Image must be under 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/catalog/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const newPhotos = [...catalogData.photos, publicUrl];

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ catalog_photos: newPhotos })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setCatalogData(prev => ({ ...prev, photos: newPhotos }));
      showSuccess('Photo Uploaded', 'Your photo has been added');
      setShowPhotoModal(false);
    } catch (err) {
      console.error('Error uploading photo:', err);
      showError('Upload Failed', 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (photoUrl: string) => {
    if (!user) return;
    try {
      const newPhotos = catalogData.photos.filter(p => p !== photoUrl);

      const { error } = await supabase
        .from('candidates')
        .update({ catalog_photos: newPhotos })
        .eq('user_id', user.id);

      if (error) throw error;

      setCatalogData(prev => ({ ...prev, photos: newPhotos }));
      showSuccess('Photo Removed', 'The photo has been deleted');
    } catch (err) {
      console.error('Error removing photo:', err);
      showError('Error', 'Failed to remove photo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  const selectedHobbies = catalogData.hobbies.map(id => getHobbyById(id)).filter(Boolean) as Hobby[];

  return (
    <div className="space-y-4">
      {/* Compact Profile Card */}
      <div className="bento-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={profile?.avatar_url}
            fallback={profile?.full_name || 'User'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
              {profile?.full_name || 'Your Name'}
            </h3>
            {catalogData.headline && (
              <p className="text-xs truncate" style={{ color: 'var(--color-accent)' }}>
                {catalogData.headline}
              </p>
            )}
          </div>
        </div>
        {catalogData.location && (
          <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--color-textMuted)' }}>
            <MapPin className="w-3 h-3" />
            {catalogData.location}
          </div>
        )}
        {catalogData.bio && (
          <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--color-textSecondary)' }}>
            {catalogData.bio}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            leftIcon={<Edit3 className="w-3 h-3" />}
            onClick={() => window.location.href = '/app/settings?tab=profile'}
          >
            Edit
          </Button>
          {import.meta.env.DEV && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              leftIcon={isSeeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              onClick={handleSeedTestData}
              disabled={isSeeding}
            >
              Seed
            </Button>
          )}
        </div>
      </div>

      {/* Compact Photo Gallery */}
      <div className="bento-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              Photos
            </span>
            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {catalogData.photos.length}/6
            </span>
          </div>
          {catalogData.photos.length < 6 && (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="p-1 rounded hover:bg-[var(--color-surface)] transition-colors"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {catalogData.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {catalogData.photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden group"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(photo)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={() => setShowPhotoModal(true)}
          >
            <Camera className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              Add photos
            </p>
          </div>
        )}
      </div>

      {/* Compact Hobbies */}
      <div className="bento-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              Hobbies
            </span>
            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {catalogData.hobbies.length}/10
            </span>
          </div>
          <button
            onClick={() => {
              setTempSelectedHobbies(catalogData.hobbies);
              setShowHobbyModal(true);
            }}
            className="p-1 rounded hover:bg-[var(--color-surface)] transition-colors"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {selectedHobbies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedHobbies.map(hobby => (
              <div
                key={hobby.id}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
              >
                <span>{hobby.emoji}</span>
                <span style={{ color: 'var(--color-text)' }}>{hobby.name}</span>
                <button
                  onClick={() => removeHobby(hobby.id)}
                  className="ml-0.5 hover:opacity-70"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={() => {
              setTempSelectedHobbies([]);
              setShowHobbyModal(true);
            }}
          >
            <Sparkles className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              Add hobbies
            </p>
          </div>
        )}
      </div>

      {/* Hobby Selection Modal */}
      <Modal
        isOpen={showHobbyModal}
        onClose={() => setShowHobbyModal(false)}
        size="lg"
        title="Select Your Hobbies"
      >
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            {HOBBY_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === category.id ? 'var(--color-accent)' : 'var(--color-background)',
                  color: selectedCategory === category.id ? 'white' : 'var(--color-textSecondary)',
                }}
              >
                {category.emoji} {category.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {tempSelectedHobbies.length} of 10 selected
            </p>
            {tempSelectedHobbies.length > 0 && (
              <button
                onClick={() => setTempSelectedHobbies([])}
                className="text-sm hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
            {HOBBIES.filter(h => h.category === selectedCategory).map(hobby => {
              const isSelected = tempSelectedHobbies.includes(hobby.id);
              return (
                <button
                  key={hobby.id}
                  onClick={() => toggleHobbySelection(hobby.id)}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-background)',
                    border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  }}
                >
                  <span className="text-xl">{hobby.emoji}</span>
                  <span
                    className="text-sm font-medium flex-1"
                    style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}
                  >
                    {hobby.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" onClick={() => setShowHobbyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleHobbyModalSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Hobbies'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        size="sm"
        title="Add Photo"
      >
        <div className="p-6 text-center">
          <div
            className="border-2 border-dashed rounded-xl p-8 mb-4 cursor-pointer hover:border-[var(--color-accent)] transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingPhoto ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <>
                <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-textMuted)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Click to upload
                </p>
                <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  PNG, JPG up to 5MB
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => setShowPhotoModal(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
