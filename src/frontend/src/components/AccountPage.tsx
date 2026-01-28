import { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  Link,
  ChevronRight,
  Check,
  Moon,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Pre-defined avatar options
type GradientAvatar = { id: string; type: 'gradient'; colors: [string, string] };
type EmojiAvatar = { id: string; type: 'emoji'; emoji: string };
type AvatarOption = GradientAvatar | EmojiAvatar;

const gradientAvatars: GradientAvatar[] = [
  { id: 'gradient-purple', type: 'gradient', colors: ['#8B5CF6', '#A78BFA'] },
  { id: 'gradient-blue', type: 'gradient', colors: ['#3B82F6', '#60A5FA'] },
  { id: 'gradient-green', type: 'gradient', colors: ['#10B981', '#34D399'] },
  { id: 'gradient-orange', type: 'gradient', colors: ['#F59E0B', '#FBBF24'] },
  { id: 'gradient-pink', type: 'gradient', colors: ['#EC4899', '#F472B6'] },
  { id: 'gradient-teal', type: 'gradient', colors: ['#14B8A6', '#2DD4BF'] },
];

const emojiAvatars: EmojiAvatar[] = [
  { id: 'emoji-moon', type: 'emoji', emoji: '🌙' },
  { id: 'emoji-star', type: 'emoji', emoji: '⭐' },
  { id: 'emoji-rocket', type: 'emoji', emoji: '🚀' },
  { id: 'emoji-fire', type: 'emoji', emoji: '🔥' },
  { id: 'emoji-sparkles', type: 'emoji', emoji: '✨' },
  { id: 'emoji-robot', type: 'emoji', emoji: '🤖' },
  { id: 'emoji-alien', type: 'emoji', emoji: '👽' },
  { id: 'emoji-ghost', type: 'emoji', emoji: '👻' },
  { id: 'emoji-cat', type: 'emoji', emoji: '🐱' },
  { id: 'emoji-dog', type: 'emoji', emoji: '🐶' },
];

type AvatarConfig = {
  type: 'default' | 'gradient' | 'emoji' | 'custom';
  value: string;
};

export function AccountPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    updates: true,
    newsletter: false,
    security: true,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('amber-user-avatar');
    return saved ? JSON.parse(saved) : { type: 'default', value: '' };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save avatar to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('amber-user-avatar', JSON.stringify(avatar));
  }, [avatar]);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'January 2024';

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Amber User';
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleAvatarSelect = (avatarOption: AvatarOption) => {
    if (avatarOption.type === 'gradient') {
      setAvatar({ type: 'gradient', value: avatarOption.id });
    } else if (avatarOption.type === 'emoji') {
      setAvatar({ type: 'emoji', value: avatarOption.emoji });
    }
    setShowAvatarPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar({ type: 'custom', value: reader.result as string });
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarDisplay = () => {
    // If user has OAuth avatar and no custom selection, show OAuth avatar
    if (avatar.type === 'default' && userAvatar) {
      return (
        <img
          src={userAvatar}
          alt={userName}
          className="w-full h-full rounded-full object-cover"
        />
      );
    }

    // Custom uploaded image
    if (avatar.type === 'custom') {
      return (
        <img
          src={avatar.value}
          alt={userName}
          className="w-full h-full rounded-full object-cover"
        />
      );
    }

    // Gradient avatar
    if (avatar.type === 'gradient') {
      const gradientAvatar = gradientAvatars.find(a => a.id === avatar.value);
      if (gradientAvatar) {
        return (
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${gradientAvatar.colors[0]}, ${gradientAvatar.colors[1]})`,
            }}
          >
            <User className="w-8 h-8 text-white" />
          </div>
        );
      }
    }

    // Emoji avatar
    if (avatar.type === 'emoji') {
      return (
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <span className="text-3xl">{avatar.value}</span>
        </div>
      );
    }

    // Default fallback
    return (
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
        }}
      >
        <User className="w-8 h-8 text-white" />
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* avatar picker modal */}
      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="w-full max-w-md mx-4 p-6 rounded-2xl border slide-in-up"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                choose avatar
              </h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-textMuted)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* gradient avatars */}
            <p
              className="text-xs uppercase tracking-wider mb-3 font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              colors
            </p>
            <div className="grid grid-cols-6 gap-2 mb-6">
              {gradientAvatars.map(avatarOption => (
                <button
                  key={avatarOption.id}
                  onClick={() => handleAvatarSelect(avatarOption)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2"
                  style={{
                    background: `linear-gradient(135deg, ${avatarOption.colors[0]}, ${avatarOption.colors[1]})`,
                    borderColor: avatar.type === 'gradient' && avatar.value === avatarOption.id
                      ? 'var(--color-accent)'
                      : 'transparent',
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>

            {/* emoji avatars */}
            <p
              className="text-xs uppercase tracking-wider mb-3 font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              icons
            </p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {emojiAvatars.map(avatarOption => (
                <button
                  key={avatarOption.id}
                  onClick={() => handleAvatarSelect(avatarOption)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: avatar.type === 'emoji' && avatar.value === avatarOption.emoji
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  }}
                >
                  <span className="text-xl">{avatarOption.emoji}</span>
                </button>
              ))}
            </div>

            {/* upload custom */}
            <p
              className="text-xs uppercase tracking-wider mb-3 font-medium"
              style={{ color: 'var(--color-textMuted)' }}
            >
              custom
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-textSecondary)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-textSecondary)';
              }}
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">upload image</span>
            </button>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: 'var(--color-textMuted)' }}
            >
              PNG or JPEG, max 5MB
            </p>
          </div>
        </div>
      )}

      {/* profile header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="relative group"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden">
            {getAvatarDisplay()}
          </div>
          {/* edit overlay */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <Camera className="w-5 h-5 text-white" />
          </div>
        </button>
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            {userName.toLowerCase()}
          </h1>
          <p
            className="text-sm flex items-center gap-1.5 mt-0.5"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <Mail className="w-3.5 h-3.5" />
            {userEmail}
          </p>
        </div>
      </div>

      {/* account info */}
      <Section title="account information">
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="display name"
          value={userName.toLowerCase()}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="email"
          value={userEmail}
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="member since"
          value={memberSince.toLowerCase()}
        />
        <InfoRow
          icon={<Shield className="w-4 h-4" />}
          label="account status"
          value="active"
          valueColor="var(--color-success)"
        />
      </Section>

      {/* subscription */}
      <Section title="subscription">
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              <span
                className="font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                amber free
              </span>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--color-accent)',
              }}
            >
              current plan
            </span>
          </div>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            basic access to amber with limited features.
          </p>
          <button
            className="w-full py-2.5 rounded-lg text-sm font-medium btn-smooth"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accentText)',
            }}
          >
            upgrade to pro
          </button>
        </div>

        <div
          className="mt-3 p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                payment method
              </p>
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                no payment method added
              </p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </div>
        </div>
      </Section>

      {/* notifications */}
      <Section title="notifications">
        <ToggleRow
          label="product updates"
          description="get notified about new features and improvements"
          enabled={notifications.updates}
          onToggle={() => setNotifications(prev => ({ ...prev, updates: !prev.updates }))}
        />
        <ToggleRow
          label="newsletter"
          description="monthly tips and best practices"
          enabled={notifications.newsletter}
          onToggle={() => setNotifications(prev => ({ ...prev, newsletter: !prev.newsletter }))}
        />
        <ToggleRow
          label="security alerts"
          description="important notifications about your account"
          enabled={notifications.security}
          onToggle={() => setNotifications(prev => ({ ...prev, security: !prev.security }))}
        />
      </Section>

      {/* connected accounts */}
      <Section title="connected accounts">
        <ConnectedAccount
          name="google"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
          connected={user?.app_metadata?.provider === 'google'}
        />
        <ConnectedAccount
          name="github"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          }
          connected={user?.app_metadata?.provider === 'github'}
        />
      </Section>

      {/* danger zone */}
      <Section title="danger zone">
        <button
          className="w-full p-3 rounded-lg border text-sm text-left transition-all"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-textMuted)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-error)';
            e.currentTarget.style.color = 'var(--color-error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-textMuted)';
          }}
        >
          delete account
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2
        className="text-xs uppercase tracking-wider mb-3 font-medium"
        style={{ color: 'var(--color-textMuted)' }}
      >
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--color-textMuted)' }}>{icon}</span>
        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
          {label}
        </span>
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: valueColor || 'var(--color-text)' }}
      >
        {value}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-3">
        <Bell className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
        <div>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="w-9 h-5 rounded-full p-0.5 transition-colors"
        style={{
          backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        <div
          className="w-4 h-4 rounded-full bg-white transition-transform"
          style={{
            transform: enabled ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

function ConnectedAccount({
  name,
  icon,
  connected,
}: {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
          {name}
        </span>
      </div>
      {connected ? (
        <span
          className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--color-success)',
          }}
        >
          <Check className="w-3 h-3" />
          connected
        </span>
      ) : (
        <button
          className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            color: 'var(--color-textMuted)',
          }}
        >
          <Link className="w-3 h-3" />
          connect
        </button>
      )}
    </div>
  );
}
