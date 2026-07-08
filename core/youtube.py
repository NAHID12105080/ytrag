import re

from youtube_transcript_api import YouTubeTranscriptApi

from core.exceptions import InvalidURLError, TranscriptFetchError

_VIDEO_ID_PATTERN = re.compile(
    r"(?:youtube\.com/(?:watch\?v=|shorts/|live/|embed/)|youtu\.be/)"
    r"([0-9A-Za-z_-]{11})"
)


def extract_video_id(url: str) -> str:
    """
    Extract YouTube video ID from a URL.
    """
    match = _VIDEO_ID_PATTERN.search(url)

    if not match:
        raise InvalidURLError("Invalid YouTube URL.")

    return match.group(1)


def get_transcript(video_id: str, language: str = "en") -> str:
    """
    Fetch transcript from YouTube video.
    """
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id, languages=[language])

        return " ".join(item.text for item in transcript)

    except Exception as e:
        raise TranscriptFetchError(str(e)) from e
