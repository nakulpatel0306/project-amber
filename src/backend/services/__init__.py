"""
Backend Services Module

Provides AI-powered services for the Amber platform:
- TranscriptionService: Audio transcription using OpenAI Whisper
- SummaryService: Meeting summarization using GPT-4
"""

from .transcription_service import TranscriptionService
from .summary_service import SummaryService

__all__ = ['TranscriptionService', 'SummaryService']
