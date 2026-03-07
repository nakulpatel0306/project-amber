import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { supabase } from '../../lib/supabase';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { EmberFirefly } from '../ember/EmberFirefly';
import { CoffeeChatCard, CoffeeChatData, ChatStatus } from './CoffeeChatCard';
import { CoffeeChatPrep } from './CoffeeChatPrep';
import { CoffeeChatFollowUp } from './CoffeeChatFollowUp';
import { ScheduleModal } from './ScheduleModal';
import { FeedbackModal } from './FeedbackModal';
import { CoffeeChatDetailModal } from './CoffeeChatDetailModal';
import { PageBanner } from '../ui/PageBanner';
import { InboxPanel } from '../connections/InboxPanel';
import { DashboardCalendar, type UpcomingChat } from '../dashboard/DashboardCalendar';
import { Coffee, UserPlus } from 'lucide-react';
import { useConnections } from '../../contexts/ConnectionsContext';

type TabValue = 'calendar' | 'pending' | 'upcoming' | 'completed';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'pending', label: 'Pending' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

const emptyStates: Partial<Record<TabValue, { mood: 'happy' | 'neutral' | 'thinking'; message: string }>> = {
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
  const { openChat } = useMessaging();
  const { pendingReceivedCount } = useConnections();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [chats, setChats] = useState<CoffeeChatData[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('calendar');
  const [_candidateId, setCandidateId] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
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

  // Prefilled date for ScheduleModal (set from DayDetailPopup)
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  // Calendar chats — accepted/scheduled with dates
  const calendarChats = useMemo<UpcomingChat[]>(() => {
    return chats
      .filter(c => c.status === 'accepted' || c.status === 'scheduled' || c.status === 'pending')
      .map(c => ({
        id: c.id,
        company: c.partner_company || c.partner_name,
        person: c.partner_name,
        role: c.role_title || 'Coffee Chat',
        time: c.scheduled_at || '',
        scheduledAt: c.scheduled_at || null,
        meetingLink: c.meeting_link || null,
        status: c.status,
      }));
  }, [chats]);

  // Unscheduled accepted chats (for DayDetailPopup)
  const unscheduledAccepted = useMemo<UpcomingChat[]>(() => {
    return chats
      .filter(c => c.status === 'accepted' && !c.scheduled_at)
      .map(c => ({
        id: c.id,
        company: c.partner_company || c.partner_name,
        person: c.partner_name,
        role: c.role_title || 'Coffee Chat',
        time: '',
        scheduledAt: null,
        meetingLink: c.meeting_link || null,
        status: c.status,
      }));
  }, [chats]);

  const handleCalendarSchedule = (chatId: string, date: string) => {
    setActiveChatId(chatId);
    setPrefilledDate(date);
    setScheduleModalOpen(true);
  };

  // Tab-based filtering
  const tabCounts = useMemo(() => ({
    calendar: calendarChats.length,
    pending: chats.filter(c => c.status === 'pending').length,
    upcoming: chats.filter(c => c.status === 'accepted' || c.status === 'scheduled').length,
    completed: chats.filter(c => c.status === 'completed').length,
  }), [chats, calendarChats]);

  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case 'pending': return chats.filter(c => c.status === 'pending');
      case 'upcoming': return chats.filter(c => c.status === 'accepted' || c.status === 'scheduled');
      case 'completed': return chats.filter(c => c.status === 'completed');
      default: return chats;
    }
  }, [chats, activeTab]);

  const empty = emptyStates[activeTab as keyof typeof emptyStates];

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading your coffee chats..." />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
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

      {/* Tab bar */}
      <div className="bento-card flex items-center gap-1 !p-1 mb-6">
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

      {/* Calendar view */}
      {activeTab === 'calendar' ? (
        <DashboardCalendar
          upcomingChats={calendarChats}
          pendingChats={tabCounts.pending}
          showViewAll={false}
          allAcceptedChats={unscheduledAccepted}
          mode="schedule"
          onScheduleChat={handleCalendarSchedule}
        />
      ) : filteredChats.length === 0 ? (
        <div className="bento-card text-center py-16">
          {empty && <EmberFirefly size="lg" mood={empty.mood} animated />}
          <h3 className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {activeTab === 'pending' ? 'No Pending Requests' : activeTab === 'upcoming' ? 'No Upcoming Chats' : 'No Completed Chats'}
          </h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--color-textMuted)' }}>
            {empty?.message}
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
                onMessage={handleMessage}
                onViewDetails={handleViewDetails}
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
        onClose={() => {
          setScheduleModalOpen(false);
          setPrefilledDate(undefined);
        }}
        onSchedule={handleSchedule}
        initialDate={prefilledDate}
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
    </div>
  );
}
