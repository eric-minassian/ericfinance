import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface GetAccountRequest {
  db: Database;
  accountId: Account["id"];
}

type GetAccountResponse = Pick<Account, "id" | "name">;

export async function getAccount({
  db,
  accountId,
}: GetAccountRequest): Promise<GetAccountResponse | null> {
  const [account] = await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
    })
    .from(accountsTable)
    .where(eq(accountsTable.id, accountId))
    .limit(1);

  return {
    id: account.id,
    name: account.name,
  };
}
