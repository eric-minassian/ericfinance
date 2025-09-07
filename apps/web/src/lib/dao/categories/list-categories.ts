import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";

export interface ListCategoriesResult {
  id: Category["id"];
  name: Category["name"];
}

export async function listCategories(
  db: Database
): Promise<ListCategoriesResult[]> {
  return await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
    })
    .from(categoriesTable)
    .orderBy(categoriesTable.name);
}
