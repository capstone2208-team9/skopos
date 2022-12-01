#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ReactStack} from '../lib/react/react-stack'
import {EcsStack} from '../lib/ecs/ecs-stack'
import {RdsStack} from '../lib/rds/rds-stack'
import {VpcStack} from '../lib/vpc/vpc-stack'

const app = new cdk.App();

const {instance: vpc} = new VpcStack(app, 'VpcStack')
const rds = new RdsStack(app, 'RdsStack', {
  vpc
})

const {backendURI, collectionRunnerURI} = new EcsStack(app, 'EcsStack', {
  db: rds.postgresQLInstance,
  vpc,
  dbCredentials: rds.credentials,
})

new ReactStack(app, 'ReactStack', {
  backendURI, collectionRunnerURI
})

