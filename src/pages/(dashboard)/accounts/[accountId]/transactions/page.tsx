import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/ui/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDB } from "@/hooks/db";
import { Transaction, transactionsTable } from "@/lib/db/schema";
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
        const data = await db!.select().from(transactionsTable);
        setTransactions(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [db]);

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payee</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                <Button variant="link" className="p-0" asChild>
                  <Link
                    href={`/accounts/${params.accountId}/transactions/${transaction.id}`}
                  >
                    {transaction.id}
                  </Link>
                </Button>
              </TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
              <TableCell>{transaction.payee}</TableCell>
              <TableCell>{transaction.notes}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link
                      href={`/accounts/${params.accountId}/transactions/${transaction.id}/edit`}
                      asChild
                    >
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this transaction?"
                          )
                        ) {
                          handleDeleteTransaction(transaction.id);
                        }
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentLayout>
  );
}
