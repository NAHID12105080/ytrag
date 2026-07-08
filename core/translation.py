from core.clients import get_llm
from core.exceptions import TranslationError
from core.prompts import TRANSLATION_PROMPT


def translate_transcript(transcript: str) -> str:
    try:
        chain = TRANSLATION_PROMPT | get_llm()
        response = chain.invoke({"transcript": transcript})
        return response.content

    except Exception as e:
        raise TranslationError(str(e)) from e
