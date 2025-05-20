import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { Account } from "@/lib/db/schema/accounts";
import { listTransactionsGroupedByDate } from "@/lib/services/transactions/list-transactions-grouped-by-date";
import { formatCurrency, formatDate } from "@/lib/utils";
import Icon from "./icon";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";

interface TransactionsTableProps {
  accountId?: Account["id"];
}

export function TransactionsTable({ accountId }: TransactionsTableProps) {
  const { db } = useDB();
  const { data } = useQuery(
    () => listTransactionsGroupedByDate({ db: db!, accountId }),
    [db, accountId]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <Button>
            <Icon variant="plus" />
            Add transaction
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="h-[55vh] w-full">
        <CardContent>
          <Table>
            {data?.map((group) => (
              <TableBody key={group.date.toString()}>
                <TableRow className="bg-muted text-xs">
                  <TableHead colSpan={2} className="text-muted-foreground h-8">
                    {formatDate(group.date)}
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right h-8">
                    {formatCurrency(group.total)}
                  </TableHead>
                </TableRow>
                {group.transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="h-12">
                    <TableCell>{transaction.payee}</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
