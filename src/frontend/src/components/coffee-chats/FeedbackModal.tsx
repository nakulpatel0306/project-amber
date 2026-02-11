import { useState } from 'react';
import { Star } from 'lucide-react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
  partnerName: string;
}

export function FeedbackModal({ isOpen, onClose, onSubmit, partnerName }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, feedback || undefined);
    setRating(0);
    setFeedback('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How was your coffee chat?" size="sm">
      <div className="space-y-4 py-2">
        <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
          Rate your chat with {partnerName}
        </p>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className="w-8 h-8"
                style={{
                  color: value <= (hoveredRating || rating) ? 'var(--color-warning)' : 'var(--color-border)',
                  fill: value <= (hoveredRating || rating) ? 'var(--color-warning)' : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm" style={{ color: 'var(--color-textMuted)' }}>
            {rating === 5
              ? 'Amazing!'
              : rating === 4
              ? 'Great experience'
              : rating === 3
              ? 'It was okay'
              : rating === 2
              ? 'Could be better'
              : 'Not great'}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            feedback (optional)
          </label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Share your thoughts about the conversation..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>skip</Button>
        <Button onClick={handleSubmit} disabled={rating === 0}>
          submit feedback
        </Button>
      </ModalFooter>
    </Modal>
  );
}
