import { useDB } from "@/hooks/db";
import {
  listTransactionsByDate,
  ListTransactionsByDateResult,
} from "@/lib/dao/transactions/list-transactions-by-date";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface UseListTransactionsGroupedByDateProps<T extends boolean | undefined> {
  accountId?: Account["id"];
  includeTransactions?: T;
}

export async function listTransactionsGroupedByDateService<
  T extends boolean | undefined
>(
  db: Database,
  params: UseListTransactionsGroupedByDateProps<T>
): Promise<ListTransactionsByDateResult<T>> {
  return listTransactionsByDate(db, params);
}

export function useListTransactionsGroupedByDate<T extends boolean | undefined>(
  params: UseListTransactionsGroupedByDateProps<T>
) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: [
      "listTransactionsGroupedByDate",
      params.accountId,
      params.includeTransactions,
    ],
    queryFn: async () => listTransactionsGroupedByDateService(db, params),
  });
}

interface UseInfiniteListTransactionsGroupedByDateProps<
  T extends boolean | undefined
> {
  accountId?: Account["id"];
  includeTransactions?: T;
  pageSize?: number;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
}

export function useInfiniteListTransactionsGroupedByDate<
  T extends boolean | undefined
>({
  accountId,
  includeTransactions,
  startDate,
  endDate,
  categoryId,
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
      startDate,
      endDate,
      categoryId,
    ],
    queryFn: async ({ pageParam }) => {
      const start = performance.now();
      const data = await listTransactionsByDate<T>(db, {
        accountId,
        includeTransactions,
        page: pageParam,
        pageSize,
        order: "desc",
        startDate,
        endDate,
        categoryId,
      });
      const end = performance.now();
      console.log(
        `useInfiniteListTransactionsGroupedByDate took ${end - start} ms`
      );
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.length === pageSize ? nextPage : undefined;
    },
  });
}
