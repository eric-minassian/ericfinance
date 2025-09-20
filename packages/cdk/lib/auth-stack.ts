import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { buildNaming, Components } from "./utils/naming";

export interface AuthStackProps extends StackProps {
  stageName: string;
}

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const { stageName } = props;
    const naming = buildNaming({ stage: stageName, account: this.account });

    this.userPool = new UserPool(this, "UserPool", {
      userPoolName: naming.resource(Components.auth, "user-pool"),
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      signInCaseSensitive: false,
      standardAttributes: { email: { required: true, mutable: false } },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
        requireSymbols: false,
        tempPasswordValidity: Duration.days(7),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    this.userPoolClient = this.userPool.addClient("WebUserPoolClient", {
      userPoolClientName: naming.resource(Components.auth, "web-client"),
      authFlows: { userPassword: true, userSrp: true },
      preventUserExistenceErrors: true,
      refreshTokenValidity: Duration.days(30),
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
    });
  }
}
