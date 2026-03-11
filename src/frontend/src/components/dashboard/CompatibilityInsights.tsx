import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

interface CompatibilityInsightsProps {
  strengths?: string[];
  growthAreas?: string[];
  tips?: string[];
  viewerRole?: 'candidate' | 'employer';
}

const dailyInsights = [
  {
    short: 'Bold thinkers attract even bolder companies.',
    headline: 'Your curiosity draws companies that value bold, original thinking.',
    detail: 'Companies with innovation-driven cultures see your openness to experience as a top trait. You naturally gravitate toward novel challenges and teams that value experimentation will thrive with you.',
  },
  {
    short: 'Where real structure meets raw creativity.',
    headline: 'You blend structure with creativity, a rare and valuable combination.',
    detail: 'Your unique blend of conscientiousness and openness is rare. Employers see someone who can dream big and deliver on time, the kind of person who turns ideas into shipped products.',
  },
  {
    short: 'You lead with empathy over ego every time.',
    headline: 'Teams trust you because you lead with empathy, not ego.',
    detail: 'Your agreeableness score signals strong emotional intelligence. Companies building collaborative cultures rank you highly. You\'re the glue that holds high-performing teams together.',
  },
  {
    short: 'Calm composure when the pressure is on.',
    headline: 'Your composure under pressure is something employers notice first.',
    detail: 'Your emotional stability stands out. Startups and fast-paced environments value your ability to stay grounded when things get chaotic. You bring clarity when others feel overwhelmed.',
  },
  {
    short: 'You naturally connect people across every team.',
    headline: 'You connect people across teams and that makes you irreplaceable.',
    detail: 'Your extraversion paired with agreeableness makes you a bridge between teams. Companies with cross-functional workflows see you as someone who can align engineering, design, and business.',
  },
  {
    short: 'Deep focus is your quiet and rare superpower.',
    headline: 'Deep, focused work is your superpower and companies need that.',
    detail: 'Your profile suggests you thrive in focused, autonomous environments. Companies offering deep work time and minimal meetings will unlock your best output.',
  },
  {
    short: 'You see what most others completely miss.',
    headline: 'You notice patterns and hidden possibilities that others easily walk right past.',
    detail: 'High openness combined with low neuroticism means you can explore unconventional solutions without anxiety. This makes you ideal for R&D, product strategy, or greenfield projects.',
  },
  {
    short: 'Reliability is your strongest personal brand.',
    headline: 'Reliability is your personal brand and it speaks louder than words.',
    detail: 'Your conscientiousness score tells employers they can count on you. In a world of missed deadlines and scope creep, you\'re the person who actually ships.',
  },
  {
    short: 'You make every single team around you better.',
    headline: 'You make the people around you better, and teams compete for that.',
    detail: 'Your personality profile indicates a multiplier effect. You elevate everyone around you. Companies with strong team cultures will fight to have you on board.',
  },
  {
    short: 'Growth is deeply woven into your DNA.',
    headline: 'Growth runs through everything you do, and employers value that deeply.',
    detail: 'Your openness to experience means you\'re always learning. Employers see someone who will adapt as roles evolve and technology shifts. That kind of growth mindset is irreplaceable.',
  },
  {
    short: 'You bridge the gaps others simply cannot.',
    headline: 'Your communication style bridges gaps that others simply cannot close.',
    detail: 'Your blend of extraversion and agreeableness creates a communication style that bridges gaps. Teams with diverse perspectives need someone like you to find common ground.',
  },
  {
    short: 'Big picture vision with a clear roadmap.',
    headline: 'You see the big picture and build the roadmap to get there.',
    detail: 'High conscientiousness paired with openness means you can both envision the future and build the roadmap to get there. That\'s a rare and valuable combination.',
  },
  {
    short: 'Your resilience truly sets you apart from others.',
    headline: 'Your resilience in competitive environments sets you apart from the crowd.',
    detail: 'Your emotional stability means you recover quickly from setbacks. In competitive industries, this resilience is what separates good careers from great ones.',
  },
  {
    short: 'Your energy lifts every team around you.',
    headline: 'Your energy lifts entire teams, and companies feel it from the first conversation.',
    detail: 'High extraversion doesn\'t just mean you\'re social, it means you bring momentum. Companies see you as someone who can rally a team and maintain enthusiasm through tough sprints.',
  },
];

