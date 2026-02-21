import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Coffee,
  Brain,
  Users,
  Star,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: string;
  type: 'coffee_chat' | 'match' | 'assessment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  coffee_chat: Coffee,
  match: Users,
  assessment: Brain,
  system: Star,
};

const typeColors: Record<string, string> = {
  coffee_chat: '#EC4899',
  match: '#10B981',
  assessment: '#8B5CF6',
  system: 'var(--color-accent)',
};

export function NotificationDropdown() {
  const { user, isEmployer } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const notifs: Notification[] = [];

    try {
      if (isEmployer) {
        // Check pending coffee chats
        const { data: employer } = await supabase
          .from('employers')
          .select('id, culture_quiz_completed')
          .eq('user_id', user.id)
          .single();

        if (employer) {
          // Only show notifications for chats initiated by candidates (incoming requests)
          const { data: pendingChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, candidate_name')
            .eq('employer_id', employer.id)
            .eq('status', 'pending')
            .eq('initiated_by', 'candidate')
            .order('created_at', { ascending: false })
            .limit(3);

          if (pendingChats) {
            for (const chat of pendingChats) {
              notifs.push({
                id: `chat-${chat.id}`,
                type: 'coffee_chat',
                title: 'New Coffee Chat Request',
                message: `${chat.candidate_name || 'A candidate'} wants to chat`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/employer/chats',
              });
            }
          }

          if (!employer.culture_quiz_completed) {
            notifs.push({
              id: 'culture-quiz',
              type: 'assessment',
              title: 'Complete Your Culture Quiz',
              message: 'Define your culture to start matching with candidates',
              read: false,
              createdAt: new Date(),
              actionUrl: '/app/employer/culture-assessment',
            });
          }
        }
      } else {
        // Candidate notifications
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id, assessment_completed_at, openness_score')
          .eq('user_id', user.id)
          .single();

        if (candidate) {
          // Pending coffee chats - use stored company_name to avoid RLS join issues
          const { data: pendingChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, company_name')
            .eq('candidate_id', candidate.id)
            .eq('status', 'pending')
            .eq('initiated_by', 'employer')
            .order('created_at', { ascending: false })
            .limit(3);

          if (pendingChats) {
            for (const chat of pendingChats) {
              notifs.push({
                id: `chat-${chat.id}`,
                type: 'coffee_chat',
                title: 'Coffee Chat Invitation',
                message: `${chat.company_name || 'A company'} wants to chat`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/chats',
              });
            }
          }

          // Remind to take assessment
          if (!candidate.openness_score) {
            notifs.push({
              id: 'assessment',
              type: 'assessment',
              title: 'Take Your Assessment',
              message: '15 minutes to discover your personality profile',
              read: false,
              createdAt: new Date(),
              actionUrl: '/app/personality',
            });
          }

          // Check for retake eligibility
          if (candidate.assessment_completed_at) {
            const lastDate = new Date(candidate.assessment_completed_at);
            const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
            if (hoursSince >= 24) {
              notifs.push({
                id: 'retake',
                type: 'assessment',
                title: 'Retake Available',
                message: 'You can retake your personality assessment',
                read: false,
                createdAt: new Date(),
                actionUrl: '/app/personality',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }

    setNotifications(notifs);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (notif: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
    setIsOpen(false);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)] relative"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{
              backgroundColor: 'var(--color-error)',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Mark All Read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--color-textMuted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = typeIcons[notif.type];
                  const color = typeColors[notif.type];
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className="w-full px-4 py-3 flex items-start gap-3 text-left transition-colors hover:bg-[var(--color-background)]"
                      style={{
                        backgroundColor: notif.read ? 'transparent' : 'rgba(245, 158, 11, 0.03)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: 'var(--color-accent)' }}
                            />
                          )}
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-textMuted)' }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                          <Clock className="w-3 h-3" />
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
