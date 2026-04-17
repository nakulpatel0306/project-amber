import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SUFFIX = 'Amber | Culture Match';

/**
 * Maps a URL path → page title.
 * Exact paths checked first; then prefix matches.
 */
const EXACT: Record<string, string> = {
  '/': '',
  '/blog': 'Blog',
  '/science': 'Science',
  '/help': 'Help Center',
  '/changelog': 'Changelog',
  '/status': 'Status',
  '/about': 'About',
  '/careers': 'Careers',
  '/press': 'Press',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/cookies': 'Cookie Policy',
  '/accessibility': 'Accessibility',
  '/auth/login': 'Sign In',
  '/auth/signup': 'Sign Up',
  '/auth/forgot-password': 'Reset Password',
  '/auth/callback': 'Signing In',
  '/auth/select-role': 'Choose Your Role',
  '/auth/verify-email': 'Verify Email',
  '/auth/onboarding': 'Welcome',
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/app/assessment': 'Assessment',
  '/app/insights': 'Insights',
  '/app/ember': 'Ember',
  '/app/matches': 'Matches',
  '/app/coffee-chats': 'Coffee Chats',
  '/app/chats': 'Coffee Chats',
  '/app/network': 'Network',
  '/app/practice': 'Practice',
  '/app/settings': 'Settings',
  '/app/pricing': 'Pricing',
  '/app/employer/dashboard': 'Employer Dashboard',
  '/app/employer/culture-quiz': 'Culture Quiz',
  '/app/employer/culture': 'Culture Insights',
  '/app/employer/roles': 'Manage Roles',
  '/app/employer/roles/create': 'Create Role',
  '/app/employer/candidates': 'Candidates',
  '/app/employer/coffee-chats': 'Coffee Chats',
  '/app/employer/ember': 'Ember',
};

/**
 * Prefix-to-title fallback for dynamic routes.
 * Order matters — longer prefixes first.
 */
const PREFIXES: Array<[string, string]> = [
  ['/blog/', 'Blog'],
  ['/app/assessments/', 'Assessment'],
  ['/app/matches/', 'Match'],
  ['/app/ember/', 'Ember'],
  ['/app/billing/', 'Billing'],
  ['/app/employer/roles/', 'Role'],
  ['/app/employer/', 'Employer'],
  ['/auth/', 'Auth'],
  ['/app/', 'Amber'],
];

function titleFor(path: string): string {
  if (path in EXACT) return EXACT[path];
  for (const [prefix, label] of PREFIXES) {
    if (path.startsWith(prefix)) return label;
  }
  return '';
}

export function RouteTitleSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = titleFor(pathname);
    document.title = page ? `${page} · ${SUFFIX}` : SUFFIX;
  }, [pathname]);

  return null;
}
