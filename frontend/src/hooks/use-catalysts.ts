import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { CatalystPanel, SentimentResult } from "@/lib/types";

export function useCatalystPanel(symbol: string) {
  return useQuery({
    queryKey: ["catalysts", symbol],
    queryFn: () => apiFetch<CatalystPanel>(`/symbols/${symbol}/catalysts`),
    enabled: symbol.length > 0,
  });
}

export function useSentiment(symbol: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<SentimentResult>(`/symbols/${symbol}/sentiment`, { method: "POST" }),
    onSuccess: (data) => {
      queryClient.setQueryData(["sentiment", symbol], data);
    },
  });
}
