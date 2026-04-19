-- ─────────────────────────────────────────────────────────────
-- Waitlist / interest-signup table
-- Captures email + role (candidate or employer) from the landing
-- page "Join Waitlist" flow. A public RPC exposes only the total
-- counts (never the raw email list).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),
  source TEXT DEFAULT 'landing',
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique constraint so "Alex@Amber.app" == "alex@amber.app"
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx
  ON waitlist (LOWER(email));

CREATE INDEX IF NOT EXISTS waitlist_created_at_idx
  ON waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS waitlist_role_idx
  ON waitlist (role);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: anyone can insert, no one can SELECT raw rows.
-- Counts are exposed via the get_waitlist_count() RPC below.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anonymous or signed-in) to add themselves
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- No public SELECT — emails stay private. Only service_role can read.
DROP POLICY IF EXISTS "Service role can read waitlist" ON waitlist;
CREATE POLICY "Service role can read waitlist" ON waitlist
  FOR SELECT TO service_role
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- Public RPC: returns aggregate counts (total / candidates /
-- employers) without exposing individual rows.
-- SECURITY DEFINER lets it bypass RLS for the aggregation only.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS TABLE (
  total BIGINT,
  candidates BIGINT,
  employers BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE role = 'candidate')::BIGINT AS candidates,
    COUNT(*) FILTER (WHERE role = 'employer')::BIGINT AS employers
  FROM waitlist;
END;
$$;

GRANT EXECUTE ON FUNCTION get_waitlist_count() TO anon, authenticated;
