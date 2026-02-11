import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  Heart,
  Target,
  Coffee,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Brain,
  MessageCircle,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { AmberLogo } from '../ui/AmberLogo';
import { EmberFirefly } from '../ember/EmberFirefly';
import { APP_NAME } from '../../utils/constants';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import {
  FloatingThemeSelector,
  FAQAccordion,
  CursorSpotlight,
  FloatingCoffeeBeans,
  MagneticButton,
  TiltCard,
  ScrollProgress,
  AnimatedBlobs,
  InteractiveGreeting,
  TypewriterText,
} from '.';

const typewriterWords = [
  'Your Personality',
  'Your Values',
  'Your Work Style',
  'Your Culture',
];

const processSteps = [
  {
    number: '01',
    title: 'Take the Assessment',
    description: 'Our Big Five personality assessment reveals your unique work style, values, and preferences in just 15 minutes.',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'Get Matched by AI',
    description: 'Our AI analyzes your profile against company cultures to find roles where you\'ll truly thrive.',
    icon: Target,
    color: '#10B981',
  },
  {
    number: '03',
    title: 'Connect Over Coffee',
    description: 'Skip the formal interviews. Have genuine conversations with teams before committing.',
    icon: Coffee,
    color: '#8B5CF6',
  },
  {
    number: '04',
    title: 'Land Your Role',
    description: 'Join companies that value who you are, not just what you do. Culture fit guaranteed.',
    icon: Award,
    color: '#EC4899',
  },
];

const valueProps = [
  {
    icon: Brain,
    title: 'Science-Backed Matching',
    description: 'Built on the Big Five personality model — the most validated framework in organizational psychology.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Our AI doesn\'t just match keywords. It understands personality dynamics and team culture fit.',
    color: '#F59E0B',
  },
  {
    icon: Coffee,
    title: 'Coffee Chats, Not Interviews',
    description: 'Casual conversations replace cold applications. Meet teams authentically before applying.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your personality data stays yours. Control exactly what employers see and when.',
    color: '#EC4899',
  },
];

