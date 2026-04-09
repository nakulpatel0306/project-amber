"""
Transcription Service

Handles audio transcription using OpenAI's Whisper API.
Supports transcribing meeting recordings and merging multiple transcripts.
"""

import os
import tempfile
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class TranscriptionService:
    """Service for transcribing audio files using OpenAI Whisper."""

    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=api_key)

    def transcribe_audio(self, audio_data: bytes, filename: str = "audio.webm") -> str:
        """
        Transcribe audio data using OpenAI Whisper.

        Args:
            audio_data: Raw audio bytes
            filename: Original filename (used for format detection)

        Returns:
            Transcription text
        """
        # Determine file extension for temp file
        ext = os.path.splitext(filename)[1] or '.webm'

        # Write to temp file (Whisper API requires file-like object)
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(audio_data)
            tmp_path = tmp.name

        try:
            with open(tmp_path, 'rb') as audio_file:
                response = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text",
                    language="en"
                )
            return response.strip() if isinstance(response, str) else str(response).strip()
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    def transcribe_from_url(self, audio_url: str) -> str:
        """
        Download and transcribe audio from a URL.

        Args:
            audio_url: URL to the audio file

        Returns:
            Transcription text
        """
        import httpx

        # Download the audio file
        with httpx.Client(timeout=60) as client:
            response = client.get(audio_url)
            response.raise_for_status()
            audio_data = response.content

        # Extract filename from URL
        filename = audio_url.split('/')[-1].split('?')[0]
        return self.transcribe_audio(audio_data, filename)

    def merge_transcripts(
        self,
        candidate_transcript: Optional[str],
        employer_transcript: Optional[str]
    ) -> str:
        """
        Merge two transcripts into a unified conversation format.

        Since we don't have speaker diarization, we simply concatenate
        the transcripts with clear separation.

        Args:
            candidate_transcript: Transcript from candidate's recording
            employer_transcript: Transcript from employer's recording

        Returns:
            Merged transcript text
        """
        parts = []

        if candidate_transcript:
            parts.append(f"[Candidate Recording]\n{candidate_transcript}")

        if employer_transcript:
            parts.append(f"[Employer Recording]\n{employer_transcript}")

        if not parts:
            return ""

        return "\n\n---\n\n".join(parts)


# Singleton instance for easy access
_service: Optional[TranscriptionService] = None


def get_transcription_service() -> TranscriptionService:
    """Get or create the transcription service singleton."""
    global _service
    if _service is None:
        _service = TranscriptionService()
    return _service
