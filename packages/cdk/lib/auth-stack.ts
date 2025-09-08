import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnManagedLoginBranding,
  ManagedLoginVersion,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import { EnvironmentConfig } from "./config";

export interface AuthStackProps extends StackProps {
  config: EnvironmentConfig;
}

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;

  constructor(scope: App, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const { config } = props;

    this.userPool = new UserPool(this, "UserPool", {
      userPoolName: config.cognito.userPoolName,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      removalPolicy:
        config.name === "dev" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    });

    this.userPoolDomain = new UserPoolDomain(this, "UserPoolDomain", {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: `${config.name}-ericfinance-auth`,
      },
      managedLoginVersion: ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    this.userPoolClient = new UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: config.cognito.userPoolClientName,
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: false,
        adminUserPassword: false,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
        callbackUrls: config.cognito.allowedOrigins,
        logoutUrls: config.cognito.allowedOrigins,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
    });

    new CfnManagedLoginBranding(this, "LoginBranding", {
      userPoolId: this.userPool.userPoolId,
      clientId: this.userPoolClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });
  }
}
