export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';

export interface MeetInvite {
  id: string;
  connection_id: string;
  proposed_times: string[]; // ISO datetime strings
  confirmed_time: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  duration_minutes: number;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: 'candidate' | 'employer';
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  sender_company: string | null;
  receiver_company: string | null;
  created_at: string;
  updated_at: string;
  meet_invite?: MeetInvite | null;
}
