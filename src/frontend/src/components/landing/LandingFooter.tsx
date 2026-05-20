import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Linkedin,
  Instagram,
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
            <div className="flex items-center gap-2 mb-3 -ml-1.5">
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
            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/theamberproject.ca/' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/the-amber-project' },
                { icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09Z" /></svg>, label: 'TikTok', href: 'https://www.tiktok.com/@theamberproject.ca?is_from_webapp=1&sender_device=pc' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textMuted)',
                  }}
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
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
                { label: 'Personality Assessment', href: '/science' },
                { label: 'Culture Matching', href: '/science' },
                { label: 'Coffee Chats', href: '/auth/signup' },
                { label: 'Pricing', href: '/pricing' },
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
                { label: 'Post a Role', href: '/auth/signup?role=employer' },
                { label: 'Browse Candidates', href: '/auth/signup?role=employer' },
                { label: 'Culture Matching', href: '/auth/signup?role=employer' },
                { label: 'Culture Assessment', href: '/auth/signup?role=employer' },
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
