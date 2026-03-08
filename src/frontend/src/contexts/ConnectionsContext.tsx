import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Connection, ConnectionStatus } from '../types/connections.types';

const API_BASE = 'http://127.0.0.1:8000';

interface SendConnectionData {
  receiverId: string;
  senderRole: 'candidate' | 'employer';
  message?: string;
  senderName?: string;
  receiverName?: string;
  senderCompany?: string;
  receiverCompany?: string;
  meetInvite?: {
    proposed_times: string[];
    duration_minutes?: number;
  };
}

interface ConnectionsContextValue {
  pendingSent: Connection[];
  pendingReceived: Connection[];
  accepted: Connection[];
  isLoading: boolean;
  pendingReceivedCount: number;
  getConnectionStatus: (targetUserId: string) => ConnectionStatus;
  sendConnectionRequest: (data: SendConnectionData) => Promise<void>;
  acceptConnection: (id: string, options?: { acceptMeetInvite?: boolean; confirmedTime?: string }) => Promise<void>;
  rejectConnection: (id: string) => Promise<void>;
  refreshConnections: () => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextValue | null>(null);

export function ConnectionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pendingSent, setPendingSent] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [accepted, setAccepted] = useState<Connection[]>([]);
  const [rejected, setRejected] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshConnections = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/connections/me`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingSent(data.pending_sent || []);
        setPendingReceived(data.pending_received || []);
        setAccepted(data.accepted || []);
        setRejected(data.rejected || []);
      }
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch on mount when user is available
  useEffect(() => {
    if (user) {
      refreshConnections();
    }
  }, [user, refreshConnections]);

  // Real-time subscription for connection changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('connections-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `sender_id=eq.${user.id}`,
        },
        () => refreshConnections()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => refreshConnections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshConnections]);

  const getConnectionStatus = useCallback((targetUserId: string): ConnectionStatus => {
    if (pendingSent.some(c => c.receiver_id === targetUserId)) return 'pending_sent';
    if (pendingReceived.some(c => c.sender_id === targetUserId)) return 'pending_received';
    if (accepted.some(c => c.sender_id === targetUserId || c.receiver_id === targetUserId)) return 'accepted';
    if (rejected.some(c => c.sender_id === targetUserId || c.receiver_id === targetUserId)) return 'rejected';
    return 'none';
  }, [pendingSent, pendingReceived, accepted, rejected]);

  const sendConnectionRequest = useCallback(async (data: SendConnectionData) => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${API_BASE}/api/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        receiver_id: data.receiverId,
        sender_role: data.senderRole,
        message: data.message || null,
        sender_name: data.senderName || null,
        receiver_name: data.receiverName || null,
        sender_company: data.senderCompany || null,
        receiver_company: data.receiverCompany || null,
        meet_invite: data.meetInvite ? {
          proposed_times: data.meetInvite.proposed_times,
          duration_minutes: data.meetInvite.duration_minutes || 30,
        } : null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send connection request');
    }
    await refreshConnections();
  }, [refreshConnections]);

  const acceptConnection = useCallback(async (id: string, options?: { acceptMeetInvite?: boolean; confirmedTime?: string }) => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${API_BASE}/api/connections/${id}/accept`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        accept_meet_invite: options?.acceptMeetInvite || false,
        confirmed_time: options?.confirmedTime || null,
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to accept connection');
    }
    await refreshConnections();
  }, [refreshConnections]);

  const rejectConnection = useCallback(async (id: string) => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${API_BASE}/api/connections/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to reject connection');
    }
    await refreshConnections();
  }, [refreshConnections]);

  const pendingReceivedCount = useMemo(() => pendingReceived.length, [pendingReceived]);

  const value = useMemo<ConnectionsContextValue>(() => ({
    pendingSent,
    pendingReceived,
    accepted,
    isLoading,
    pendingReceivedCount,
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    refreshConnections,
  }), [
    pendingSent, pendingReceived, accepted, isLoading, pendingReceivedCount,
    getConnectionStatus, sendConnectionRequest, acceptConnection, rejectConnection, refreshConnections,
  ]);

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) {
    throw new Error('useConnections must be used within ConnectionsProvider');
  }
  return ctx;
}
