import { useState, useEffect } from 'react';
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
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.65-2.2.46-3.06-.4C3.79 16.17 4.36 9.02 8.8 8.76c1.28.06 2.17.72 2.92.76.99-.2 1.94-.78 3-.84 1.28-.08 2.24.38 2.87 1.14-2.63 1.56-2.01 5 .88 5.96-.52 1.36-1.18 2.7-2.42 4.5zM12.03 8.7c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor" />
      </svg>
    ),
    Meta: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M6.915 4.03c-1.544 0-2.87 1.207-3.912 3.128C1.948 9.182 1.5 11.587 1.5 13.5c0 1.336.326 2.472.955 3.268.609.77 1.465 1.182 2.475 1.182.965 0 1.84-.442 2.73-1.354.752-.77 1.527-1.855 2.34-3.244.552-.946 1.04-1.85 1.46-2.693L12 9.637l.54 1.022c.42.843.908 1.747 1.46 2.693.813 1.389 1.588 2.474 2.34 3.244.89.912 1.765 1.354 2.73 1.354 1.01 0 1.866-.412 2.475-1.182.629-.796.955-1.932.955-3.268 0-1.913-.448-4.318-1.503-6.342C19.955 5.237 18.63 4.03 17.085 4.03c-1.062 0-2.063.534-3.046 1.59-.713.767-1.39 1.756-2.039 2.937-.65-1.181-1.326-2.17-2.04-2.937C8.978 4.564 7.977 4.03 6.915 4.03z" fill="#0081FB" />
      </svg>
    ),
    Amazon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 0 1-.753.069c-1.06-.878-1.25-1.287-1.829-2.126-1.748 1.783-2.986 2.317-5.251 2.317C6.792 18.055 5 16.555 5 13.876c0-2.09 1.133-3.512 2.745-4.209 1.397-.616 3.349-.726 4.843-.896v-.334c0-.615.047-1.342-.314-1.873-.315-.471-.919-.666-1.452-.666-1.186 0-2.178.544-2.436 1.783-.113.213-.282.44-.53.44l-2.58-.278c-.11-.024-.232-.11-.2-.273C5.577 4.474 8.264 3.5 10.693 3.5c1.248 0 2.878.332 3.862 1.276 1.248 1.165 1.128 2.72 1.128 4.415v3.995c0 1.2.499 1.728.967 2.376.164.232.2.509-.01.681-.527.44-1.465 1.258-1.98 1.717l-.016-.165z" fill="currentColor" />
        <path d="M21.74 17.739C20.096 19.112 17.569 20 15.413 20c-3.052 0-5.8-1.13-7.877-3.01-.163-.147-.017-.348.179-.234 2.244 1.305 5.02 2.09 7.888 2.09 1.935 0 4.063-.4 6.022-1.232.295-.126.544.194.266.385l-.15.74z" fill="#FF9900" />
        <path d="M22.457 16.904c-.222-.284-1.47-.134-2.03-.068-.17.02-.196-.128-.042-.236 .995-.698 2.627-.497 2.817-.263.19.236-.05 1.882-.983 2.668-.143.121-.28.057-.216-.103.21-.521.68-1.688.454-1.998z" fill="#FF9900" />
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
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm0 0v24c1.873.225 2.81.312 4.715.398V0h-4.715zm13.204 0v23.97c-1.677-.197-3.32-.409-4.752-.601V24c3.261.398 6.263.795 9.752 1V0h-5z" fill="#E50914" />
      </svg>
    ),
    Stripe: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.038c0 4.3 2.867 5.882 5.907 7.079 1.986.78 2.93 1.39 2.93 2.426 0 .942-.79 1.525-2.262 1.525-1.86 0-4.87-.964-6.853-2.233L2.52 21.394C4.112 22.533 7.263 24 10.73 24c2.638 0 4.815-.672 6.348-1.94 1.675-1.382 2.49-3.24 2.49-5.53.026-4.41-2.91-5.966-5.592-7.38z" fill="#635BFF" />
      </svg>
    ),
    Shopify: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M15.337 1.138s-.248.074-.66.203c-.39-.95-.854-1.727-1.558-1.727-.03 0-.06 0-.09.003C12.7.213 12.32 0 11.988 0c-2.39 0-3.536 2.985-3.894 4.504l-1.85.573C5.78 5.22 5.727 5.273 5.672 5.726L4.097 18.91 14.46 21l5.543-1.198S15.394 1.237 15.337 1.138zM11.07 3.534c-.005.002-.91.282-1.7.525.338-1.298 1.073-2.48 2.026-2.786a5.49 5.49 0 0 0-.326 2.261zm1.385-2.598c.11 0 .22.037.327.107-.986.465-2.044 1.637-2.49 3.977l-1.916.594c.52-1.74 1.77-4.678 4.079-4.678zm.581 12.48s-.782-.424-1.738-.424c-1.406 0-1.475.882-1.475 1.104 0 1.213 3.163 1.678 3.163 4.524 0 2.239-1.42 3.68-3.336 3.68-2.3 0-3.474-1.431-3.474-1.431l.615-2.034s1.21 1.04 2.232 1.04c.667 0 .94-.525.94-.908 0-1.585-2.596-1.657-2.596-4.263 0-2.192 1.573-4.314 4.753-4.314.962 0 1.63.301 1.63.301l-.914 2.725z" fill="#95BF47" />
        <path d="M15.337 1.138s-.248.074-.66.203c-.39-.95-.854-1.727-1.558-1.727-.03 0-.06 0-.09.003L14.46 21l5.543-1.198S15.394 1.237 15.337 1.138z" fill="#5E8E3E" />
      </svg>
    ),
    Spotify: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-.991-.12-1.111-.6-.12-.48.12-.99.6-1.111 4.38-1.32 9.78-.66 13.5 1.62.36.181.54.78.211 1.17zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954" />
      </svg>
    ),
    Airbnb: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12.001 18.275c-.94-1.303-1.752-2.607-2.477-3.782-.838-1.375-1.609-2.81-1.96-4.207-.256-.982-.243-1.86.08-2.614.332-.775.88-1.327 1.588-1.6.332-.128.68-.192 1.034-.192h.004c.356 0 .707.064 1.038.196.712.276 1.256.828 1.584 1.596.32.75.336 1.63.08 2.614-.355 1.4-1.12 2.832-1.96 4.207-.72 1.175-1.536 2.479-2.476 3.782h.465zm7.614.576c-.108.836-.578 1.576-1.296 2.04-.47.304-.997.46-1.54.46-.36 0-.72-.076-1.072-.228-.652-.282-1.24-.758-1.791-1.353 1.018-1.376 1.868-2.738 2.616-3.96.83-1.36 1.616-2.832 2.024-4.408.336-1.283.344-2.487-.02-3.552-.365-.99-1.065-1.761-1.935-2.101-.608-.256-1.256-.388-1.925-.388h-.004c-.668 0-1.316.132-1.924.388-.868.34-1.568 1.11-1.933 2.1-.364 1.066-.356 2.27-.02 3.553.408 1.576 1.196 3.048 2.024 4.408.756 1.235 1.605 2.584 2.616 3.96-.552.595-1.14 1.071-1.792 1.353-.348.152-.708.228-1.068.228-.544 0-1.072-.156-1.54-.46-.72-.464-1.192-1.204-1.3-2.04-.048-.424-.024-.904.08-1.44l-.008.004C8.904 15.78 7.14 13.43 6.24 11.1c-.6-1.56-.72-3.06-.36-4.44.36-1.32 1.14-2.46 2.28-3.18C9.36 2.58 10.68 2.1 12 2.1s2.64.48 3.84 1.38c1.14.72 1.92 1.86 2.28 3.18.36 1.38.24 2.88-.36 4.44-.9 2.33-2.664 4.68-4.74 7.23l-.008-.004c.104.536.128 1.016.08 1.44l.004.004.515.003z" fill="#FF5A5F" />
      </svg>
    ),
    Slack: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M5.042 15.166a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.166a2.528 2.528 0 0 1 2.522-2.524h2.52v2.524zm1.268 0a2.528 2.528 0 0 1 2.522-2.524 2.528 2.528 0 0 1 2.522 2.524v6.312A2.528 2.528 0 0 1 8.832 24a2.528 2.528 0 0 1-2.522-2.522v-6.312z" fill="#E01E5A" />
        <path d="M8.832 5.042a2.528 2.528 0 0 1-2.522-2.52A2.528 2.528 0 0 1 8.832 0a2.528 2.528 0 0 1 2.522 2.522v2.52H8.832zm0 1.268a2.528 2.528 0 0 1 2.522 2.522 2.528 2.528 0 0 1-2.522 2.522H2.522A2.528 2.528 0 0 1 0 8.832a2.528 2.528 0 0 1 2.522-2.522h6.31z" fill="#36C5F0" />
        <path d="M18.958 8.832a2.528 2.528 0 0 1 2.52-2.522A2.528 2.528 0 0 1 24 8.832a2.528 2.528 0 0 1-2.522 2.522h-2.52V8.832zm-1.268 0a2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.522-2.522V2.522A2.528 2.528 0 0 1 15.168 0a2.528 2.528 0 0 1 2.522 2.522v6.31z" fill="#2EB67D" />
        <path d="M15.168 18.958a2.528 2.528 0 0 1 2.522 2.52A2.528 2.528 0 0 1 15.168 24a2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zm0-1.268a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.522h6.31A2.528 2.528 0 0 1 24 15.168a2.528 2.528 0 0 1-2.522 2.522h-6.31z" fill="#ECB22E" />
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
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.43c-.466.047-.56.28-.374.466l1.823 1.312zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.933-.234-1.494-.934l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.234 4.764 7.28v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933l3.222-.187zM2.31 1.234l13.59-1c1.68-.14 2.1.094 3.13.84l4.31 3.032c.699.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.046-1.448-.094-1.96-.747l-3.127-4.066c-.56-.747-.793-1.306-.793-1.96V2.874c0-.84.373-1.54 1.354-1.64z" fill="currentColor" />
      </svg>
    ),
    Vercel: (
      <svg viewBox="0 0 24 21" className="h-5 w-6" style={{ color: 'var(--color-text)' }}>
        <polygon points="12,0 24,21 0,21" fill="currentColor" />
      </svg>
    ),
    Datadog: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M19.098 16.378l-1.32-1.192-1.399.93-.564-.678 1.205-1.186-.698-.815-1.263.792-.556-.607.982-.94-.628-.565-1.083.94c-.243-.255-.49-.413-.737-.538l.195-1.47-.94-.333-.22 1.318c-.317-.02-.65.04-.98.168L9.989 9.62l-.674.523 1.12 1.473-.372.352-1.505-.982-.603.705 1.38 1.23-.27.37-1.67-.778-.39.74 1.63 1.062c-.127.414-.195.85-.178 1.31l-1.677.447.127.983 1.587-.223c.15.495.39.967.716 1.4l-1.254 1.29.69.672 1.17-1.19c.452.358.974.612 1.543.744l.247 1.704h.98l.135-1.646c.555-.05 1.079-.24 1.558-.526l1.15 1.17.733-.708-1.085-1.13c.37-.38.656-.83.845-1.33l1.636.41.24-.954-1.605-.555c.046-.38.024-.768-.065-1.15l1.527-.65-.34-.906zm-5.1 3.987c-1.992.387-3.903-.913-4.27-2.904-.366-1.99.916-3.902 2.907-4.29 1.992-.386 3.904.915 4.27 2.906.367 1.99-.915 3.901-2.906 4.288z" fill="#632CA6" />
      </svg>
    ),
    Tesla: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.627-1.587-7.715-1.587S4.433 6.828 4.287 8.267c0 0-2.15-.802-3.233-2.438C5.28 3.865 9.525 3.775 9.525 3.775L12 5.362zm0 2.129s-2.344-.067-3.654-.539l-.626 1.242s1.66.676 4.28.676c2.62 0 4.28-.676 4.28-.676l-.626-1.242C14.344 7.424 12 7.49 12 7.49zm0 2.138L10.028 24h1.167l.805-8.566L12 24l.805-8.566L12 24h1.167L11.195 9.63z" fill="#E82127" />
      </svg>
    ),
    Nvidia: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M8.948 8.798v-1.43c.217-.017.438-.03.663-.03 3.479 0 5.931 2.778 5.931 2.778s-2.745 3.179-5.654 3.179c-.33 0-.644-.04-.94-.108V9.168c1.753.088 2.1.588 3.168 2.106l2.35-1.975s-1.742-1.854-4.427-1.854c-.374 0-.737.033-1.09.102v1.25zm0 6.283v1.362c-4.036-.567-5.27-4.484-5.27-4.484s1.922-2.636 5.27-3.066v1.49c-2.073.318-3.562 1.674-3.562 1.674s1.05 2.175 3.562 3.024zm0-7.63V5.967c-5.152.6-6.836 4.266-6.836 4.266s2.42 4.058 6.836 4.74V13.56c-3.498-.437-5.07-3.363-5.07-3.363s1.727-2.21 5.07-2.746zm6.956-.754s-3.14-3.4-7.503-3.4c-.516 0-1.015.05-1.5.132V2.094l.398-.031c6.304-.153 10.84 5.12 10.84 5.12s-3.2 6.126-8.83 6.126c-.324 0-.636-.02-.94-.053v-1.463c.266.032.536.05.812.05 3.735 0 6.723-3.946 6.723-3.946z" fill="#76B900" />
      </svg>
    ),
    Uber: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.876 0 1.602-.34 2.072-.907v.78h1.47V7.97H5.07v4.874c0 1.164-.702 1.89-1.726 1.89-1.018 0-1.728-.738-1.728-1.89V7.97H0zm14.87 0v8.862h1.478v-.792c.468.564 1.194.918 2.076.918 1.984 0 3.576-1.69 3.576-3.876 0-2.187-1.592-3.877-3.576-3.877-.882 0-1.608.336-2.076.9V7.97h-1.478zm-5.148 0c-2.07 0-3.702 1.673-3.702 3.876 0 2.272 1.716 3.877 3.84 3.877 1.206 0 2.268-.498 2.988-1.38l-1.08-.804c-.468.552-1.134.882-1.86.882-1.266 0-2.196-.846-2.382-2.028h5.652c.036-.21.048-.432.048-.66 0-2.132-1.518-3.763-3.504-3.763zm7.062 1.29c1.26 0 2.19 1.05 2.19 2.587 0 1.536-.93 2.586-2.19 2.586-1.23 0-2.19-1.086-2.19-2.586s.96-2.586 2.19-2.586zm-7.014-.012c1.092 0 1.974.726 2.148 1.824H7.632c.186-1.086 1.044-1.824 2.138-1.824z" fill="currentColor" />
      </svg>
    ),
    Coinbase: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <circle cx="12" cy="12" r="12" fill="#0052FF" />
        <path d="M12.017 15.402c-1.876 0-3.398-1.522-3.398-3.398s1.522-3.398 3.398-3.398c1.614 0 2.966 1.127 3.313 2.636h3.44C18.37 7.666 15.488 5.4 12.017 5.4A6.603 6.603 0 0 0 5.413 12a6.603 6.603 0 0 0 6.604 6.6c3.471 0 6.353-2.266 6.753-5.842h-3.44c-.347 1.509-1.699 2.644-3.313 2.644z" fill="#fff" />
      </svg>
    ),
    Canva: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.14 14.428c-.327.84-1.24 1.837-2.508 1.837-.468 0-.864-.168-1.14-.456-.684-.72-.54-1.884-.132-3.144.396-1.2 1.236-2.76 2.652-2.76.408 0 .756.156.984.444.588.744.468 2.472.144 4.079zM12 2.4c5.292 0 9.6 4.308 9.6 9.6 0 .72-.084 1.416-.24 2.088-.204-.108-.504-.204-.852-.204-.636 0-1.248.36-1.752.732.012-.108.024-.216.024-.324 0-1.2-.588-2.016-1.596-2.016-1.668 0-2.976 1.668-3.48 3.24-.24.744-.624 2.208-.024 3.012.216.288.528.468.912.552-.84.132-1.716.204-2.592.204-5.292 0-9.6-4.308-9.6-9.6S6.708 2.4 12 2.4z" fill="#00C4CC" />
      </svg>
    ),
    Linear: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M2.1 13.67a10.2 10.2 0 0 0 8.24 8.24L2.1 13.67zM1.56 11.03a10.22 10.22 0 0 0 11.42 11.42L1.56 11.03zM12.98 22.44A10.22 10.22 0 0 0 22.44 12.98L12.98 22.44zM22.79 10.93A10.24 10.24 0 0 0 13.07 1.2l9.72 9.73zM10.4 1.56L22.44 13.6A10.22 10.22 0 0 0 10.4 1.56z" fill="#5E6AD2" />
      </svg>
    ),
    Wealthsimple: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm-1.424-7.09l2.752-7.627-.07-.007h-2.15l-1.7 5.09-1.727-5.09H5.527l3.158 7.634h1.891zm5.02 0l2.876-7.627-.044-.007h-2.164l-2.78 7.634h2.112z" fill="currentColor" />
      </svg>
    ),
    OpenAI: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 10.696 0a6.074 6.074 0 0 0-5.812 4.312 6.044 6.044 0 0 0-4.04 2.9 6.09 6.09 0 0 0 .748 7.09 5.985 5.985 0 0 0 .518 4.911 6.046 6.046 0 0 0 6.51 2.9A6.065 6.065 0 0 0 13.304 24a6.074 6.074 0 0 0 5.812-4.312 6.044 6.044 0 0 0 4.04-2.9 6.09 6.09 0 0 0-.748-7.09l-.126.123zM13.304 22.45a4.528 4.528 0 0 1-2.912-1.057l.145-.083 4.834-2.79a.788.788 0 0 0 .396-.683v-6.814l2.043 1.18a.073.073 0 0 1 .04.056v5.64a4.546 4.546 0 0 1-4.546 4.55zM3.68 18.315a4.51 4.51 0 0 1-.54-3.04l.145.087 4.834 2.79a.778.778 0 0 0 .782 0l5.904-3.408v2.361a.073.073 0 0 1-.03.061l-4.889 2.822a4.546 4.546 0 0 1-6.206-1.673zM2.393 7.877a4.528 4.528 0 0 1 2.363-1.987l-.002.169v5.58a.778.778 0 0 0 .39.675l5.904 3.408-2.043 1.18a.073.073 0 0 1-.068.005L4.049 14.085a4.546 4.546 0 0 1-1.656-6.208zM18.95 11.72l-5.904-3.408L15.09 7.13a.073.073 0 0 1 .068-.005l4.889 2.822a4.547 4.547 0 0 1-.701 8.195v-5.749a.778.778 0 0 0-.396-.673zM21.06 8.945l-.144-.088-4.834-2.79a.778.778 0 0 0-.782 0l-5.904 3.408V7.114a.073.073 0 0 1 .03-.061l4.889-2.822a4.547 4.547 0 0 1 6.745 4.714zM7.67 13.72l-2.043-1.18a.073.073 0 0 1-.04-.056V6.845a4.547 4.547 0 0 1 7.453-3.49l-.145.083-4.834 2.79a.788.788 0 0 0-.396.683l.005 6.809z" fill="currentColor" />
      </svg>
    ),
    Databricks: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M12 2L1.5 8.1v2.6L12 4.6l10.5 6.1V8.1L12 2z" fill="#FF3621" />
        <path d="M12 8.2L1.5 14.3v2.6L12 10.8l10.5 6.1v-2.6L12 8.2z" fill="#FF3621" />
        <path d="M12 14.4L1.5 20.5 12 26.6l10.5-6.1L12 14.4zM12 14.4L1.5 20.5 12 22l10.5-1.5L12 14.4z" fill="#FF3621" />
      </svg>
    ),
    Plaid: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" style={{ color: 'var(--color-text)' }}>
        <path d="M9.268 1.393H6.392L4.53 3.268V6.17l1.862 1.875h2.876L11.13 6.17V3.268L9.268 1.393zm4.862 0h-2.876L9.392 3.268V6.17l1.862 1.875h2.876l1.862-1.875V3.268L14.13 1.393zm4.862 0h-2.876l-1.862 1.875V6.17l1.862 1.875h2.876L20.855 6.17V3.268L18.992 1.393zM9.268 6.255H6.392L4.53 8.13v2.902l1.862 1.875h2.876l1.862-1.875V8.13L9.268 6.255zm4.862 0h-2.876L9.392 8.13v2.902l1.862 1.875h2.876l1.862-1.875V8.13L14.13 6.255zm4.862 0h-2.876l-1.862 1.875v2.902l1.862 1.875h2.876l1.862-1.875V8.13l-1.862-1.875zM9.268 11.117H6.392L4.53 12.992v2.902l1.862 1.875h2.876l1.862-1.875v-2.902L9.268 11.117zm4.862 0h-2.876l-1.862 1.875v2.902l1.862 1.875h2.876l1.862-1.875v-2.902l-1.862-1.875zm4.862 0h-2.876l-1.862 1.875v2.902l1.862 1.875h2.876l1.862-1.875v-2.902l-1.862-1.875z" fill="currentColor" opacity=".85" />
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

