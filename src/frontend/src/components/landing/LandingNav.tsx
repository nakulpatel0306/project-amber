import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { AmberLogo } from '../ui/AmberLogo';
import { MagneticButton } from './MagneticButton';

export function LandingNav() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-6 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, var(--color-background) 40%, transparent)',
      }}
    >
      <div
        className="max-w-5xl mx-auto px-6 py-3 rounded-2xl border pointer-events-auto"
        style={{
          background: 'color-mix(in srgb, var(--color-surface) 70%, transparent)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="transition-transform group-hover:scale-110 group-hover:rotate-3">
              <AmberLogo size="sm" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Amber Project
            </span>
          </Link>

          {/* Theme toggle + Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-textSecondary)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <Link to="/app">
                <MagneticButton
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accentText)',
                  }}
                  strength={0.08}
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <MagneticButton
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accentText)',
                    }}
                    strength={0.08}
                  >
                    Get Started
                  </MagneticButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
