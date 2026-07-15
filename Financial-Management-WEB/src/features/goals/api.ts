import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { GoalResponse } from "@/types/dtos";
import { GoalType } from "@/types/enums";

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetAmount: number;
  deadline: string;
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data } = await apiClient.get<GoalResponse[]>("/api/goals");
      return data;
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const { data } = await apiClient.post<GoalResponse>("/api/goals", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CreateGoalInput & { id: string }) => {
      const { data } = await apiClient.put<GoalResponse>(`/api/goals/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
