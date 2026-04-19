import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AmberLogo } from '../ui/AmberLogo';
import { MagneticButton } from './MagneticButton';
import { WaitlistModal } from './WaitlistModal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface WaitlistCounts {
  total: number;
  candidates: number;
  employers: number;
}

export function LandingNav() {
  const [modalOpen, setModalOpen] = useState(false);
  const [counts, setCounts] = useState<WaitlistCounts>({
    total: 0,
    candidates: 0,
    employers: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.rpc('get_waitlist_count');
      if (error) {
        console.warn('Waitlist count unavailable:', error.message);
        return;
      }
      if (data && Array.isArray(data) && data[0]) {
        const row = data[0] as {
          total: number | string;
          candidates: number | string;
          employers: number | string;
        };
        setCounts({
          total: Number(row.total) || 0,
          candidates: Number(row.candidates) || 0,
          employers: Number(row.employers) || 0,
        });
      }
    } catch (err) {
      console.warn('Could not fetch waitlist count', err);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6 pb-6 pointer-events-none"
      >
        <div
          className="max-w-5xl mx-auto px-6 py-3 rounded-2xl border pointer-events-auto"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 70%, transparent)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="transition-transform group-hover:scale-110 group-hover:rotate-3">
                <AmberLogo size="md" />
              </div>
              <span
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Amber Project
              </span>
            </Link>

            {/* Live waitlist counter + Join CTA */}
            <div className="flex items-center gap-3">
              {/* Desktop: full pill with count + label + CTA */}
              <MagneticButton
                onClick={() => setModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.08}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-accentText)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <span>
                  <span className="font-semibold tabular-nums">{counts.total}</span>
                  <span className="opacity-90"> Interested</span>
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--color-accentText) 18%, transparent)',
                  }}
                >
                  Join
                  <ArrowRight className="w-3 h-3" />
                </span>
              </MagneticButton>

              {/* Mobile: compact count pill */}
              <MagneticButton
                onClick={() => setModalOpen(true)}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
                strength={0.08}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-accentText)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <span className="tabular-nums">{counts.total}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCounts}
        total={counts.total}
        candidates={counts.candidates}
        employers={counts.employers}
      />
    </>
  );
}
