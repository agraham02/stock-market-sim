import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { API_BASE_URL, ApiError, apiFetch } from "@/lib/api";
import type { ChatContextType, TutorChatMessage } from "@/lib/types";

function historyKey(contextType: ChatContextType, contextId: string | null) {
  return ["tutor-history", contextType, contextId] as const;
}

export function useTutorHistory(contextType: ChatContextType, contextId: string | null) {
  return useQuery({
    queryKey: historyKey(contextType, contextId),
    queryFn: () =>
      apiFetch<TutorChatMessage[]>(
        `/tutor/history?context_type=${contextType}${contextId ? `&context_id=${encodeURIComponent(contextId)}` : ""}`
      ),
  });
}

/** Parses one `event: <name>\ndata: <json>` block already split out of the SSE byte stream. */
function parseSseEvent(raw: string): { event: string; data: unknown } | null {
  const eventLine = raw.split("\n").find((l) => l.startsWith("event: "));
  const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
  if (!dataLine) return null;
  return {
    event: eventLine ? eventLine.slice("event: ".length) : "message",
    data: JSON.parse(dataLine.slice("data: ".length)),
  };
}

/** Streams the tutor's reply token-by-token via SSE instead of waiting for the full message. */
export function useSendTutorMessage(contextType: ChatContextType, contextId: string | null) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);

  function mutate(message: string, options?: { onError?: (error: unknown) => void }) {
    setIsPending(true);
    setStreamingText("");

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tutor/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context_type: contextType, context_id: contextId, message }),
        });
        if (!res.ok || !res.body) {
          const body = await res.text().catch(() => "");
          throw new ApiError(res.status, body || res.statusText);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const parsed = parseSseEvent(raw);
            if (!parsed) continue;

            if (parsed.event === "user") {
              const userMessage = parsed.data as TutorChatMessage;
              queryClient.setQueryData<TutorChatMessage[]>(historyKey(contextType, contextId), (prev) => [
                ...(prev ?? []),
                userMessage,
              ]);
            } else if (parsed.event === "delta") {
              accumulated += (parsed.data as { text: string }).text;
              setStreamingText(accumulated);
            } else if (parsed.event === "error") {
              throw new Error((parsed.data as { detail: string }).detail);
            } else if (parsed.event === "done") {
              const assistantMessage = parsed.data as TutorChatMessage;
              queryClient.setQueryData<TutorChatMessage[]>(historyKey(contextType, contextId), (prev) => [
                ...(prev ?? []),
                assistantMessage,
              ]);
            }
          }
        }
      } catch (error) {
        options?.onError?.(error);
      } finally {
        setIsPending(false);
        setStreamingText(null);
      }
    })();
  }

  return { mutate, isPending, streamingText };
}
