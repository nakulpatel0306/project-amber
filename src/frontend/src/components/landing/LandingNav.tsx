import { Link } from 'react-router-dom';
import { AmberLogo } from '../ui/AmberLogo';
import { MagneticButton } from './MagneticButton';

export function LandingNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-6 pointer-events-none"
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
              <AmberLogo size="md" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Amber Project
            </span>
          </Link>

          {/* Coming Soon badge */}
          <div className="flex items-center gap-3">
            <MagneticButton
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accentText)',
              }}
              strength={0.08}
            >
              Coming Soon
            </MagneticButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
