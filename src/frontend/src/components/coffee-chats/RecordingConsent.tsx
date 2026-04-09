import { useState } from 'react';
import { Mic, Shield, FileText, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecordingConsentProps {
  onConsent: () => void;
  onDecline: () => void;
}

export function RecordingConsent({ onConsent, onDecline }: RecordingConsentProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
        >
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>
            Enable Meeting Recording?
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
            Record this coffee chat to get AI-generated meeting notes, including a summary,
            key topics, and action items.
          </p>

          {/* Benefits */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Automatic transcription and summary
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Both participants should record for best results
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                Recordings are private and only accessible to participants
              </span>
            </div>
          </div>

          {/* Consent checkbox */}
          <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              I understand that my audio will be recorded, transcribed, and used to generate
              meeting notes. I have informed the other participant about the recording.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onConsent} disabled={!acknowledged}>
              Enable Recording
            </Button>
            <Button size="sm" variant="ghost" onClick={onDecline}>
              <X className="w-4 h-4 mr-1" />
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecordingConsentBannerProps {
  onDismiss: () => void;
}

export function RecordingConsentBanner({ onDismiss }: RecordingConsentBannerProps) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        border: '1px solid rgba(217, 119, 6, 0.3)',
      }}
    >
      <Mic className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
      <p className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>
        <strong>Tip:</strong> Both participants should record their audio for the most complete
        meeting notes.
      </p>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-[var(--color-surfaceHover)] transition-colors"
      >
        <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
      </button>
    </div>
  );
}
