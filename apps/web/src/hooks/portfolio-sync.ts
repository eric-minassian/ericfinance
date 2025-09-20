import { PortfolioSyncContext } from "@/providers/portfolio-sync-context";
import { useContext } from "react";

export function usePortfolioSync() {
  return useContext(PortfolioSyncContext);
}
