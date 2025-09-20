import { CfnOutput, Duration, Stack, StackProps, Tags } from "aws-cdk-lib";
import {
  Conditions,
  IManagedPolicy,
  OpenIdConnectProvider,
  PolicyDocument,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { buildNaming, Components } from "./utils/naming";

export interface GithubActionsRepositoryConfig {
  readonly owner: string;
  readonly repo: string;
  readonly filter?: string;
}

export interface GithubActionsRoleConfig {
  readonly inlinePolicies?: Record<string, PolicyDocument>;
  readonly managedPolicies?: IManagedPolicy[];
}

export interface GithubActionsAwsAuthStackProps extends StackProps {
  readonly repositoryConfig: GithubActionsRepositoryConfig;
  readonly roleConfig: GithubActionsRoleConfig;
  readonly stageName: string;
}

export class GithubActionsAwsAuthStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: GithubActionsAwsAuthStackProps
  ) {
    super(scope, id, props);

    const naming = buildNaming({
      stage: props.stageName,
      account: this.account,
    });

    const githubProvider = new OpenIdConnectProvider(
      this,
      "GithubActionsProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      }
    );

    const iamRepoDeployAccess = `repo:${props.repositoryConfig.owner}/${
      props.repositoryConfig.repo
    }:${props.repositoryConfig.filter ?? "*"}`;

    const conditions: Conditions = {
      StringLike: {
        "token.actions.githubusercontent.com:sub": iamRepoDeployAccess,
      },
      StringEquals: {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      },
    };

    const role = new Role(this, "GitHubActionsOidcAccessRole", {
      assumedBy: new WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        conditions
      ),
      inlinePolicies: props.roleConfig.inlinePolicies,
      managedPolicies: props.roleConfig.managedPolicies,
      roleName: naming.role(Components.githubOidc),
      description:
        "This role is used via GitHub Actions assume the role in the target AWS account",
      maxSessionDuration: Duration.hours(12),
    });

    new CfnOutput(this, "GitHubActionsOidcAccessRoleArn", {
      value: role.roleArn,
      description: `Arn for AWS IAM role with Github Actions OIDC auth for ${iamRepoDeployAccess}`,
      exportName: "GitHubActionsOidcAccessRoleArn",
    });

    Tags.of(this).add("component", "cdk-github-actions-oidc-iam-role");
  }
}
