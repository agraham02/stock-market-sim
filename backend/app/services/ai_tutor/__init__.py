from app.core.config import Settings
from app.services.ai_tutor.base import TutorMessage, TutorProvider


class TutorNotConfiguredError(Exception):
    pass


def get_tutor_provider(settings: Settings) -> TutorProvider:
    if settings.ai_tutor_provider == "gemini":
        if not settings.gemini_api_key:
            raise TutorNotConfiguredError("GEMINI_API_KEY is not set")
        from app.services.ai_tutor.gemini_provider import GeminiTutorProvider

        return GeminiTutorProvider(settings.gemini_api_key, settings.gemini_model, settings.tutor_max_output_tokens)

    if settings.ai_tutor_provider == "anthropic":
        if not settings.anthropic_api_key:
            raise TutorNotConfiguredError("ANTHROPIC_API_KEY is not set")
        from app.services.ai_tutor.anthropic_provider import AnthropicTutorProvider

        return AnthropicTutorProvider(
            settings.anthropic_api_key, settings.anthropic_model, settings.tutor_max_output_tokens
        )

    raise TutorNotConfiguredError(f"Unknown AI_TUTOR_PROVIDER '{settings.ai_tutor_provider}'")


__all__ = ["TutorMessage", "TutorProvider", "TutorNotConfiguredError", "get_tutor_provider"]
