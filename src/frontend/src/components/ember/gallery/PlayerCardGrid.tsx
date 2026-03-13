import { motion } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import { cardGridContainer, cardItem } from '../../../utils/motion';
import type { EmployerResult, CandidateResult } from '../../../types/matching.types';
import type { ConnectionStatus } from '../../../types/connections.types';

interface CandidateGridProps {
  mode: 'candidate';
  employers: EmployerResult[];
  savedIds: Set<string>;
  getConnectionStatus?: (userId: string) => ConnectionStatus;
  onDeepDive: (employer: EmployerResult) => void;
  onBrew: (employer: EmployerResult) => void;
  onToggleSave: (employer: EmployerResult) => void;
  onConnect?: (employer: EmployerResult) => void;
  isLoading?: boolean;
}

interface EmployerGridProps {
  mode: 'employer';
  candidates: CandidateResult[];
  savedIds: Set<string>;
  selectedIds?: Set<string>;
  showSelect?: boolean;
  getConnectionStatus?: (userId: string) => ConnectionStatus;
  onDeepDive: (candidate: CandidateResult) => void;
  onBrew: (candidate: CandidateResult) => void;
  onToggleSave: (candidate: CandidateResult) => void;
  onToggleSelect?: (candidate: CandidateResult) => void;
  onConnect?: (candidate: CandidateResult) => void;
  isLoading?: boolean;
}

type PlayerCardGridProps = CandidateGridProps | EmployerGridProps;

function SkeletonCard() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="w-28 h-4 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="w-20 h-3 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="h-1.5 rounded-full w-5/6" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
      </div>
      <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex gap-2">
          <div className="flex-1 h-7 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex-1 h-7 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

export function PlayerCardGrid(props: PlayerCardGridProps) {
  const isLoading = props.isLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (props.mode === 'candidate') {
    const { employers, savedIds, getConnectionStatus, onDeepDive, onBrew, onToggleSave, onConnect } = props;

    if (employers.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            No matches found. Try adjusting your filters.
          </p>
        </div>
      );
    }

    // Key changes when the list changes so Framer re-triggers stagger
    const gridKey = employers.map(e => e.employerId).join(',');

    return (
      <motion.div
        key={gridKey}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        variants={cardGridContainer}
        initial="hidden"
        animate="show"
      >
          {employers.map((employer, i) => {
            const connStatus = getConnectionStatus?.(employer.userId) || 'none';
            return (
              <motion.div key={employer.employerId} variants={cardItem}>
                <PlayerCard
                  id={employer.employerId}
                  name={employer.profileName}
                  subtitle={employer.companyName}
                  archetype={employer.archetype}
                  overallScore={employer.overallScore}
                  cultureScore={employer.cultureScore}
                  workStyleScore={employer.workStyleFit}
                  traitScore={employer.traitScore}
                  avatarUrl={employer.logoUrl}
                  highlightPills={[]}
                  index={i}
                  isSaved={savedIds.has(employer.employerId)}
                  connectionStatus={connStatus}
                  onDeepDive={() => onDeepDive(employer)}
                  onBrew={() => onBrew(employer)}
                  onToggleSave={() => onToggleSave(employer)}
                  onConnect={() => onConnect?.(employer)}
                />
              </motion.div>
            );
          })}
      </motion.div>
    );
  }

  // Employer mode
  const { candidates, savedIds, selectedIds, showSelect, getConnectionStatus, onDeepDive, onBrew, onToggleSave, onToggleSelect, onConnect } = props;

  if (candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          No candidates found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  const gridKey = candidates.map(c => c.candidateId).join(',');

  return (
    <motion.div
      key={gridKey}
      className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      variants={cardGridContainer}
      initial="hidden"
      animate="show"
    >
        {candidates.map((candidate, i) => {
          const connStatus = getConnectionStatus?.(candidate.userId) || 'none';
          return (
            <motion.div key={candidate.candidateId} variants={cardItem}>
              <PlayerCard
                id={candidate.candidateId}
                name={candidate.name}
                subtitle={candidate.headline}
                archetype={candidate.archetype}
                overallScore={candidate.overallScore}
                cultureScore={candidate.cultureScore}
                workStyleScore={candidate.workStyleFit}
                traitScore={candidate.traitScore}
                highlightPills={[]}
                index={i}
                isSaved={savedIds.has(candidate.candidateId)}
                isSelected={selectedIds?.has(candidate.candidateId)}
                showSelect={showSelect}
                connectionStatus={connStatus}
                onDeepDive={() => onDeepDive(candidate)}
                onBrew={() => onBrew(candidate)}
                onToggleSave={() => onToggleSave(candidate)}
                onToggleSelect={() => onToggleSelect?.(candidate)}
                onConnect={() => onConnect?.(candidate)}
              />
            </motion.div>
          );
        })}
    </motion.div>
  );
}
