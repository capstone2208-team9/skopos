import * as cdk from 'aws-cdk-lib'
import {RemovalPolicy} from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import {Construct} from 'constructs'
import * as path from 'path'

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'SkoposUIApp', {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    })
    new s3Deployment.BucketDeployment(this, 'deploy-skopos-ui', {
      sources: [s3Deployment.Source.asset(path.join(__dirname, 'build.zip'))],
      destinationBucket: bucket
    })
  }
}