// Full-colour company logos + name labels for the marquee
// Dark logos use currentColor so they adapt to light/dark themes
function CompanyLogo({ name }: { name: string }) {
  const logos: Record<string, React.ReactNode> = {
    Google: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
    Apple: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor" />
      </svg>
    ),
    Meta: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M6.92 4C4.56 4 2.83 6.5 2.83 9.5c0 1.8.5 3.5 1.4 4.7L12 4.6c-1-.3-2.2-.6-3.5-.6h-1.6z" fill="#0081FB" />
        <path d="M21.17 9.5c0-3-2-5.5-4.25-5.5-1 0-2 .2-3 .5l6.5 10.2c.5-1.3.75-3 .75-5.2z" fill="#0081FB" />
        <path d="M12 5.5L5.5 17.3c1 .5 2.2.7 3.5.7h6c1.3 0 2.5-.2 3.5-.7L12 5.5z" fill="#0064E0" />
      </svg>
    ),
    Amazon: (
      <svg viewBox="0 0 24 16" className="h-5 w-auto">
        <path d="M14.17 11.62c-3.66 2.42-8.97 3.71-13.54 3.71-.64 0-1.27-.04-1.88-.12l-.09.06c.34.3.93.5 1.26.5 4.04 0 7.97-1.4 11.06-3.76.16-.12.32-.24.47-.38.49-.42.38-.62-.06-.43-.44.18-.92.37-1.41.55z" fill="#FF9900" />
        <path d="M15.73 13.22c-.34-.45-2.26-.21-3.12-.11-.26.03-.3-.2-.07-.36 1.53-1.08 4.04-.77 4.33-.41.29.37-.08 2.93-1.51 4.15-.22.19-.43.09-.33-.16.32-.8 1.04-2.67.7-3.11z" fill="#FF9900" />
        <text x="0" y="9" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="-0.3" style={{ fill: 'var(--color-text)' }}>amazon</text>
      </svg>
    ),
    Microsoft: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
      </svg>
    ),
    Netflix: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M5.4 1h4.44l4.8 13.3V1h3.96v22h-3.96L9.84 9.36V23H5.4V1z" fill="#E50914" />
      </svg>
    ),
    Stripe: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M13.98 10.28c0-1.17-.57-2.1-1.98-2.1-.69 0-1.16.14-1.5.3v4.18c.38.19.7.24 1.1.24 1.3 0 2.38-1.05 2.38-2.62zM24 12c0 6.63-5.37 12-12 12S0 18.63 0 12 5.37 0 12 0s12 5.37 12 12zm-8.05-1.85c0 2.74-1.92 4.57-4.68 4.57-.74 0-1.4-.12-1.82-.35v3.16l-2.4.51V7.28c.7-.34 1.9-.62 3.37-.62 3.07 0 5.53 1.66 5.53 3.49z" fill="#635BFF" />
      </svg>
    ),
    Shopify: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M20.5 3.6c-.02-.14-.14-.23-.27-.24-.13-.01-2.72-.2-2.72-.2s-1.8-1.78-2-1.97a.67.67 0 0 0-.46-.18L13.5 23.5l7-1.52S20.53 3.75 20.5 3.6zm-5.96-.64l-.88.27-.52-1.27c-.3-.72-.82-1.1-1.38-1.1-.04 0-.07 0-.11.01l-.2-.27c-.35-.37-.8-.55-1.32-.52C8.43.27 6.88 2.12 6.25 4.47l-2 .62c-.62.2-.64.21-.72.8-.06.44-1.68 12.97-1.68 12.97L14.5 21.5l-.02-18.54h.06zm-3.21.99L9.2 4.6c.55-1.7 1.6-2.52 2.54-2.73-.24.56-.45 1.37-.41 2.08zm-1.8-2.7c.08 0 .16.02.23.05-.96.45-2 1.58-2.43 3.84l-1.58.49c.47-1.75 1.68-4.33 3.78-4.38z" fill="#95BF47" />
        <path d="M20.23 3.36c-.13-.01-2.72-.2-2.72-.2s-1.8-1.78-2-1.97a.37.37 0 0 0-.18-.1L13.5 23.5l7-1.52S20.53 3.75 20.5 3.6c-.02-.14-.14-.23-.27-.24z" fill="#5E8E3E" />
      </svg>
    ),
    Spotify: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.99-.12-1.14-.6-.12-.48.12-.99.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.2-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.36z" fill="#1DB954" />
      </svg>
    ),
    Airbnb: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 0C8.36 3.6 5.04 7.56 5.04 10.92c0 2.4 1.08 4.32 2.76 5.52-.12.36-.24.6-.36.84-.24.48-.48.84-.48 1.32 0 .84.6 1.44 1.44 1.44.48 0 .84-.12 1.2-.48.24.12.48.12.72.12h3.36c.24 0 .48 0 .72-.12.36.36.72.48 1.2.48.84 0 1.44-.6 1.44-1.44 0-.48-.24-.84-.48-1.32-.12-.24-.24-.48-.36-.84 1.68-1.2 2.76-3.12 2.76-5.52C18.96 7.56 15.64 3.6 12 0z" fill="#FF5A5F" />
      </svg>
    ),
    Slack: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M5.04 15.04a2.5 2.5 0 0 1-2.52 2.48A2.5 2.5 0 0 1 0 15.04a2.5 2.5 0 0 1 2.52-2.48h2.52v2.48zm1.28 0a2.5 2.5 0 0 1 2.52-2.48 2.5 2.5 0 0 1 2.52 2.48v6.24a2.5 2.5 0 0 1-2.52 2.48 2.5 2.5 0 0 1-2.52-2.48v-6.24z" fill="#E01E5A" />
        <path d="M8.84 5.04a2.5 2.5 0 0 1-2.52-2.48A2.5 2.5 0 0 1 8.84.08a2.5 2.5 0 0 1 2.52 2.48v2.48H8.84zm0 1.28a2.5 2.5 0 0 1 2.52 2.52 2.5 2.5 0 0 1-2.52 2.52H2.52A2.5 2.5 0 0 1 0 8.84a2.5 2.5 0 0 1 2.52-2.52h6.32z" fill="#36C5F0" />
        <path d="M18.96 8.84a2.5 2.5 0 0 1 2.52-2.52A2.5 2.5 0 0 1 24 8.84a2.5 2.5 0 0 1-2.52 2.52h-2.52V8.84zm-1.28 0a2.5 2.5 0 0 1-2.52 2.52 2.5 2.5 0 0 1-2.52-2.52V2.52A2.5 2.5 0 0 1 15.16 0a2.5 2.5 0 0 1 2.52 2.52v6.32z" fill="#2EB67D" />
        <path d="M15.16 18.96a2.5 2.5 0 0 1 2.52 2.52A2.5 2.5 0 0 1 15.16 24a2.5 2.5 0 0 1-2.52-2.52v-2.52h2.52zm0-1.28a2.5 2.5 0 0 1-2.52-2.52 2.5 2.5 0 0 1 2.52-2.52h6.32A2.5 2.5 0 0 1 24 15.16a2.5 2.5 0 0 1-2.52 2.52h-6.32z" fill="#ECB22E" />
      </svg>
    ),
    Figma: (
      <svg viewBox="0 0 16 24" className="h-6 w-auto">
        <path d="M4 24a4 4 0 0 0 4-4v-4H4a4 4 0 0 0 0 8z" fill="#0ACF83" />
        <path d="M0 12a4 4 0 0 1 4-4h4v8H4a4 4 0 0 1-4-4z" fill="#A259FF" />
        <path d="M0 4a4 4 0 0 1 4-4h4v8H4a4 4 0 0 1-4-4z" fill="#F24E1E" />
        <path d="M8 0h4a4 4 0 0 1 0 8H8V0z" fill="#FF7262" />
        <circle cx="12" cy="12" r="4" fill="#1ABCFE" />
      </svg>
    ),
    Notion: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M4.46 1.6l12.67-.96c.38-.03.47.07.5.1l2.14 1.5c.23.17.3.2.3.4v17.22c0 .4-.15.65-.62.68l-14.7.87c-.35.02-.52-.04-.7-.26L1.72 18c-.2-.27-.28-.47-.28-.7V2.63c0-.34.15-.63.53-.67l2.49-.36z" fill="var(--color-background)" stroke="currentColor" strokeWidth=".8" />
        <path d="M9.5 5.43v12.47c0 .45.2.63.6.6l9.5-.57c.4-.02.45-.27.45-.64V5.6c0-.37-.14-.56-.47-.53l-9.93.6c-.37.02-.15.37-.15.76z" fill="currentColor" />
      </svg>
    ),
    Vercel: (
      <svg viewBox="0 0 24 21" className="h-5 w-6" style={{ color: 'var(--color-text)' }}>
        <polygon points="12,0 24,21 0,21" fill="currentColor" />
      </svg>
    ),
    Datadog: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M18.09 11.77l-1.08-1.76-2.06.97-.76-1.27 2.14-1.3-.84-1.38-2.16 1.29-.45-.74 1.63-1.57-.82-.62-1.37 1.52c-.36-.25-.76-.43-1.18-.52l.33-2H9.36l.25 2.02c-.4.1-.79.3-1.12.55L7.23 5.49l-.84.58 1.52 1.61-.5.76-2.09-1.21-.84 1.38 2.14 1.29-.3.72-2.3-.77-.47 1.54 2.36.82c-.04.24-.06.48-.06.73 0 .85.25 1.64.67 2.31l-1.75 1.58.95.93 1.6-1.58c.75.63 1.7 1.02 2.74 1.06l.13 2.05h1.33l.13-2.1a4.3 4.3 0 0 0 2.5-1.17l1.8 1.27.83-1.04-1.71-1.32c.4-.72.64-1.55.64-2.44 0-.46-.06-.9-.18-1.32l2.07-.98zm-6.05 4.2a2.78 2.78 0 1 1 0-5.56 2.78 2.78 0 0 1 0 5.56z" fill="#632CA6" />
      </svg>
    ),
    Tesla: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 1L1.5 5.5C4.5 4.2 8 3.5 12 3.5s7.5.7 10.5 2L12 1zm0 4c-3.3 0-6.3.5-8.8 1.5L12 23l8.8-16.5C18.3 5.5 15.3 5 12 5z" fill="#CC0000" />
      </svg>
    ),
    Nvidia: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M8.95 8.57C11.4 8.2 13.26 9.7 13.26 9.7s-1.83 2.24-3.68 2.24c-.42 0-.82-.1-1.13-.32V8.66l.5-.09zm-1.63-.3v5.91c0 0 .56.42 1.9.42 3.16 0 5.58-3.14 5.58-3.14s-2.04-2.9-5.2-3.44c-.8-.14-1.55-.06-2.28.25zm10.25.15c-1.45-1.49-3.6-2.2-3.6-2.2s.24-.68.24-1.44c0-.63-.18-1.06-.18-1.06 2.86.35 5.32 2.7 5.32 2.7s-3.5 4.2-7.14 4.2c-.38 0-.74-.04-1.07-.12v-1.39c.36.1.71.15 1.04.15 2.37 0 5.4-1.84 5.4-1.84zM3.75 8.38s2-2.15 5.57-2.55v-1.3C5.86 4.96 3.75 8.38 3.75 8.38z" fill="#76B900" />
      </svg>
    ),
    Uber: (
      <svg viewBox="0 0 24 24" className="h-5 w-auto" style={{ color: 'var(--color-text)' }}>
        <text x="0" y="18" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5" fill="currentColor">Uber</text>
      </svg>
    ),
    Coinbase: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <circle cx="12" cy="12" r="12" fill="#0052FF" />
        <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 5.2-3.75h-2.4A3.25 3.25 0 0 1 12 15.25a3.25 3.25 0 0 1-2.8-1.5A3.25 3.25 0 0 1 12 8.75c1 0 1.93.47 2.53 1.22h2.53A5.5 5.5 0 0 0 12 6.5z" fill="#fff" />
      </svg>
    ),
    Canva: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <circle cx="12" cy="12" r="12" fill="#00C4CC" />
        <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-.5 9.5c-2 0-3.5-1.6-3.5-3.5s1.5-3.5 3.5-3.5c1 0 1.8.4 2.4 1l-1 1c-.4-.4-.9-.6-1.4-.6-1.3 0-2.2 1-2.2 2.2s.9 2.2 2.2 2.2c1 0 1.6-.5 1.8-1.2H11.5v-1.2h3.3c0 .2.1.4.1.7 0 1.7-1.2 3-3.4 3z" fill="#fff" />
      </svg>
    ),
    Linear: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M2.1 13.67a10.2 10.2 0 0 0 8.24 8.24L2.1 13.67zM1.56 11.03a10.22 10.22 0 0 0 11.42 11.42L1.56 11.03zM12.98 22.44A10.22 10.22 0 0 0 22.44 12.98L12.98 22.44zM22.79 10.93A10.24 10.24 0 0 0 13.07 1.2l9.72 9.73zM10.4 1.56L22.44 13.6A10.22 10.22 0 0 0 10.4 1.56z" fill="#5E6AD2" />
      </svg>
    ),
    Wealthsimple: (
      <svg viewBox="0 0 120 24" className="h-5 w-auto" style={{ color: 'var(--color-text)' }}>
        <rect width="24" height="24" rx="5" fill="#FFD84D" />
        <text x="6" y="17.5" fontSize="14" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#1A1A1A">W</text>
        <text x="30" y="17" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif" fill="currentColor">Wealthsimple</text>
      </svg>
    ),
    OpenAI: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M22.28 9.37a6.06 6.06 0 0 0-.52-4.97 6.12 6.12 0 0 0-6.6-2.94A6.06 6.06 0 0 0 10.58 0a6.12 6.12 0 0 0-5.83 4.23 6.06 6.06 0 0 0-4.05 2.94 6.12 6.12 0 0 0 .75 7.16 6.06 6.06 0 0 0 .52 4.97A6.12 6.12 0 0 0 8.58 22.24 6.06 6.06 0 0 0 13.15 24a6.12 6.12 0 0 0 5.83-4.23 6.06 6.06 0 0 0 4.05-2.94 6.12 6.12 0 0 0-.75-7.16zM13.15 22.4a4.54 4.54 0 0 1-2.92-1.06l.15-.08 4.85-2.8a.79.79 0 0 0 .4-.69v-6.83l2.05 1.18a.07.07 0 0 1 .04.06v5.66a4.56 4.56 0 0 1-4.57 4.56zM3.68 18.3a4.53 4.53 0 0 1-.54-3.05l.15.09 4.85 2.8a.79.79 0 0 0 .78 0l5.92-3.42v2.37a.07.07 0 0 1-.03.06l-4.9 2.83a4.56 4.56 0 0 1-6.23-1.68zM2.38 7.89a4.53 4.53 0 0 1 2.38-2l0 .17v5.6a.79.79 0 0 0 .4.69l5.92 3.42-2.05 1.18a.07.07 0 0 1-.07 0l-4.9-2.83A4.56 4.56 0 0 1 2.38 7.89zm16.6 3.87l-5.92-3.42 2.05-1.18a.07.07 0 0 1 .07 0l4.9 2.83a4.56 4.56 0 0 1-.7 8.22v-5.76a.79.79 0 0 0-.4-.69zM21.1 9.03l-.15-.09-4.85-2.8a.79.79 0 0 0-.78 0l-5.92 3.42V7.19a.07.07 0 0 1 .03-.06l4.9-2.83a4.56 4.56 0 0 1 6.77 4.73zM7.63 13.72L5.58 12.54a.07.07 0 0 1-.04-.06V6.82A4.56 4.56 0 0 1 13.02 4.1l-.15.08-4.85 2.8a.79.79 0 0 0-.4.69v6.83z" fill="#10A37F" />
      </svg>
    ),
    Databricks: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 1L1 7l11 6 11-6L12 1z" fill="#FF3621" />
        <path d="M1 12l11 6 11-6" fill="#FF3621" opacity=".7" />
        <path d="M1 17l11 6 11-6" fill="#FF3621" opacity=".4" />
      </svg>
    ),
    Plaid: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="17" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".35" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".35" />
        <rect x="17" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="1" y="17" width="6" height="6" rx="1" fill="currentColor" opacity=".35" />
        <rect x="9" y="17" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="17" y="17" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {logos[name] || null}
      <span className="text-[10px] font-medium" style={{ color: 'var(--color-textMuted)' }}>
        {name}
      </span>
    </div>
  );
}

