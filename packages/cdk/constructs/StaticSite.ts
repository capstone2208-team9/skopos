import * as chalk from "chalk";
import * as path from "path";
import * as fs from "fs-extra";
import * as crypto from "crypto";
import { execSync } from "child_process";
import { Construct } from "constructs";
import {
  Token,
  Duration,
  CfnOutput,
  RemovalPolicy,
  CustomResource, Stack,
} from 'aws-cdk-lib'
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Assets from "aws-cdk-lib/aws-s3-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cfOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import { AwsCliLayer } from "aws-cdk-lib/lambda-layer-awscli";

import {
  BaseSiteDomainProps,
  BaseSiteReplaceProps,
  BaseSiteCdkDistributionProps,
  getBuildCmdEnvironment,
  buildErrorResponsesFor404ErrorPage,
  buildErrorResponsesForRedirectToIndex,
} from "./BaseSite";

const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");

export function isCDKConstruct(construct: any): construct is Construct {
  const fqn = construct?.constructor?.[JSII_RTTI_SYMBOL_1]?.fqn;
  return (
    typeof fqn === "string" &&
    (fqn.startsWith("@aws-cdk/") || fqn.startsWith("aws-cdk-lib"))
  );
}

export interface StaticSiteFileOptions {
  exclude: string | string[];
  include: string | string[];
  cacheControl: string;
}

