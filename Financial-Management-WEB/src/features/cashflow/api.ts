import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CashFlowSummaryResponse } from "@/types/dtos";

export function useCashFlowSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["cashflow", "summary", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<CashFlowSummaryResponse>("/api/cashflow/summary", {
        params: { from, to },
      });
      return data;
    },
  });
}
