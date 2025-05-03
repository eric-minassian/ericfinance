import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import {
  Account,
  accountsTable,
  Transaction,
  transactionsTable,
} from "@/lib/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";

type CombinedTransaction = Transaction & {
  accountName: Account["name"];
};

export default function TransactionsPage() {
  const { db } = useDB();
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await db!
        .select({
          id: transactionsTable.id,
          accountId: transactionsTable.accountId,
          amount: transactionsTable.amount,
          date: transactionsTable.date,
          payee: transactionsTable.payee,
          notes: transactionsTable.notes,
          accountName: accountsTable.name,
        })
        .from(transactionsTable)
        .innerJoin(
          accountsTable,
          eq(transactionsTable.accountId, accountsTable.id)
        );
      setTransactions(data);
    };
    fetchTransactions();
  }, [db]);

  const columns: ColumnDef<CombinedTransaction>[] = [
    {
      accessorKey: "accountName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
    },
    {
      accessorKey: "payee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payee" />
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
    },
  ];

  return (
    <ContentLayout
      header={
        <Header description="View and manage your transactions.">
          Transactions
        </Header>
      }
    >
      <DataTable data={transactions} columns={columns} />
    </ContentLayout>
  );
}
