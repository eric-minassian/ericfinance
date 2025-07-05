import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { createSecurities } from "@/lib/dao/securities/create-securities";
import { importsTable } from "@/lib/db/schema/imports";
import { InsertSecurity } from "@/lib/db/schema/securities";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function createSecuritiesService(
  db: Database,
  securities: InsertSecurity[]
): Promise<void> {
  await db.transaction(async (tx) => {
    const [{ insertId }] = await tx
      .insert(importsTable)
      .values({})
      .returning({ insertId: importsTable.id });

    await createSecurities(tx, {
      securities: securities.map((security) => ({
        ...security,
        importId: insertId,
      })),
    });
  });
}

export function useCreateSecurities() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (securities: InsertSecurity[]) =>
      createSecuritiesService(db, securities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listSecurities"] });
    },
  });
}
