import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { EmberFirefly } from '../ember/EmberFirefly';
import { CoffeeChatCard, CoffeeChatData, ChatStatus } from './CoffeeChatCard';
import { CoffeeChatPrep } from './CoffeeChatPrep';
import { CoffeeChatFollowUp } from './CoffeeChatFollowUp';
import { ScheduleModal } from './ScheduleModal';
import { FeedbackModal } from './FeedbackModal';

type TabValue = 'pending' | 'upcoming' | 'completed';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

const emptyStates: Record<TabValue, { mood: 'happy' | 'neutral' | 'thinking'; message: string }> = {
  pending: {
    mood: 'happy',
    message: 'No pending requests. Explore your Ember matches to start connecting!',
  },
  upcoming: {
    mood: 'neutral',
    message: 'No upcoming chats. Accept a pending request to get started.',
  },
  completed: {
    mood: 'thinking',
    message: 'No completed chats yet. Your chat history will appear here.',
  },
};

export function CandidateCoffeeChats() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<CoffeeChatData[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [_candidateId, setCandidateId] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState('');

  useEffect(() => {
    if (!user) return;
    loadChats();
  }, [user]);

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

      const { data: chatData } = await supabase
        .from('coffee_chats')
        .select('*, employers!inner(company_name, industry, location)')
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false });

      if (chatData) {
        const mapped: CoffeeChatData[] = chatData.map((c: any) => ({
          id: c.id,
          candidate_id: c.candidate_id,
          employer_id: c.employer_id,
          role_id: c.role_id,
          status: c.status as ChatStatus,
          message: c.message,
          initiated_by: c.initiated_by,
          scheduled_at: c.scheduled_at,
          meeting_link: c.meeting_link,
          rating: c.rating,
          feedback: c.feedback,
          created_at: c.created_at,
          partner_name: c.employers?.company_name || 'Unknown',
          partner_company: c.employers?.company_name,
          partner_location: c.employers?.location,
          match_score: c.match_score,
          role_title: c.role_title,
        }));
        setChats(mapped);
      }
    } catch (err) {
      console.error('Error loading coffee chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatStatus = async (chatId: string, status: string) => {
    try {
      await supabase.from('coffee_chats').update({ status }).eq('id', chatId);
      setChats(prev =>
        prev.map(c => (c.id === chatId ? { ...c, status: status as ChatStatus } : c))
      );
      success('Updated', `Chat ${status}`);
    } catch {
      showError('Error', 'Failed to update chat');
    }
  };

  const handleSchedule = async (scheduledAt: string, meetingLink?: string) => {
    if (!activeChatId) return;
    try {
      await supabase
        .from('coffee_chats')
        .update({ scheduled_at: scheduledAt, meeting_link: meetingLink, status: 'scheduled' })
        .eq('id', activeChatId);
      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, status: 'scheduled' as ChatStatus, scheduled_at: scheduledAt, meeting_link: meetingLink }
            : c
        )
      );
      success('Scheduled', 'Coffee chat scheduled!');
    } catch {
      showError('Error', 'Failed to schedule');
    }
  };

  const handleFeedback = async (rating: number, feedback?: string) => {
    if (!activeChatId) return;
    try {
      await supabase
        .from('coffee_chats')
        .update({ rating, feedback, status: 'completed' })
        .eq('id', activeChatId);
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

  // Tab-based filtering
  const tabCounts = useMemo(() => ({
    pending: chats.filter(c => c.status === 'pending').length,
    upcoming: chats.filter(c => c.status === 'accepted' || c.status === 'scheduled').length,
    completed: chats.filter(c => c.status === 'completed').length,
  }), [chats]);

  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case 'pending': return chats.filter(c => c.status === 'pending');
      case 'upcoming': return chats.filter(c => c.status === 'accepted' || c.status === 'scheduled');
      case 'completed': return chats.filter(c => c.status === 'completed');
      default: return chats;
    }
  }, [chats, activeTab]);

  const empty = emptyStates[activeTab];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <EmberFirefly size="lg" mood="thinking" animated />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Loading your coffee chats...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Coffee Chats
        </h1>
        <p style={{ color: 'var(--color-textSecondary)' }}>
          Connect with teams over casual conversations
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.value ? 'var(--color-accent)' : 'transparent',
              color: activeTab === tab.value ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
            }}
          >
            {tab.label}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]"
              style={{
                backgroundColor: activeTab === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--color-background)',
                color: activeTab === tab.value ? 'white' : 'var(--color-textMuted)',
              }}
            >
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Chat list */}
      {filteredChats.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <EmberFirefly size="lg" mood={empty.mood} animated />
          <h3 className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {activeTab === 'pending' ? 'No Pending Requests' : activeTab === 'upcoming' ? 'No Upcoming Chats' : 'No Completed Chats'}
          </h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--color-textMuted)' }}>
            {empty.message}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChats.map(chat => (
            <div key={chat.id}>
              <CoffeeChatCard
                chat={chat}
                userRole="candidate"
                onAccept={id => updateChatStatus(id, 'accepted')}
                onDecline={id => updateChatStatus(id, 'cancelled')}
                onSchedule={id => {
                  setActiveChatId(id);
                  setScheduleModalOpen(true);
                }}
                onComplete={id => updateChatStatus(id, 'completed')}
                onFeedback={id => {
                  const c = chats.find(ch => ch.id === id);
                  setActiveChatId(id);
                  setActiveChatPartner(c?.partner_name || '');
                  setFeedbackModalOpen(true);
                }}
                onViewMatch={id => {
                  const c = chats.find(ch => ch.id === id);
                  if (c?.role_id) {
                    navigate(`/app/ember?deepdive=${c.role_id}`);
                  } else {
                    navigate('/app/ember');
                  }
                }}
              />
              {(chat.status === 'accepted' || chat.status === 'scheduled') && (
                <CoffeeChatPrep chatId={chat.id} />
              )}
              {chat.status === 'completed' && chat.rating && (
                <CoffeeChatFollowUp chat={chat} />
              )}
            </div>
          ))}
        </div>
      )}

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedback}
        partnerName={activeChatPartner}
      />
    </div>
  );
}
