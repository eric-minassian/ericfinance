import { PortfolioSyncClient } from "@/lib/portfolio-sync";
import { createContext } from "react";

export interface PortfolioSyncContextValue {
  client: PortfolioSyncClient | null;
}
export const PortfolioSyncContext = createContext<PortfolioSyncContextValue>({
  client: null,
});
