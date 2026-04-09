import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { supabase } from '../../lib/supabase';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { CoffeeChatData, ChatStatus } from './CoffeeChatCard';
import { CoffeeChatsCalendar } from './CoffeeChatsCalendar';
import { FeedbackModal } from './FeedbackModal';
import { CoffeeChatDetailModal } from './CoffeeChatDetailModal';
import { MeetingNotesModal } from './MeetingNotesModal';
import { MeetingRecorderModal } from './MeetingRecorderModal';
import { PageBanner } from '../ui/PageBanner';
import { InboxPanel } from '../connections/InboxPanel';
import { Coffee, UserPlus } from 'lucide-react';
import { useConnections } from '../../contexts/ConnectionsContext';

const API_BASE = 'http://127.0.0.1:8000';

export function CandidateCoffeeChats() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { openChat } = useMessaging();
  const { pendingReceivedCount } = useConnections();
  const [isLoading, setIsLoading] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [chats, setChats] = useState<CoffeeChatData[]>([]);
  const [_candidateId, setCandidateId] = useState<string | null>(null);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [recorderModalOpen, setRecorderModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState('');
  const [activeChat, setActiveChat] = useState<CoffeeChatData | null>(null);

  const showLoader = useMinLoader(isLoading);

  // Handle opening message panel
  const handleMessage = useCallback((chatId: string, partnerName: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    openChat(chatId, {
      id: chat.employer_id,
      name: partnerName,
      avatarUrl: null,
      coffeeChatId: chatId,
    });
  }, [chats, openChat]);

  // Handle viewing partner details
  const handleViewDetails = useCallback((chat: CoffeeChatData) => {
    setActiveChat(chat);
    setDetailModalOpen(true);
  }, []);

  // Handle recording meeting
  const handleRecord = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    setActiveChatId(chatId);
    setActiveChatPartner(chat?.partner_name || '');
    setRecorderModalOpen(true);
  }, [chats]);

  // Handle viewing meeting notes
  const handleViewNotes = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    setActiveChatId(chatId);
    setActiveChatPartner(chat?.partner_name || '');
    setNotesModalOpen(true);
  }, [chats]);

  // Handle notes processed - refresh chats
  const handleNotesProcessed = useCallback(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadChats();
  }, [user]);

  // Real-time subscription for coffee chat changes
  useEffect(() => {
    if (!_candidateId) return;
    const channel = supabase
      .channel('candidate-coffee-chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coffee_chats', filter: `candidate_id=eq.${_candidateId}` },
        () => loadChats()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [_candidateId]);

  const loadChats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!candidate) {
        setIsLoading(false);
        return;
      }

      setCandidateId(candidate.id);

      // Query without JOINs - use stored company_name to avoid RLS issues
      const { data: chatData } = await supabase
        .from('coffee_chats')
        .select('*')
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false });

      if (chatData) {
        const mapped: CoffeeChatData[] = chatData.map((c: any) => ({
          id: c.id,
          candidate_id: c.candidate_id,
          employer_id: c.employer_id,
          role_id: c.role_id,
          connection_id: c.connection_id,
          status: c.status as ChatStatus,
          message: c.message,
          initiated_by: c.initiated_by,
          scheduled_at: c.scheduled_at,
          meeting_link: c.meeting_link,
          rating: c.rating,
          feedback: c.feedback,
          created_at: c.created_at,
          partner_name: c.company_name || 'Unknown',
          partner_company: c.company_name,
          match_score: c.match_score,
          role_title: c.role_title,
          preferred_dates: c.preferred_dates,
          has_meeting_notes: c.has_meeting_notes,
        }));
        setChats(mapped);
      }
    } catch (err) {
      console.error('Error loading coffee chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    };
  };

  const handleFeedback = async (rating: number, feedback?: string) => {
    if (!activeChatId) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/coffee-chats/${activeChatId}/feedback`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ rating, feedback: feedback || null }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, status: 'completed' as ChatStatus, rating, feedback: feedback || null }
            : c
        )
      );
      success('Thanks!', 'Feedback submitted');
    } catch {
      showError('Error', 'Failed to submit feedback');
    }
  };

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading your coffee chats..." />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <PageBanner
        title="Coffee Chats"
        subtitle="Connect with teams over casual conversations"
        icon={Coffee}
        rightContent={
          <button
            onClick={() => setInboxOpen(true)}
            className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
            title="Connections"
          >
            <UserPlus className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
            {pendingReceivedCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: 'var(--color-accent)', minWidth: '16px', height: '16px', padding: '0 3px' }}
              >
                {pendingReceivedCount}
              </span>
            )}
          </button>
        }
      />

      <CoffeeChatsCalendar
        chats={chats}
        onMessage={handleMessage}
        onViewDetails={handleViewDetails}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedback}
        partnerName={activeChatPartner}
      />

      {activeChat && (
        <CoffeeChatDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setActiveChat(null);
          }}
          coffeeChatId={activeChat.id}
          viewerRole="candidate"
          partnerId={activeChat.employer_id}
          partnerName={activeChat.partner_name}
          matchScore={activeChat.match_score}
          onMessage={() => {
            setDetailModalOpen(false);
            handleMessage(activeChat.id, activeChat.partner_name);
          }}
        />
      )}

      <InboxPanel isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />

      {/* Meeting Recorder Modal */}
      {activeChatId && (
        <MeetingRecorderModal
          isOpen={recorderModalOpen}
          onClose={() => {
            setRecorderModalOpen(false);
            setActiveChatId(null);
          }}
          coffeeChatId={activeChatId}
          partnerName={activeChatPartner}
          onNotesProcessed={handleNotesProcessed}
        />
      )}

      {/* Meeting Notes Modal */}
      {activeChatId && (
        <MeetingNotesModal
          isOpen={notesModalOpen}
          onClose={() => {
            setNotesModalOpen(false);
            setActiveChatId(null);
          }}
          coffeeChatId={activeChatId}
          partnerName={activeChatPartner}
        />
      )}
    </div>
  );
}
