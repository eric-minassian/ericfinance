import { queryClient } from "@/context/query";
import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface UpdateCategoryRequest {
  db: Database;
  id: Category["id"];
  name: Category["name"];
}

type UpdateCategoryResponse = void;

export async function updateCategory({
  db,
  id,
  name,
}: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
  await db
    .update(categoriesTable)
    .set({ name })
    .where(eq(categoriesTable.id, id))
    .returning({ id: categoriesTable.id });

  queryClient.invalidateQueries({ queryKey: ["categories"] });

  return;
}
