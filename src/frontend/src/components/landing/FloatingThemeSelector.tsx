import { useState, useEffect, useCallback } from 'react';
import { Palette, X, Plus, Trash2, Sparkles, ChevronLeft } from 'lucide-react';
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

// Lighten/darken a hex color by a percentage
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(2.55 * percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Determine if a color is light
function isLight(hex: string): boolean {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="relative w-10 h-10 rounded-xl cursor-pointer overflow-hidden flex-shrink-0 border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-textSecondary)' }}>{label}</p>
        <input
          type="text"
          value={value}
          onChange={e => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="w-full text-xs font-mono px-2 py-1 rounded-lg border outline-none"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>
    </div>
  );
}

export function FloatingThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(getCustomThemes);
  const { currentTheme, setTheme, themes } = useTheme();

  // Simplified custom theme form — 6 key colors, rest auto-derived
  const [customName, setCustomName] = useState('');
  const [baseColors, setBaseColors] = useState({
    background: '#1a1a2e',
    surface: '#0f3460',
    text: '#ffffff',
    accent: '#e94560',
    success: '#00d9a0',
    error: '#ff4757',
  });

  const updateBase = useCallback((key: string, value: string) => {
    setBaseColors(prev => ({ ...prev, [key]: value }));
  }, []);

  // Auto-derive full theme from the 6 base colors
  const derivedTheme = {
    background: baseColors.background,
    backgroundSecondary: adjustColor(baseColors.background, isLight(baseColors.background) ? -3 : 5),
    surface: baseColors.surface,
    surfaceHover: adjustColor(baseColors.surface, isLight(baseColors.surface) ? -8 : 8),
    border: adjustColor(baseColors.surface, isLight(baseColors.surface) ? -15 : 15),
    borderHover: adjustColor(baseColors.surface, isLight(baseColors.surface) ? -25 : 25),
    text: baseColors.text,
    textSecondary: adjustColor(baseColors.text, isLight(baseColors.text) ? 30 : -30),
    textMuted: adjustColor(baseColors.text, isLight(baseColors.text) ? 50 : -50),
    accent: baseColors.accent,
    accentHover: adjustColor(baseColors.accent, isLight(baseColors.accent) ? -12 : 12),
    accentText: isLight(baseColors.accent) ? '#1a1a1a' : '#ffffff',
    success: baseColors.success,
    error: baseColors.error,
    warning: '#F59E0B',
  };

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
      colors: { ...derivedTheme },
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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{
          backgroundColor: 'var(--color-accent)',
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
                  {isCreating && (
                    <button
                      onClick={() => setIsCreating(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10"
                    >
                      <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
                    </button>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Palette className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                      {isCreating ? 'Create Your Theme' : 'Choose Your Vibe'}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {isCreating ? 'Pick your colors, we handle the rest' : `Currently: ${currentTheme.name}`}
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
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {isCreating ? (
                /* Custom Theme Creator */
                <div className="space-y-5">
                  {/* Name input */}
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Theme name..."
                    className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />

                  {/* Color pickers grouped */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-textMuted)' }}>Base</p>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Background" value={baseColors.background} onChange={v => updateBase('background', v)} />
                        <ColorField label="Surface" value={baseColors.surface} onChange={v => updateBase('surface', v)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-textMuted)' }}>Text & Accent</p>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Text" value={baseColors.text} onChange={v => updateBase('text', v)} />
                        <ColorField label="Accent" value={baseColors.accent} onChange={v => updateBase('accent', v)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-textMuted)' }}>Status</p>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Success" value={baseColors.success} onChange={v => updateBase('success', v)} />
                        <ColorField label="Error" value={baseColors.error} onChange={v => updateBase('error', v)} />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div
                    className="p-5 rounded-2xl border"
                    style={{
                      backgroundColor: derivedTheme.background,
                      borderColor: derivedTheme.border,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-3 font-semibold" style={{ color: derivedTheme.textMuted }}>Preview</p>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: derivedTheme.surface }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-0.5" style={{ color: derivedTheme.text }}>Hello, World</p>
                        <p className="text-xs" style={{ color: derivedTheme.textSecondary }}>This is how your theme will look across the app.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: derivedTheme.accent, color: derivedTheme.accentText }}
                      >
                        Primary
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: derivedTheme.surface, color: derivedTheme.text, border: `1px solid ${derivedTheme.border}` }}
                      >
                        Secondary
                      </div>
                      <div className="flex gap-1.5 items-center ml-auto">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: derivedTheme.success }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: derivedTheme.error }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: derivedTheme.warning }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTheme}
                      disabled={!customName.trim()}
                      className="flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
                    >
                      Create Theme
                    </button>
                  </div>
                </div>
              ) : (
                /* Theme Grid */
                <div className="space-y-4">
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
                    <span className="text-sm font-medium">Create Custom Theme</span>
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
