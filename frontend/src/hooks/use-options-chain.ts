import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { OptionChain } from "@/lib/types";

export function useOptionExpirations(symbol: string) {
  return useQuery({
    queryKey: ["option-expirations", symbol],
    queryFn: () => apiFetch<string[]>(`/symbols/${symbol}/options/expirations`),
    enabled: symbol.length > 0,
  });
}

export function useOptionChain(symbol: string, expiration: string | undefined) {
  return useQuery({
    queryKey: ["option-chain", symbol, expiration],
    queryFn: () =>
      apiFetch<OptionChain>(
        `/symbols/${symbol}/options/chain?expiration=${expiration}`
      ),
    enabled: symbol.length > 0 && !!expiration,
  });
}
