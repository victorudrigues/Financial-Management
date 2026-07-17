import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TransactionResponse } from "@/types/dtos";

export interface CreateTransferInput {
  amount: number;
  sourceAccountId: string;
  destinationAccountId: string;
  competenceDate: string;
  notes?: string | null;
}

export function useTransfers(from: string, to: string) {
  return useQuery({
    queryKey: ["transfers", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<TransactionResponse[]>("/api/transfers", { params: { from, to } });
      return data;
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTransferInput) => {
      const { data } = await apiClient.post<TransactionResponse>("/api/transfers", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
