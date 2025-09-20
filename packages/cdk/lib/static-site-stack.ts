import {
  App,
  DockerImage,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
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
import {
  BucketDeployment,
  CacheControl,
  Source,
} from "aws-cdk-lib/aws-s3-deployment";
import { execSync } from "child_process";
import { cpSync } from "fs";
import { EnvironmentConfig } from "./utils/config";
import { buildNaming, Components } from "./utils/naming";

export interface StaticSiteStackProps extends StackProps {
  config: EnvironmentConfig;
  sourcePath: string;
  userPoolId: string;
  userPoolClientId: string;
  apiUrl: string;
}

export class StaticSiteStack extends Stack {
  public readonly distribution: Distribution;
  public readonly bucket: Bucket;

  constructor(scope: App, id: string, props: StaticSiteStackProps) {
    super(scope, id, props);

    const { config, sourcePath } = props;
    const naming = buildNaming({ stage: config.name, account: this.account });

    // S3 Bucket for static assets
    this.bucket = new Bucket(this, "StaticSiteBucket", {
      bucketName: naming.bucket(Components.staticSite),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy:
        config.name === "dev" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      autoDeleteObjects: config.name === "dev",
    });

    const certificate = new Certificate(this, "SiteCertificate", {
      domainName: config.domainName,
      validation: CertificateValidation.fromDns(),
    });

    // CloudFront Distribution
    this.distribution = new Distribution(this, "Distribution", {
      comment: naming.resource(Components.staticSite, "cdn"),
      defaultRootObject: "index.html",
      priceClass: PriceClass.PRICE_CLASS_100,
      domainNames: [config.domainName],
      certificate,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
    });

    // Deploy static assets
    const codeAsset = Source.asset(sourcePath, {
      bundling: {
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync("pnpm install --frozen-lockfile", {
                stdio: "inherit",
                cwd: sourcePath,
              });
              execSync("NODE_ENV=production pnpm --filter web build", {
                stdio: "inherit",
                cwd: sourcePath,
              });

              const buildDir = `${sourcePath}/apps/web/dist`;

              cpSync(buildDir, outputDir, { recursive: true });

              return true;
            } catch (error) {
              console.error("Local bundling failed:", error);
              return false;
            }
          },
        },
        user: "root",
        image: DockerImage.fromRegistry("node:24-alpine"),
        command: [
          "sh",
          "-c",
          [
            "npm install -g pnpm",
            "pnpm install --frozen-lockfile",
            "pnpm --filter web build",
            "cp -au apps/web/dist/* /asset-output",
          ].join(" && "),
        ],
        environment: {
          CI: "true",
          NODE_ENV: "production",
        },
      },
    });

    new BucketDeployment(this, "DeployStaticSite", {
      sources: [codeAsset],
      exclude: ["config.json"],
      destinationBucket: this.bucket,
      distribution: this.distribution,
    });

    // Dynamically generate a runtime config file the frontend can fetch at /config.json
    new BucketDeployment(this, "DeployRuntimeConfig", {
      sources: [
        Source.jsonData("config.json", {
          userPoolId: props.userPoolId,
          userPoolClientId: props.userPoolClientId,
          portfolioApiUrl: props.apiUrl,
        }),
      ],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      cacheControl: [CacheControl.noCache()], // ensure clients always revalidate config
    });
  }
}
