import { queryClient } from "@/context/query";
import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";

interface CreateCategoryRequest {
  db: Database;
  name: Category["name"];
}

type CreateCategoryResponse = {
  id: string;
};

export async function createCategory({
  db,
  name,
}: CreateCategoryRequest): Promise<CreateCategoryResponse> {
  const [category] = await db
    .insert(categoriesTable)
    .values({
      name,
    })
    .returning({ id: categoriesTable.id });

  queryClient.invalidateQueries({ queryKey: ["categories"] });

  return category;
}
