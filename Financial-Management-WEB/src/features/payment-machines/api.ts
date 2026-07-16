import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PaymentMachineResponse } from "@/types/dtos";
import { CardBrand } from "@/types/enums";

export interface BrandFeeInput {
  brand: CardBrand;
  debitFeePercent: number;
  creditFeePercent: number;
  installmentFeePercent: number;
}

export interface CreatePaymentMachineInput {
  name: string;
  unifiedFeeForAllBrands: boolean;
  brandFees: BrandFeeInput[];
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

export function useUpdatePaymentMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CreatePaymentMachineInput & { id: string }) => {
      const { data } = await apiClient.put<PaymentMachineResponse>(`/api/payment-machines/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-machines"] });
    },
  });
}

export function useDeletePaymentMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/payment-machines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-machines"] });
    },
  });
}

export function useSetPaymentMachineActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await apiClient.patch<PaymentMachineResponse>(`/api/payment-machines/${id}/active`, isActive);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-machines"] });
    },
  });
}
