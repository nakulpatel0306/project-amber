import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  coffee_chat_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_avatar_url: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface ChatPartner {
  id: string;
  name: string;
  avatarUrl: string | null;
  coffeeChatId: string;
}

interface OpenChat {
  coffeeChatId: string;
  partner: ChatPartner;
  messages: Message[];
  isMinimized: boolean;
}

interface MessagingContextValue {
  openChats: OpenChat[];
  openChat: (coffeeChatId: string, partner: ChatPartner) => void;
  closeChat: (coffeeChatId: string) => void;
  minimizeChat: (coffeeChatId: string) => void;
  maximizeChat: (coffeeChatId: string) => void;
  sendMessage: (coffeeChatId: string, content: string) => Promise<void>;
  markAsRead: (coffeeChatId: string) => Promise<void>;
  unreadCounts: Record<string, number>;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

  // Load messages for a chat
  const loadMessages = useCallback(async (coffeeChatId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('coffee_chat_id', coffeeChatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return [];
    }
    return data || [];
  }, []);

  // Subscribe to real-time messages for a chat
  const subscribeToChat = useCallback((coffeeChatId: string) => {
    if (channels.has(coffeeChatId)) return;

    const channel = supabase
      .channel(`messages:${coffeeChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `coffee_chat_id=eq.${coffeeChatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setOpenChats(prev =>
            prev.map(chat =>
              chat.coffeeChatId === coffeeChatId
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
            )
          );

          // Update unread count if message is from someone else
          if (newMessage.sender_id !== user?.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [coffeeChatId]: (prev[coffeeChatId] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    setChannels(prev => new Map(prev).set(coffeeChatId, channel));
  }, [channels, user?.id]);

  // Unsubscribe from a chat
  const unsubscribeFromChat = useCallback((coffeeChatId: string) => {
    const channel = channels.get(coffeeChatId);
    if (channel) {
      supabase.removeChannel(channel);
      setChannels(prev => {
        const next = new Map(prev);
        next.delete(coffeeChatId);
        return next;
      });
    }
  }, [channels]);

  // Open a chat panel
  const openChat = useCallback(async (coffeeChatId: string, partner: ChatPartner) => {
    // Check if already open
    const existing = openChats.find(c => c.coffeeChatId === coffeeChatId);
    if (existing) {
      // Just maximize if minimized
      setOpenChats(prev =>
        prev.map(c =>
          c.coffeeChatId === coffeeChatId ? { ...c, isMinimized: false } : c
        )
      );
      return;
    }

    // Limit to 3 open chats
    if (openChats.length >= 3) {
      // Close the oldest one
      const oldest = openChats[0];
      unsubscribeFromChat(oldest.coffeeChatId);
      setOpenChats(prev => prev.slice(1));
    }

    // Load messages and open
    const messages = await loadMessages(coffeeChatId);
    setOpenChats(prev => [
      ...prev,
      { coffeeChatId, partner, messages, isMinimized: false },
    ]);

    // Subscribe to real-time updates
    subscribeToChat(coffeeChatId);

    // Clear unread count
    setUnreadCounts(prev => ({ ...prev, [coffeeChatId]: 0 }));
  }, [openChats, loadMessages, subscribeToChat, unsubscribeFromChat]);

  // Close a chat panel
  const closeChat = useCallback((coffeeChatId: string) => {
    unsubscribeFromChat(coffeeChatId);
    setOpenChats(prev => prev.filter(c => c.coffeeChatId !== coffeeChatId));
  }, [unsubscribeFromChat]);

  // Minimize a chat panel
  const minimizeChat = useCallback((coffeeChatId: string) => {
    setOpenChats(prev =>
      prev.map(c =>
        c.coffeeChatId === coffeeChatId ? { ...c, isMinimized: true } : c
      )
    );
  }, []);

  // Maximize a chat panel
  const maximizeChat = useCallback((coffeeChatId: string) => {
    setOpenChats(prev =>
      prev.map(c =>
        c.coffeeChatId === coffeeChatId ? { ...c, isMinimized: false } : c
      )
    );
    // Clear unread count
    setUnreadCounts(prev => ({ ...prev, [coffeeChatId]: 0 }));
  }, []);

  // Send a message
  const sendMessage = useCallback(async (coffeeChatId: string, content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase.from('messages').insert({
      coffee_chat_id: coffeeChatId,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Unknown',
      sender_avatar_url: profile?.avatar_url || null,
      content: content.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user, profile]);

  // Mark messages as read
  const markAsRead = useCallback(async (coffeeChatId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('coffee_chat_id', coffeeChatId)
      .neq('sender_id', user.id)
      .is('read_at', null);

    setUnreadCounts(prev => ({ ...prev, [coffeeChatId]: 0 }));
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [channels]);

  return (
    <MessagingContext.Provider
      value={{
        openChats,
        openChat,
        closeChat,
        minimizeChat,
        maximizeChat,
        sendMessage,
        markAsRead,
        unreadCounts,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
