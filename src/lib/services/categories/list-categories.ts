import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";

interface ListCategoriesRequest {
  db: Database;
}

type ListCategoriesResponse = Array<Category>;

export async function listCategories({
  db,
}: ListCategoriesRequest): Promise<ListCategoriesResponse> {
  const categories = await db
    .select()
    .from(categoriesTable)
    .orderBy(categoriesTable.name);

  return categories;
}
