import { useDB } from "@/hooks/db";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { useListCategories } from "@/lib/services/categories/list-categories";
import { useInfiniteListTransactionsGroupedByDate } from "@/lib/services/transactions/list-transactions-by-date";
import { updateTransaction } from "@/lib/services/transactions/update-transaction";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Icon from "./icon";
import { TransactionsTableFilterButton } from "./transactions-table-filter-button";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Header } from "./ui/header";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SpaceBetween } from "./ui/space-between";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";

const PAGE_SIZE = 20;

interface TransactionsTableProps {
  accountId?: Account["id"];
}

export function TransactionsTable({ accountId }: TransactionsTableProps) {
  const { ref, inView } = useInView();
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<DateString | undefined>();
  const [endDate, setEndDate] = useState<DateString | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data: categories } = useListCategories();

  const { db } = useDB();
  const {
    data: groupedTransactions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteListTransactionsGroupedByDate({
    accountId,
    includeTransactions: true,
    pageSize: PAGE_SIZE,
    startDate,
    endDate,
    categoryId,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
      setPage((prev) => prev + 1);
    }
  }, [fetchNextPage, inView]);

  return (
    <Card>
      <CardHeader>
        <Header
          actions={
            <SpaceBetween>
              <Button>
                <Icon variant="plus" />
                Add transaction
              </Button>
              <TransactionsTableFilterButton
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
              />
            </SpaceBetween>
          }
        >
          Transactions
        </Header>
      </CardHeader>
      <ScrollArea className="h-[55vh] w-full">
        <CardContent>
          <Table>
            {groupedTransactions?.pages
              .slice(0, page + 1)
              .flatMap((page) => page)
              .map((group, idx) => (
                <TableBody key={`${group.date.toISOString()}-${idx}`}>
                  <TableRow className="bg-muted text-xs">
                    <TableHead
                      colSpan={2}
                      className="text-muted-foreground h-8"
                    >
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
                          defaultValue={
                            transaction.categoryId ?? "uncategorized"
                          }
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
          <div ref={ref}>
            {(hasNextPage || isFetchingNextPage) && (
              <div className="text-center text-sm text-muted-foreground">
                Loading more transactions...
              </div>
            )}
            {!hasNextPage && !isFetching && (
              <div className="text-center text-sm text-muted-foreground">
                No more transactions
              </div>
            )}
          </div>
        </CardContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  );
}
