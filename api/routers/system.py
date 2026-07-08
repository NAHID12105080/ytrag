from fastapi import APIRouter

from api import schemas
from core import config
from core.exceptions import ConfigError

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/health", response_model=schemas.HealthResponse)
def health() -> schemas.HealthResponse:
    try:
        config.get_api_key()
        gemini_configured = True
    except ConfigError:
        gemini_configured = False

    return schemas.HealthResponse(
        status="ok" if gemini_configured else "degraded",
        gemini_configured=gemini_configured,
        llm_model=config.LLM_MODEL,
        embedding_model=config.EMBEDDING_MODEL,
    )
