#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {EcsStack} from '../lib/ecs/ecs-stack'
import {RdsStack} from '../lib/rds/rds-stack'
import {VpcStack} from '../lib/vpc/vpc-stack'
import { SkoposCloudStack } from '../lib/skopos-cloud-stack';

const app = new cdk.App();
new SkoposCloudStack(app, 'SkoposCloudStack');

// change lambda env variable for pointing to ecs collection runner


