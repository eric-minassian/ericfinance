#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { AuthStack } from "../lib/auth-stack";
import { GithubActionsAwsAuthStack } from "../lib/github-actions-aws-auth-stack";
import { PortfolioStack } from "../lib/portfolio-stack";
import { StaticSiteStack } from "../lib/static-site-stack";
import { getEnvironmentConfig } from "../lib/utils/config";
import { AWS_REGION, REPOSITORY_CONFIG } from "../lib/utils/contants";
import { buildNaming, Components } from "../lib/utils/naming";

const app = new App();

const stage = app.node.tryGetContext("stage") || "dev";
const config = getEnvironmentConfig(stage);
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: AWS_REGION };
const naming = buildNaming({ stage: stage, account: env.account });

const rootPath = path.resolve(__dirname, "../../../");

if (config.name !== "dev") {
  new GithubActionsAwsAuthStack(app, naming.stack(Components.githubOidc), {
    env,
    stageName: config.name,
    repositoryConfig: REPOSITORY_CONFIG,
    roleConfig: {
      inlinePolicies: {
        AssumeCdkRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["sts:AssumeRole"],
              resources: [`arn:aws:iam::${env.account}:role/cdk-*`],
            }),
          ],
        }),
      },
    },
  });
}

const authStack = new AuthStack(app, naming.stack(Components.auth), {
  env,
  stageName: config.name,
});

const portfolioStack = new PortfolioStack(
  app,
  naming.stack(Components.portfolio),
  {
    env,
    stageName: config.name,
    userPool: authStack.userPool,
    userPoolClient: authStack.userPoolClient,
  }
);

const staticSiteStack = new StaticSiteStack(
  app,
  naming.stack(Components.staticSite),
  {
    env,
    config,
    sourcePath: rootPath,
    userPoolId: authStack.userPool.userPoolId,
    userPoolClientId: authStack.userPoolClient.userPoolClientId,
    apiUrl: portfolioStack.api.apiEndpoint,
  }
);
staticSiteStack.addDependency(authStack);
staticSiteStack.addDependency(portfolioStack);

// CDK Nag
// Aspects.of(app).add(new AwsSolutionsChecks());
// Aspects.of(app).add(new HIPAASecurityChecks());
