-- Migration: Connections & Connection Meet Invites
-- Adds a connections layer as a prerequisite for coffee chats.
-- Users send Connect requests (with optional bundled coffee chat invite + proposed times).
-- Accepted connections unlock coffee chats.

-- ============================================
-- CONNECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('candidate', 'employer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  -- Denormalized names to avoid RLS JOIN issues (same pattern as coffee_chats)
  sender_name TEXT,
  receiver_name TEXT,
  sender_company TEXT,
  receiver_company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connections_sender ON public.connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_connections_updated_at ON public.connections;
CREATE TRIGGER trigger_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION update_connections_updated_at();

-- ============================================
-- CONNECTION MEET INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.connection_meet_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  proposed_times JSONB, -- array of ISO datetime strings
  confirmed_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meet_invites_connection ON public.connection_meet_invites(connection_id);

DROP TRIGGER IF EXISTS trigger_meet_invites_updated_at ON public.connection_meet_invites;
CREATE TRIGGER trigger_meet_invites_updated_at
  BEFORE UPDATE ON public.connection_meet_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_connections_updated_at();

-- ============================================
-- ALTER COFFEE_CHATS — add connection_id reference
-- ============================================
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_coffee_chats_connection ON public.coffee_chats(connection_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_meet_invites ENABLE ROW LEVEL SECURITY;

-- Connections: users can view connections they are part of
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Connections: users can insert connections where they are the sender
DROP POLICY IF EXISTS "Users can create connections" ON public.connections;
CREATE POLICY "Users can create connections"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Connections: participants can update connections
DROP POLICY IF EXISTS "Participants can update connections" ON public.connections;
CREATE POLICY "Participants can update connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Meet invites: accessible via connection ownership
DROP POLICY IF EXISTS "Users can view own meet invites" ON public.connection_meet_invites;
CREATE POLICY "Users can view own meet invites"
  ON public.connection_meet_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create meet invites" ON public.connection_meet_invites;
CREATE POLICY "Users can create meet invites"
  ON public.connection_meet_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update meet invites" ON public.connection_meet_invites;
CREATE POLICY "Users can update meet invites"
  ON public.connection_meet_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

SELECT 'Migration complete! Connections tables created.' AS status;