const employerDailyInsights = [
  {
    short: 'Your culture is a magnet for self-starters.',
    headline: 'Autonomous cultures attract candidates who ship without supervision.',
    detail: 'Your preference for low micromanagement and high ownership signals to candidates that you trust your people. Self-directed builders see this and apply before you even post the role.',
  },
  {
    short: 'Hire for curiosity, not just credentials.',
    headline: 'Candidates with high openness outperform on ambiguous problems.',
    detail: 'Credentials confirm what someone has done. Curiosity predicts what they will do next. Prioritize openness to experience when evaluating candidates for roles that require creative problem-solving.',
  },
  {
    short: 'Your best hire is already on your shortlist.',
    headline: 'Top matches often surface early — trust the compatibility signal.',
    detail: 'Data shows that the strongest culture-fit candidates tend to appear in your first batch of applicants. Resist the urge to wait for a bigger pool. Review your top matches today.',
  },
  {
    short: 'Retention starts before the offer letter.',
    headline: 'Candidates who feel seen during hiring stay longer after they join.',
    detail: 'The hiring experience is the first chapter of the employee experience. When candidates feel their personality and values are understood, they arrive on day one already invested in your mission.',
  },
  {
    short: 'Diverse thinking styles build stronger teams.',
    headline: 'Balanced personality profiles across your team reduce blind spots.',
    detail: 'If every hire mirrors your own personality profile, you build an echo chamber. Look for complementary traits — pair high-conscientiousness operators with high-openness visionaries for maximum impact.',
  },
  {
    short: 'Culture fit is not culture clone.',
    headline: 'The best additions strengthen your culture by expanding it.',
    detail: 'Culture fit does not mean hiring people who think exactly like your current team. The strongest hires add something new — a perspective, a working style, a strength your team currently lacks.',
  },
  {
    short: 'Consistency in values beats consistency in skills.',
    headline: 'Shared values predict long-term success better than shared skill sets.',
    detail: 'Skills can be taught, but value alignment is intrinsic. When screening candidates, weigh their alignment on core values like ownership, collaboration, and transparency more heavily than technical checkboxes.',
  },
  {
    short: 'Your team thrives on psychological safety.',
    headline: 'High-agreeableness teams need leaders who protect open dialogue.',
    detail: 'If your culture scores high on agreeableness, your people value harmony. That is a strength, but it can suppress dissent. Hire leaders who actively invite disagreement to keep innovation flowing.',
  },
  {
    short: 'Speed of hiring signals strength of culture.',
    headline: 'Fast, decisive hiring tells candidates your team knows what it wants.',
    detail: 'Top candidates evaluate you as much as you evaluate them. A streamlined hiring process that communicates clear values and quick decisions signals a well-run organization they want to join.',
  },
  {
    short: 'Look for the spark behind the resume.',
    headline: 'Personality insights reveal what resumes cannot.',
    detail: 'A resume shows experience. A personality profile shows drive, resilience, and collaboration style. Use both together to understand not just what a candidate has done, but how they will show up on your team.',
  },
  {
    short: 'High-energy hires energize the whole team.',
    headline: 'Extraverted candidates lift team morale and cross-functional momentum.',
    detail: 'If your team has been running low on energy, a high-extraversion hire can shift the dynamic. They naturally rally people, break silos, and keep momentum alive through long projects.',
  },
  {
    short: 'Calm operators anchor your fastest-moving teams.',
    headline: 'Low-neuroticism candidates bring stability to high-pressure environments.',
    detail: 'Every high-growth team needs an anchor. Candidates with low neuroticism stay composed through ambiguity, missed deadlines, and shifting priorities — exactly when your team needs steadiness most.',
  },
  {
    short: 'Your values attract before your perks do.',
    headline: 'Mission-driven candidates choose culture over compensation.',
    detail: 'The candidates you want most are not choosing between offers based on salary alone. They are choosing based on values alignment. Make your culture visible and specific — it is your strongest recruiting advantage.',
  },
  {
    short: 'Great teams are assembled, not just recruited.',
    headline: 'Think in terms of team composition, not individual hires.',
    detail: 'Each new hire changes the personality balance of the entire team. Before opening a role, map your current team composition and identify the trait gaps. Hire to complete the picture, not to duplicate it.',
  },
];

