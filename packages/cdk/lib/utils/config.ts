export type Stage = "dev" | "beta" | "prod";

export interface EnvironmentConfig {
  name: Stage;
  domainName: string;
}

export const environments: Record<Stage, EnvironmentConfig> = {
  dev: {
    name: "dev",
    domainName: "dev.finance.ericminassian.com",
  },
  beta: {
    name: "beta",
    domainName: "beta.finance.ericminassian.com",
  },
  prod: {
    name: "prod",
    domainName: "finance.ericminassian.com",
  },
};

export function getEnvironmentConfig(stage: string): EnvironmentConfig {
  const config = environments[stage as Stage];
  if (!config) {
    throw new Error(`Environment configuration not found for: ${stage}`);
  }
  return config;
}
