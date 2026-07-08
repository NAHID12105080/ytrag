from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

from core import config
from core.config import get_api_key

_llm: ChatGoogleGenerativeAI | None = None
_embeddings: GoogleGenerativeAIEmbeddings | None = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model=config.LLM_MODEL,
            temperature=config.TEMPERATURE,
            google_api_key=get_api_key(),
        )
    return _llm


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=config.EMBEDDING_MODEL,
            google_api_key=get_api_key(),
        )
    return _embeddings
