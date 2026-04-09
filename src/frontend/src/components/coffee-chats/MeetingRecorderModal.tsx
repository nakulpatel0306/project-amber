import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MeetingRecorder } from './MeetingRecorder';
import { RecordingConsent, RecordingConsentBanner } from './RecordingConsent';

interface MeetingRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  coffeeChatId: string;
  partnerName: string;
  onNotesProcessed?: () => void;
}

export function MeetingRecorderModal({
  isOpen,
  onClose,
  coffeeChatId,
  partnerName,
  onNotesProcessed,
}: MeetingRecorderModalProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const handleConsent = () => {
    setHasConsented(true);
  };

  const handleDecline = () => {
    onClose();
  };

  const handleRecordingUploaded = () => {
    // Keep modal open for processing
  };

  const handleProcessingComplete = () => {
    onNotesProcessed?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Meeting - ${partnerName}`}
      size="md"
    >
      <div className="py-2 space-y-4">
        {!hasConsented ? (
          <RecordingConsent onConsent={handleConsent} onDecline={handleDecline} />
        ) : (
          <>
            {showBanner && (
              <RecordingConsentBanner onDismiss={() => setShowBanner(false)} />
            )}
            <MeetingRecorder
              coffeeChatId={coffeeChatId}
              onRecordingUploaded={handleRecordingUploaded}
              onProcessingComplete={handleProcessingComplete}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
