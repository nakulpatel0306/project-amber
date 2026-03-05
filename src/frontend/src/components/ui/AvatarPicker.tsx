import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

// Fun avatar options - mix of animals, expressions, and characters
const AVATAR_OPTIONS = [
  // Animals
  { id: 'cat', emoji: '🐱', label: 'Cool Cat' },
  { id: 'dog', emoji: '🐶', label: 'Good Boy' },
  { id: 'fox', emoji: '🦊', label: 'Sly Fox' },
  { id: 'panda', emoji: '🐼', label: 'Chill Panda' },
  { id: 'koala', emoji: '🐨', label: 'Sleepy Koala' },
  { id: 'lion', emoji: '🦁', label: 'Brave Lion' },
  { id: 'unicorn', emoji: '🦄', label: 'Magical Unicorn' },
  { id: 'owl', emoji: '🦉', label: 'Wise Owl' },
  { id: 'penguin', emoji: '🐧', label: 'Fancy Penguin' },
  { id: 'butterfly', emoji: '🦋', label: 'Free Spirit' },

  // Fun faces
  { id: 'cool', emoji: '😎', label: 'Too Cool' },
  { id: 'nerd', emoji: '🤓', label: 'Big Brain' },
  { id: 'wink', emoji: '😉', label: 'Charmer' },
  { id: 'star', emoji: '🤩', label: 'Starstruck' },
  { id: 'chill', emoji: '😌', label: 'Zen Master' },
  { id: 'think', emoji: '🤔', label: 'Deep Thinker' },

  // Objects & misc
  { id: 'rocket', emoji: '🚀', label: 'Go-Getter' },
  { id: 'alien', emoji: '👽', label: 'Out of This World' },
  { id: 'robot', emoji: '🤖', label: 'Tech Wizard' },
  { id: 'ghost', emoji: '👻', label: 'Mysterious' },
  { id: 'ninja', emoji: '🥷', label: 'Stealthy' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Explorer' },
  { id: 'artist', emoji: '🧑‍🎨', label: 'Creative Soul' },
  { id: 'scientist', emoji: '🧑‍🔬', label: 'Curious Mind' },
];

// Background colors for avatars
const AVATAR_COLORS = [
  { id: 'sunset', color: '#f5576c' },
  { id: 'ocean', color: '#4facfe' },
  { id: 'forest', color: '#11998e' },
  { id: 'fire', color: '#f5af19' },
  { id: 'purple', color: '#667eea' },
  { id: 'midnight', color: '#0c3483' },
  { id: 'coffee', color: '#D97706' },
  { id: 'candy', color: '#ff9a9e' },
];

interface AvatarPickerProps {
  selectedAvatar: string | null;
  selectedColor: string | null;
  onSelect: (avatarId: string, colorId: string) => void;
  onClose?: () => void;
}

export function AvatarPicker({ selectedAvatar, selectedColor, onSelect, onClose }: AvatarPickerProps) {
  const [tempAvatar, setTempAvatar] = useState(selectedAvatar || AVATAR_OPTIONS[0].id);
  const [tempColor, setTempColor] = useState(selectedColor || AVATAR_COLORS[6].id); // Default to coffee/amber

  const handleConfirm = () => {
    onSelect(tempAvatar, tempColor);
    onClose?.();
  };

  const currentColor = AVATAR_COLORS.find(c => c.id === tempColor)?.color || AVATAR_COLORS[0].color;
  const currentEmoji = AVATAR_OPTIONS.find(a => a.id === tempAvatar)?.emoji || '😊';

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
          style={{ backgroundColor: currentColor }}
        >
          {currentEmoji}
        </div>
      </div>

      {/* Color selection */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Background Color
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setTempColor(color.id)}
              className={cn(
                'w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center',
                tempColor === color.id && 'ring-2 ring-offset-2 ring-[var(--color-accent)]'
              )}
              style={{ backgroundColor: color.color }}
            >
              {tempColor === color.id && <Check className="w-5 h-5 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar selection */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Choose Your Avatar
        </p>
        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setTempAvatar(avatar.id)}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110',
                tempAvatar === avatar.id
                  ? 'bg-[var(--color-accent)]/20 ring-2 ring-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] hover:bg-[var(--color-surfaceHover)]'
              )}
              title={avatar.label}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          Save Avatar
        </button>
      </div>
    </div>
  );
}

// Helper to get avatar display data
export function getAvatarDisplay(avatarId: string | null, colorId: string | null) {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
  const color = AVATAR_COLORS.find(c => c.id === colorId) || AVATAR_COLORS[6];
  return { emoji: avatar.emoji, backgroundColor: color.color, label: avatar.label };
}

export { AVATAR_OPTIONS, AVATAR_COLORS };
