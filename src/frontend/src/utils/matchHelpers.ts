/* ------------------------------------------------------------------ */
/*  Shared helpers for matching UI                                     */
/* ------------------------------------------------------------------ */

export function getMatchColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 55) return 'var(--color-warning)';
  return 'var(--color-textMuted)';
}

export function generateHighlightPills(match: {
  cultureMatchScore: number;
  traitMatchScore: number;
  breakdown: { workStyleFit: number; valuesFit: number };
}): string[] {
  const pills: string[] = [];
  if (match.cultureMatchScore >= 80) pills.push('Strong Culture Fit');
  if (match.breakdown.valuesFit >= 75) pills.push('Values Aligned');
  if (match.breakdown.workStyleFit >= 85) pills.push('Work Style Match');
  if (match.traitMatchScore >= 80) pills.push('Personality Match');
  return pills.slice(0, 3);
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #d946ef)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
];

export function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getBonusColor(bonus: number): string {
  if (bonus >= 5) return '#10b981';
  if (bonus >= 0) return '#f59e0b';
  return '#ef4444';
}

export function getBonusBg(bonus: number): string {
  if (bonus >= 5) return 'rgba(16, 185, 129, 0.1)';
  if (bonus >= 0) return 'rgba(245, 158, 11, 0.1)';
  return 'rgba(239, 68, 68, 0.1)';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Low';
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not specified';
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}
