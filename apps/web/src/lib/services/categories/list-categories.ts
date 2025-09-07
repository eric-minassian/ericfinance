import { useDB } from "@/hooks/db";
import {
  listCategories,
  ListCategoriesResult,
} from "@/lib/dao/categories/list-categories";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export async function listCategoriesService(
  db: Database
): Promise<ListCategoriesResult[]> {
  return listCategories(db);
}

export function useListCategories() {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listCategories"],
    queryFn: () => listCategoriesService(db),
  });
}
