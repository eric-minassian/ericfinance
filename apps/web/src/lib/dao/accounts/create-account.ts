import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";

export interface CreateAccountParams {
  name: Account["name"];
  variant: Account["variant"];
}

export interface CreateAccountResult {
  id: Account["id"];
}

export async function createAccount(
  db: Database,
  params: CreateAccountParams
): Promise<CreateAccountResult> {
  const [createdAccount] = await db
    .insert(accountsTable)
    .values(params)
    .returning({ id: accountsTable.id });

  return createdAccount;
}
