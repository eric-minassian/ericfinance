import { useDB } from "@/hooks/db";
import { useInfiniteTransactions } from "@/hooks/use-infinite-transactions";
import { Account } from "@/lib/db/schema/accounts";
import { formatCurrency, formatDate } from "@/lib/utils";
import Icon from "./icon";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";

interface TransactionsTableProps {
  accountId?: Account["id"];
}

export function TransactionsTable({ accountId }: TransactionsTableProps) {
  const { db } = useDB();
  const {
    groupedTransactions,
    isFetching,
    hasNextPage,
    initialLoadAttempted,
    ref,
  } = useInfiniteTransactions({ accountId, db });

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
            {groupedTransactions.map((group, idx) => (
              <TableBody key={`${group.date.toISOString()}-${idx}`}>
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
          {isFetching && (
            <div className="flex justify-center py-4">Loading...</div>
          )}
          {!isFetching &&
            !hasNextPage &&
            groupedTransactions.length === 0 &&
            initialLoadAttempted && (
              <div className="flex justify-center py-4 text-muted-foreground">
                No transactions found.
              </div>
            )}
          {hasNextPage && <div ref={ref} style={{ height: "1px" }} />}
        </CardContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  );
}
