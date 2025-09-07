import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  createCategory,
  CreateCategoryParams,
  CreateCategoryResult,
} from "@/lib/dao/categories/create-category";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function createCategoryService(
  db: Database,
  params: CreateCategoryParams
): Promise<CreateCategoryResult> {
  const result = await createCategory(db, params);
  queryClient.invalidateQueries({ queryKey: ["listCategories"] });
  return result;
}

export function useCreateCategory() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: CreateCategoryParams) =>
      createCategoryService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listCategories"] });
    },
  });
}
