import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CategoryResponse } from "@/types/dtos";
import { CategoryType } from "@/types/enums";

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color?: string | null;
  parentCategoryId?: string | null;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoryResponse[]>("/api/categories");
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data } = await apiClient.post<CategoryResponse>("/api/categories", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color?: string | null }) => {
      const { data } = await apiClient.put<CategoryResponse>(`/api/categories/${id}`, { name, color });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
