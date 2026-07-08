class YtragError(Exception):
    """Base exception for all ytrag domain errors."""


class ConfigError(YtragError):
    pass


class InvalidURLError(YtragError):
    pass


class TranscriptFetchError(YtragError):
    pass


class TranslationError(YtragError):
    pass


class TopicExtractionError(YtragError):
    pass


class NotesGenerationError(YtragError):
    pass


class RAGError(YtragError):
    pass
