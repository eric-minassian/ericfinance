import { useDB } from "@/hooks/db";
import { listTransactionsByDate } from "@/lib/dao/transactions/list-transactions-by-date";
import { Account } from "@/lib/db/schema/accounts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface UseListTransactionsGroupedByDateProps<T extends boolean | undefined> {
  accountId?: Account["id"];
  includeTransactions?: T;
}

export function useListTransactionsGroupedByDate<
  T extends boolean | undefined
>({
  accountId,
  includeTransactions,
}: UseListTransactionsGroupedByDateProps<T>) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listTransactionsGroupedByDate", accountId, includeTransactions],
    queryFn: async () => {
      return listTransactionsByDate<T>(db, {
        accountId,
        includeTransactions,
      });
    },
  });
}

interface UseInfiniteListTransactionsGroupedByDateProps<
  T extends boolean | undefined
> {
  accountId?: Account["id"];
  includeTransactions?: T;
  pageSize?: number;
}

export function useInfiniteListTransactionsGroupedByDate<
  T extends boolean | undefined
>({
  accountId,
  includeTransactions,
  pageSize = 20,
}: UseInfiniteListTransactionsGroupedByDateProps<T>) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useInfiniteQuery({
    queryKey: [
      "infiniteListTransactionsGroupedByDate",
      accountId,
      includeTransactions,
    ],
    queryFn: async ({ pageParam }) => {
      return listTransactionsByDate<T>(db, {
        accountId,
        includeTransactions,
        page: pageParam,
        pageSize,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.length === pageSize ? nextPage : undefined;
    },
  });
}
