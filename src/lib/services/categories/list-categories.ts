import { useDB } from "@/hooks/db";
import { listCategories } from "@/lib/dao/categories/list-categories";
import { useQuery } from "@tanstack/react-query";

export function useListCategories() {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listCategories"],
    queryFn: () => listCategories(db),
  });
}
