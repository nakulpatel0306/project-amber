import { useState } from 'react';
import { Bug, Lightbulb, Star, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

type FeedbackType = 'bug_report' | 'feature_request' | 'satisfaction';

interface FeedbackTab {
  id: FeedbackType;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const tabs: FeedbackTab[] = [
  {
    id: 'bug_report',
    label: 'Bug Report',
    icon: Bug,
    placeholder: 'Describe the issue you encountered. Include steps to reproduce if possible...',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    icon: Lightbulb,
    placeholder: 'Describe the feature you would like to see and how it would help you...',
  },
  {
    id: 'satisfaction',
    label: 'Satisfaction',
    icon: Star,
    placeholder: 'Share your overall experience with Amber. What do you love? What could be better?',
  },
];

export function FeedbackSection() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<FeedbackType>('bug_report');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      showError('Message required', 'Please enter your feedback before submitting.');
      return;
    }

    if (activeTab === 'satisfaction' && !rating) {
      showError('Rating required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        feedback_type: activeTab,
        message: message.trim(),
        rating: activeTab === 'satisfaction' ? rating : null,
        page: 'settings',
      });

      if (error) throw error;

      success('Thank you!', 'Your feedback has been submitted successfully.');
      setMessage('');
      setRating(null);
      setSubmitted(true);

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      showError('Failed to submit', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          feedback
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          help us improve amber by sharing your thoughts
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setSubmitted(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium',
              'transition-all'
            )}
            style={{
              backgroundColor:
                activeTab === id ? 'var(--color-background)' : 'transparent',
              color:
                activeTab === id
                  ? 'var(--color-text)'
                  : 'var(--color-textMuted)',
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label.toLowerCase()}</span>
          </button>
        ))}
      </div>

      {/* Rating (only for satisfaction) */}
      {activeTab === 'satisfaction' && (
        <div>
          <p
            className="text-sm mb-3"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            how would you rate your experience?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  'transition-all border'
                )}
                style={{
                  backgroundColor:
                    rating && rating >= value
                      ? 'var(--color-accent)'
                      : 'var(--color-surface)',
                  borderColor:
                    rating && rating >= value
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  color:
                    rating && rating >= value
                      ? 'var(--color-accentText)'
                      : 'var(--color-textMuted)',
                }}
              >
                <Star
                  className="w-5 h-5"
                  fill={rating && rating >= value ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <p
            className="text-xs mt-2"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {rating === 1 && 'Very unsatisfied'}
            {rating === 2 && 'Unsatisfied'}
            {rating === 3 && 'Neutral'}
            {rating === 4 && 'Satisfied'}
            {rating === 5 && 'Very satisfied'}
          </p>
        </div>
      )}

      {/* Message */}
      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={currentTab.placeholder.toLowerCase()}
        rows={5}
        disabled={isSubmitting}
      />

      {/* Character count */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {message.length} / 2000 characters
        </p>
        {submitted && (
          <p
            className="text-xs"
            style={{ color: 'var(--color-success)' }}
          >
            feedback submitted successfully!
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isSubmitting || (activeTab === 'satisfaction' && !rating)}
        isLoading={isSubmitting}
        leftIcon={<Send className="w-4 h-4" />}
      >
        submit feedback
      </Button>

      {/* Info */}
      <div
        className="p-4 rounded-xl text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textMuted)',
        }}
      >
        <p>
          your feedback helps us build a better product. we read every
          submission and may reach out if we have questions.
        </p>
      </div>
    </div>
  );
}
