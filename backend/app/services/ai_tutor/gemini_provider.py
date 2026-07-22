from google import genai
from google.genai import types

from app.services.ai_tutor.base import TutorMessage, TutorProvider


class GeminiTutorProvider(TutorProvider):
    def __init__(self, api_key: str, model: str, max_output_tokens: int):
        self._client = genai.Client(api_key=api_key)
        self._model = model
        self._max_output_tokens = max_output_tokens

    def reply(self, system_prompt: str, history: list[TutorMessage], user_message: str) -> str:
        contents = [
            types.Content(
                role="model" if turn["role"] == "assistant" else "user",
                parts=[types.Part(text=turn["content"])],
            )
            for turn in history
        ]
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        response = self._client.models.generate_content(
            model=self._model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=self._max_output_tokens,
                thinking_config=types.ThinkingConfig(thinking_level="low"),
            ),
        )
        return response.text or ""
