import { useState } from 'react';
import { Coffee, Sparkles } from 'lucide-react';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ScoreRing } from '../../ui/ScoreRing';
import { avatarGradient } from '../../../utils/matchHelpers';

interface CoffeeBrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  subtitle?: string;
  archetype?: { name: string; key: string };
  overallScore: number;
  avatarUrl?: string | null;
  onBrew: (note: string) => Promise<void>;
}

export function CoffeeBrewModal({
  isOpen,
  onClose,
  name,
  subtitle,
  archetype,
  overallScore,
  avatarUrl,
  onBrew,
}: CoffeeBrewModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onBrew(note);
      setNote('');
      onClose();
    } catch {
      // Error handled by parent via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: avatarUrl ? undefined : avatarGradient(name) }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{initial}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{name}</h3>
            {subtitle && (
              <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{subtitle}</p>
            )}
            {archetype && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-0.5"
                style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
              >
                <Sparkles className="w-2 h-2" />
                {archetype.name}
              </span>
            )}
          </div>
          <ScoreRing score={overallScore} size={44} />
        </div>

        {/* Note field */}
        <div className="mb-4">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="I'd love to learn about your team culture!"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-xl text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          />
          <p className="text-right text-[10px] mt-1" style={{ color: 'var(--color-textMuted)' }}>
            {note.length}/500
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Not Yet
        </Button>
        <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
          <Coffee className="w-3.5 h-3.5 mr-1" />
          Brew It
        </Button>
      </ModalFooter>
    </Modal>
  );
}
