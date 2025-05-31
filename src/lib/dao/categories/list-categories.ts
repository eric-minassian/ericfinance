import { categoriesTable, Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";

type Return = Category[];

export async function listCategories(db: Database): Promise<Return> {
  return await db.select().from(categoriesTable).orderBy(categoriesTable.name);
}
