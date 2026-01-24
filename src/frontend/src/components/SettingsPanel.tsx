import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Check, Palette, Keyboard, Trash2, HelpCircle, ChevronRight } from 'lucide-react';

interface SettingsPanelProps {
  onClearHistory: () => void;
}

type SettingsSection = 'theme' | 'shortcuts' | 'help';

export function SettingsPanel({ onClearHistory }: SettingsPanelProps) {
  const { currentTheme, setTheme, themes } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('theme');

  return (
    <div className="space-y-4">
      {/* section tabs */}
      <div
        className="flex rounded-lg p-1"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <button
          onClick={() => setActiveSection('theme')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor: activeSection === 'theme' ? 'var(--color-background)' : 'transparent',
            color: activeSection === 'theme' ? 'var(--color-text)' : 'var(--color-textMuted)',
          }}
        >
          <Palette className="w-3.5 h-3.5" />
          theme
        </button>
        <button
          onClick={() => setActiveSection('shortcuts')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor: activeSection === 'shortcuts' ? 'var(--color-background)' : 'transparent',
            color: activeSection === 'shortcuts' ? 'var(--color-text)' : 'var(--color-textMuted)',
          }}
        >
          <Keyboard className="w-3.5 h-3.5" />
          shortcuts
        </button>
        <button
          onClick={() => setActiveSection('help')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor: activeSection === 'help' ? 'var(--color-background)' : 'transparent',
            color: activeSection === 'help' ? 'var(--color-text)' : 'var(--color-textMuted)',
          }}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          help
        </button>
      </div>

      {/* theme section */}
      {activeSection === 'theme' && (
        <div className="space-y-3 slide-in-up">
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            choose your preferred theme
          </p>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(theme => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className="group relative flex items-center gap-3 p-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                    borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-borderHover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                >
                  {/* theme preview */}
                  <div
                    className="w-8 h-8 rounded-lg overflow-hidden border flex-shrink-0"
                    style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                  >
                    <div
                      className="h-1/2 flex items-center justify-end pr-1"
                      style={{ backgroundColor: theme.colors.background }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    <div
                      className="h-1/2"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                  </div>

                  {/* theme name */}
                  <span
                    className="text-sm flex-1 text-left"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {theme.name.toLowerCase()}
                  </span>

                  {/* selected indicator */}
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: theme.colors.accent }}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* shortcuts section */}
      {activeSection === 'shortcuts' && (
        <div className="space-y-3 slide-in-up">
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            keyboard shortcuts for quick actions
          </p>
          <div className="space-y-1">
            <ShortcutRow keys={['enter']} action="submit answer" />
            <ShortcutRow keys={['⌘', ',']} action="toggle settings" />
            <ShortcutRow keys={['esc']} action="close panel" />
          </div>
        </div>
      )}

      {/* help section */}
      {activeSection === 'help' && (
        <div className="space-y-4 slide-in-up">
          <div className="space-y-3">
            <HelpCard
              title="getting started"
              content="Take our quick 10-question assessment to discover your work style and values. We'll match you with startups that align with your culture preferences."
            />
            <HelpCard
              title="culture assessment"
              content="Answer questions about how you prefer to work, communicate, and what values matter most to you. Each question helps build your culture profile."
            />
            <HelpCard
              title="candidate dashboard"
              content="View all candidates who have completed assessments. Filter by score, search by name or email, and schedule coffee chats with potential matches."
            />
            <HelpCard
              title="coffee chats"
              content="Once you find a candidate that looks like a good fit, schedule a coffee chat to get to know them better and discuss potential opportunities."
            />
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              need more help? check out our documentation or contact support.
            </p>
            <button
              className="mt-2 text-xs flex items-center gap-1 transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              view documentation
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* danger zone */}
      <div
        className="pt-4 mt-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={onClearHistory}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs rounded-lg border transition-all"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-textMuted)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-error)';
            e.currentTarget.style.color = 'var(--color-error)';
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-textMuted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          clear all data
        </button>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div
      className="flex items-center justify-between p-2.5 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text)' }}>
        {action}
      </span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-textSecondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {key}
            </kbd>
            {i < keys.length - 1 && (
              <span className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                +
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function HelpCard({ title, content }: { title: string; content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {title}
        </span>
        <ChevronRight
          className="w-4 h-4 transition-transform"
          style={{
            color: 'var(--color-textMuted)',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {isExpanded && (
        <div
          className="px-3 pb-3 slide-in-up"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p
            className="text-xs pt-3 leading-relaxed"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
