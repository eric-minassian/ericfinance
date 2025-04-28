import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDB } from "@/hooks/db";
import {
  Accounts,
  Transactions,
  accountsTable,
  transactionsTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

export default function AccountDetailPage() {
  const { db } = useDB();
  const params = useParams<{ accountId: string }>();

  const [account, setAccount] = useState<Accounts | null>(null);
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        if (!db || !params.accountId) return;

        const accountData = await db
          .select()
          .from(accountsTable)
          .where(eq(accountsTable.id, params.accountId));

        if (accountData && accountData.length > 0) {
          setAccount(accountData[0]);

          // Fetch transactions for this account
          const transactionData = await db
            .select()
            .from(transactionsTable)
            .where(eq(transactionsTable.accountId, params.accountId))
            .orderBy((tr) => tr.date, "desc"); // Most recent first

          setTransactions(transactionData);
        } else {
          toast.error("Account not found");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch account details");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [db, params.accountId]);

  if (loading) {
    return <div className="p-4 text-center">Loading account details...</div>;
  }

  if (!account) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold">Account Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The account you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/accounts">Back to Accounts</Link>
        </Button>
      </div>
    );
  }

  // Calculate account balance
  const balance = transactions.reduce((sum, transaction) => {
    return sum + parseFloat(transaction.amount);
  }, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{account.name}</h2>
          <p className="text-muted-foreground">
            Balance: ${balance.toFixed(2)}
          </p>
        </div>
        <Button asChild>
          <Link href={`/accounts/${account.id}/transactions/new`}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No transactions found for this account.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.payee}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.notes || "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        parseFloat(transaction.amount) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(transaction.amount) >= 0 ? "+" : ""}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
