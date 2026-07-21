import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Lesson, LessonDetail } from "@/lib/types";

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: () => apiFetch<Lesson[]>("/lessons"),
  });
}

export function useLesson(lessonId: number | undefined) {
  return useQuery({
    queryKey: ["lessons", lessonId],
    queryFn: () => apiFetch<LessonDetail>(`/lessons/${lessonId}`),
    enabled: lessonId !== undefined,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) =>
      apiFetch<Lesson>(`/lessons/${lessonId}/complete`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}
