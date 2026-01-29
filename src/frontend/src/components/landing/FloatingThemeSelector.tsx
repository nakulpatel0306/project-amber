import { useState, useEffect } from 'react';
import { Palette, X, Plus, Trash2, Sparkles } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface CustomTheme extends Theme {
  isCustom?: boolean;
}

const CUSTOM_THEMES_KEY = 'amber-custom-themes';

function getCustomThemes(): CustomTheme[] {
  try {
    const saved = localStorage.getItem(CUSTOM_THEMES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCustomThemes(themes: CustomTheme[]) {
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
}

export function FloatingThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(getCustomThemes);
  const { currentTheme, setTheme, themes } = useTheme();

  // Custom theme form state
  const [customName, setCustomName] = useState('');
  const [customColors, setCustomColors] = useState({
    background: '#1a1a2e',
    backgroundSecondary: '#16213e',
    surface: '#0f3460',
    surfaceHover: '#1a4a7a',
    border: '#e94560',
    borderHover: '#ff6b6b',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    accent: '#e94560',
    accentHover: '#ff6b6b',
    accentText: '#ffffff',
    success: '#00d9a0',
    error: '#ff4757',
    warning: '#ffa502',
  });

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleCreateTheme = () => {
    if (!customName.trim()) return;

    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: customName,
      colors: { ...customColors },
      isCustom: true,
    };

    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    saveCustomThemes(updated);
    setTheme(newTheme.id);
    setIsCreating(false);
    setCustomName('');
  };

  const handleDeleteCustomTheme = (id: string) => {
    const updated = customThemes.filter(t => t.id !== id);
    setCustomThemes(updated);
    saveCustomThemes(updated);
    if (currentTheme.id === id) {
      setTheme('amber-light');
    }
  };

  const allThemes = [...themes, ...customThemes];

  const colorFields = [
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Surface' },
    { key: 'text', label: 'Text' },
    { key: 'accent', label: 'Accent' },
    { key: 'border', label: 'Border' },
  ] as const;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
          boxShadow: '0 4px 20px rgba(217, 119, 6, 0.4)',
        }}
        aria-label="Open theme selector"
      >
        <Palette className="w-6 h-6 text-white transition-transform group-hover:rotate-12" />
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'var(--color-accent)' }} />
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => { setIsOpen(false); setIsCreating(false); }}
        >
          {/* Blur backdrop */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-modal-enter"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-6 py-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Palette className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                      {isCreating ? 'create your theme' : 'choose your vibe'}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {isCreating ? 'design something unique' : `currently: ${currentTheme.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setIsCreating(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10"
                >
                  <X className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isCreating ? (
                /* Custom Theme Creator */
                <div className="space-y-5">
                  {/* Name input */}
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-textSecondary)' }}>
                      theme name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="my awesome theme"
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Color pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    {colorFields.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-10 h-10 rounded-lg cursor-pointer border-2 overflow-hidden"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Preview */}
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: customColors.background,
                      borderColor: customColors.border,
                    }}
                  >
                    <p className="text-xs mb-2" style={{ color: customColors.textMuted }}>preview</p>
                    <p className="font-semibold mb-1" style={{ color: customColors.text }}>This is how text looks</p>
                    <p className="text-sm mb-3" style={{ color: customColors.textSecondary }}>Secondary text style</p>
                    <div
                      className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: customColors.accent, color: customColors.accentText }}
                    >
                      accent button
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleCreateTheme}
                      disabled={!customName.trim()}
                      className="flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
                    >
                      create theme
                    </button>
                  </div>
                </div>
              ) : (
                /* Theme Grid */
                <div className="space-y-4">
                  {/* Built-in themes */}
                  <div className="grid grid-cols-2 gap-3">
                    {allThemes.map((theme) => {
                      const isSelected = currentTheme.id === theme.id;
                      const isCustom = 'isCustom' in theme && (theme as CustomTheme).isCustom;

                      return (
                        <button
                          key={theme.id}
                          onClick={() => setTheme(theme.id)}
                          className="relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]"
                          style={{
                            backgroundColor: theme.colors.background,
                            borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                            boxShadow: isSelected ? `0 0 0 2px ${theme.colors.accent}` : 'none',
                          }}
                        >
                          {/* Theme preview dots */}
                          <div className="flex gap-1.5 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.text }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.surface }} />
                          </div>

                          <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
                            {theme.name}
                          </p>

                          {isSelected && (
                            <div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              <Sparkles className="w-3 h-3" style={{ color: theme.colors.accentText }} />
                            </div>
                          )}

                          {isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomTheme(theme.id);
                              }}
                              className="absolute bottom-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" style={{ color: theme.colors.error }} />
                            </button>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Create custom theme button */}
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-textSecondary)' }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">create custom theme</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
