import * as cdk from 'aws-cdk-lib'
import {Construct} from 'constructs'
import { EcsStack } from './ecs/ecs-stack'
import { RdsStack } from './rds/rds-stack'
import { VpcStack } from './vpc/vpc-stack'

export class SkoposCloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    // const iam = new IamStack(app, 'IamStack')
    const vpc = new VpcStack(scope, 'VpcStack')
    const rds = new RdsStack(scope, 'RdsStack', {
      vpc: vpc.vpc
    })

    new EcsStack(scope, 'EcsStack', {
      db: rds.postgresQLInstance,
      vpc: vpc.vpc,
      dbCredentials: rds.credentials,
    })
  }
}
