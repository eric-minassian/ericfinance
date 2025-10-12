import { useDB } from "@/hooks/db";
import { listTransactions } from "@/lib/dao/transactions/list-transactions copy";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Category } from "@/lib/db/schema/categories";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseInfiniteListTransactionsProps {
  accountId?: Account["id"];
  pageSize?: number;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
}

export function useInfiniteListTransactions({
  accountId,
  startDate,
  endDate,
  categoryId,
  pageSize = 50,
}: UseInfiniteListTransactionsProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useInfiniteQuery({
    queryKey: [
      "infiniteListTransactions",
      accountId,
      startDate,
      endDate,
      categoryId,
    ],
    queryFn: async ({ pageParam }) => {
      const start = performance.now();
      const data = await listTransactions(db, {
        accountId,
        page: pageParam,
        pageSize,
        order: "desc",
        startDate,
        endDate,
        categoryId,
      });
      const end = performance.now();
      console.log(`useInfiniteListTransactions took ${end - start} ms`);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.length === pageSize ? nextPage : undefined;
    },
  });
}
