import { X, Mail, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AmberLogo } from '../ui/AmberLogo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type Role = 'candidate' | 'employer';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  total?: number;
  candidates?: number;
  employers?: number;
}

export function WaitlistModal({
  isOpen,
  onClose,
  onSuccess,
  total = 0,
  candidates = 0,
  employers = 0,
}: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('candidate');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please Enter Your Email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please Enter A Valid Email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setSubmitted(true);
        setSubmitting(false);
        onSuccess?.();
      }, 600);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('waitlist').insert({
        email: trimmed,
        role,
        source: 'landing',
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError("You're Already On The List. We'll Be In Touch!");
        } else {
          setError(insertError.message || 'Something Went Wrong. Please Try Again.');
        }
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError('Something Went Wrong. Please Try Again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — soft blur, no hard black */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-background) 70%, transparent)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-[420px] rounded-3xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.35)',
              }}
              initial={{ scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-md transition-colors z-10 hover:opacity-100 opacity-60"
                style={{ color: 'var(--color-textMuted)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {!submitted ? (
                <div className="px-8 pt-10 pb-7">
                  {/* Logo + eyebrow */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      <AmberLogo size="md" />
                    </div>
                    <p
                      className="text-[10px] font-mono uppercase tracking-[0.3em] mb-2"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Coming Soon
                    </p>
                    <h2
                      className="text-[28px] font-serif font-normal tracking-tight leading-tight"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Be First In{' '}
                      <span className="italic" style={{ color: 'var(--color-accent)' }}>
                        Line.
                      </span>
                    </h2>
                    <p
                      className="text-[13px] leading-relaxed mt-3 max-w-[320px] mx-auto"
                      style={{ color: 'var(--color-textSecondary)' }}
                    >
                      Amber Opens Soon. Drop Your Email And We'll Let You Know The Moment It's Ready.
                    </p>
                  </div>

                  {/* Live counter — subtle inline strip */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] mb-7 flex-wrap">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span style={{ color: 'var(--color-textMuted)' }}>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {total}
                      </span>
                      <span> Already Interested</span>
                    </span>
                    {total > 0 && (
                      <>
                        <span
                          className="w-[3px] h-[3px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-border)' }}
                        />
                        <span style={{ color: 'var(--color-textMuted)' }}>
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: 'var(--color-textSecondary)' }}
                          >
                            {candidates}
                          </span>
                          <span> Seekers, </span>
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: 'var(--color-textSecondary)' }}
                          >
                            {employers}
                          </span>
                          <span> Employers</span>
                        </span>
                      </>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role toggle — minimal segmented pill */}
                    <div>
                      <label
                        className="block text-[10px] font-mono uppercase tracking-[0.25em] mb-2"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        I'm Joining As
                      </label>
                      <div
                        className="relative grid grid-cols-2 rounded-lg p-0.5"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {/* Sliding indicator */}
                        <motion.div
                          className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-md"
                          style={{ backgroundColor: 'var(--color-accent)' }}
                          animate={{ x: role === 'candidate' ? 2 : 'calc(100% + 2px)' }}
                          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                        />
                        <button
                          type="button"
                          onClick={() => setRole('candidate')}
                          className="relative py-2 text-[12px] font-semibold transition-colors z-10"
                          style={{
                            color:
                              role === 'candidate'
                                ? 'var(--color-accentText)'
                                : 'var(--color-textSecondary)',
                          }}
                        >
                          Job Seeker
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('employer')}
                          className="relative py-2 text-[12px] font-semibold transition-colors z-10"
                          style={{
                            color:
                              role === 'employer'
                                ? 'var(--color-accentText)'
                                : 'var(--color-textSecondary)',
                          }}
                        >
                          Employer
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        className="block text-[10px] font-mono uppercase tracking-[0.25em] mb-2"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        Email
                      </label>
                      <div
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: `1px solid ${
                            error
                              ? 'var(--color-error, #DC2626)'
                              : 'var(--color-border)'
                          }`,
                        }}
                      >
                        <Mail
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: 'var(--color-textMuted)' }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="you@example.com"
                          className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-60"
                          style={{ color: 'var(--color-text)' }}
                          autoFocus
                          disabled={submitting}
                        />
                      </div>
                      {error && (
                        <p
                          className="text-[11px] mt-1.5"
                          style={{ color: 'var(--color-error, #DC2626)' }}
                        >
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg py-3 text-[13px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      {submitting ? (
                        <span>Adding You...</span>
                      ) : (
                        <>
                          Count Me In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p
                    className="text-[10px] text-center mt-4"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    No Spam. Unsubscribe Anytime.
                  </p>
                </div>
              ) : (
                /* Success state — equally minimal */
                <motion.div
                  className="px-8 pt-12 pb-10 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-5"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--color-success) 12%, transparent)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.1,
                      type: 'spring',
                      damping: 16,
                      stiffness: 280,
                    }}
                  >
                    <Check
                      className="w-5 h-5"
                      style={{ color: 'var(--color-success)' }}
                      strokeWidth={3}
                    />
                  </motion.div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.3em] mb-2"
                    style={{ color: 'var(--color-success)' }}
                  >
                    You're In
                  </p>
                  <h2
                    className="text-[24px] font-serif font-normal tracking-tight leading-tight mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    See You{' '}
                    <span className="italic" style={{ color: 'var(--color-accent)' }}>
                      Soon.
                    </span>
                  </h2>
                  <p
                    className="text-[13px] leading-relaxed max-w-[300px] mx-auto mb-6"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    We'll Email You The Moment Amber Opens Up For{' '}
                    {role === 'candidate' ? 'Job Seekers' : 'Employers'}.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] mb-6">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span style={{ color: 'var(--color-textMuted)' }}>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {Math.max(total, 1)}
                      </span>
                      <span> People Now Waiting</span>
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-[12px] font-medium transition-colors"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
