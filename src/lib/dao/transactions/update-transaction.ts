import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface UpdateTransactionParams {
  transactionId: Transaction["id"];
  categoryId: Transaction["categoryId"];
}

export async function updateTransaction(
  db: Database,
  { transactionId, categoryId }: UpdateTransactionParams
): Promise<void> {
  await db
    .update(transactionsTable)
    .set({ categoryId })
    .where(eq(transactionsTable.id, transactionId));
}
