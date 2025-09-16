import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { EnvironmentConfig } from "./utils/config";

export interface StaticSiteStackProps extends StackProps {
  config: EnvironmentConfig;
  buildPath: string;
}

export class StaticSiteStack extends Stack {
  public readonly distribution: Distribution;
  public readonly bucket: Bucket;

  constructor(scope: App, id: string, props: StaticSiteStackProps) {
    super(scope, id, props);

    const { config, buildPath } = props;

    // S3 Bucket for static assets
    this.bucket = new Bucket(this, "StaticSiteBucket", {
      bucketName: `${config.name}-ericfinance-static-site-${this.account}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
      encryption: BucketEncryption.KMS,
      removalPolicy:
        config.name === "dev" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      autoDeleteObjects: config.name === "dev",
    });

    // CloudFront Distribution
    this.distribution = new Distribution(this, "Distribution", {
      comment: `${config.name} EricFinance Distribution`,
      defaultRootObject: "index.html",
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
    });

    // Deploy static assets
    new BucketDeployment(this, "DeployStaticSite", {
      sources: [Source.asset(buildPath)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
    });
  }
}
