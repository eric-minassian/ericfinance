import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface GetAccountParams {
  accountId: Account["id"];
}

export interface GetAccountResult {
  id: Account["id"];
  name: Account["name"];
  variant: Account["variant"];
}

export async function getAccount(
  db: Database,
  params: GetAccountParams
): Promise<GetAccountResult | null> {
  const [account] = await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      variant: accountsTable.variant,
    })
    .from(accountsTable)
    .where(eq(accountsTable.id, params.accountId))
    .limit(1);

  return account || null;
}
