import { useDB } from "@/hooks/db";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { useListCategories } from "@/lib/services/categories/list-categories";
import { useTotalFilteredTransactions } from "@/lib/services/transactions/get-total-filtered-transactions";
import { useInfiniteListTransactions } from "@/lib/services/transactions/list-transactions-infinite";
import { useUpdateTransaction } from "@/lib/services/transactions/update-transaction";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { TableCombobox } from "./table-combobox";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const PAGE_SIZE = 50;

interface TransactionsTableProps {
  accountId?: Account["id"];
}

export function TransactionsTable({ accountId }: TransactionsTableProps) {
  const { ref, inView } = useInView();
  const [startDate, setStartDate] = useState<DateString | undefined>();
  const [endDate, setEndDate] = useState<DateString | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data: categories } = useListCategories();
  const updateTransactionMutation = useUpdateTransaction();

  const { db } = useDB();
  const {
    data: transactions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteListTransactions({
    accountId,
    pageSize: PAGE_SIZE,
    startDate,
    endDate,
    categoryId,
  });

  const hasFilters = Boolean(startDate || endDate || categoryId);

  const { data: filteredTotal } = useTotalFilteredTransactions({
    accountId,
    startDate,
    endDate,
    categoryId,
    enabled: hasFilters,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="flex flex-col h-full">
      <Table>
        <TableHeader className="bg-background border-b">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Payee</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <ScrollArea className="flex-1 min-h-0">
        <Table>
          <TableBody>
            {transactions?.pages.flatMap((page) =>
              page.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date.toMDYString()}</TableCell>
                  <TableCell>{transaction.payee}</TableCell>
                  <TableCell className="py-0">
                    <TableCombobox
                      options={[
                        { value: "uncategorized", label: "Uncategorized" },
                        ...(categories?.map((category) => ({
                          value: category.id,
                          label: category.name,
                        })) ?? []),
                      ]}
                      value={transaction.categoryId ?? "uncategorized"}
                      onValueChange={async (value) => {
                        if (!db) return;
                        const categoryId =
                          value === "uncategorized" ? null : value;
                        await updateTransactionMutation.mutateAsync({
                          transactionId: transaction.id,
                          categoryId,
                        });
                      }}
                      placeholder="Select category..."
                      searchPlaceholder="Search categories..."
                      emptyMessage="No category found."
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
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
      </ScrollArea>
    </div>
  );
}
