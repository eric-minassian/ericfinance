import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface DeleteCategoryParams {
  categoryId: Category["id"];
}

export async function deleteCategory(
  db: Database,
  params: DeleteCategoryParams
): Promise<void> {
  await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, params.categoryId));
}
