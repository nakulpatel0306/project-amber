import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { EmberFirefly } from '../ember/EmberFirefly';
import { CoffeeChatCard, CoffeeChatData, ChatStatus } from './CoffeeChatCard';
import { CoffeeChatPrep } from './CoffeeChatPrep';
import { CoffeeChatFollowUp } from './CoffeeChatFollowUp';
import { ScheduleModal } from './ScheduleModal';
import { FeedbackModal } from './FeedbackModal';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
];

export function EmployerCoffeeChats() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<CoffeeChatData[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [_employerId, setEmployerId] = useState<string | null>(null);

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

      const { data: chatData } = await supabase
        .from('coffee_chats')
        .select('*, candidates!inner(*, profiles!inner(full_name, email))')
        .eq('employer_id', employer.id)
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
          partner_name: c.candidates?.profiles?.full_name || 'Unknown',
          partner_location: c.candidates?.location,
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

  const filteredChats =
    statusFilter === 'all' ? chats : chats.filter(c => c.status === statusFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <EmberFirefly size="lg" mood="thinking" animated />
          <p className="mt-4 text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Loading coffee chats...
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
          Manage conversations with potential hires
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
            style={{
              backgroundColor: statusFilter === f.value ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
              borderColor: statusFilter === f.value ? 'var(--color-accent)' : 'var(--color-border)',
              color: statusFilter === f.value ? 'var(--color-accent)' : 'var(--color-textSecondary)',
            }}
          >
            {f.label}
            <span className="ml-1">
              ({f.value === 'all' ? chats.length : chats.filter(c => c.status === f.value).length})
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
          <EmberFirefly size="lg" mood="happy" animated />
          <h3 className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            No Coffee Chats Yet
          </h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--color-textMuted)' }}>
            No coffee chats yet — find your matches and start connecting!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChats.map(chat => (
            <div key={chat.id}>
              <CoffeeChatCard
                chat={chat}
                userRole="employer"
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
