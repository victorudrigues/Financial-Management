import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DashboardOverviewResponse } from "@/types/dtos";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardOverviewResponse>("/api/dashboard/overview");
      return data;
    },
  });
}
