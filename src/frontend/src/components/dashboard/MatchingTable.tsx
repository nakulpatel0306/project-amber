import { PersonalityPolygon } from './PersonalityPolygon';

interface MatchRow {
  company: string;
  role: string;
  matchScore: number;
  location: string;
  workStyle: string | null;
}

interface MatchingTableProps {
  matches: MatchRow[];
  hasCompletedAssessment: boolean;
}

function getTraitsFromScore(score: number): string[] {
  if (score >= 90) return ['Exceptional Fit', 'Culture Aligned', 'Top Match'];
  if (score >= 80) return ['Strong Fit', 'Collaborative'];
  if (score >= 70) return ['Good Fit', 'Adaptable'];
  if (score >= 60) return ['Moderate Fit'];
  return ['Exploring'];
}

function getStatusInfo(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Confirmed', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' };
  if (score >= 70) return { label: 'Reviewed', color: 'var(--color-accent)', bg: 'rgba(240, 144, 48, 0.1)' };
  return { label: 'Pending', color: 'var(--color-textMuted)', bg: 'rgba(85, 85, 85, 0.15)' };
}

// Generate pseudo-OCEAN scores from match score for polygon visualization
function generateOceanFromMatch(score: number, companyName: string): number[] {
  let seed = companyName.length * 17 + score;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  return Array.from({ length: 5 }, () => {
    const base = score * 0.7 + rand() * 30;
    return Math.min(100, Math.max(20, base));
  });
}

export function MatchingTable({ matches, hasCompletedAssessment }: MatchingTableProps) {
  if (!hasCompletedAssessment) {
    return (
      <div className="bento-card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--color-text)' }}
        >
          Top Personality Matches
        </h3>
        <p
          className="text-sm text-center py-8"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Complete your personality assessment to see matched roles
        </p>
      </div>
    );
  }

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Top Personality Matches
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Role', 'Match Score', 'Core Traits', 'Work Style', 'Status'].map(header => (
                <th
                  key={header}
                  className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  No matches found yet
                </td>
              </tr>
            ) : (
              matches.map((match, i) => {
                const traits = getTraitsFromScore(match.matchScore);
                const status = getStatusInfo(match.matchScore);
                const oceanScores = generateOceanFromMatch(match.matchScore, match.company);

                return (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-[var(--color-surfaceHover)]"
                    style={{
                      borderBottom: i < matches.length - 1 ? '1px solid var(--color-border)' : undefined,
                      backgroundColor: i % 2 === 1 ? 'var(--color-background)' : undefined,
                    }}
                  >
                    {/* Role + Company */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                          style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'var(--color-accentText)',
                          }}
                        >
                          {match.company.charAt(0)}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {match.role}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            {match.company} · {match.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Match Score + Polygon */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <PersonalityPolygon scores={oceanScores} size={28} />
                        <span
                          className="text-sm font-bold"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {match.matchScore}%
                        </span>
                      </div>
                    </td>

                    {/* Core Traits */}
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {traits.map(trait => (
                          <span
                            key={trait}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: 'var(--color-surfaceHover)',
                              color: 'var(--color-textSecondary)',
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Work Style */}
                    <td className="px-5 py-3">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-textSecondary)' }}
                      >
                        {match.workStyle || 'Flexible'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
