import { PortfolioSyncContext } from "@/context/portfolio-sync-context";
import { PortfolioSyncClient } from "@/lib/portfolio-sync";
import React, { useMemo } from "react";

export function PortfolioSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBase = import.meta.env.VITE_PORTFOLIO_API_URL as string | undefined;
  const client = useMemo(
    () => (apiBase ? new PortfolioSyncClient(apiBase) : null),
    [apiBase]
  );
  return (
    <PortfolioSyncContext.Provider value={{ client }}>
      {children}
    </PortfolioSyncContext.Provider>
  );
}
