import { motion } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import { cardGridContainer, cardItem } from '../../../utils/motion';
import type { EmployerResult, CandidateResult } from '../../../types/matching.types';

interface CandidateGridProps {
  mode: 'candidate';
  employers: EmployerResult[];
  savedIds: Set<string>;
  onDeepDive: (employer: EmployerResult) => void;
  onBrew: (employer: EmployerResult) => void;
  onToggleSave: (employer: EmployerResult) => void;
  isLoading?: boolean;
}

interface EmployerGridProps {
  mode: 'employer';
  candidates: CandidateResult[];
  savedIds: Set<string>;
  selectedIds?: Set<string>;
  showSelect?: boolean;
  onDeepDive: (candidate: CandidateResult) => void;
  onBrew: (candidate: CandidateResult) => void;
  onToggleSave: (candidate: CandidateResult) => void;
  onToggleSelect?: (candidate: CandidateResult) => void;
  isLoading?: boolean;
}

type PlayerCardGridProps = CandidateGridProps | EmployerGridProps;

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="p-5 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="w-24 h-4 rounded mb-1" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="w-32 h-3 rounded mb-2" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="w-20 h-4 rounded-full mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="w-16 h-16 rounded-full mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="flex gap-3 mb-3">
          <div className="w-12 h-6 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="w-12 h-6 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="w-12 h-6 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
      </div>
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (props.mode === 'candidate') {
    const { employers, savedIds, onDeepDive, onBrew, onToggleSave } = props;

    if (employers.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            No matches found. Try adjusting your filters.
          </p>
        </div>
      );
    }

    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={cardGridContainer}
        initial="hidden"
        animate="show"
      >
          {employers.map((employer, i) => (
            <motion.div key={employer.employerId} variants={cardItem}>
              <PlayerCard
                id={employer.employerId}
                name={employer.companyName}
                subtitle={employer.industry}
                archetype={employer.archetype}
                overallScore={employer.overallScore}
                cultureScore={employer.cultureScore}
                workStyleScore={employer.workStyleFit}
                traitScore={employer.traitScore}
                highlightPills={[]}
                index={i}
                isSaved={savedIds.has(employer.employerId)}
                onDeepDive={() => onDeepDive(employer)}
                onBrew={() => onBrew(employer)}
                onToggleSave={() => onToggleSave(employer)}
              />
            </motion.div>
          ))}
      </motion.div>
    );
  }

  // Employer mode
  const { candidates, savedIds, selectedIds, showSelect, onDeepDive, onBrew, onToggleSave, onToggleSelect } = props;

  if (candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          No candidates found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      variants={cardGridContainer}
      initial="hidden"
      animate="show"
    >
        {candidates.map((candidate, i) => (
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
              onDeepDive={() => onDeepDive(candidate)}
              onBrew={() => onBrew(candidate)}
              onToggleSave={() => onToggleSave(candidate)}
              onToggleSelect={() => onToggleSelect?.(candidate)}
            />
          </motion.div>
        ))}
    </motion.div>
  );
}
