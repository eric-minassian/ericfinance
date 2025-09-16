#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { GithubActionsAwsAuthStack } from "../lib/github-actions-aws-auth-stack";
import { StaticSiteStack } from "../lib/static-site-stack";
import { getEnvironmentConfig } from "../lib/utils/config";
import { AWS_REGION, REPOSITORY_CONFIG } from "../lib/utils/contants";

const app = new App();

const stage = app.node.tryGetContext("stage") || "dev";
const config = getEnvironmentConfig(stage);
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: AWS_REGION };

const webBuildPath = path.resolve(__dirname, "../../../apps/web/dist");

if (config.name !== "dev") {
  new GithubActionsAwsAuthStack(app, `GitHubOIDCStack-${config.name}`, {
    env,
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

new StaticSiteStack(app, `EricFinance-StaticSite-${config.name}`, {
  config,
  buildPath: webBuildPath,
  env,
});

// CDK Nag
// Aspects.of(app).add(new AwsSolutionsChecks());
// Aspects.of(app).add(new HIPAASecurityChecks());
