import { useState, useRef, useEffect } from 'react';
import { X, Minus, Send, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging, type Message, type ChatPartner } from '../../contexts/MessagingContext';
import { format, isToday, isYesterday } from 'date-fns';

interface MessagePanelProps {
  coffeeChatId: string;
  partner: ChatPartner;
  messages: Message[];
  isMinimized: boolean;
  position: number; // 0, 1, 2 for positioning multiple panels
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
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  // Calculate right position based on panel index
  const rightOffset = 24 + position * 340; // 340px per panel + 24px margin

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
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
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
      className="fixed bottom-4 w-80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        right: `${rightOffset}px`,
        height: '420px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-sm font-semibold text-white truncate">{partner.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => minimizeChat(coffeeChatId)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => closeChat(coffeeChatId)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-center" style={{ color: 'var(--color-textMuted)' }}>
              No messages yet.<br />Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {msg.sender_avatar_url ? (
                        <img
                          src={msg.sender_avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
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
                  <div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                      style={{
                        backgroundColor: isOwn ? 'var(--color-accent)' : 'var(--color-surface)',
                        color: isOwn ? 'white' : 'var(--color-text)',
                        border: isOwn ? 'none' : '1px solid var(--color-border)',
                      }}
                    >
                      {msg.content}
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 ${isOwn ? 'text-right' : ''}`}
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-2 border-t"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-end gap-2">
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
              maxHeight: '80px',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-2 rounded-xl transition-colors disabled:opacity-50"
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
