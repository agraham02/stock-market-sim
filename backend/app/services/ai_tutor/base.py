from abc import ABC, abstractmethod
from typing import TypedDict


class TutorMessage(TypedDict):
    role: str  # "user" | "assistant"
    content: str


class TutorProvider(ABC):
    @abstractmethod
    def reply(self, system_prompt: str, history: list[TutorMessage], user_message: str) -> str:
        """Return the tutor's reply given prior turns (oldest first) and the new user message."""
