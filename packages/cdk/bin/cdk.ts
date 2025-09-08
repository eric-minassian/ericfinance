#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import * as path from "path";
import { AuthStack } from "../lib/auth-stack";
import { getEnvironmentConfig } from "../lib/config";
import { StaticSiteStack } from "../lib/static-site-stack";

const app = new App();

const envName = app.node.tryGetContext("stage") || "dev";
const config = getEnvironmentConfig(envName);

const webPath = path.resolve(__dirname, "../../../apps/web/dist");

const env = {
  account: config.account,
  region: config.region,
};

const authStack = new AuthStack(app, `EricFinance-Auth-${config.name}`, {
  config,
  env,
});

const staticSiteStack = new StaticSiteStack(
  app,
  `EricFinance-StaticSite-${config.name}`,
  {
    config,
    authStack,
    buildPath: webPath,
    env,
  }
);

staticSiteStack.addDependency(authStack);

// CDK Nag
// Aspects.of(app).add(new AwsSolutionsChecks());
// Aspects.of(app).add(new HIPAASecurityChecks());
