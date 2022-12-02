#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import {ReactStack} from '../lib/react/react-stack.js'
import {EcsStack} from '../lib/ecs/ecs-stack.js'
import {RdsStack} from '../lib/rds/rds-stack.js'
import {VpcStack} from '../lib/vpc/vpc-stack.js'

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

// change lambda env variable for pointing to ecs collection runner

new ReactStack(app, 'ReactStack', {
  backendURI, collectionRunnerURI
})

