import { importsTable } from "@/lib/db/schema/imports";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";

interface CreateTransactionsRequest {
  db: Database;
  accountId: string;
  transactions: Array<{
    date: Transaction["date"];
    amount: Transaction["amount"];
    payee: Transaction["payee"];
    notes: Transaction["notes"];
  }>;
}

type CreateTransactionsResponse = void;

export async function createTransactions({
  db,
  accountId,
  transactions,
}: CreateTransactionsRequest): Promise<CreateTransactionsResponse> {
  if (transactions.length === 0) {
    throw new Error("No transactions to import");
  }

  await db.transaction(async (tx) => {
    const [importRecord] = await tx
      .insert(importsTable)
      .values({})
      .returning({ id: importsTable.id });

    await tx.insert(transactionsTable).values(
      transactions.map((transaction) => ({
        ...transaction,
        accountId,
        importId: importRecord.id,
      }))
    );
  });

  return;
}
