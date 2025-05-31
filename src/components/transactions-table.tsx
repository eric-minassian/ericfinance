import { useDB } from "@/hooks/db";
import { Account } from "@/lib/db/schema/accounts";
import { listCategories } from "@/lib/services/categories/list-categories";
import { listTransactionsGroupedByDate } from "@/lib/services/transactions/list-transactions-by-date";
import { updateTransaction } from "@/lib/services/transactions/update-transaction";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Icon from "./icon";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";

interface TransactionsTableProps {
  accountId?: Account["id"];
}

export function TransactionsTable({ accountId }: TransactionsTableProps) {
  const { db } = useDB();
  const { data: groupedTransactions } = useQuery({
    queryKey: ["listTransactionsByDate", accountId],
    queryFn: async () => listTransactionsGroupedByDate({ db: db!, accountId }),
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => listCategories({ db: db! }),
  });

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
            {groupedTransactions?.map((group, idx) => (
              <TableBody key={`${group.date.toISOString()}-${idx}`}>
                <TableRow className="bg-muted text-xs">
                  <TableHead colSpan={2} className="text-muted-foreground h-8">
                    {group.date.toMDYString()}
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right h-8">
                    {formatCurrency(group.total)}
                  </TableHead>
                </TableRow>
                {group.transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="h-12">
                    <TableCell>{transaction.payee}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={transaction.categoryId ?? "uncategorized"}
                        onValueChange={async (value) => {
                          if (!db) return;
                          const categoryId =
                            value === "uncategorized" ? null : value;
                          await updateTransaction({
                            db,
                            transactionId: transaction.id,
                            categoryId,
                          });
                        }}
                      >
                        <SelectTrigger size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uncategorized">
                            Uncategorized
                          </SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </CardContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  );
}
