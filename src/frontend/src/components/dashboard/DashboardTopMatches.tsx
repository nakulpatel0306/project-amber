import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LayoutGrid,
  List,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreRing } from '../ui/ScoreRing';
import { Button } from '../ui/Button';

interface TopMatch {
  company: string;
  role: string;
  matchScore: number;
  location: string;
  workStyle: string | null;
}

interface DashboardTopMatchesProps {
  topMatches: TopMatch[];
  hasCompletedAssessment: boolean;
}

export function DashboardTopMatches({ topMatches, hasCompletedAssessment }: DashboardTopMatchesProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : topMatches.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < topMatches.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="p-5 rounded-2xl border h-full flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Top Matches
        </h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => setViewMode('cards')}
              className="px-2 py-1 transition-colors duration-200"
              style={{
                backgroundColor: viewMode === 'cards' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'cards' ? 'white' : 'var(--color-textMuted)',
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-2 py-1 transition-colors duration-200"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--color-textMuted)',
              }}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <Link to="/app/matches" className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!hasCompletedAssessment ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-textMuted)' }}>
              Complete your assessment to see job matches
            </p>
          </div>
        ) : topMatches.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-textMuted)' }}>
              No matches available yet. Check back soon!
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View (carousel) */
          <div className="flex flex-col h-full">
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="p-5 rounded-xl"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  {topMatches[currentIndex] && (() => {
                    const match = topMatches[currentIndex];
                    return (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                              style={{
                                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              {match.company.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                                {match.role}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                                {match.company}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-textSecondary)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              <MapPin className="w-3 h-3" />
                              {match.location}
                            </span>
                            {match.workStyle && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{
                                  backgroundColor: 'var(--color-background)',
                                  color: 'var(--color-textSecondary)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                {match.workStyle}
                              </span>
                            )}
                          </div>
                          <Link to="/app/matches">
                            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                              View Match
                            </Button>
                          </Link>
                        </div>
                        <div className="flex-shrink-0">
                          <ScoreRing score={match.matchScore} size={72} />
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {topMatches.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textMuted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5">
                  {topMatches.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className="w-2 h-2 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: idx === currentIndex ? 'var(--color-accent)' : 'var(--color-border)',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textMuted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            {topMatches.map((match, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              >
                <Link
                  to="/app/matches"
                  className="p-3 rounded-lg flex items-center gap-3 hover:shadow-sm transition-shadow"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  {/* Rank badge */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: i < 3 ? 'rgba(217, 119, 6, 0.12)' : 'var(--color-background)',
                      color: i < 3 ? 'var(--color-accent)' : 'var(--color-textMuted)',
                      border: i < 3 ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {match.role}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        {match.company}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-3 h-3" />
                        {match.location}
                      </span>
                      {match.workStyle && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-textSecondary)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {match.workStyle}
                        </span>
                      )}
                    </div>
                  </div>

                  <ScoreRing score={match.matchScore} size={40} strokeWidth={2} fontSize="text-[10px]" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
