import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { Transaction, transactionsTable } from "@/lib/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

interface AccountTransactionsPage {
  params: {
    accountId: string;
  };
}

export default function AccountTransactionsPage({
  params,
}: AccountTransactionsPage) {
  const { db } = useDB();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await db!
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable.accountId, params.accountId));
        setTransactions(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [db, params.accountId]);

  async function handleDeleteTransaction(id: Transaction["id"]) {
    try {
      await db!.delete(transactionsTable).where(eq(transactionsTable.id, id));
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id)
      );
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/accounts/${params.accountId}/transactions/${row.original.id}`}
            className="underline-offset-4 hover:underline"
          >
            {row.original.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
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
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                href={`/accounts/${params.accountId}/transactions/${row.original.id}/edit`}
                asChild
              >
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  if (
                    confirm("Are you sure you want to delete this transaction?")
                  ) {
                    handleDeleteTransaction(row.original.id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <ContentLayout
      header={
        <Header
          description="Manage your transactions here."
          actions={
            <Button asChild>
              <Link href={`/accounts/${params.accountId}/transactions/create`}>
                Create Transaction
              </Link>
            </Button>
          }
        >
          Transactions
        </Header>
      }
    >
      <DataTable data={transactions} columns={columns} />
    </ContentLayout>
  );
}
