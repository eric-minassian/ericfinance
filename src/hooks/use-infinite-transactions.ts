import { Account } from "@/lib/db/schema/accounts";
import { listTransactionsGroupedByDate } from "@/lib/services/transactions/list-transactions-grouped-by-date";
import { Database } from "@/lib/types";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type TransactionGroup = Awaited<
  ReturnType<typeof listTransactionsGroupedByDate>
>[number];
const PAGE_SIZE = 20;

interface UseInfiniteTransactionsProps {
  accountId?: Account["id"];
  db: Database | null;
}

export function useInfiniteTransactions({
  accountId,
  db,
}: UseInfiniteTransactionsProps) {
  const [groupedTransactions, setGroupedTransactions] = useState<
    TransactionGroup[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  const { ref, inView } = useInView();

  useEffect(() => {
    setGroupedTransactions([]);
    setCurrentPage(1);
    setHasNextPage(true);
    setIsFetching(false);
    setInitialLoadAttempted(false);
  }, [accountId, db]);

  useEffect(() => {
    if (!db || isFetching || !hasNextPage) {
      if (
        !db ||
        isFetching ||
        (hasNextPage === false && initialLoadAttempted === true)
      ) {
        return;
      }
    }

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const newPageData = await listTransactionsGroupedByDate({
          db: db!,
          accountId,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        setGroupedTransactions((prev) =>
          currentPage === 1 ? newPageData : [...prev, ...newPageData]
        );
        setHasNextPage(newPageData.length === PAGE_SIZE);
        if (newPageData.length > 0 || currentPage === 1) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        console.error("Failed to load transactions:", error);
        setHasNextPage(false);
      } finally {
        setIsFetching(false);
        if (!initialLoadAttempted) {
          setInitialLoadAttempted(true);
        }
      }
    };

    if (currentPage === 1 && !initialLoadAttempted && db) {
      fetchData();
    } else if (
      inView &&
      hasNextPage &&
      !isFetching &&
      initialLoadAttempted &&
      db
    ) {
      fetchData();
    }
  }, [
    db,
    accountId,
    currentPage,
    inView,
    hasNextPage,
    isFetching,
    initialLoadAttempted,
  ]);

  return {
    groupedTransactions,
    isFetching,
    hasNextPage,
    initialLoadAttempted,
    ref,
  };
}
