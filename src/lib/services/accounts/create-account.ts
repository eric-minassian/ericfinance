import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";

interface CreateAccountRequest {
  db: Database;
  name: Account["name"];
}

interface CreateAccountResponse {
  id: Account["id"];
}

export async function createAccount({
  db,
  name,
}: CreateAccountRequest): Promise<CreateAccountResponse> {
  const [createdAccount] = await db
    .insert(accountsTable)
    .values({
      name,
    })
    .returning({ id: accountsTable.id });

  return createdAccount;
}
