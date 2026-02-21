-- saved_matches table for bookmarking/shortlisting
CREATE TABLE IF NOT EXISTS saved_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('role', 'candidate')),
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  match_score INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'pending', 'connected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_matches_user_id ON saved_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_matches_role_id ON saved_matches(role_id);
CREATE INDEX IF NOT EXISTS idx_saved_matches_candidate_id ON saved_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_matches_status ON saved_matches(status);

-- RLS policies
ALTER TABLE saved_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved matches" ON saved_matches;
CREATE POLICY "Users can view their own saved matches"
  ON saved_matches FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved matches" ON saved_matches;
CREATE POLICY "Users can insert their own saved matches"
  ON saved_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved matches" ON saved_matches;
CREATE POLICY "Users can update their own saved matches"
  ON saved_matches FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved matches" ON saved_matches;
CREATE POLICY "Users can delete their own saved matches"
  ON saved_matches FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_saved_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_matches_updated_at ON saved_matches;
CREATE TRIGGER saved_matches_updated_at
  BEFORE UPDATE ON saved_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_matches_updated_at();

-- Add candidate_name column for display without cross-table JOINs
ALTER TABLE saved_matches ADD COLUMN IF NOT EXISTS candidate_name TEXT;
