#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {EcsStack} from '../lib/ecs/ecs-stack'
// import {IamStack} from '../lib/iam/iam-stack'
import {RdsStack} from '../lib/rds/rds-stack'
import {S3Stack} from '../lib/s3/s3-stack'
import {VpcStack} from '../lib/vpc/vpc-stack'
import { SkoposCloudStack } from '../lib/skopos-cloud-stack';
import { LambdaStack } from '../lib/lambda/lambda-stack'

const app = new cdk.App();
new SkoposCloudStack(app, 'SkoposCloudStack');

// const iam = new IamStack(app, 'IamStack')
const vpc = new VpcStack(app, 'VpcStack')
const rds = new RdsStack(app, 'RdsStack', {
  vpc: vpc.vpc
})
const lambda = new LambdaStack(app, 'LambdaStack')

new EcsStack(app, 'EcsStack', {
  db: rds.postgresQLInstance,
  vpc: vpc.vpc,
  dbCredentials: rds.credentials,
  lambdaArn: lambda.functionArn
})

// change lambda env variable for pointing to ecs collection runner

new S3Stack(app, 'S3Stack') 


