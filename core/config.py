import os

from dotenv import load_dotenv

from core.exceptions import ConfigError

load_dotenv()

DEFAULT_LANGUAGE = "en"

LLM_MODEL = "gemini-2.5-flash"
TEMPERATURE = 0.2

EMBEDDING_MODEL = "models/gemini-embedding-001"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
RETRIEVAL_K = 4


def get_api_key() -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ConfigError("GOOGLE_API_KEY not found in environment variables.")
    return api_key
