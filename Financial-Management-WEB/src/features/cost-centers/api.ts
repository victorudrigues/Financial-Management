import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CostCenterResponse } from "@/types/dtos";

export interface CreateCostCenterInput {
  name: string;
  description?: string | null;
}

export function useCostCenters() {
  return useQuery({
    queryKey: ["cost-centers"],
    queryFn: async () => {
      const { data } = await apiClient.get<CostCenterResponse[]>("/api/cost-centers");
      return data;
    },
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCostCenterInput) => {
      const { data } = await apiClient.post<CostCenterResponse>("/api/cost-centers", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CreateCostCenterInput & { id: string }) => {
      const { data } = await apiClient.put<CostCenterResponse>(`/api/cost-centers/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/cost-centers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}
