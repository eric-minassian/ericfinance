import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  deleteCategory,
  DeleteCategoryParams,
} from "@/lib/dao/categories/delete-category";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function deleteCategoryService(
  db: Database,
  params: DeleteCategoryParams
): Promise<void> {
  await deleteCategory(db, params);
  queryClient.invalidateQueries({ queryKey: ["listCategories"] });
}

export function useDeleteCategory() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: DeleteCategoryParams) =>
      deleteCategoryService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listCategories"] });
    },
  });
}
