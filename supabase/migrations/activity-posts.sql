-- Migration: Activity Posts
-- User-posted images showcasing hobbies/interests for the dashboard carousel.

CREATE TABLE IF NOT EXISTS public.activity_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  hobby_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_posts_user ON public.activity_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_posts_created ON public.activity_posts(created_at DESC);

-- RLS
ALTER TABLE public.activity_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view posts
DROP POLICY IF EXISTS "Authenticated users can view activity posts" ON public.activity_posts;
CREATE POLICY "Authenticated users can view activity posts"
  ON public.activity_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own posts
DROP POLICY IF EXISTS "Users can create own activity posts" ON public.activity_posts;
CREATE POLICY "Users can create own activity posts"
  ON public.activity_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
DROP POLICY IF EXISTS "Users can update own activity posts" ON public.activity_posts;
CREATE POLICY "Users can update own activity posts"
  ON public.activity_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
DROP POLICY IF EXISTS "Users can delete own activity posts" ON public.activity_posts;
CREATE POLICY "Users can delete own activity posts"
  ON public.activity_posts FOR DELETE
  USING (auth.uid() = user_id);

SELECT 'Migration complete! Activity posts table created.' AS status;
