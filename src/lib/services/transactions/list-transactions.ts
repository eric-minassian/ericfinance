import { Account } from "@/lib/db/schema/accounts";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface ListTransactionsRequest {
  db: Database;
  accountId?: Account["id"];
}

type ListTransactionsResponse = Array<
  Pick<Transaction, "id" | "date" | "amount" | "payee" | "notes">
>;

export async function listTransactions({
  db,
  accountId,
}: ListTransactionsRequest): Promise<ListTransactionsResponse> {
  return await db
    .select({
      id: transactionsTable.id,
      date: transactionsTable.date,
      amount: transactionsTable.amount,
      payee: transactionsTable.payee,
      notes: transactionsTable.notes,
    })
    .from(transactionsTable)
    .where(accountId ? eq(transactionsTable.accountId, accountId) : undefined);
}
