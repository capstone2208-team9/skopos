import * as cdk from 'aws-cdk-lib'
import {Duration, Stack} from 'aws-cdk-lib'
import {InstanceType, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2'
import {Cluster, ContainerImage, PlacementConstraint, PlacementStrategy,} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedEc2Service} from 'aws-cdk-lib/aws-ecs-patterns'
import {ApplicationProtocol} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {Effect, PolicyStatement} from 'aws-cdk-lib/aws-iam'
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
  readonly backendEc2Service: ApplicationLoadBalancedEc2Service
  readonly collectionRunnerEc2Service: ApplicationLoadBalancedEc2Service

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props)
    const {vpc, db, dbCredentials} = props

    const backendCluster = new Cluster(this, 'ECSBackendCluster', {
      vpc,
      containerInsights: true,
    })

    const collectionRunnerCluster = new Cluster(this, 'ECSCollectionRunnerCluster', {
      vpc,
      containerInsights: true,
    })
    //add capacity to the cluster
    backendCluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t3.micro'),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 1,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    })


    collectionRunnerCluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t3.micro'),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 5,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    })

    const func = new lambda.Function(this, 'call-collection-runner', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: 'call-collection-runner',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.collectionRunner',
      code: lambda.Code.fromAsset(
        path.join(__dirname, './../../src/lambda-function')
      ),
      environment: {
        REGION: cdk.Stack.of(this).region,
        AVAILABILITY_ZONES: JSON.stringify(
          cdk.Stack.of(this).availabilityZones
        ),
      },
    })

    this.backendEc2Service = new ApplicationLoadBalancedEc2Service(
      this,
      'BackendEc2Service',
      {
        cluster: backendCluster,
        publicLoadBalancer: true,
        openListener: true,
        loadBalancerName: 'skopos-graphql-lb',
        serviceName: 'BackendService',
        desiredCount: 1,
        memoryLimitMiB: 512,
        cpu: 256,
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          // image: ContainerImage.fromRegistry('nykaelad/graphql-server:1.3'),
          image: ContainerImage.fromRegistry('kat201/skopos-graphql:1.3'),
          containerPort: 3001,
          containerName: 'BackendContainer',
          enableLogging: true,
          environment: {
            DATABASE_URL: `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`,
            PORT: '3001',
            LAMBDA_ARN: func.functionArn,
            AWS_REGION: Stack.of(this).region,
            LAMBDA_NAME: func.functionName
          },
        },
      }
    )
    // TODO: add SNS:ListSubscriptionsByTopic to policy
    this.backendEc2Service.taskDefinition.addToTaskRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: [
          'events:EnableRule',
          'events:PutRule',
          'events:DeleteRule',
          'events:PutTargets',
          'events:ListRuleNamesByTarget',
          'events:ListRules',
          'events:RemoveTargets',
          'events:ListTargetsByRule',
          'sns:CreateTopic',
          'sns:DeleteTopic',
          'sns:Unsubscribe',
          'sns:Publish',
          'sns:CreateSubscription',
          'sns:ListSubscriptionsByTopic',
          'sns:Subscribe',
          'events:DisableRule',
          'lambda:AddPermission',
          'lambda:RemovePermission',
        ],
      }))

    this.backendEc2Service.targetGroup.configureHealthCheck({
      interval: Duration.seconds(120),
      path: '/health'
    })
    this.backendURI = this.backendEc2Service.loadBalancer.loadBalancerDnsName

    this.collectionRunnerEc2Service = new ApplicationLoadBalancedEc2Service(
      this,
      'CollectionRunnerEc2Service',
      {
        cluster: collectionRunnerCluster,
        publicLoadBalancer: true,
        openListener: true,
        loadBalancerName: 'collection-runner-lb',
        serviceName: 'CollectionRunnerService',
        desiredCount: 1,
        memoryLimitMiB: 512,
        cpu: 256,
        placementConstraints: [PlacementConstraint.distinctInstances()],
        placementStrategies: [PlacementStrategy.packedByCpu()],
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          // image: ContainerImage.fromRegistry('nykaelad/collection-runner:1.0'),
          image: ContainerImage.fromRegistry('kat201/skopos-collection-runner:1.3'),
          containerPort: 3003,
          containerName: 'CollectionRunnerContainer',
          enableLogging: true,
          environment: {
            GRAPHQL_URL: `http://${this.backendEc2Service.loadBalancer.loadBalancerDnsName}/graphql`,
            AWS_REGION: Stack.of(this).region,
          },
        },
      }
    )

    // TODO: this gives collection runner permissions it needs
    this.collectionRunnerEc2Service.taskDefinition.addToTaskRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: [
          'sns:Publish',
        ],
      }))


    this.collectionRunnerEc2Service.service.autoScaleTaskCount({
      maxCapacity: 5,
      minCapacity: 1,
    })

    this.collectionRunnerEc2Service.targetGroup.configureHealthCheck({
      interval: Duration.seconds(120),
      path: '/health'
    })

    this.collectionRunnerURI = this.collectionRunnerEc2Service.loadBalancer.loadBalancerDnsName

    func.addEnvironment(
      'COLLECTION_RUNNER_URI',
      this.collectionRunnerEc2Service.loadBalancer.loadBalancerDnsName
    )
  }
}
