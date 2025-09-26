import { PortfolioSyncContext } from "@/context/portfolio-sync-context";
import { useRuntimeConfig } from "@/hooks/runtime-config";
import { PortfolioSyncClient } from "@/lib/portfolio-sync";
import React, { useMemo } from "react";

export function PortfolioSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: config } = useRuntimeConfig();
  const apiBase = config?.portfolioApiUrl;
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