const demoTraits = [
  { label: 'Openness', value: 82, color: '#8B5CF6' },
  { label: 'Conscientiousness', value: 71, color: '#F59E0B' },
  { label: 'Extraversion', value: 64, color: '#10B981' },
  { label: 'Agreeableness', value: 88, color: '#EC4899' },
  { label: 'Neuroticism', value: 35, color: '#06B6D4' },
];

const demoMatches = [
  { company: 'Notion', role: 'Product Designer', score: 94, color: '#8B5CF6' },
  { company: 'Stripe', role: 'Frontend Engineer', score: 89, color: '#635BFF' },
  { company: 'Spotify', role: 'UX Researcher', score: 85, color: '#1DB954' },
];

const demoChatMessages = [
  { from: 'employer', text: "Hey! We loved your personality profile. Free for a coffee chat this week?", delay: 0 },
  { from: 'candidate', text: "Absolutely! I'd love to learn more about the team culture.", delay: 1 },
  { from: 'employer', text: "Amazing — how's Thursday at 2pm? We'll keep it casual ☕", delay: 2 },
];

function ProductDemo() {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Decorative glow */}
      <div
        className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl -z-10"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6, #10B981)',
        }}
      />

      {/* Browser chrome frame */}
      <div
        className="rounded-2xl border overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div
            className="flex-1 text-center text-xs font-medium"
            style={{ color: 'var(--color-textMuted)' }}
          >
            app.tryamber.com
          </div>
        </div>

        {/* Screen content */}
        <div className="relative h-72 sm:h-80 overflow-hidden">
          {/* Screen 1: Assessment */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-opacity duration-500"
            style={{ opacity: activeScreen === 0 ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Your OCEAN Profile
              </span>
            </div>
            <div className="space-y-3">
              {demoTraits.map((trait, i) => (
                <div key={trait.label} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium w-28 sm:w-36 text-right"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {trait.label}
                  </span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div
                      className="h-full rounded-full animate-bar-fill"
                      style={{
                        '--bar-width': `${trait.value}%`,
                        backgroundColor: trait.color,
                        animationDelay: `${i * 200}ms`,
                        animationPlayState: activeScreen === 0 ? 'running' : 'paused',
                        width: activeScreen === 0 ? `${trait.value}%` : '0%',
                      } as React.CSSProperties}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-8"
                    style={{ color: trait.color }}
                  >
                    {trait.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Screen 2: Matches */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-opacity duration-500"
            style={{ opacity: activeScreen === 1 ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4" style={{ color: '#10B981' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Your Top Matches
              </span>
            </div>
            <div className="space-y-3">
              {demoMatches.map((match, i) => (
                <div
                  key={match.company}
                  className="flex items-center gap-4 p-3 rounded-xl border"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    opacity: activeScreen === 1 ? 1 : 0,
                    transform: activeScreen === 1 ? 'translateX(0)' : 'translateX(30px)',
                    transition: `all 0.5s ease-out ${i * 200}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: match.color }}
                  >
                    {match.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {match.company}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-textMuted)' }}>
                      {match.role}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: `${match.color}15`, color: match.color }}
                  >
                    Great Fit
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Screen 3: Coffee Chat */}
          <div
            className="absolute inset-0 p-6 sm:p-8 transition-opacity duration-500"
            style={{ opacity: activeScreen === 2 ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Coffee className="w-4 h-4" style={{ color: '#EC4899' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Coffee Chat
              </span>
            </div>
            <div className="space-y-3">
              {demoChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    opacity: activeScreen === 2 ? 1 : 0,
                    transform: activeScreen === 2 ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
                    transition: `all 0.4s ease-out ${i * 400}ms`,
                  }}
                >
                  <div
                    className="max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed"
                    style={{
                      backgroundColor: msg.from === 'candidate' ? 'var(--color-accent)' : 'var(--color-background)',
                      color: msg.from === 'candidate' ? 'var(--color-accentText)' : 'var(--color-text)',
                      borderBottomRightRadius: msg.from === 'candidate' ? '4px' : undefined,
                      borderBottomLeftRadius: msg.from === 'employer' ? '4px' : undefined,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Screen indicator dots */}
        <div className="flex justify-center gap-2 pb-4">
          {['Assessment', 'Matches', 'Coffee Chat'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveScreen(i)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                backgroundColor: activeScreen === i ? 'var(--color-accent)' : 'var(--color-background)',
                color: activeScreen === i ? 'var(--color-accentText)' : 'var(--color-textMuted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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

      {/* Product Demo Animation */}
      <ScrollSection>
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-center text-sm font-medium mb-8 tracking-wide uppercase"
              style={{ color: 'var(--color-textMuted)', letterSpacing: '0.1em' }}
            >
              See How It Works
            </p>
            <ProductDemo />
          </div>
        </section>
      </ScrollSection>

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
