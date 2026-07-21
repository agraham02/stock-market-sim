import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { JournalEntry } from "@/lib/types";

export function useJournal() {
  return useQuery({
    queryKey: ["journal"],
    queryFn: () => apiFetch<JournalEntry[]>("/journal"),
  });
}