const COMPANY_LIST = [
  'Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Nvidia', 'Tesla',
  'Stripe', 'Shopify', 'Spotify', 'Airbnb', 'Uber', 'Coinbase', 'Databricks', 'OpenAI',
  'Slack', 'Figma', 'Notion', 'Linear', 'Canva', 'Vercel', 'Plaid', 'Wealthsimple', 'Datadog',
];

const OUR_VALUES = [
  {
    number: '01',
    title: 'Personality Over Paper',
    description: 'We believe who you are matters more than what\'s on your resume. Your personality, values, and work style predict job satisfaction better than any transcript or GPA ever could. The era of judging candidates by grades and credentials is over.',
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'Authenticity First',
    description: 'No cover letter gymnastics. No keyword stuffing. Just be yourself. Our assessments have no right or wrong answers — only honest ones that lead to better matches. We reward being real, not performing.',
    color: '#8B5CF6',
  },
  {
    number: '03',
    title: 'Science, Not Buzzwords',
    description: 'Built on the Big Five personality model with 40+ years of peer-reviewed research. Every match is grounded in organizational psychology, not gut feelings or vague "culture fit" labels.',
    color: '#10B981',
  },
  {
    number: '04',
    title: 'Conversations Over Applications',
    description: 'Coffee chats replace cold applications. Meet real people on real teams before you ever commit. Building connections should feel human, not transactional. A 15-minute chat tells you more than a 15-page application.',
    color: '#EC4899',
  },
  {
    number: '05',
    title: 'Your Data, Your Rules',
    description: 'Your personality data belongs to you. Full control over what employers can see, when they can see it, and the power to revoke access at any time. Privacy isn\'t a feature — it\'s a right.',
    color: '#06B6D4',
  },
];

