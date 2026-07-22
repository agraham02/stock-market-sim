import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { ChatContextType, TutorChatMessage, TutorChatResponse } from "@/lib/types";

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

export function useSendTutorMessage(contextType: ChatContextType, contextId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      apiFetch<TutorChatResponse>("/tutor/chat", {
        method: "POST",
        body: JSON.stringify({ context_type: contextType, context_id: contextId, message }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<TutorChatMessage[]>(historyKey(contextType, contextId), (prev) => [
        ...(prev ?? []),
        ...data.messages,
      ]);
    },
  });
}
