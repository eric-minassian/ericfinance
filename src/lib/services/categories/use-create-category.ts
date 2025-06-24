import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { useMutation } from "@tanstack/react-query";

interface CreateCategoryParams {
  name: Category["name"];
}

export function useCreateCategory() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async ({ name }: CreateCategoryParams) => {
      const [category] = await db
        .insert(categoriesTable)
        .values({
          name,
        })
        .returning({ id: categoriesTable.id });

      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listCategories"] });
    },
  });
}
