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