function toTitleCase(str: string): string {
  return str.replace(/\./g, '').replace(/\b\w/g, c => c.toUpperCase());
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pickInsights(seed: number, role: 'candidate' | 'employer' = 'candidate') {
  const pool = role === 'employer' ? employerDailyInsights : dailyInsights;
  // Use prime-spaced offsets so each day gets a distinct combination
  const a = seed % pool.length;
  const b = (seed + 5) % pool.length;
  const c = (seed + 11) % pool.length;
  return [pool[a], pool[b], pool[c]];
}

export function CompatibilityInsights({ viewerRole = 'candidate' }: CompatibilityInsightsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalEntering, setModalEntering] = useState(false);
  const [seed, setSeed] = useState(getDayOfYear);
  const [todaysInsights, setTodaysInsights] = useState(() => pickInsights(getDayOfYear(), viewerRole));

  const FADE_MS = 400;

  const switchTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, FADE_MS);
  }, []);

  // Auto-rotate only when modal is closed
  useEffect(() => {
    if (showModal) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % todaysInsights.length);
        setIsTransitioning(false);
      }, FADE_MS);
    }, 6000);
    return () => clearInterval(interval);
  }, [showModal, todaysInsights.length]);

  const refreshReadings = () => {
    setIsTransitioning(true);
    const newSeed = seed + 3;
    setSeed(newSeed);
    setTimeout(() => {
      setTodaysInsights(pickInsights(newSeed, viewerRole));
      setCurrentIndex(0);
      setIsTransitioning(false);
    }, FADE_MS);
  };

  const openModal = () => {
    setShowModal(true);
    requestAnimationFrame(() => setModalEntering(true));
  };

  const closeModal = () => {
    setModalEntering(false);
    setTimeout(() => setShowModal(false), 300);
  };

  const current = todaysInsights[currentIndex];

  return (
    <>
      <div
        onClick={openModal}
        className="relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          minHeight: 200,
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Your Daily Reading
          </span>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Short headline */}
        <div className="flex-1 flex items-center py-1">
          <p
            className="text-base sm:text-lg font-bold leading-snug transition-opacity duration-400"
            style={{
              color: 'var(--color-text)',
              opacity: isTransitioning ? 0 : 1,
              fontFamily: 'var(--font-display)',
            }}
          >
            {current.short}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshReadings();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:rotate-180"
            style={{
              backgroundColor: 'var(--color-surfaceHover)',
              color: 'var(--color-textSecondary)',
              transitionDuration: '500ms',
            }}
            aria-label="New readings"
            title="Shuffle readings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex gap-1.5">
            {todaysInsights.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  switchTo(i);
                }}
                className="w-2 h-2 rounded-full transition-colors duration-300 p-0 border-0"
                style={{
                  backgroundColor: i === currentIndex ? 'var(--color-accent)' : 'var(--color-border)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              backdropFilter: modalEntering ? 'blur(12px)' : 'blur(0px)',
              WebkitBackdropFilter: modalEntering ? 'blur(12px)' : 'blur(0px)',
              backgroundColor: modalEntering ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
            }}
          />

          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              transform: modalEntering ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
              opacity: modalEntering ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-1 w-full"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              }}
            />

            <div className="p-6">
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
                style={{ color: 'var(--color-textMuted)' }}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {viewerRole === 'employer' ? 'Daily Culture Reading' : 'Daily Personality Reading'}
                </span>
              </div>

              <h2
                className="text-2xl font-bold mb-3 leading-tight transition-opacity duration-400"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-display)',
                  opacity: isTransitioning ? 0 : 1,
                }}
              >
                {current.headline}
              </h2>

              <p
                className="text-sm leading-relaxed mb-6 transition-opacity duration-400"
                style={{
                  color: 'var(--color-textSecondary)',
                  opacity: isTransitioning ? 0 : 1,
                }}
              >
                {current.detail}
              </p>

              <div className="h-px w-full mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  Your Readings
                </p>
                <button
                  onClick={refreshReadings}
                  className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Shuffle
                </button>
              </div>
              <div className="space-y-2">
                {todaysInsights.map((insight, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i !== currentIndex) {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentIndex(i);
                          setIsTransitioning(false);
                        }, FADE_MS);
                      }
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: i === currentIndex ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      border: i === currentIndex ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: i === currentIndex ? 'var(--color-accent)' : 'var(--color-text)',
                      }}
                    >
                      {toTitleCase(insight.short)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
