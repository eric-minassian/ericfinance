import { useDB } from "@/hooks/db";
import { Account } from "@/lib/db/schema/accounts";
import { securitiesTable } from "@/lib/db/schema/securities";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface UseListSecuritiesProps {
  accountId?: Account["id"];
}

export function useListSecurities({ accountId }: UseListSecuritiesProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listSecurities", accountId],
    queryFn: async () => {
      return await db
        .select({
          id: securitiesTable.id,
          amount: securitiesTable.amount,
          date: securitiesTable.date,
          ticker: securitiesTable.ticker,
        })
        .from(securitiesTable)
        .where(
          accountId ? eq(securitiesTable.accountId, accountId) : undefined
        );
    },
  });
}
