import React from "react";

export type UseQueryResult<T> =
  | {
      isPending: true;
      isError: false;
      data: undefined;
      error: null;
    }
  | {
      isPending: false;
      isError: true;
      data: undefined;
      error: unknown;
    }
  | {
      isPending: false;
      isError: false;
      data: T;
      error: null;
    };

export function useQuery<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
): UseQueryResult<T> & {
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
} {
  const [currentData, setCurrentData] = React.useState<T | undefined>(
    undefined
  );
  const [isPending, setIsPending] = React.useState<boolean>(true);
  const [error, setError] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) {
        return;
      }

      setIsPending(true);
      setError(null);

      try {
        const result = await fn();
        if (isMounted) {
          setCurrentData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsPending(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  if (isPending) {
    return {
      isPending: true,
      isError: false,
      data: undefined,
      error: null,
      setData: setCurrentData,
    };
  }

  if (error) {
    return {
      isPending: false,
      isError: true,
      data: undefined,
      error: error,
      setData: setCurrentData,
    };
  }

  return {
    isPending: false,
    isError: false,
    data: currentData as T,
    error: null,
    setData: setCurrentData,
  };
}
