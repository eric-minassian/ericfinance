import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";

export interface CreateCategoryParams {
  name: Category["name"];
}

export interface CreateCategoryResult {
  id: Category["id"];
}

export async function createCategory(
  db: Database,
  params: CreateCategoryParams
): Promise<CreateCategoryResult> {
  const [category] = await db
    .insert(categoriesTable)
    .values(params)
    .returning({ id: categoriesTable.id });

  return category;
}
