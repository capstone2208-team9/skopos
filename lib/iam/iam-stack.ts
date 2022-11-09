import {CfnOutput} from 'aws-cdk-lib'
import * as cdk from 'aws-cdk-lib'
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam'
import {Construct} from 'constructs'

export class IamStack extends cdk.Stack {
  readonly fargateServiceRole: Role

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.fargateServiceRole = new Role(this, 'FargateTaskExecutionServiceRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    })

    this.fargateServiceRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: [
        'events:EnableRule',
        'events:PutRule',
        'sns:CreateTopic',
        'sns:Unsubscribe',
        'events:DeleteRule',
        'events:PutTargets',
        'sns:Publish',
        'events:ListRuleNamesByTarget',
        'events:ListRules',
        'sns:Subscribe',
        'events:RemoveTargets',
        'events:ListTargetsByRule',
        'events:DisableRule',
        'lambda:AddPermission',
        'lambda:RemovePermission'
      ],
    }))

    new CfnOutput(this, 'FargateRoleARN', {
      value: this.fargateServiceRole.roleArn
    })
  }
}
