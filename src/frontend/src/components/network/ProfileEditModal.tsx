import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Plus,
  X,
  Sparkles,
  Check,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { HOBBIES, HOBBY_CATEGORIES, getHobbyById, type Hobby, type HobbyCategory } from '../../data/hobbies';

interface PhotoWithCaption {
  url: string;
  caption: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoWithCaption[]>([]);
  const [editingCaption, setEditingCaption] = useState<number | null>(null);
  const [captionText, setCaptionText] = useState('');

  const [showHobbyPicker, setShowHobbyPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HobbyCategory>('content');
  const [tempSelectedHobbies, setTempSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // First try to get basic data
      const { data, error } = await supabase
        .from('candidates')
        .select('hobbies, catalog_photos')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading candidate data:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setHobbies(data.hobbies || []);

        // Try to get caption data separately (column may not exist)
        let captionData: PhotoWithCaption[] = [];
        try {
          const { data: captionResult } = await supabase
            .from('candidates')
            .select('catalog_photos_data')
            .eq('user_id', user.id)
            .single();

          if (captionResult?.catalog_photos_data && Array.isArray(captionResult.catalog_photos_data)) {
            captionData = captionResult.catalog_photos_data as PhotoWithCaption[];
          }
        } catch {
          // Column doesn't exist yet, use empty captions
        }

        // Use caption data if available, otherwise convert old format
        if (captionData.length > 0) {
          setPhotos(captionData);
        } else if (data.catalog_photos && data.catalog_photos.length > 0) {
          // Convert old format to new format
          setPhotos(data.catalog_photos.map((url: string) => ({ url, caption: '' })));
        } else {
          setPhotos([]);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHobbies = async (newHobbies: string[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ hobbies: newHobbies })
        .eq('user_id', user.id);

      if (error) throw error;
      setHobbies(newHobbies);
      showSuccess('Saved', 'Hobbies updated');
    } catch (err) {
      showError('Error', 'Failed to save hobbies');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHobbyPickerSave = () => {
    saveHobbies(tempSelectedHobbies);
    setShowHobbyPicker(false);
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

  const addCustomHobby = () => {
    const trimmed = customHobby.trim();
    if (!trimmed) return;

    // Create a custom hobby ID
    const customId = `custom:${trimmed.toLowerCase().replace(/\s+/g, '-')}`;

    if (tempSelectedHobbies.includes(customId)) {
      showError('Already Added', 'This hobby is already in your list');
      return;
    }

    if (tempSelectedHobbies.length >= 10) {
      showError('Limit Reached', 'You can select up to 10 hobbies');
      return;
    }

    setTempSelectedHobbies(prev => [...prev, customId]);
    setCustomHobby('');
  };

  const removeHobby = (hobbyId: string) => {
    saveHobbies(hobbies.filter(h => h !== hobbyId));
  };

  const savePhotos = async (newPhotos: PhotoWithCaption[]) => {
    if (!user) return false;
    try {
      // Always update catalog_photos (the URL array)
      const { error: photosError } = await supabase
        .from('candidates')
        .update({
          catalog_photos: newPhotos.map(p => p.url),
        })
        .eq('user_id', user.id);

      if (photosError) throw photosError;

      // Try to update caption data (column may not exist)
      try {
        await supabase
          .from('candidates')
          .update({
            catalog_photos_data: newPhotos,
          })
          .eq('user_id', user.id);
      } catch {
        // Column doesn't exist yet, captions won't be saved
        console.warn('catalog_photos_data column not available');
      }

      setPhotos(newPhotos);
      return true;
    } catch (err) {
      showError('Error', 'Failed to save photos');
      return false;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (photos.length >= 6) {
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

      const newPhotos = [...photos, { url: publicUrl, caption: '' }];
      const success = await savePhotos(newPhotos);

      if (success) {
        showSuccess('Photo Uploaded', 'Add a caption to describe your photo!');
        // Auto-open caption editor for new photo
        setEditingCaption(newPhotos.length - 1);
        setCaptionText('');
      }
    } catch (err) {
      showError('Upload Failed', 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (index: number) => {
    if (!user) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    const success = await savePhotos(newPhotos);
    if (success) {
      showSuccess('Photo Removed', 'The photo has been deleted');
    }
  };

  const saveCaption = async (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], caption: captionText };
    const success = await savePhotos(newPhotos);
    if (success) {
      showSuccess('Caption Saved', 'Your caption has been updated');
      setEditingCaption(null);
      setCaptionText('');
    }
  };

  const selectedHobbies = hobbies.map(id => {
    // Handle custom hobbies
    if (id.startsWith('custom:')) {
      const name = id.replace('custom:', '').replace(/-/g, ' ');
      return { id, name: name.charAt(0).toUpperCase() + name.slice(1), emoji: '✨', category: 'social' as const };
    }
    return getHobbyById(id);
  }).filter(Boolean) as Hobby[];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Edit Profile">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto -mx-6 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : (
          <>
            {/* Photos Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Camera className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Photos ({photos.length}/6)
                </h3>
                {photos.length < 6 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                      <div className="relative aspect-square group">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCaption(index);
                              setCaptionText(photo.caption);
                            }}
                            className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removePhoto(index)}
                            className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        {editingCaption === index ? (
                          <div className="space-y-2">
                            <textarea
                              value={captionText}
                              onChange={(e) => setCaptionText(e.target.value)}
                              placeholder="Add a caption..."
                              className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                              rows={2}
                              maxLength={150}
                              autoFocus
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                {captionText.length}/150
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCaption(null);
                                    setCaptionText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={() => saveCaption(index)}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer group/caption"
                            onClick={() => {
                              setEditingCaption(index);
                              setCaptionText(photo.caption);
                            }}
                          >
                            {photo.caption ? (
                              <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                                {photo.caption}
                              </p>
                            ) : (
                              <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                                <Plus className="w-3 h-3" />
                                Add caption...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: 'var(--color-border)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    Click to add photos
                  </p>
                </div>
              )}
            </div>

            {/* Hobbies Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Hobbies ({hobbies.length}/10)
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setTempSelectedHobbies(hobbies);
                    setShowHobbyPicker(true);
                  }}
                >
                  {hobbies.length > 0 ? 'Edit' : 'Add'}
                </Button>
              </div>
              {selectedHobbies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedHobbies.map(hobby => (
                    <div
                      key={hobby.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
                      style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <span>{hobby.name}</span>
                      <button
                        onClick={() => removeHobby(hobby.id)}
                        className="p-0.5 rounded hover:bg-[var(--color-surface)]"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: 'var(--color-border)' }}
                  onClick={() => {
                    setTempSelectedHobbies([]);
                    setShowHobbyPicker(true);
                  }}
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    Click to add hobbies
                  </p>
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        )}
      </div>

      {/* Hobby Picker Sub-Modal */}
      {showHobbyPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Select Hobbies</h3>
              <button onClick={() => setShowHobbyPicker(false)} style={{ color: 'var(--color-textMuted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HOBBY_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: selectedCategory === category.id ? 'var(--color-accent)' : 'transparent',
                      color: selectedCategory === category.id ? 'white' : 'var(--color-textSecondary)',
                      border: selectedCategory === category.id ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Custom hobby input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customHobby}
                  onChange={(e) => setCustomHobby(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomHobby();
                    }
                  }}
                  placeholder="Add your own hobby..."
                  className="flex-1 px-3 py-2 text-sm rounded-md"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  maxLength={30}
                />
                <Button size="sm" onClick={addCustomHobby} disabled={!customHobby.trim()}>
                  Add
                </Button>
              </div>

              <p className="text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                {tempSelectedHobbies.length} of 10 selected
              </p>

              {/* Hobby grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
                {HOBBIES.filter(h => h.category === selectedCategory).map(hobby => {
                  const isSelected = tempSelectedHobbies.includes(hobby.id);
                  return (
                    <button
                      key={hobby.id}
                      onClick={() => toggleHobbySelection(hobby.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-left transition-all text-sm"
                      style={{
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                        border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                      }}
                    >
                      <span>{hobby.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
              <Button variant="outline" onClick={() => setShowHobbyPicker(false)}>Cancel</Button>
              <Button onClick={handleHobbyPickerSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
