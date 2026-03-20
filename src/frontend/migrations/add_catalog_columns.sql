-- Migration: Add catalog columns to candidates table
-- Run this in your Supabase SQL Editor or via psql

-- Add hobbies column (array of hobby IDs)
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}';

-- Add catalog_photos column (array of photo URLs)
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS catalog_photos text[] DEFAULT '{}';

-- Create storage bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile photos
CREATE POLICY "Public read access for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
