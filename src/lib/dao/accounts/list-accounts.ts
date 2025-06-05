import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";

type Return = (Pick<Account, "id" | "name" | "variant"> & {})[];

export async function listAccounts(db: Database): Promise<Return> {
  return await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      variant: accountsTable.variant,
    })
    .from(accountsTable)
    .orderBy(accountsTable.createdAt);
}
