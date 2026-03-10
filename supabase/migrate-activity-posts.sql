-- ============================================
-- ACTIVITY POSTS MIGRATION
-- ============================================
-- This script creates the activity_posts table for the Network Hub feed.
-- Run this in your Supabase SQL Editor.
--
-- Prerequisites:
--   - schema.sql has been run (for profiles table and updated_at function)
--   - seed-catalog-data.sql has been run (for hobbies/catalog_photos columns)

-- ============================================
-- ACTIVITY_POSTS TABLE
-- ============================================
-- Stores user-created posts with images and captions
CREATE TABLE IF NOT EXISTS public.activity_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Post content
  image_url TEXT NOT NULL,           -- Primary image URL (stored in Supabase storage)
  caption TEXT NOT NULL,             -- Post caption (required)
  hobby_tags TEXT[] DEFAULT '{}',    -- Array of hobby/personality tags

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_activity_posts_user_id ON public.activity_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_posts_created_at ON public.activity_posts(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS update_activity_posts_updated_at ON public.activity_posts;
CREATE TRIGGER update_activity_posts_updated_at
  BEFORE UPDATE ON public.activity_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.activity_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view all posts
DROP POLICY IF EXISTS "Anyone can view activity posts" ON public.activity_posts;
CREATE POLICY "Anyone can view activity posts"
ON public.activity_posts FOR SELECT
TO authenticated
USING (true);

-- Users can create their own posts
DROP POLICY IF EXISTS "Users can create own posts" ON public.activity_posts;
CREATE POLICY "Users can create own posts"
ON public.activity_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.activity_posts;
CREATE POLICY "Users can update own posts"
ON public.activity_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON public.activity_posts;
CREATE POLICY "Users can delete own posts"
ON public.activity_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET (for post images)
-- ============================================
-- Create storage bucket for activity post images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-posts', 'activity-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for activity posts bucket
DROP POLICY IF EXISTS "Anyone can view activity post images" ON storage.objects;
CREATE POLICY "Anyone can view activity post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activity-posts');

DROP POLICY IF EXISTS "Authenticated users can upload activity post images" ON storage.objects;
CREATE POLICY "Authenticated users can upload activity post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activity-posts');

DROP POLICY IF EXISTS "Users can delete own activity post images" ON storage.objects;
CREATE POLICY "Users can delete own activity post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activity-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- POST_LIKES TABLE
-- ============================================
-- Tracks which users have liked which posts
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.activity_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can only like a post once
  UNIQUE(user_id, post_id)
);

-- ============================================
-- POST_LIKES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

-- ============================================
-- POST_LIKES RLS
-- ============================================
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view likes (to show like counts)
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
CREATE POLICY "Anyone can view post likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

-- Users can like posts (create their own like records)
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts (delete their own like records)
DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- ADD LIKE_COUNT COLUMN TO ACTIVITY_POSTS
-- ============================================
-- Denormalized like count for faster queries
ALTER TABLE public.activity_posts
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- ============================================
-- TRIGGER: Update like_count on like/unlike
-- ============================================
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activity_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activity_posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like_change ON public.post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- ============================================
-- VERIFY SETUP
-- ============================================
-- Check that the tables were created
SELECT 'activity_posts columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_posts'
ORDER BY ordinal_position;

SELECT 'post_likes columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;
