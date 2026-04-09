import { useState, useEffect } from 'react';
import {
  FileText,
  Tag,
  CheckSquare,
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';

const API_BASE = 'http://127.0.0.1:8000';

interface MeetingNotesData {
  exists: boolean;
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  summary_text?: string;
  key_topics?: string[];
  action_items?: string[];
  merged_transcript?: string;
  has_candidate_recording?: boolean;
  has_employer_recording?: boolean;
  error_message?: string;
  created_at?: string;
}

interface MeetingNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  coffeeChatId: string;
  partnerName: string;
}

type TabValue = 'summary' | 'topics' | 'actions' | 'transcript';

export function MeetingNotesModal({
  isOpen,
  onClose,
  coffeeChatId,
  partnerName,
}: MeetingNotesModalProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('summary');
  const [notes, setNotes] = useState<MeetingNotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && coffeeChatId) {
      loadNotes();
    }
  }, [isOpen, coffeeChatId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${API_BASE}/api/coffee-chats/${coffeeChatId}/meeting-notes`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notes');
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error loading meeting notes:', err);
      setNotes(null);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
    { value: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
    { value: 'topics', label: 'Topics', icon: <Tag className="w-4 h-4" /> },
    { value: 'actions', label: 'Actions', icon: <CheckSquare className="w-4 h-4" /> },
    { value: 'transcript', label: 'Transcript', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Loading meeting notes...
          </p>
        </div>
      );
    }

    if (!notes?.exists) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-textMuted)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            No meeting notes available yet.
          </p>
        </div>
      );
    }

    if (notes.status === 'pending') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="w-8 h-8" style={{ color: 'var(--color-textMuted)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Recording uploaded. Click "Generate Meeting Notes" to process.
          </p>
        </div>
      );
    }

    if (notes.status === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            AI is transcribing and summarizing your meeting...
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            This may take a few minutes.
          </p>
        </div>
      );
    }

    if (notes.status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-error)' }}>
            Failed to process meeting notes.
          </p>
          {notes.error_message && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {notes.error_message}
            </p>
          )}
        </div>
      );
    }

    // Completed status - show content based on active tab
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  AI Summary
                </h4>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>
                {notes.summary_text || 'No summary available.'}
              </p>
            </div>

            {/* Recording status */}
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-textMuted)' }}>
              <span>
                Candidate recording: {notes.has_candidate_recording ? 'Yes' : 'No'}
              </span>
              <span>
                Employer recording: {notes.has_employer_recording ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        );

      case 'topics':
        return (
          <div>
            {notes.key_topics && notes.key_topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {notes.key_topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No key topics identified.
              </p>
            )}
          </div>
        );

      case 'actions':
        return (
          <div>
            {notes.action_items && notes.action_items.length > 0 ? (
              <ul className="space-y-2">
                {notes.action_items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <CheckSquare
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-accent)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No action items identified.
              </p>
            )}
          </div>
        );

      case 'transcript':
        return (
          <div>
            {notes.merged_transcript ? (
              <div>
                <button
                  onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                  className="flex items-center gap-2 mb-3 text-sm font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {transcriptExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Collapse transcript
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Expand full transcript
                    </>
                  )}
                </button>
                <div
                  className={`p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${
                    transcriptExpanded ? '' : 'max-h-48 overflow-hidden'
                  }`}
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-textSecondary)',
                    position: 'relative',
                  }}
                >
                  {notes.merged_transcript}
                  {!transcriptExpanded && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-16"
                      style={{
                        background: 'linear-gradient(transparent, var(--color-background))',
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                No transcript available.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Meeting Notes - ${partnerName}`}
      size="lg"
    >
      <div className="py-2">
        {/* Tab bar */}
        {notes?.status === 'completed' && (
          <div
            className="flex items-center gap-1 p-1 rounded-xl mb-4"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab.value ? 'var(--color-accent)' : 'transparent',
                  color:
                    activeTab === tab.value
                      ? 'var(--color-accentText)'
                      : 'var(--color-textSecondary)',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </Modal>
  );
}
