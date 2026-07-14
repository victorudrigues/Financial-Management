import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TransactionResponse } from "@/types/dtos";
import { ExpenseNature, PaymentMethod, RecurrenceType } from "@/types/enums";

export interface CreateExpenseInput {
  description: string;
  amount: number;
  accountId: string;
  categoryId: string;
  competenceDate: string;
  paymentMethod: PaymentMethod;
  expenseNature: ExpenseNature;
  recurrence: RecurrenceType;
  costCenterId?: string | null;
  notes?: string | null;
}

export function useExpenses(from: string, to: string) {
  return useQuery({
    queryKey: ["expenses", from, to],
    queryFn: async () => {
      const { data } = await apiClient.get<TransactionResponse[]>("/api/expenses", { params: { from, to } });
      return data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const { data } = await apiClient.post<TransactionResponse>("/api/expenses", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow"] });
    },
  });
}
