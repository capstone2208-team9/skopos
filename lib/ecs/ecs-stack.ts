import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import {
  SecurityGroup,
  Vpc,
  InstanceType,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  ContainerImage,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as path from "path";

export interface EcsStackProps extends cdk.StackProps {
  db: DatabaseInstance;
  dbCredentials: { username: string; password: string };
  vpc: Vpc;
}

export class EcsStack extends cdk.Stack {
  readonly backendEc2Service: ApplicationLoadBalancedEc2Service;
  readonly collectionRunnerEc2Service: ApplicationLoadBalancedEc2Service;

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
      maxCapacity: 10,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });

    collectionRunnerCluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: new InstanceType("t3.micro"),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 1,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
    });

    const func = new lambda.Function(this, "call-collection-runner", {
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
        cpu: 128,
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          image: ContainerImage.fromRegistry("ahamoudeis/backend_skopos:1.8"),
          containerPort: 3001,
          containerName: "BackendContainer",
          enableLogging: true,
          environment: {
            DATABASE_URL: `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`,
            LAMBDA_ARN: func.functionArn,
            AWS_REGION: "us-east-1",
          },
        },
      }
    );
    // backendServiceSG.connections.allowFrom(this.backendEc2Service.loadBalancer, Port.tcp(3001))
    // this.backendEc2Service.targetGroup.configureHealthCheck({
    //   port: '3001',
    //   path: '/health'
    // })

    this.backendEc2Service.taskDefinition.addToTaskRolePolicy(
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
        //add health check to the service
        protocol: ApplicationProtocol.HTTP,
        taskImageOptions: {
          image: ContainerImage.fromRegistry("ahamoudeis/collection_runner_skopos:1.0"),
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

    // collectionRunnerServiceSG.connections.allowFrom(this.collectionRunnerEc2Service.loadBalancer, Port.tcp(3003))

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
  }
}
