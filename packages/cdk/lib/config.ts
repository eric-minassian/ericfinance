export type StageName = "dev" | "staging" | "prod";

export interface EnvironmentConfig {
  name: StageName;
  account?: string;
  region: string;
  domain?: {
    name: string;
    certificateArn?: string;
    hostedZoneId?: string;
  };
  cognito: {
    userPoolName: string;
    userPoolClientName: string;
    allowedOrigins: string[];
  };
  monitoring?: {
    enableCloudWatch: boolean;
    enableXRay: boolean;
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    name: "dev",
    region: "us-west-2",
    cognito: {
      userPoolName: "ericfinance-dev-users",
      userPoolClientName: "ericfinance-dev-client",
      allowedOrigins: ["http://localhost:5173", "https://dev.ericfinance.com"],
    },
    monitoring: {
      enableCloudWatch: true,
      enableXRay: false,
    },
  },
  // staging: {
  //   name: "staging",
  //   region: "us-east-1",
  //   domain: {
  //     name: "staging.ericfinance.com",
  //     // certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id',
  //     // hostedZoneId: 'Z1234567890ABC',
  //   },
  //   cognito: {
  //     userPoolName: "ericfinance-staging-users",
  //     userPoolClientName: "ericfinance-staging-client",
  //     allowedOrigins: ["https://staging.ericfinance.com"],
  //   },
  //   monitoring: {
  //     enableCloudWatch: true,
  //     enableXRay: true,
  //   },
  // },
  // prod: {
  //   name: "prod",
  //   region: "us-east-1",
  //   domain: {
  //     name: "app.ericfinance.com",
  //     // certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id',
  //     // hostedZoneId: 'Z1234567890ABC',
  //   },
  //   cognito: {
  //     userPoolName: "ericfinance-prod-users",
  //     userPoolClientName: "ericfinance-prod-client",
  //     allowedOrigins: ["https://app.ericfinance.com"],
  //   },
  //   monitoring: {
  //     enableCloudWatch: true,
  //     enableXRay: true,
  //   },
  // },
};

export function getEnvironmentConfig(envName: string): EnvironmentConfig {
  const config = environments[envName];
  if (!config) {
    throw new Error(`Environment configuration not found for: ${envName}`);
  }
  return config;
}
