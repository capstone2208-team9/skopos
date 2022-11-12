import * as cdk from 'aws-cdk-lib'
import {CfnOutput} from 'aws-cdk-lib'
import {Vpc} from 'aws-cdk-lib/aws-ec2'
import {Cluster, ContainerImage,} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'
import {ApplicationProtocol} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {Effect, PolicyStatement,} from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import {DatabaseInstance} from 'aws-cdk-lib/aws-rds'
import {Construct} from 'constructs'
import * as path from 'path'

export interface EcsStackProps extends cdk.StackProps {
  db: DatabaseInstance;
  dbCredentials: { username: string; password: string };
  vpc: Vpc;
}

export class EcsStack extends cdk.Stack {
  readonly backendURI: string
  readonly collectionRunnerURI: string

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props)
    const {vpc, db, dbCredentials} = props

    const cluster = new Cluster(this, 'ECSCluster', {
      vpc,
      containerInsights: true,
    })

    const func = new lambda.Function(this, 'call-collection-runner', {
      functionName: 'call-collection-runner',
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.collectionRunner',
      code: lambda.Code.fromAsset(path.join(__dirname, './../../src/lambda-function')),
      environment: {
        REGION: cdk.Stack.of(this).region,
        AVAILABILITY_ZONES: JSON.stringify(
          cdk.Stack.of(this).availabilityZones,
        ),
      },
    });

    const backendFargateService = new ApplicationLoadBalancedFargateService(this, 'BackendFargateService', {
      cluster,
      publicLoadBalancer: true,
      openListener: true,
      assignPublicIp: true,
      loadBalancerName: 'skopos-backend',
      serviceName: 'BackendService',
      desiredCount: 1,
      memoryLimitMiB: 512,
      cpu: 256,
      protocol: ApplicationProtocol.HTTP,
      taskImageOptions: {
        image: ContainerImage.fromRegistry('kat201/skopos-backend-1.2'),
        containerPort: 3001,
        containerName: 'BackendContainer',
        enableLogging: true,
        environment: {
          DATABASE_URL: `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`,
          LAMBDA_ARN: func.functionArn,
          AWS_REGION: cdk.Stack.of(this).region
        },
      }
    })

    this.backendURI = backendFargateService.loadBalancer.loadBalancerDnsName

    backendFargateService.taskDefinition.addToTaskRolePolicy(
      new PolicyStatement({
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
          'lambda:RemovePermission',
        ],
      })
    )

    backendFargateService.targetGroup.configureHealthCheck({
      port: '3001',
      path: '/health'
    })

    const collectionRunnerFargateService = new ApplicationLoadBalancedFargateService(this, 'CollectionRunnerFargateService', {
      cluster,
      publicLoadBalancer: true,
      openListener: true,
      assignPublicIp: true,
      loadBalancerName: 'collection-runner',
      serviceName: 'CollectionRunnerService',
      desiredCount: 1,
      memoryLimitMiB: 512,
      cpu: 256,
      taskImageOptions: {
        image: ContainerImage.fromRegistry('kat201/collection-runner1.1'),
        containerPort: 3003,
        containerName: 'CollectionRunnerContainer',
        enableLogging: true,
        environment: {
          GRAPHQL_URL: `http://${backendFargateService.loadBalancer.loadBalancerDnsName}/graphql`,
          AWS_REGION: 'us-east-1',
        }
      }
    })

    this.collectionRunnerURI = collectionRunnerFargateService.loadBalancer.loadBalancerDnsName

    collectionRunnerFargateService.targetGroup.configureHealthCheck({
      port: '3003',
      path: '/health',
    })

    func.addEnvironment('COLLECTION_RUNNER_URI',
      collectionRunnerFargateService.loadBalancer.loadBalancerDnsName,
    )

    new CfnOutput(this, 'skopos-backend', {
      value: backendFargateService.loadBalancer.loadBalancerDnsName,
    })

    new CfnOutput(this, 'CollectionRunnerLoadBalancerDNSName', {
      value: collectionRunnerFargateService.loadBalancer.loadBalancerDnsName,
    })

    new CfnOutput(this, 'LambdaARN', {
      value: func.functionArn
    })
  }
}
