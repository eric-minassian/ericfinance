import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { importsTable } from "@/lib/db/schema/imports";
import { InsertSecurity, securitiesTable } from "@/lib/db/schema/securities";
import { useMutation } from "@tanstack/react-query";

export function useCreateSecurities() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (securities: InsertSecurity[]) => {
      await db.transaction(async (tx) => {
        const [{ insertId }] = await tx
          .insert(importsTable)
          .values({})
          .returning({ insertId: importsTable.id });

        await tx.insert(securitiesTable).values(
          securities.map((security) => ({
            ...security,
            importId: insertId,
          }))
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listSecurities"] });
    },
  });
}
