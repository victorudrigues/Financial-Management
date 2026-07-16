import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TransactionResponse } from "@/types/dtos";
import { CardBrand, PaymentMethod } from "@/types/enums";

export interface CreateIncomeInput {
  description: string;
  amount: number;
  accountId: string;
  categoryId: string;
  competenceDate: string;
  paymentMethod: PaymentMethod;
  clientName?: string | null;
  costCenterId?: string | null;
  notes?: string | null;
  paymentMachineId?: string | null;
  installments?: number | null;
  cardBrand?: CardBrand | null;
}

export function useIncome(from: string, to: string) {
  return useQuery({
    queryKey: ["income", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<TransactionResponse[]>("/api/income", { params: { from, to } });
      return data;
    },
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateIncomeInput) => {
      const { data } = await apiClient.post<TransactionResponse>("/api/income", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
  });
}
