import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { SymbolChart } from "@/lib/types";

export function useSymbolChart(symbol: string, days = 180) {
  return useQuery({
    queryKey: ["symbol-chart", symbol, days],
    queryFn: () => apiFetch<SymbolChart>(`/symbols/${symbol}/chart?days=${days}`),
    enabled: symbol.length > 0,
  });
}
