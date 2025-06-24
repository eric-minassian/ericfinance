import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export function useDeleteCategory() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (id: Category["id"]) => {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listCategories"] });
    },
  });
}
