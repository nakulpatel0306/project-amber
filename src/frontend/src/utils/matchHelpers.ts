/* ------------------------------------------------------------------ */
/*  Shared helpers for matching UI                                     */
/* ------------------------------------------------------------------ */

export function getMatchColor(score: number): string {
  if (score >= 85) return 'var(--color-score-excellent)';
  if (score >= 70) return 'var(--color-score-good)';
  if (score >= 55) return 'var(--color-score-fair)';
  return 'var(--color-score-low)';
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

const AVATAR_COLORS = [
  '#6366f1',
  '#f43f5e',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
];

export function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getBonusColor(bonus: number): string {
  if (bonus >= 5) return 'var(--color-success)';
  if (bonus >= 0) return 'var(--color-warning)';
  return 'var(--color-error)';
}

export function getBonusBg(bonus: number): string {
  if (bonus >= 5) return 'color-mix(in srgb, var(--color-success) 10%, transparent)';
  if (bonus >= 0) return 'color-mix(in srgb, var(--color-warning) 10%, transparent)';
  return 'color-mix(in srgb, var(--color-error) 10%, transparent)';
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
