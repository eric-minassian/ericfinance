import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface UpdateTransactionRequest {
  db: Database;
  transactionId: Transaction["id"];
  categoryId: Transaction["categoryId"];
}

type UpdateTransactionResponse = void;

export async function updateTransaction({
  db,
  transactionId,
  categoryId,
}: UpdateTransactionRequest): Promise<UpdateTransactionResponse> {
  await db
    .update(transactionsTable)
    .set({ categoryId })
    .where(eq(transactionsTable.id, transactionId));
}
