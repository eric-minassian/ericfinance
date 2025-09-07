import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";

export interface ListAccountsResult {
  id: Account["id"];
  name: Account["name"];
  variant: Account["variant"];
}

export async function listAccounts(
  db: Database
): Promise<ListAccountsResult[]> {
  return await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      variant: accountsTable.variant,
    })
    .from(accountsTable)
    .orderBy(accountsTable.createdAt);
}
