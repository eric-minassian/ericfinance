export type Stage = "dev" | "beta" | "prod";

export interface EnvironmentConfig {
  name: Stage;
}

export const environments: Record<Stage, EnvironmentConfig> = {
  dev: {
    name: "dev",
  },
  beta: {
    name: "beta",
  },
  prod: {
    name: "prod",
  },
};

export function getEnvironmentConfig(stage: string): EnvironmentConfig {
  const config = environments[stage as Stage];
  if (!config) {
    throw new Error(`Environment configuration not found for: ${stage}`);
  }
  return config;
}
