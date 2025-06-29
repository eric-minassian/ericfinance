import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface GetAccountParams {
  accountId: Account["id"];
}

export async function getAccount(db: Database, params: GetAccountParams) {
  const [account] = await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      variant: accountsTable.variant,
    })
    .from(accountsTable)
    .where(eq(accountsTable.id, params.accountId))
    .limit(1);

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    variant: account.variant,
  };
}

export function useGetAccount(params: GetAccountParams) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["getAccount", params],
    queryFn: async () => getAccount(db, params),
  });
}
