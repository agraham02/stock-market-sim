import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Portfolio } from "@/lib/types";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => apiFetch<Portfolio>("/portfolio"),
  });
}
