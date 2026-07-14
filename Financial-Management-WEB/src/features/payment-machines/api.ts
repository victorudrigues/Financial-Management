import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PaymentMachineResponse } from "@/types/dtos";

export interface CreatePaymentMachineInput {
  name: string;
  debitFeePercent: number;
  creditFeePercent: number;
  installmentFeePercent: number;
  pixFeePercent: number;
  settlementDays: number;
  allowsAnticipation: boolean;
}

export function usePaymentMachines() {
  return useQuery({
    queryKey: ["payment-machines"],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentMachineResponse[]>("/api/payment-machines");
      return data;
    },
  });
}

export function useCreatePaymentMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaymentMachineInput) => {
      const { data } = await apiClient.post<PaymentMachineResponse>("/api/payment-machines", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-machines"] });
    },
  });
}
