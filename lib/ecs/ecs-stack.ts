<<<<<<< HEAD
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
=======
import * as cdk from "aws-cdk-lib";
import { CfnOutput, Duration } from "aws-cdk-lib";
import {
  SecurityGroup,
  Vpc,
  InstanceType,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  ContainerImage,
  PlacementConstraint,
  PlacementStrategy,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as path from "path";
>>>>>>> ec2

export interface EcsStackProps extends cdk.StackProps {
  db: DatabaseInstance;
  dbCredentials: { username: string; password: string };
  vpc: Vpc;
}

export class EcsStack extends cdk.Stack {
<<<<<<< HEAD
  readonly backendURI: string
  readonly collectionRunnerURI: string
=======
  readonly backendEc2Service: ApplicationLoadBalancedEc2Service;
  readonly collectionRunnerEc2Service: ApplicationLoadBalancedEc2Service;
>>>>>>> ec2

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);
    const { vpc, db, dbCredentials } = props;

    const backendCluster = new Cluster(this, "ECSBackendCluster", {
      vpc,
      containerInsights: true,
    });

    const collectionRunnerCluster = new Cluster(this, "ECSCollectionRunnerCluster", {
      vpc,
      containerInsights: true,
    });
    //add capacity to the cluster
    backendCluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: new InstanceType("t3.micro"),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 1,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });

<<<<<<< HEAD
    const func = new lambda.Function(this, 'call-collection-runner', {
      functionName: 'call-collection-runner',
=======
    collectionRunnerCluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: new InstanceType("t3.micro"),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 5,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });

    const func = new lambda.Function(this, "call-collection-runner", {
>>>>>>> ec2
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "index.collectionRunner",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "./../../src/lambda-function")
      ),
      environment: {
        REGION: cdk.Stack.of(this).region,
        AVAILABILITY_ZONES: JSON.stringify(
          cdk.Stack.of(this).availabilityZones
        ),
      },
    });

<<<<<<< HEAD
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
        image: ContainerImage.fromRegistry('kat201/skopos-backend:latest'),
        containerPort: 3001,
        containerName: 'BackendContainer',
        enableLogging: true,
        environment: {
          DATABASE_URL: `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`,
          LAMBDA_ARN: func.functionArn,
          AWS_REGION: cdk.Stack.of(this).region
=======
    this.backendEc2Service = new ApplicationLoadBalancedEc2Service(
      this,
      "BackendEc2Service",
      {
        cluster: backendCluster,
        publicLoadBalancer: true,
        openListener: true,
        loadBalancerName: "BackendLoadBalancerDNSName",
        serviceName: "BackendService",
        desiredCount: 1,
        memoryLimitMiB: 512,
        cpu: 512,
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          image: ContainerImage.fromRegistry("nykaelad/graphql-server:1.3"),
          containerPort: 3001,
          containerName: "BackendContainer",
          enableLogging: true,
          environment: {
            DATABASE_URL: `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`,
            PORT: "3001",
            LAMBDA_ARN: func.functionArn,
            AWS_REGION: "us-east-1",
            LAMBDA_FUNCTION_NAME: func.functionName
          },
>>>>>>> ec2
        },
      }
    );
    // backendServiceSG.connections.allowFrom(this.backendEc2Service.loadBalancer, Port.tcp(3001))
    this.backendEc2Service.targetGroup.configureHealthCheck({
      interval: Duration.seconds(120),
      path: '/health'
    })

<<<<<<< HEAD
    this.backendURI = backendFargateService.loadBalancer.loadBalancerDnsName

    backendFargateService.taskDefinition.addToTaskRolePolicy(
=======
    this.backendEc2Service.taskDefinition.addToTaskRolePolicy(
>>>>>>> ec2
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: [
          "events:EnableRule",
          "events:PutRule",
          "sns:CreateTopic",
          "sns:Unsubscribe",
          "events:DeleteRule",
          "events:PutTargets",
          "sns:Publish",
          "events:ListRuleNamesByTarget",
          "events:ListRules",
          "sns:Subscribe",
          "events:RemoveTargets",
          "events:ListTargetsByRule",
          "events:DisableRule",
          "lambda:AddPermission",
          "lambda:RemovePermission",
        ],
      })
<<<<<<< HEAD
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
        image: ContainerImage.fromRegistry('kat201/collection-runner-1.2'),
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
      this.collectionRunnerURI
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
=======
    );

    this.collectionRunnerEc2Service = new ApplicationLoadBalancedEc2Service(
      this,
      "CollectionRunnerEc2Service",
      {
        cluster: collectionRunnerCluster,
        publicLoadBalancer: true,
        openListener: true,
        loadBalancerName: "CollectionRunnerDNSName",
        serviceName: "CollectionRunnerService",
        desiredCount: 1,
        memoryLimitMiB: 512,
        cpu: 128,
        placementConstraints: [PlacementConstraint.distinctInstances()],
        placementStrategies: [PlacementStrategy.packedByCpu()],
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          image: ContainerImage.fromRegistry("nykaelad/collection-runner:1.0"),
          containerPort: 3003,
          containerName: "CollectionRunnerContainer",
          enableLogging: true,
          environment: {
            GRAPHQL_URL: `${this.backendEc2Service.loadBalancer.loadBalancerDnsName}/graphql`,
            AWS_REGION: "us-east-1",
          },
        },
      }
    );

    this.collectionRunnerEc2Service.service.autoScaleTaskCount({
      maxCapacity: 5,
      minCapacity: 1,
    })
    // collectionRunnerServiceSG.connections.allowFrom(this.collectionRunnerEc2Service.loadBalancer, Port.tcp(3003))
    this.collectionRunnerEc2Service.targetGroup.configureHealthCheck({
      interval: Duration.seconds(120),
      path: '/health'
    })

    func.addEnvironment(
      "COLLECTION_RUNNER_URI",
      this.collectionRunnerEc2Service.loadBalancer.loadBalancerDnsName
    );

    new CfnOutput(this, "BackendLoadBalancerDNSName", {
      value: this.backendEc2Service.loadBalancer.loadBalancerDnsName,
    });

    // new CfnOutput(this, "CollectionRunnerLoadBalancerDNSName", {
    //   value: this.collectionRunnerEc2Service.loadBalancer.loadBalancerDnsName,
    // });
>>>>>>> ec2
  }
}
