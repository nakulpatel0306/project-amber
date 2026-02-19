import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from 'lucide-react';
import { AmberLogo } from '../ui/AmberLogo';
import { APP_NAME } from '../../utils/constants';

const RESOURCE_LINKS: { label: string; href: string }[] = [
  { label: 'Blog', href: '/blog' },
  { label: 'The Science', href: '/science' },
  { label: 'Help Center', href: '/help' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export function LandingFooter() {
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
              Culture-first job matching powered by personality science and AI.
              Who you are matters more than what's on your resume.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Github, label: 'GitHub' },
              ].map(social => (
                <button
                  key={social.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textMuted)',
                  }}
                  title={social.label}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </button>
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
                { label: 'Personality Assessment', href: '/auth/signup' },
                { label: 'Culture Matching', href: '/auth/signup' },
                { label: 'Coffee Chats', href: '/auth/signup' },
                { label: 'Meet Ember', href: '/auth/signup' },
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
                { label: 'Best Matches', href: '/auth/signup?role=employer' },
                { label: 'Pricing', href: '/app/pricing' },
                { label: 'Enterprise', href: '/auth/signup?role=employer' },
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
                <span className="text-sm flex items-center gap-2" style={{ color: 'var(--color-textSecondary)' }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  hello@tryamber.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter - compact row */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 rounded-xl"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div>
            <h4
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              Stay in the Loop
            </h4>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Personality science, hiring trends, and product updates.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 sm:w-56 px-4 py-2 rounded-lg text-sm border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accentText)',
              }}
            >
              Subscribe
            </button>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
