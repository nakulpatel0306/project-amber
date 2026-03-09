-- ============================================
-- ADD PHOTO CAPTIONS COLUMN
-- ============================================
-- This script adds the catalog_photos_data column to store photo captions.
-- Run this in your Supabase SQL Editor.

-- Add catalog_photos_data column for photos with captions (JSONB array)
-- Format: [{"url": "...", "caption": "..."}, ...]
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS catalog_photos_data jsonb DEFAULT '[]'::jsonb;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name = 'catalog_photos_data';