export interface StaticSiteProps {
  /**
   * Path to the directory where the website source is located.
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   path: "path/to/src",
   * });
   * ```
   */
  path: string;
  /**
   * The name of the index page (e.g. "index.html") of the website.
   *
   * @default "index.html"
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   indexPage: "other-index.html",
   * });
   * ```
   */
  indexPage?: string;
  /**
   * The error page behavior for this website. Takes either an HTML page.
   * ```
   * 404.html
   * ```
   * Or the constant `"redirect_to_index_page"` to redirect to the index page.
   *
   * Note that, if the error pages are redirected to the index page, the HTTP status code is set to 200. This is necessary for single page apps, that handle 404 pages on the client side.
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   errorPage: "redirect_to_index_page",
   * });
   * ```
   */
  errorPage?: "redirect_to_index_page" | Omit<string, "redirect_to_index_page">;
  /**
   * The command for building the website
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   buildCommand: "npm run build",
   * });
   * ```
   */
  buildCommand?: string;
  /**
   * The directory with the content that will be uploaded to the S3 bucket. If a `buildCommand` is provided, this is usually where the build output is generated. The path is relative to the [`path`](#path) where the website source is located.
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   buildOutput: "dist",
   * });
   * ```
   */
  buildOutput?: string;
  /**
   * Pass in a list of file options to configure cache control for different files. Behind the scenes, the `StaticSite` construct uses a combination of the `s3 cp` and `s3 sync` commands to upload the website content to the S3 bucket. An `s3 cp` command is run for each file option block, and the options are passed in as the command options.
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   buildOutput: "dist",
   *   fileOptions: {
   *     exclude: "*",
   *     include: "*.js",
   *     cacheControl: "max-age=31536000,public,immutable",
   *   }
   * });
   * ```
   */
  fileOptions?: StaticSiteFileOptions[];
  /**
   * Pass in a list of placeholder values to be replaced in the website content. For example, the follow configuration:
   *
   * @example
   * ```js
   * new StaticSite(stack, "ReactSite", {
   *   replaceValues: [
   *     {
   *       files: "*.js",
   *       search: "{{ API_URL }}",
   *       replace: api.url,
   *     },
   *     {
   *       files: "*.js",
   *       search: "{{ COGNITO_USER_POOL_CLIENT_ID }}",
   *       replace: auth.cognitoUserPoolClient.userPoolClientId,
   *     },
   *   ],
   * });
   * ```
   */
  replaceValues?: StaticSiteReplaceProps[];
  /**
   * The customDomain for this website. SST supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.
   *
   * Note that you can also migrate externally hosted domains to Route 53 by [following this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   path: "path/to/src",
   *   customDomain: "domain.com",
   * });
   * ```
   *
   * @example
   * ```js
   * new StaticSite(stack, "Site", {
   *   path: "path/to/src",
   *   customDomain: {
   *     domainName: "domain.com",
   *     domainAlias: "www.domain.com",
   *     hostedZone: "domain.com"
   *   }
   * });
   * ```
   */
  customDomain?: string | StaticSiteDomainProps;
  /**
   * An object with the key being the environment variable name. Note, this requires your build tool to support build time environment variables.
   *
   * @example
   * ```js
   * new StaticSite(stack, "ReactSite", {
   *   environment: {
   *     REACT_APP_API_URL: api.url,
   *     REACT_APP_USER_POOL_CLIENT: auth.cognitoUserPoolClient.userPoolClientId,
   *   },
   * });
   * ```
   */
  environment?: Record<string, string>;
  /**
   * While deploying, SST removes old files that no longer exist. Pass in `false` to keep the old files around.
   *
   * @default true
   *
   * @example
   * ```js
   * new StaticSite(stack, "ReactSite", {
   *  purge: false
   * });
   * ```
   */
  purgeFiles?: boolean;
  /**
   * While deploying, SST waits for the CloudFront cache invalidation process to finish. This ensures that the new content will be served once the deploy command finishes. However, this process can sometimes take more than 5 mins. For non-prod environments it might make sense to pass in `false`. That'll skip waiting for the cache to invalidate and speed up the deploy process.
   *
   * @default true
   *
   * @example
   * ```js
   * new StaticSite(stack, "ReactSite", {
   *  waitForInvalidation: false
   * });
   * ```
   */
  waitForInvalidation?: boolean;
  cdk?: {
    /**
     * Allows you to override default id for this construct.
     */
    id?: string;
    /**
     * Allows you to override default settings this construct uses internally to ceate the bucket
     *
     * @example
     * ```js
     * new StaticSite(stack, "Site", {
     *   path: "path/to/src",
     *   cdk: {
     *     bucket: {
     *       bucketName: "mybucket",
     *     },
     *   }
     * });
     * ```
     */
    bucket?: s3.BucketProps | s3.IBucket;
    /**
     * Configure the internally created CDK `Distribution` instance.
     *
     * @example
     * ```js
     * new StaticSite(stack, "Site", {
     *   path: "path/to/src",
     *   cdk: {
     *     distribution: {
     *       comment: "Distribution for my React website",
     *     },
     *   }
     * });
     * ```
     */
    distribution?: StaticSiteCdkDistributionProps;
  };
}

export interface StaticSiteDomainProps extends BaseSiteDomainProps { }
export interface StaticSiteReplaceProps extends BaseSiteReplaceProps { }
export interface StaticSiteCdkDistributionProps
  extends BaseSiteCdkDistributionProps { }

/////////////////////
// Construct
/////////////////////

/**
 * The `StaticSite` construct is a higher level CDK construct that makes it easy to create a static website.
 *
 * @example
 *
 * Deploys a plain HTML website in the `path/to/src` directory.
 *
 * ```js
 * import { StaticSite } from "@serverless-stack/resources";
 *
 * new StaticSite(stack, "Site", {
 *   path: "path/to/src",
 * });
 * ```
 */
