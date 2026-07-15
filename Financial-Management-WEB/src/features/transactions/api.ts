import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TransactionResponse } from "@/types/dtos";

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["income"] });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["cashflow"] });
}

export function useConfirmTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, settlementDate }: { id: string; settlementDate: string }) => {
      const { data } = await apiClient.post<TransactionResponse>(`/api/transactions/${id}/confirm`, { settlementDate });
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/api/transactions/${id}/cancel`);
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useReverseTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/api/transactions/${id}/reverse`);
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}
