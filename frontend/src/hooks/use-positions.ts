import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { OpenTradeRequest, OpenTradeResponse, OrderType, Position } from "@/lib/types";

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: () => apiFetch<Position[]>("/positions"),
    refetchInterval: 15_000,
  });
}

export function useOpenTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: OpenTradeRequest) =>
      apiFetch<OpenTradeResponse>("/trades", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useCloseTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      positionId,
      orderType = "market",
      limitPrice,
    }: {
      positionId: number;
      orderType?: OrderType;
      limitPrice?: number;
    }) =>
      apiFetch<Position>(`/trades/${positionId}/close`, {
        method: "POST",
        body: JSON.stringify({ order_type: orderType, limit_price: limitPrice }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}
