"""
Summary Service

Handles meeting summarization using OpenAI's GPT-4.
Generates structured summaries with key topics and action items.
"""

import os
import json
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class SummaryService:
    """Service for generating meeting summaries using GPT-4."""

    SYSTEM_PROMPT = """You are an AI assistant that summarizes coffee chat meetings between job candidates and employers.
Your role is to extract key insights, discussion topics, and any action items from the meeting transcript.

Generate a structured summary that includes:
1. A brief overview (2-3 sentences)
2. Key topics discussed
3. Notable insights about the candidate or role
4. Action items or follow-ups mentioned
5. Overall tone and rapport assessment

Be professional, concise, and focus on information relevant to the hiring process."""

    USER_PROMPT_TEMPLATE = """Please analyze this coffee chat transcript and provide a structured summary.

TRANSCRIPT:
{transcript}

Respond in the following JSON format:
{{
    "summary": "A 2-3 sentence overview of the meeting",
    "key_topics": ["topic1", "topic2", "topic3"],
    "action_items": ["action1", "action2"],
    "candidate_insights": "Brief notes about the candidate's strengths, interests, or concerns",
    "employer_insights": "Brief notes about the role, team, or company discussed",
    "rapport_assessment": "Brief assessment of the conversation dynamic"
}}"""

    def __init__(self):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=api_key)

    def generate_summary(self, transcript: str) -> dict:
        """
        Generate a structured summary from a meeting transcript.

        Args:
            transcript: The merged transcript text

        Returns:
            Dictionary with summary, key_topics, action_items, etc.
        """
        if not transcript or not transcript.strip():
            return {
                "summary": "No transcript available for summarization.",
                "key_topics": [],
                "action_items": [],
                "candidate_insights": "",
                "employer_insights": "",
                "rapport_assessment": ""
            }

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": self.USER_PROMPT_TEMPLATE.format(transcript=transcript)}
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )

        # Parse the JSON response
        content = response.choices[0].message.content
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            result = {
                "summary": content,
                "key_topics": [],
                "action_items": [],
                "candidate_insights": "",
                "employer_insights": "",
                "rapport_assessment": ""
            }

        # Ensure all expected fields exist
        return {
            "summary": result.get("summary", ""),
            "key_topics": result.get("key_topics", []),
            "action_items": result.get("action_items", []),
            "candidate_insights": result.get("candidate_insights", ""),
            "employer_insights": result.get("employer_insights", ""),
            "rapport_assessment": result.get("rapport_assessment", "")
        }

    def generate_quick_summary(self, transcript: str, max_sentences: int = 3) -> str:
        """
        Generate a quick, unstructured summary.

        Args:
            transcript: The transcript text
            max_sentences: Maximum number of sentences

        Returns:
            Plain text summary
        """
        if not transcript or not transcript.strip():
            return "No transcript available."

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize the following meeting transcript in {max_sentences} sentences or less. Focus on the main points discussed."
                },
                {"role": "user", "content": transcript}
            ],
            temperature=0.5,
            max_tokens=200
        )

        return response.choices[0].message.content.strip()


# Singleton instance for easy access
_service: Optional[SummaryService] = None


def get_summary_service() -> SummaryService:
    """Get or create the summary service singleton."""
    global _service
    if _service is None:
        _service = SummaryService()
    return _service
