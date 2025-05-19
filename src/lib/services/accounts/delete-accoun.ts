import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface DeleteAccountRequest {
  db: Database;
  accountId: Account["id"];
}

type DeleteAccountResponse = void;

export async function deleteAccount({
  db,
  accountId,
}: DeleteAccountRequest): Promise<DeleteAccountResponse> {
  await db.delete(accountsTable).where(eq(accountsTable.id, accountId));

  return;
}
