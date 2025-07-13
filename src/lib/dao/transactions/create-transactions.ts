import { DateString } from "@/lib/date";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { InferInsertModel } from "drizzle-orm";

export interface CreateTransactionsParams {
  transactions: (Omit<InferInsertModel<typeof transactionsTable>, "date"> & {
    date: DateString;
  })[];
}

export async function createTransactions(
  db: Database,
  { transactions }: CreateTransactionsParams
): Promise<Transaction["id"][]> {
  const result = await db
    .insert(transactionsTable)
    .values(transactions)
    .returning({ id: transactionsTable.id });
  return result.map((row) => row.id);
}
