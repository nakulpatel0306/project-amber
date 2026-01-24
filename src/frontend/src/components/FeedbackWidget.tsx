import { useState } from 'react';
import { MessageCircle, X, Send, Loader2, Check } from 'lucide-react';
import { submitFeedback } from '../utils/api';

interface FeedbackWidgetProps {
  page?: string;
}

export function FeedbackWidget({ page = 'unknown' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        message: message.trim(),
        user_type: 'candidate',
        page,
      });

      setIsSuccess(true);
      setMessage('');

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg btn-smooth z-40"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accentText)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
        }}
        title="send feedback"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-6"
          onClick={() => !isSubmitting && setIsOpen(false)}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          />

          {/* modal content */}
          <div
            className="relative w-full max-w-sm rounded-2xl border shadow-xl slide-in-up"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3
                className="font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                send feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: 'var(--color-textMuted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* content */}
            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-6">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Check className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    thanks for your feedback!
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    how can we improve?
                  </p>

                  {error && (
                    <div
                      className="mb-4 p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-error)',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="share your thoughts..."
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium btn-smooth flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accentText)',
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 spinner" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        submit
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
