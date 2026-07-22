from collections.abc import Iterator

import anthropic

from app.services.ai_tutor.base import TutorMessage, TutorProvider


class AnthropicTutorProvider(TutorProvider):
    def __init__(self, api_key: str, model: str, max_output_tokens: int):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model
        self._max_output_tokens = max_output_tokens

    def reply_stream(self, system_prompt: str, history: list[TutorMessage], user_message: str) -> Iterator[str]:
        messages = [{"role": turn["role"], "content": turn["content"]} for turn in history]
        messages.append({"role": "user", "content": user_message})

        with self._client.messages.stream(
            model=self._model,
            max_tokens=self._max_output_tokens,
            system=system_prompt,
            messages=messages,
        ) as stream:
            yield from stream.text_stream
