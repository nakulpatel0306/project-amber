import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Minus, Send, User, Smile, Paperclip } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging, type Message, type ChatPartner } from '../../contexts/MessagingContext';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface MessagePanelProps {
  coffeeChatId: string;
  partner: ChatPartner;
  messages: Message[];
  isMinimized: boolean;
  position: number;
}

export function MessagePanel({
  coffeeChatId,
  partner,
  messages,
  isMinimized,
  position,
}: MessagePanelProps) {
  const { user } = useAuth();
  const { closeChat, minimizeChat, maximizeChat, sendMessage, markAsRead, unreadCounts } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const unreadCount = unreadCounts[coffeeChatId] || 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Mark as read when opening
  useEffect(() => {
    if (!isMinimized) {
      markAsRead(coffeeChatId);
    }
  }, [isMinimized, coffeeChatId, markAsRead]);

  // Focus input when maximized
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(coffeeChatId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages: insert date separators and detect consecutive same-sender
  const groupedMessages = useMemo(() => {
    const groups: { type: 'date' | 'message'; date?: string; msg?: Message; showAvatar?: boolean }[] = [];
    let lastDate: Date | null = null;
    let lastSenderId: string | null = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      if (!lastDate || !isSameDay(msgDate, lastDate)) {
        groups.push({ type: 'date', date: msg.created_at });
        lastSenderId = null;
      }
      const showAvatar = msg.sender_id !== lastSenderId;
      groups.push({ type: 'message', msg, showAvatar });
      lastDate = msgDate;
      lastSenderId = msg.sender_id;
    });
    return groups;
  }, [messages]);

  // 384px wide + 24px gap per panel
  const rightOffset = 24 + position * 408;

  if (isMinimized) {
    return (
      <button
        onClick={() => maximizeChat(coffeeChatId)}
        className="fixed bottom-4 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all hover:scale-105"
        style={{
          right: `${rightOffset}px`,
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          zIndex: 50,
        }}
      >
        {partner.avatarUrl ? (
          <img src={partner.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-surfaceHover)' }}
          >
            <User className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="text-sm font-medium max-w-[120px] truncate">{partner.name}</span>
        {unreadCount > 0 && (
          <span
            className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 w-96 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        right: `${rightOffset}px`,
        height: '460px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        zIndex: 50,
      }}
    >
      {/* Header — clean surface bg */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {partner.avatarUrl ? (
              <img src={partner.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <User className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
              </div>
            )}
            {/* Online dot */}
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-surface)' }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {partner.name}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-success)' }}>Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => minimizeChat(coffeeChatId)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
          >
            <Minus className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <button
            onClick={() => closeChat(coffeeChatId)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-center" style={{ color: 'var(--color-textMuted)' }}>
              No messages yet.<br />Say hello!
            </p>
          </div>
        ) : (
          groupedMessages.map((item, idx) => {
            if (item.type === 'date' && item.date) {
              return (
                <div key={`date-${idx}`} className="flex justify-center my-3">
                  <span
                    className="text-[10px] font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}
                  >
                    {formatDateSeparator(item.date)}
                  </span>
                </div>
              );
            }
            if (item.type === 'message' && item.msg) {
              const msg = item.msg;
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${item.showAvatar ? 'mt-3' : 'mt-0.5'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && item.showAvatar && (
                      <div className="flex-shrink-0 mt-1">
                        {msg.sender_avatar_url ? (
                          <img src={msg.sender_avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-border)' }}
                          >
                            <User className="w-3 h-3" style={{ color: 'var(--color-textMuted)' }} />
                          </div>
                        )}
                      </div>
                    )}
                    {!isOwn && !item.showAvatar && <div className="w-6 flex-shrink-0" />}
                    <div>
                      <div
                        className="message-enter px-3 py-2 rounded-[20px] text-sm"
                        style={{
                          backgroundColor: isOwn ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: isOwn ? 'white' : 'var(--color-text)',
                          border: isOwn ? 'none' : '1px solid var(--color-border)',
                        }}
                      >
                        {msg.content}
                      </div>
                      {item.showAvatar && (
                        <p
                          className={`text-[10px] mt-0.5 ${isOwn ? 'text-right' : ''}`}
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator placeholder */}
      {/* (will show when partner is typing) */}

      {/* Input */}
      <div
        className="p-3 border-t"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-end gap-2">
          <button
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)] flex-shrink-0 mb-0.5"
            title="Emoji"
          >
            <Smile className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <button
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)] flex-shrink-0 mb-0.5"
            title="Attach"
          >
            <Paperclip className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
          </button>
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-xl text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              maxHeight: '72px',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
