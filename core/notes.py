from core.clients import get_llm
from core.exceptions import NotesGenerationError, TopicExtractionError
from core.prompts import NOTES_PROMPT, TOPICS_PROMPT


def get_important_topics(transcript: str) -> str:
    try:
        chain = TOPICS_PROMPT | get_llm()
        response = chain.invoke({"transcript": transcript})
        return response.content

    except Exception as e:
        raise TopicExtractionError(str(e)) from e


def generate_notes(transcript: str) -> str:
    try:
        chain = NOTES_PROMPT | get_llm()
        response = chain.invoke({"transcript": transcript})
        return response.content

    except Exception as e:
        raise NotesGenerationError(str(e)) from e
