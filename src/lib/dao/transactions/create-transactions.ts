import { DateString } from "@/lib/date";
import { transactionsTable } from "@/lib/db/schema/transactions";
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
): Promise<void> {
  await db.insert(transactionsTable).values(transactions);
}
