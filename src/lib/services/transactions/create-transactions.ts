import { queryClient } from "@/context/query";
import { importsTable } from "@/lib/db/schema/imports";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { applyRules } from "../rules/apply-rules";

interface CreateTransactionsRequest {
  db: Database;
  accountId: string;
  transactions: Array<{
    date: Transaction["date"];
    amount: Transaction["amount"];
    payee: Transaction["payee"];
    notes: Transaction["notes"];
    rawData?: Transaction["rawData"];
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

  const newTransactionIds = await db.transaction(async (tx) => {
    const [importRecord] = await tx
      .insert(importsTable)
      .values({})
      .returning({ id: importsTable.id });

    const insertedTransactions = await tx
      .insert(transactionsTable)
      .values(
        transactions.map((transaction) => ({
          ...transaction,
          accountId,
          importId: importRecord.id,
        }))
      )
      .returning({ id: transactionsTable.id });

    return insertedTransactions.map((t) => t.id);
  });

  if (newTransactionIds.length > 0) {
    await applyRules({ db, transactionIds: newTransactionIds });
  }

  queryClient.invalidateQueries({
    queryKey: ["transactions", accountId],
  });
  queryClient.invalidateQueries({
    queryKey: ["accounts", accountId],
  });

  return;
}
