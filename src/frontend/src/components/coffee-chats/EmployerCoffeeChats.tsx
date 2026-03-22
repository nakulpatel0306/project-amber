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
import { AcceptWithDateModal } from './AcceptWithDateModal';
import { PageBanner } from '../ui/PageBanner';
import { Button } from '../ui/Button';
import { InboxPanel } from '../connections/InboxPanel';
import { DashboardCalendar, type UpcomingChat } from '../dashboard/DashboardCalendar';
import { Coffee, UserPlus, Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { deriveDisplayStatus, type DisplayStatus } from '../../utils/coffeeChatStatus';

const API_BASE = 'http://127.0.0.1:8000';

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

/** Derive display status for a chat */
function getDisplayStatus(chat: CoffeeChatData): DisplayStatus {
  return deriveDisplayStatus(chat.status, chat.scheduled_at);
}

export function EmployerCoffeeChats() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { openChat } = useMessaging();
  const { pendingReceivedCount } = useConnections();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [chats, setChats] = useState<CoffeeChatData[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('calendar');
  const [_employerId, setEmployerId] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [acceptWithDateModalOpen, setAcceptWithDateModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState('');
  const [activeChat, setActiveChat] = useState<CoffeeChatData | null>(null);
  const [chatToAccept, setChatToAccept] = useState<CoffeeChatData | null>(null);

  const showLoader = useMinLoader(isLoading);

  // Handle opening message panel
  const handleMessage = useCallback((chatId: string, partnerName: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    openChat(chatId, {
      id: chat.candidate_id,
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

  // Real-time subscription for coffee chat changes
  useEffect(() => {
    if (!_employerId) return;
    const channel = supabase
      .channel('employer-coffee-chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coffee_chats', filter: `employer_id=eq.${_employerId}` },
        () => loadChats()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [_employerId]);

  const loadChats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employer) {
        setIsLoading(false);
        return;
      }

      setEmployerId(employer.id);

      // Query without JOINs - use stored candidate_name to avoid RLS issues
      const { data: chatData } = await supabase
        .from('coffee_chats')
        .select('*')
        .eq('employer_id', employer.id)
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
          partner_name: c.candidate_name || 'Unknown',
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

  const getAuthHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    };
  };

  const updateChatStatus = async (chatId: string, status: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/coffee-chats/${chatId}/status?status=${status}`, {
        method: 'PATCH', headers,
      });
      if (!res.ok) throw new Error('Failed to update');
      setChats(prev =>
        prev.map(c => (c.id === chatId ? { ...c, status: status as ChatStatus } : c))
      );
      success('Updated', `Chat ${status}`);
    } catch {
      showError('Error', 'Failed to update chat');
    }
  };

  // Handle accepting a chat - if it has preferred dates, show modal to select one
  const handleAcceptChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    if (chat.preferred_dates && chat.preferred_dates.length > 0) {
      // Has preferred dates - show modal to select one
      setChatToAccept(chat);
      setAcceptWithDateModalOpen(true);
    } else {
      // No preferred dates - just accept (will need to schedule later)
      updateChatStatus(chatId, 'accepted');
    }
  };

  // Accept and schedule with a selected date
  const handleAcceptWithDate = async (scheduledAt: string) => {
    if (!chatToAccept) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/coffee-chats/${chatToAccept.id}/schedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ scheduled_at: scheduledAt }),
      });
      if (!res.ok) throw new Error('Failed to schedule');
      setChats(prev =>
        prev.map(c =>
          c.id === chatToAccept.id
            ? { ...c, status: 'scheduled' as ChatStatus, scheduled_at: scheduledAt }
            : c
        )
      );
      success('Scheduled!', `Coffee chat scheduled with ${chatToAccept.partner_name}`);
      setAcceptWithDateModalOpen(false);
      setChatToAccept(null);
    } catch {
      showError('Error', 'Failed to accept and schedule');
    }
  };

  const handleSchedule = async (scheduledAt: string, meetingLink?: string) => {
    if (!activeChatId) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/coffee-chats/${activeChatId}/schedule`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ scheduled_at: scheduledAt, meeting_link: meetingLink || null }),
      });
      if (!res.ok) throw new Error('Failed to schedule');
      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, status: 'scheduled' as ChatStatus, scheduled_at: scheduledAt, meeting_link: meetingLink }
            : c
        )
      );
      setScheduleModalOpen(false);
      success('Scheduled', 'Coffee chat scheduled!');
    } catch {
      showError('Error', 'Failed to schedule');
    }
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

  // Prefilled date for ScheduleModal (set from DayDetailPopup)
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  // Calendar chats — all non-cancelled chats with dates or preferred dates
  const calendarChats = useMemo<UpcomingChat[]>(() => {
    return chats
      .filter(c => c.status !== 'cancelled')
      .map(c => ({
        id: c.id,
        company: c.partner_name,
        person: c.partner_name,
        role: c.role_title || 'Coffee Chat',
        time: c.scheduled_at || '',
        scheduledAt: c.scheduled_at || null,
        meetingLink: c.meeting_link || null,
        status: c.status,
        preferredDates: c.preferred_dates,
      }));
  }, [chats]);

  // Unscheduled accepted chats (for DayDetailPopup)
  const unscheduledAccepted = useMemo<UpcomingChat[]>(() => {
    return chats
      .filter(c => c.status === 'accepted' && !c.scheduled_at)
      .map(c => ({
        id: c.id,
        company: c.partner_name,
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

  // Stat pill counts for PageBanner
  const statCounts = useMemo(() => ({
    pending: chats.filter(c => c.status === 'pending').length,
    upcoming: chats.filter(c => c.status === 'accepted' || c.status === 'scheduled').length,
    completed: chats.filter(c => c.status === 'completed').length,
  }), [chats]);

  // Tab-based filtering using derived display status
  const tabCounts = useMemo(() => ({
    calendar: chats.filter(c => c.status !== 'cancelled').length,
    pending: chats.filter(c => getDisplayStatus(c) === 'pending').length,
    upcoming: chats.filter(c => getDisplayStatus(c) === 'upcoming').length,
    completed: chats.filter(c => getDisplayStatus(c) === 'completed').length,
  }), [chats]);

  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case 'pending': return chats.filter(c => getDisplayStatus(c) === 'pending');
      case 'upcoming': return chats.filter(c => getDisplayStatus(c) === 'upcoming');
      case 'completed': return chats.filter(c => getDisplayStatus(c) === 'completed');
      default: return chats;
    }
  }, [chats, activeTab]);

  const empty = emptyStates[activeTab as keyof typeof emptyStates];

  if (showLoader) {
    return (
      <CoffeeBrewLoader variant="fullscreen" message="Loading coffee chats..." />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <PageBanner
        title="Coffee Chats"
        subtitle="Manage Conversations With Potential Hires"
        iconNode={
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
          >
            <Coffee className="w-7 h-7 text-white" />
          </div>
        }
        belowSubtitle={
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            {([
              { label: 'Pending', value: statCounts.pending, color: '#f59e0b', Icon: Clock },
              { label: 'Upcoming', value: statCounts.upcoming, color: '#06B6D4', Icon: CalendarDays },
              { label: 'Completed', value: statCounts.completed, color: '#10B981', Icon: CheckCircle2 },
            ] as const).map(stat => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                  border: `1px solid ${stat.color}30`,
                  color: 'var(--color-text)',
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.Icon className="w-3 h-3" style={{ color: stat.color }} />
                </span>
                <span className="font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                <span style={{ color: 'var(--color-textSecondary)' }}>{stat.label}</span>
              </span>
            ))}
          </div>
        }
        rightContent={
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" leftIcon={<Coffee className="w-3.5 h-3.5" />} onClick={() => navigate('/app/employer/ember')}>
              Find Match
            </Button>
            <Button variant="outline" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setInboxOpen(true)} className="relative">
              Requests
              {pendingReceivedCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: 'var(--color-accent)', minWidth: '16px', height: '16px', padding: '0 3px' }}
                >
                  {pendingReceivedCount}
                </span>
              )}
            </Button>
          </div>
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
                backgroundColor: activeTab === tab.value ? 'var(--color-surfaceHover)' : 'var(--color-background)',
                color: activeTab === tab.value ? 'var(--color-accentText)' : 'var(--color-textMuted)',
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
          viewerRole="employer"
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
                userRole="employer"
                onAccept={handleAcceptChat}
                onDecline={id => updateChatStatus(id, 'cancelled')}
                onSchedule={id => {
                  setActiveChatId(id);
                  setScheduleModalOpen(true);
                }}
                onReschedule={id => {
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
                  if (c?.candidate_id) {
                    navigate(`/app/employer/ember?deepdive=${c.candidate_id}`);
                  } else {
                    navigate('/app/employer/ember');
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
          viewerRole="employer"
          partnerId={activeChat.candidate_id}
          partnerName={activeChat.partner_name}
          matchScore={activeChat.match_score}
          onMessage={() => {
            setDetailModalOpen(false);
            handleMessage(activeChat.id, activeChat.partner_name);
          }}
        />
      )}

      <InboxPanel isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />

      {chatToAccept && (
        <AcceptWithDateModal
          isOpen={acceptWithDateModalOpen}
          onClose={() => {
            setAcceptWithDateModalOpen(false);
            setChatToAccept(null);
          }}
          onAccept={handleAcceptWithDate}
          partnerName={chatToAccept.partner_name}
          preferredDates={chatToAccept.preferred_dates || []}
        />
      )}
    </div>
  );
}
