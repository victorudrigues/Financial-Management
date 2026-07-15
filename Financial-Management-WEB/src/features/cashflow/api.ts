import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CashFlowSummaryResponse, CategoryBreakdownItem, CostCenterBreakdownItem } from "@/types/dtos";

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

export function useCategoryBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: ["cashflow", "by-category", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoryBreakdownItem[]>("/api/cashflow/by-category", {
        params: { from, to },
      });
      return data;
    },
  });
}

export function useCostCenterBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: ["cashflow", "by-cost-center", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<CostCenterBreakdownItem[]>("/api/cashflow/by-cost-center", {
        params: { from, to },
      });
      return data;
    },
  });
}
