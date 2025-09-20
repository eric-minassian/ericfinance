import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";
import { buildNaming, Components } from "./utils/naming";

export interface PortfolioStackProps extends StackProps {
  stageName: string;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  maxObjectSizeBytes?: number;
}

export class PortfolioStack extends Stack {
  public readonly portfolioBucket: Bucket;
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);
    const {
      stageName,
      userPool,
      userPoolClient,
      maxObjectSizeBytes = 25 * 1024 * 1024,
    } = props;
    const naming = buildNaming({ stage: stageName, account: this.account });

    this.portfolioBucket = new Bucket(this, "PortfolioBucket", {
      bucketName: naming.bucket(Components.portfolio),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy:
        stageName === "dev" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      autoDeleteObjects: stageName === "dev",
    });

    const getPortfolioHandler = new NodejsFunction(this, "GetPortfolioFn", {
      entry: path.resolve(__dirname, "lambdas/get-portfolio.ts"),
      runtime: Runtime.NODEJS_22_X,
      memorySize: 256,
      timeout: Duration.seconds(5),
      environment: {
        BUCKET_NAME: this.portfolioBucket.bucketName,
      },
    });
    this.portfolioBucket.grantRead(getPortfolioHandler);

    const authorizer = new HttpUserPoolAuthorizer(
      "CognitoAuthorizer",
      userPool,
      {
        userPoolClients: [userPoolClient],
      }
    );

    this.api = new HttpApi(this, "PortfolioApi", {
      apiName: naming.resource(Components.portfolio, "api"),
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: [CorsHttpMethod.GET],
        allowHeaders: ["authorization", "content-type"],
        maxAge: Duration.days(10),
      },
    });

    this.api.addRoutes({
      path: "/portfolio",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "GetPortfolioIntegration",
        getPortfolioHandler
      ),
    });
  }
}
