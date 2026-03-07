import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Coffee,
  Brain,
  Users,
  Star,
  Clock,
  X,
  Trash2,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: string;
  type: 'coffee_chat' | 'match' | 'assessment' | 'system' | 'welcome' | 'achievement' | 'connection';
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
  welcome: UserPlus,
  achievement: CheckCircle,
  connection: UserPlus,
};

const typeColors: Record<string, string> = {
  coffee_chat: '#F59E0B',
  match: '#10B981',
  assessment: '#8B5CF6',
  system: 'var(--color-accent)',
  welcome: '#3B82F6',
  achievement: '#10B981',
  connection: '#D97706',
};

const STORAGE_KEY = 'amber_notifications';

function getPersistedState(): { read: string[]; dismissed: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { read: [], dismissed: [] };
}

function persistState(read: string[], dismissed: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ read, dismissed }));
}

export function NotificationDropdown() {
  const { user, profile, isEmployer } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const persisted = getPersistedState();
    setReadIds(new Set(persisted.read));
    setDismissedIds(new Set(persisted.dismissed));
  }, []);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const notifs: Notification[] = [];
    const firstName = profile?.full_name?.split(' ')[0] || 'there';

    try {
      if (isEmployer) {
        const { data: employer } = await supabase
          .from('employers')
          .select('id, culture_quiz_completed, created_at')
          .eq('user_id', user.id)
          .single();

        if (employer) {
          // Pending coffee chat requests from candidates
          const { data: pendingChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, candidate_name')
            .eq('employer_id', employer.id)
            .eq('status', 'pending')
            .eq('initiated_by', 'candidate')
            .order('created_at', { ascending: false })
            .limit(5);

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

          // Accepted chats (confirmations)
          const { data: acceptedChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, candidate_name')
            .eq('employer_id', employer.id)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false })
            .limit(3);

          if (acceptedChats) {
            for (const chat of acceptedChats) {
              notifs.push({
                id: `accepted-${chat.id}`,
                type: 'achievement',
                title: 'Chat Confirmed',
                message: `${chat.candidate_name || 'A candidate'} accepted your invite`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/employer/chats',
              });
            }
          }

          // Pending connection requests
          const { data: pendingConnections } = await supabase
            .from('connections')
            .select('id, created_at, sender_name')
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

          if (pendingConnections) {
            for (const conn of pendingConnections) {
              notifs.push({
                id: `conn-${conn.id}`,
                type: 'connection',
                title: 'Connection Request',
                message: `${conn.sender_name || 'Someone'} wants to connect`,
                read: false,
                createdAt: new Date(conn.created_at),
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

          // Roles without candidates
          const { data: roles } = await supabase
            .from('roles')
            .select('id, title')
            .eq('employer_id', employer.id)
            .eq('status', 'active');

          if (roles && roles.length === 0) {
            notifs.push({
              id: 'no-roles',
              type: 'system',
              title: 'Post Your First Role',
              message: 'Create a role listing to start finding candidates',
              read: false,
              createdAt: new Date(),
              actionUrl: '/app/employer',
            });
          }
        }
      } else {
        // Candidate notifications
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id, assessment_completed_at, openness_score, headline, created_at')
          .eq('user_id', user.id)
          .single();

        if (candidate) {
          // Pending coffee chats from employers
          const { data: pendingChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, company_name')
            .eq('candidate_id', candidate.id)
            .eq('status', 'pending')
            .eq('initiated_by', 'employer')
            .order('created_at', { ascending: false })
            .limit(5);

          if (pendingChats) {
            for (const chat of pendingChats) {
              notifs.push({
                id: `chat-${chat.id}`,
                type: 'coffee_chat',
                title: 'Coffee Chat Invitation',
                message: `${chat.company_name || 'A company'} wants to chat with you`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/chats',
              });
            }
          }

          // Accepted chats (your requests got accepted)
          const { data: acceptedChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, company_name')
            .eq('candidate_id', candidate.id)
            .eq('status', 'accepted')
            .eq('initiated_by', 'candidate')
            .order('created_at', { ascending: false })
            .limit(3);

          if (acceptedChats) {
            for (const chat of acceptedChats) {
              notifs.push({
                id: `accepted-${chat.id}`,
                type: 'achievement',
                title: 'Chat Request Accepted',
                message: `${chat.company_name || 'A company'} accepted your chat request`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/chats',
              });
            }
          }

          // Completed chats — prompt for feedback
          const { data: completedChats } = await supabase
            .from('coffee_chats')
            .select('id, created_at, company_name, candidate_rating')
            .eq('candidate_id', candidate.id)
            .eq('status', 'completed')
            .is('candidate_rating', null)
            .order('created_at', { ascending: false })
            .limit(3);

          if (completedChats) {
            for (const chat of completedChats) {
              notifs.push({
                id: `feedback-${chat.id}`,
                type: 'system',
                title: 'Rate Your Chat',
                message: `How was your chat with ${chat.company_name || 'the employer'}?`,
                read: false,
                createdAt: new Date(chat.created_at),
                actionUrl: '/app/chats',
              });
            }
          }

          // Pending connection requests (candidate)
          const { data: pendingConns } = await supabase
            .from('connections')
            .select('id, created_at, sender_name, sender_company')
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

          if (pendingConns) {
            for (const conn of pendingConns) {
              notifs.push({
                id: `conn-${conn.id}`,
                type: 'connection',
                title: 'Connection Request',
                message: `${conn.sender_name || conn.sender_company || 'Someone'} wants to connect`,
                read: false,
                createdAt: new Date(conn.created_at),
              });
            }
          }

          // Assessment reminder
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

          // Profile incomplete
          if (!candidate.headline) {
            notifs.push({
              id: 'profile-incomplete',
              type: 'system',
              title: 'Complete Your Profile',
              message: 'Add a headline and bio to stand out to employers',
              read: false,
              createdAt: new Date(),
              actionUrl: '/app/settings',
            });
          }

          // Retake available
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

          // Match notification — check if there are roles to match with
          if (candidate.openness_score) {
            const { count } = await supabase
              .from('roles')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'active');

            if (count && count > 0) {
              notifs.push({
                id: 'new-matches',
                type: 'match',
                title: 'Matches Available',
                message: `${count} ${count === 1 ? 'role matches' : 'roles match'} your personality profile`,
                read: false,
                createdAt: new Date(),
                actionUrl: '/app/ember',
              });
            }
          }
        }
      }

      // Welcome notification for all users
      notifs.push({
        id: 'welcome',
        type: 'welcome',
        title: `Welcome, ${firstName}`,
        message: 'Get started by exploring your dashboard',
        read: false,
        createdAt: new Date(user.created_at || Date.now()),
        actionUrl: isEmployer ? '/app/employer' : '/app/dashboard',
      });
    } catch (err) {
      console.error('Error loading notifications:', err);
    }

    // Sort by date, newest first
    notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setNotifications(notifs);
  };

  const visibleNotifications = notifications
    .filter(n => !dismissedIds.has(n.id))
    .map(n => ({ ...n, read: n.read || readIds.has(n.id) }));

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistState([...next], [...dismissedIds]);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(prev => {
      const next = new Set(prev);
      visibleNotifications.forEach(n => next.add(n.id));
      persistState([...next], [...dismissedIds]);
      return next;
    });
  };

  const dismissOne = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistState([...readIds], [...next]);
      return next;
    });
  };

  const clearAll = () => {
    const allIds = visibleNotifications.map(n => n.id);
    setDismissedIds(prev => {
      const next = new Set(prev);
      allIds.forEach(id => next.add(id));
      persistState([...readIds], [...next]);
      return next;
    });
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
    setIsOpen(false);
  };

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)] relative"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed w-80 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              top: dropdownPos.top,
              right: dropdownPos.right,
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
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Mark All Read
                  </button>
                )}
                {visibleNotifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1 rounded transition-colors hover:bg-[var(--color-surfaceHover)]"
                    style={{ color: 'var(--color-textMuted)' }}
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--color-textMuted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    All caught up
                  </p>
                </div>
              ) : (
                visibleNotifications.map(notif => {
                  const Icon = typeIcons[notif.type] || Star;
                  const color = typeColors[notif.type] || 'var(--color-accent)';
                  return (
                    <div
                      key={notif.id}
                      className="relative group"
                    >
                      <button
                        onClick={() => handleClick(notif)}
                        className="w-full px-4 py-3 flex items-start gap-3 text-left transition-colors hover:bg-[var(--color-background)] pr-10"
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissOne(notif.id);
                        }}
                        className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-surfaceHover)]"
                        style={{ color: 'var(--color-textMuted)' }}
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
