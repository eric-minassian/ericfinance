import { queryClient } from "@/context/query";
import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface DeleteCategoryRequest {
  db: Database;
  id: Category["id"];
}

type DeleteCategoryResponse = void;

export async function deleteCategory({
  db,
  id,
}: DeleteCategoryRequest): Promise<DeleteCategoryResponse> {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

  queryClient.invalidateQueries({ queryKey: ["categories"] });

  return;
}
