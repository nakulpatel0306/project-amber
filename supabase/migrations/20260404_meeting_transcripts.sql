-- Migration: Create meeting_transcripts table for AI-powered meeting notes
-- This table stores audio recordings, transcriptions, and AI summaries for coffee chats.
-- Both participants can upload their own audio, which gets transcribed and merged.

-- Create the meeting_transcripts table
CREATE TABLE IF NOT EXISTS public.meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coffee_chat_id UUID NOT NULL REFERENCES public.coffee_chats(id) ON DELETE CASCADE,

  -- Participant recordings (storage paths in meeting-recordings bucket)
  candidate_audio_path TEXT,
  employer_audio_path TEXT,

  -- Individual transcripts from Whisper
  candidate_transcript TEXT,
  employer_transcript TEXT,

  -- Merged/unified transcript
  merged_transcript TEXT,

  -- AI-generated summary and structured data
  summary_text TEXT,
  key_topics JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Processing status tracking
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups by coffee_chat_id
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_coffee_chat_id
  ON public.meeting_transcripts(coffee_chat_id);

-- Add flag to coffee_chats table to quickly identify chats with notes
ALTER TABLE public.coffee_chats
  ADD COLUMN IF NOT EXISTS has_meeting_notes BOOLEAN DEFAULT FALSE;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meeting_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meeting_transcripts_updated_at ON public.meeting_transcripts;
CREATE TRIGGER meeting_transcripts_updated_at
  BEFORE UPDATE ON public.meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_transcripts_updated_at();

-- Enable RLS on meeting_transcripts
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view transcripts for coffee chats they are part of
CREATE POLICY "Users can view their own meeting transcripts"
  ON public.meeting_transcripts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      JOIN public.candidates c ON cc.candidate_id = c.id
      JOIN public.employers e ON cc.employer_id = e.id
      WHERE cc.id = meeting_transcripts.coffee_chat_id
        AND (c.user_id = auth.uid() OR e.user_id = auth.uid())
    )
  );

-- RLS Policy: Users can insert transcripts for coffee chats they are part of
CREATE POLICY "Users can create meeting transcripts for their chats"
  ON public.meeting_transcripts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      JOIN public.candidates c ON cc.candidate_id = c.id
      JOIN public.employers e ON cc.employer_id = e.id
      WHERE cc.id = coffee_chat_id
        AND (c.user_id = auth.uid() OR e.user_id = auth.uid())
    )
  );

-- RLS Policy: Users can update transcripts for coffee chats they are part of
CREATE POLICY "Users can update their own meeting transcripts"
  ON public.meeting_transcripts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_chats cc
      JOIN public.candidates c ON cc.candidate_id = c.id
      JOIN public.employers e ON cc.employer_id = e.id
      WHERE cc.id = meeting_transcripts.coffee_chat_id
        AND (c.user_id = auth.uid() OR e.user_id = auth.uid())
    )
  );

SELECT 'Migration complete! meeting_transcripts table created.' AS status;
