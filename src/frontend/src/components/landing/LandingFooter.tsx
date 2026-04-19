import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { AmberLogo } from '../ui/AmberLogo';
import { APP_NAME } from '../../utils/constants';

const RESOURCE_LINKS: { label: string; href: string }[] = [
  { label: 'Blog', href: '/blog' },
  { label: 'The Science', href: '/science' },
  { label: 'Help Center', href: '/help' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export function LandingFooter() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer
      className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t"
      style={{
        backgroundColor: 'var(--color-backgroundSecondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main grid - Brand + Links + Newsletter all in one row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          {/* Brand - spans 2 cols on lg */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <AmberLogo size="sm" />
              <span
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {APP_NAME}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Where personality meets opportunity. We use the science of who you
              are to connect you with companies where you will genuinely thrive.
            </p>
          </div>
          {/* Product */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Product
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Personality Assessment', href: '/science', enabled: true },
                { label: 'Culture Matching', href: '/science', enabled: false },
                { label: 'Coffee Chats', href: '/auth/signup', enabled: false },
                { label: 'Pricing', href: '/pricing', enabled: true },
              ].map(item => (
                <li key={item.label}>
                  {item.enabled ? (
                    <Link
                      to={item.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="text-sm cursor-default"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              For Employers
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Post a Role' },
                { label: 'Browse Candidates' },
                { label: 'Culture Matching' },
                { label: 'Culture Assessment' },
              ].map(item => (
                <li key={item.label}>
                  <span
                    className="text-sm cursor-default"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Resources
            </h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Press', href: '/press' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-sm flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  Toronto, ON
                </span>
              </li>
              <li>
                <a
                  href="mailto:amberfounders@gmail.com"
                  className="text-sm flex items-center gap-2 transition-colors hover:underline"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  SEND US AN EMAIL
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Made with love in Toronto.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs hover:underline" style={{ color: 'var(--color-textMuted)' }}>
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs hover:underline" style={{ color: 'var(--color-textMuted)' }}>
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-xs hover:underline" style={{ color: 'var(--color-textMuted)' }}>
              Cookie Policy
            </Link>
            <Link to="/accessibility" className="text-xs hover:underline" style={{ color: 'var(--color-textMuted)' }}>
              Accessibility
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ color: 'var(--color-textMuted)' }}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
