from abc import ABC, abstractmethod
from collections.abc import Iterator
from typing import TypedDict


class TutorMessage(TypedDict):
    role: str  # "user" | "assistant"
    content: str


class TutorProvider(ABC):
    @abstractmethod
    def reply_stream(self, system_prompt: str, history: list[TutorMessage], user_message: str) -> Iterator[str]:
        """Yield the tutor's reply in text chunks, given prior turns (oldest first) and the new user message."""
