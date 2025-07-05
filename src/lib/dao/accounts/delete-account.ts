import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface DeleteAccountParams {
  accountId: Account["id"];
}

export async function deleteAccount(
  db: Database,
  params: DeleteAccountParams
): Promise<void> {
  await db.delete(accountsTable).where(eq(accountsTable.id, params.accountId));
}