export class StaticSite extends Construct {
  public readonly id: string;
  public readonly cdk: {
    /**
     * The internally created CDK `Bucket` instance.
     */
    bucket: s3.Bucket;
    /**
     * The internally created CDK `Distribution` instance.
     */
    distribution: cloudfront.Distribution;
  };
  private readonly props: StaticSiteProps;
  private isPlaceholder: boolean;
  private assets: s3Assets.Asset[];
  private readonly filenamesAsset?: s3Assets.Asset;
  private readonly awsCliLayer: AwsCliLayer;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, props.cdk?.id || id);
    this.id = id;
    const buildPath = path.join(__dirname, 'siteBuildDir')
    try {
     !fs.existsSync(buildPath) && fs.mkdirSync(buildPath)
    } catch (e) {
      console.log('skip create build path')
    }
    const buildDir = buildPath
    this.props = props;
    this.cdk = {} as any;
    this.awsCliLayer = new AwsCliLayer(this, "AwsCliLayer");
    this.registerSiteEnvironment();

    // Build app
    this.buildApp();
    this.assets = this.bundleAssets(200, buildDir);
    this.filenamesAsset = this.bundleFilenamesAsset(buildDir);

    // Create Bucket
    this.cdk.bucket = this.createS3Bucket();

    // Create S3 Deployment
    // const s3deployCR = this.createS3Deployment();
    this.createS3Deployment();

    // TODO: Create CloudFront if we can get certificate and domain
    // this.cdk.distribution = this.createCfDistribution();
    // this.cdk.distribution.node.addDependency(s3deployCR);

    // Invalidate CloudFront
    // const invalidationCR = this.createCloudFrontInvalidation();
    // invalidationCR.node.addDependency(this.cdk.distribution);
  }

  /**
   * The CloudFront URL of the website. (TODO: change this if adding Cloudfront back in)
   */
  public get url(): string {
    return this.cdk.bucket.bucketWebsiteUrl
  }

  /**
   * If the custom domain is enabled, this is the URL of the website with the custom domain.
   */
  public get customDomainUrl(): string | undefined {
    const { customDomain } = this.props;
    if (!customDomain) {
      return;
    }

    if (typeof customDomain === "string") {
      return `https://${customDomain}`;
    } else {
      return `https://${customDomain.domainName}`;
    }
  }

  /**
   * The ARN of the internally created S3 Bucket.
   */
  public get bucketArn(): string {
    return this.cdk.bucket.bucketArn;
  }

  /**
   * The name of the internally created S3 Bucket.
   */
  public get bucketName(): string {
    return this.cdk.bucket.bucketName;
  }

  /**
   * The ID of the internally created CloudFront Distribution.
   */
  public get distributionId(): string {
    return this.cdk.distribution.distributionId;
  }

  /**
   * The domain name of the internally created CloudFront Distribution.
   */
  public get distributionDomain(): string {
    return this.cdk.distribution.distributionDomainName;
  }

  public getConstructMetadata() {
    return {
      type: "StaticSite" as const,
      data: {
        distributionId: this.cdk.distribution.distributionId,
        customDomainUrl: this.customDomainUrl,
      },
    };
  }

  private buildApp() {
    const { path: sitePath, buildCommand } = this.props;

    // validate site path exists
    if (!fs.existsSync(sitePath)) {
      throw new Error(
        `No path found at "${path.resolve(sitePath)}" for the "${this.node.id
        }" StaticSite.`
      );
    }

    // build
    if (buildCommand) {
      try {
        console.log(chalk.grey(`Building static site ${sitePath}`));
        execSync(buildCommand, {
          cwd:  sitePath,
          stdio: "inherit",
          env: {
            ...process.env,
            ...getBuildCmdEnvironment(this.props.environment),
          },
        });
      } catch (e) {
        console.log(e)
        throw new Error(
          `There was a problem building the "${this.node.id}" StaticSite.`
        );
      }
    }
  }

  private bundleAssets(
    fileSizeLimit: number,
    buildDir: string
  ): s3Assets.Asset[] {
    const { path: sitePath } = this.props;
    const buildOutput = this.props.buildOutput || ".";

    // validate buildOutput exists
    const siteOutputPath = path.resolve(path.join(sitePath, buildOutput));
    if (!fs.existsSync(siteOutputPath)) {
      throw new Error(
        `No build output found at "${siteOutputPath}" for the "${this.node.id}" StaticSite.`
      );
    }

    // create zip files
    const script = path.join(__dirname, "../assets/BaseSite/archiver.cjs");
    const zipPath = path.resolve(
      path.join(buildDir, `StaticSite-${this.node.id}-${this.node.addr}`)
    );
    // clear zip path to ensure no partX.zip remain from previous build
    fs.removeSync(zipPath);
    const cmd = ["node", script, siteOutputPath, zipPath, fileSizeLimit].join(
      " "
    );

    try {
      execSync(cmd, {
        cwd: sitePath,
        stdio: "inherit",
      });
    } catch (e) {
      throw new Error(
        `There was a problem generating the "${this.node.id}" StaticSite package.`
      );
    }

    // create assets
    const assets = [];
    for (let partId = 0; ; partId++) {
      const zipFilePath = path.join(zipPath, `part${partId}.zip`);
      if (!fs.existsSync(zipFilePath)) {
        break;
      }

      assets.push(
        new s3Assets.Asset(this, `Asset${partId}`, {
          path: zipFilePath,
        })
      );
    }
    return assets;
  }

  private bundleFilenamesAsset(buildDir: string): s3Assets.Asset | undefined {
    if (this.isPlaceholder) {
      return;
    }
    if (this.props.purgeFiles === false) {
      return;
    }

    const zipPath = path.resolve(
      path.join(buildDir, `StaticSite-${this.node.id}-${this.node.addr}`)
    );

    // create assets
    const filenamesPath = path.join(zipPath, `filenames`);
    if (!fs.existsSync(filenamesPath)) {
      throw new Error(
        `There was a problem generating the "${this.node.id}" StaticSite package.`
      );
    }

    return new s3Assets.Asset(this, `AssetFilenames`, {
      path: filenamesPath,
    });
  }

  private createS3Bucket(): s3.Bucket {
    const { cdk } = this.props;

      const bucketProps = cdk?.bucket as s3.BucketProps;

      const websiteBucket =  new s3.Bucket(this, "S3Bucket", {
        autoDeleteObjects: true,
        publicReadAccess: true,
        removalPolicy: RemovalPolicy.DESTROY,
        ...bucketProps,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
      });
      websiteBucket.grantPublicAccess('*', 's3:GetObject')
    return websiteBucket
  }

  private createS3Deployment(): CustomResource {
    const { fileOptions } = this.props;

    // Create a Lambda function that will be doing the uploading
    const uploader = new lambda.Function(this, "S3Uploader", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../assets/BaseSite/custom-resource")
      ),
      layers: [this.awsCliLayer],
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: "s3-upload.handler",
      timeout: Duration.minutes(15),
      memorySize: 1024,
    });
    this.cdk.bucket.grantReadWrite(uploader);
    this.assets.forEach((asset) => asset.grantRead(uploader));

    // Create the custom resource function
    const handler = new lambda.Function(this, "S3Handler", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../assets/BaseSite/custom-resource")
      ),
      layers: [this.awsCliLayer],
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: "s3-handler.handler",
      timeout: Duration.minutes(15),
      memorySize: 1024,
      environment: {
        UPLOADER_FUNCTION_NAME: uploader.functionName,
      },
    });
    this.cdk.bucket.grantReadWrite(handler);
    this.filenamesAsset?.grantRead(handler);
    uploader.grantInvoke(handler);

    // Create custom resource
    return new CustomResource(this, "S3Deployment", {
      serviceToken: handler.functionArn,
      resourceType: "Custom::SSTBucketDeployment",
      properties: {
        Sources: this.assets.map((asset) => ({
          BucketName: asset.s3BucketName,
          ObjectKey: asset.s3ObjectKey,
        })),
        DestinationBucketName: this.cdk.bucket.bucketName,
        Filenames: this.filenamesAsset && {
          BucketName: this.filenamesAsset.s3BucketName,
          ObjectKey: this.filenamesAsset.s3ObjectKey,
        },
        FileOptions: (fileOptions || []).map(
          ({ exclude, include, cacheControl }) => {
            if (typeof exclude === "string") {
              exclude = [exclude];
            }
            if (typeof include === "string") {
              include = [include];
            }
            const options = [];
            exclude.forEach((per) => options.push("--exclude", per));
            include.forEach((per) => options.push("--include", per));
            options.push("--cache-control", cacheControl);
            return options;
          }
        ),
        ReplaceValues: this.getS3ContentReplaceValues(),
      },
    });
  }

  /////////////////////
  // CloudFront Distribution
  /////////////////////

  private createCfDistribution(): cloudfront.Distribution {
    const { cdk } = this.props;
    const indexPage = this.props.indexPage || "index.html";
    const errorPage = this.props.errorPage;
    // Build errorResponses
    let errorResponses;
    // case: sst start => showing stub site, and redirect all routes to the index page
    if (this.isPlaceholder) {
      errorResponses = buildErrorResponsesForRedirectToIndex(indexPage);
    } else if (errorPage) {
      if (cdk?.distribution?.errorResponses) {
        throw new Error(
          `Cannot configure the "cfDistribution.errorResponses" when "errorPage" is passed in. Use one or the other to configure the behavior for error pages.`
        );
      }

      errorResponses =
        errorPage === "redirect_to_index_page"
          ? buildErrorResponsesForRedirectToIndex(indexPage)
          : buildErrorResponsesFor404ErrorPage(errorPage as string);
    }

    // Create CloudFront distribution
    return new cloudfront.Distribution(this, "Distribution", {
      // these values can be overwritten by cfDistributionProps
      defaultRootObject: indexPage,
      errorResponses,
      ...cdk?.distribution,
      defaultBehavior: {
        origin: new cfOrigins.S3Origin(this.cdk.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
        ...cdk?.distribution?.defaultBehavior,
      },
    });
  }

  private createCloudFrontInvalidation(): CustomResource {
    // Create a Lambda function that will be doing the invalidation
    const invalidator = new lambda.Function(this, "CloudFrontInvalidator", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../assets/BaseSite/custom-resource")
      ),
      layers: [this.awsCliLayer],
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: "cf-invalidate.handler",
      timeout: Duration.minutes(15),
      memorySize: 1024,
    });

    // Grant permissions to invalidate CF Distribution
    invalidator.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cloudfront:GetInvalidation",
          "cloudfront:CreateInvalidation",
        ],
        resources: ["*"],
      })
    );

    // Need the AssetHash field so the CR gets updated on each deploy
    const assetsHash = crypto
      .createHash("md5")
      .update(this.assets.map(({ assetHash }) => assetHash).join(""))
      .digest("hex");

    // Create custom resource
    const waitForInvalidation = this.isPlaceholder
      ? false
      : (this.props.waitForInvalidation !== false);
    return new CustomResource(this, "CloudFrontInvalidation", {
      serviceToken: invalidator.functionArn,
      resourceType: "Custom::SSTCloudFrontInvalidation",
      properties: {
        AssetsHash: assetsHash,
        DistributionId: this.cdk.distribution.distributionId,
        DistributionPaths: ["/*"],
        WaitForInvalidation: waitForInvalidation,
      },
    });
  }

  /////////////////////
  // Helper Functions
  /////////////////////

  private getS3ContentReplaceValues(): StaticSiteReplaceProps[] {
    const replaceValues: StaticSiteReplaceProps[] =
      this.props.replaceValues || [];

    Object.entries(this.props.environment || {})
      .filter(([, value]) => Token.isUnresolved(value))
      .forEach(([key, value]) => {
        const token = `{{ ${key} }}`;
        replaceValues.push(
          {
            files: "**/*.html",
            search: token,
            replace: value,
          },
          {
            files: "**/*.js",
            search: token,
            replace: value,
          }
        );
      });
    return replaceValues;
  }

  private registerSiteEnvironment() {
    const environmentOutputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(this.props.environment || {})) {
      const outputId = `SstSiteEnv_${key}`;
      const output = new CfnOutput(this, outputId, { value });
      environmentOutputs[key] = Stack.of(this).getLogicalId(output);
    }
  }
}
