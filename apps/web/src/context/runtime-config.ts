import { createContext } from "react";

export interface RuntimeConfig {
  userPoolId: string;
  userPoolClientId: string;
  portfolioApiUrl: string;
}

interface RuntimeConfigContextValue {
  config?: RuntimeConfig;
  loading: boolean;
  error: Error | null;
}

export const RuntimeConfigContext = createContext<
  RuntimeConfigContextValue | undefined
>(undefined);
