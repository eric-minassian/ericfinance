import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface UseGetAccountProps {
  accountId: Account["id"];
}

export function useGetAccount({ accountId }: UseGetAccountProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["getAccount", accountId],
    queryFn: async () => {
      const [account] = await db
        .select({
          id: accountsTable.id,
          name: accountsTable.name,
          variant: accountsTable.variant,
        })
        .from(accountsTable)
        .where(eq(accountsTable.id, accountId))
        .limit(1);

      if (!account) {
        throw new Error(`Account with id ${accountId} not found`);
      }

      return {
        id: account.id,
        name: account.name,
        variant: account.variant,
      };
    },
  });
}
