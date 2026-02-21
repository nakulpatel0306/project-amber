-- Messages table for coffee chat conversations
-- Enables real-time messaging between candidates and employers

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_chat_id UUID NOT NULL REFERENCES public.coffee_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT,
  sender_avatar_url TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_messages_coffee_chat_id ON public.messages(coffee_chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only participants of the coffee chat can read/write messages
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      WHERE cc.id = coffee_chat_id
      AND (
        EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = cc.candidate_id AND c.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = cc.employer_id AND e.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      WHERE cc.id = coffee_chat_id
      AND (
        EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = cc.candidate_id AND c.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = cc.employer_id AND e.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;
CREATE POLICY "Participants can update messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      WHERE cc.id = coffee_chat_id
      AND (
        EXISTS (SELECT 1 FROM public.candidates c WHERE c.id = cc.candidate_id AND c.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = cc.employer_id AND e.user_id = auth.uid())
      )
    )
  );

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Verify
SELECT 'Messages table created successfully!' AS status;