const forCandidates = [
  { text: 'Discover your unique work personality', icon: Sparkles },
  { text: 'Get matched based on culture, not keywords', icon: Heart },
  { text: 'See compatibility scores before applying', icon: Target },
  { text: 'Schedule casual coffee chats with teams', icon: Coffee },
];

const forEmployers = [
  { text: 'Define your company culture scientifically', icon: Zap },
  { text: 'Get your Top 10 candidates on a silver platter', icon: Trophy },
  { text: 'AI-ranked candidates by personality fit', icon: TrendingUp },
  { text: 'Reduce turnover with better culture matches', icon: Shield },
];

function Trophy(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <Award {...props} />;
}

const faqItems = [
  {
    question: 'How does the culture matching actually work?',
    answer: 'Our AI analyzes your Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) and compares them with company culture profiles. We look at team dynamics, work style preferences, and values alignment to calculate a compatibility score that predicts how well you\'ll fit.',
  },
  {
    question: 'Is Amber free for job seekers?',
    answer: 'Yes! Our free tier lets you take the assessment, browse matches, and connect with employers. Premium plans unlock features like unlimited coffee chats, priority matching, and personalized Ember coaching.',
  },
  {
    question: 'What makes the Big Five assessment special?',
    answer: 'The Big Five is the most scientifically validated personality framework used by psychologists worldwide. Unlike other tests, it measures stable traits that predict workplace behavior and satisfaction. Our assessment is designed specifically for career matching.',
  },
  {
    question: 'What are coffee chats and how do they work?',
    answer: 'Coffee chats are informal 15-30 minute conversations with team members. No pressure, no formal interview questions. Just genuine conversation to see if there\'s mutual interest. Companies can invite you, or you can request them after matching.',
  },
  {
    question: 'How is this different from LinkedIn or job boards?',
    answer: 'Traditional job platforms match based on skills and keywords. Amber matches based on who you are — your personality, values, and work style. We believe culture fit predicts job satisfaction better than a resume ever could.',
  },
];

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-animate ${isVisible ? 'visible'  : ''} ${className}`}>
      {children}
    </div>
  );
}

function ValueCard({ value, index }: { value: typeof OUR_VALUES[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`scroll-animate ${isVisible ? 'visible' : ''}`}
    >
      <div
        className="max-w-5xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}>
          {/* Number */}
          <div className="flex-shrink-0">
            <div
              className="text-8xl sm:text-9xl font-black select-none"
              style={{ color: value.color, lineHeight: 1, opacity: 0.35 }}
            >
              {value.number}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-xl">
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: value.color }}
            />
            <h3
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {value.title}
            </h3>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {value.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Background Effects */}
      <AnimatedBlobs />
      <FloatingCoffeeBeans />
      <CursorSpotlight />
      <ScrollProgress />
      <FloatingThemeSelector />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <div
          className="max-w-5xl mx-auto px-6 py-3 rounded-2xl border"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="transition-transform group-hover:scale-110 group-hover:rotate-3">
                <AmberLogo size="sm" />
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {APP_NAME}
              </span>
            </Link>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/app">
                  <MagneticButton
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accentText)',
                    }}
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

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Interactive Greeting */}
          <div className="mb-8">
            <InteractiveGreeting />
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-slide-up"
            style={{ color: 'var(--color-text)' }}
          >
            Find Jobs That Fit{' '}
            <span className="block mt-2">
              <TypewriterText
                words={typewriterWords}
                className="animate-gradient-text"
              />
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-200"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Your personality says more about you than any resume ever could.
            We match you with companies where you'll actually thrive — based on who you are, not what's on paper.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-300">
            <Link to="/auth/signup">
              <MagneticButton
                className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 animate-glow-pulse"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.2}
              >
                Start Free Assessment
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
            <Link to="/auth/signup?role=employer">
              <MagneticButton
                className="px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 border-2"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                }}
                strength={0.2}
              >
                <Briefcase className="w-5 h-5" />
                I'm Hiring
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Recruiters From These Companies */}
      <ScrollSection>
        <section className="py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-center text-sm font-medium mb-8 tracking-wide uppercase"
              style={{ color: 'var(--color-textMuted)', letterSpacing: '0.1em' }}
            >
              Recruiters From Leading Companies
            </p>
            <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <div className="flex items-center animate-marquee" style={{ width: 'max-content' }}>
                {/* Duplicate the logos for seamless loop */}
                {[...COMPANY_LIST, ...COMPANY_LIST].map((name, i) => (
                  <div
                    key={`${name}-${i}`}
                    className="flex items-center justify-center px-8 py-3 flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <CompanyLogo name={name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Why Amber - Value Props */}
      <ScrollSection>
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {valueProps.map((prop) => (
                <TiltCard
                  key={prop.title}
                  className="p-6 rounded-2xl border cursor-default"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  tiltAmount={5}
                >
                  <div
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${prop.color}15` }}
                  >
                    <prop.icon className="w-6 h-6" style={{ color: prop.color }} />
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {prop.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {prop.description}
                  </p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* How It Works - Process Steps */}
      <ScrollSection>
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                From Assessment to Offer in 4 Steps
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Our process is designed to be fast, insightful, and actually enjoyable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processSteps.map((step) => (
                <TiltCard
                  key={step.number}
                  className="p-8 rounded-3xl border cursor-default"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  tiltAmount={5}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <div>
                      <div
                        className="text-xs font-mono font-bold mb-2"
                        style={{ color: step.color }}
                      >
                        {step.number}
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Meet Ember - AI Agent Section */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div
              className="p-10 sm:p-14 rounded-3xl border relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute top-0 right-0 w-60 h-60 opacity-10 rounded-full blur-3xl"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-40 h-40 opacity-5 rounded-full blur-3xl"
                style={{ backgroundColor: '#8B5CF6' }}
              />

              <div className="relative flex flex-col lg:flex-row items-center gap-10">
                {/* Ember Firefly */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <EmberFirefly size="xl" mood="happy" animated />
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-md"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.3)' }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center lg:text-left">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </div>

                  <h2
                    className="text-3xl sm:text-4xl font-bold mb-4"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Meet Ember
                  </h2>
                  <p
                    className="text-lg mb-6 max-w-xl"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    Your personal AI career companion. Ember analyzes personality data, identifies your
                    archetype, and finds matches you'd never discover on your own.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Brain className="w-5 h-5 mb-2" style={{ color: '#8B5CF6' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Personality Analysis
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Deep archetype mapping
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <MessageCircle className="w-5 h-5 mb-2" style={{ color: '#10B981' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Smart Matching
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Culture-first recommendations
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Coffee className="w-5 h-5 mb-2" style={{ color: '#EC4899' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Coffee Chats
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                        Casual team conversations
                      </p>
                    </div>
                  </div>

                  <Link to="/auth/signup">
                    <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Try Ember Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Our Values - Wealthsimple-style scroll */}
      <section
        style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
      >
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              What We Believe
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              We're building a world where your personality opens more doors than your pedigree.
            </p>
          </div>
        </div>

        {OUR_VALUES.map((value, index) => (
          <ValueCard key={value.number} value={value} index={index} />
        ))}
      </section>

      {/* Two-Sided Value Props */}
      <ScrollSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Built for Both Sides
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Whether you're looking for your next role or your next hire, Amber works for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Candidates */}
              <TiltCard
                className="p-10 rounded-3xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Users className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: 'var(--color-text)' }}
                  >
                    For Job Seekers
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {forCandidates.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup">
                    <MagneticButton
                      className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      Find Your Match
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>

              {/* For Employers */}
              <TiltCard
                className="p-10 rounded-3xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                tiltAmount={3}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl"
                  style={{ backgroundColor: 'var(--color-accentHover)' }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <Briefcase className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: 'var(--color-text)' }}
                  >
                    For Employers
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {forEmployers.map(item => (
                      <li key={item.text} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup?role=employer">
                    <MagneticButton
                      className="w-full py-4 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Start Hiring Smarter
                    </MagneticButton>
                  </Link>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* FAQ Section */}
      <ScrollSection>
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Got Questions?
              </h2>
              <p style={{ color: 'var(--color-textSecondary)' }}>
                Here are some answers to help you get started.
              </p>
            </div>

            <div
              className="p-8 rounded-3xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Final CTA */}
      <ScrollSection>
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <EmberFirefly size="lg" mood="excited" animated />
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Ready to Find Where You Belong?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Discover your personality profile and get matched with companies
              that value who you are. It starts with a 15-minute assessment.
            </p>

            <Link to="/auth/signup">
              <MagneticButton
                className="px-10 py-5 rounded-2xl text-lg font-semibold inline-flex items-center gap-3 animate-glow-pulse"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.15}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
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
                  { label: 'Top 10 Matches', href: '/auth/signup?role=employer' },
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
                {[
                  'Blog',
                  'The Science',
                  'Help Center',
                  'API Docs',
                  'Status',
                ].map(label => (
                  <li key={label}>
                    <span
                      className="text-sm cursor-pointer transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {label}
                    </span>
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
                  'About Us',
                  'Careers',
                  'Press',
                ].map(label => (
                  <li key={label}>
                    <span
                      className="text-sm cursor-pointer transition-colors hover:underline"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      {label}
                    </span>
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
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Privacy Policy
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Terms of Service
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Cookie Policy
              </span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--color-textMuted)' }}>
                Accessibility
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
