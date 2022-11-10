import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { Port, Vpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  NetworkMode,
  TaskDefinition,
  FargateTaskDefinition,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface EcsStackProps extends cdk.StackProps {
  db: DatabaseInstance;
  dbCredentials: { username: string; password: string };
  vpc: Vpc;
  lambdaArn: string;
}

export class EcsStack extends cdk.Stack {
  readonly collectionRunnerService: ApplicationLoadBalancedFargateService;
  readonly graphqlService: ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);
    const { vpc, db, dbCredentials, lambdaArn } = props;

    const cluster = new Cluster(this, "ECSCluster", {
      vpc,
      containerInsights: true,
    });

    // from aws-deploy
    const backendServiceTaskDefinition = new FargateTaskDefinition(
      this,
      "backend-server",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
      }
    );

    const backendServiceContainer = backendServiceTaskDefinition.addContainer(
      "backend-server-container",
      {
        image: ContainerImage.fromRegistry("nykaelad/graphql-server:1.1"),
      }
    );

    backendServiceContainer.addPortMappings({
      containerPort: 3001,
    });

    const backendServiceSG = new SecurityGroup(
      this,
      `backend-server-security-group`,
      {
        allowAllOutbound: true,
        securityGroupName: `backend-server-security-group`,
        vpc,
      }
    );

    const backendServiceFargate = new FargateService(
      this,
      "backend-service-fargate",
      {
        cluster,
        taskDefinition: backendServiceTaskDefinition,
        assignPublicIp: true,
        desiredCount: 1,
        securityGroups: [backendServiceSG],
      }
    );

    backendServiceTaskDefinition.addToTaskRolePolicy(
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

    const collectionRunnerServiceTaskDefinition = new FargateTaskDefinition(
      this,
      "skoposFullStack-collectionRunner-server",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
      }
    );

    const collectionRunnerServiceContainer =
      collectionRunnerServiceTaskDefinition.addContainer(
        "collectionRunner-server-container",
        {
          image: ContainerImage.fromRegistry("nykaelad/collection-runner:1.0"),
        }
      );

    collectionRunnerServiceContainer.addPortMappings({
      containerPort: 3003,
    });

    const collectionRunnerServiceSG = new SecurityGroup(
      this,
      `collectionRunner-server-security-group`,
      {
        allowAllOutbound: true,
        securityGroupName: `collectionRunner-server-security-group`,
        vpc,
      }
    );

    const collectionRunnerServiceFargate = new FargateService(
      this,
      "collectionRunner-service-fargate",
      {
        cluster,
        taskDefinition: collectionRunnerServiceTaskDefinition,
        assignPublicIp: true,
        desiredCount: 1,
        securityGroups: [collectionRunnerServiceSG],
      }
    );

    backendServiceFargate.autoScaleTaskCount({
      minCapacity: 0,
      maxCapacity: 2,
    });

    collectionRunnerServiceFargate.autoScaleTaskCount({
      minCapacity: 0,
      maxCapacity: 2,
    });

    const httpServerLB = new elbv2.ApplicationLoadBalancer(
      this,
      "skopos-backend-loadbalancer",
      {
        vpc,
        //for now the load balancer is internet facing; later we might change it to be accessible only to frontend and collection runner
        internetFacing: true,
      }
    );

    const httpServerListener = httpServerLB.addListener(
      "listener-for-server-load-balancer",
      {
        port: 80,
        defaultAction: elbv2.ListenerAction.fixedResponse(404),
      }
    );

    httpServerListener.addTargets("target-for-backend-lb", {
      port: 80,
      priority: 1,
      targets: [backendServiceFargate],
      // @ts-ignore
      pathPatterns: ["/graphql/*", "/backend/health"],
    });

    httpServerListener.addTargets("target-for-collectionRunner-lb", {
      port: 80,
      priority: 2,
      targets: [collectionRunnerServiceFargate],
      // @ts-ignore
      // might have to add a route in collection runner to disambiguate between routes
      pathPatterns: ["collection-runner/*", "/collection-runner/health"],
    });

    backendServiceSG.connections.allowFrom(httpServerLB, Port.tcp(3001));
    collectionRunnerServiceSG.connections.allowFrom(
      httpServerLB,
      Port.tcp(3003)
    );

    const dbUrl = `postgresql://${dbCredentials.username}:${dbCredentials.password}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/prisma?schema=public&connect_timeout=60`;
    backendServiceContainer.addEnvironment("DATABASE_URL", dbUrl);

    backendServiceContainer.addEnvironment(
      "COLLECTION_RUNNER_URL",
      httpServerLB.loadBalancerDnsName
    );

    backendServiceContainer.addEnvironment("LAMDA_ARN", lambdaArn);

    backendServiceContainer.addEnvironment("AWS_REGION", "us-east-1");

    collectionRunnerServiceContainer.addEnvironment(
      "GRAPH_URL",
      `${httpServerLB.loadBalancerDnsName}/graphql`
    );

    collectionRunnerServiceContainer.addEnvironment("AWS_REGION", "us-east-1");

    // const graphqlCluster = new Cluster(this, 'graphqlCluster', {vpc, containerInsights: true})
    // const collectionRunnerCluster = new Cluster(this, 'collectionRunnerCluster', {vpc, containerInsights: true})

    // const fargateServiceRole = new Role(this, 'FargateTaskExecutionServiceRole', {
    //   assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    //   managedPolicies: [
    //     ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    //   ]
    // })

    // fargateServiceRole.addToPolicy(new PolicyStatement({
    //   effect: Effect.ALLOW,
    //   resources: ['*'],
    //   actions: [
    //     'events:EnableRule',
    //     'events:PutRule',
    //     'sns:CreateTopic',
    //     'sns:Unsubscribe',
    //     'events:DeleteRule',
    //     'events:PutTargets',
    //     'sns:Publish',
    //     'events:ListRuleNamesByTarget',
    //     'events:ListRules',
    //     'sns:Subscribe',
    //     'events:RemoveTargets',
    //     'events:ListTargetsByRule',
    //     'events:DisableRule',
    //     'lambda:AddPermission',
    //     'lambda:RemovePermission'
    //   ],
    // }))

    // const collectionRunnerDefinition = new TaskDefinition(this, 'taskRunnerDef', {
    //   cpu: '512',
    //   memoryMiB: '1024',
    //   compatibility: Compatibility.EC2_AND_FARGATE,
    //   networkMode: NetworkMode.AWS_VPC,
    //   taskRole: fargateServiceRole,
    //   executionRole: fargateServiceRole,
    // })

    // collectionRunnerDefinition.addContainer('collectionRunnerContainer', {
    //   portMappings: [{containerPort: 3003}],
    //   memoryLimitMiB: 1024,
    //   image: ContainerImage.fromRegistry(
    //     'nykaelad/collection-runner:latest'
    //   ),
    //   containerName: 'runnerContainer',
    //   essential: true,
    // })

    // const service = new FargateService(this, 'CollectionRunnerService', {
    //   assignPublicIp: true,
    //   cluster,
    //   desiredCount: 1,
    //   taskDefinition: collectionRunnerDefinition,
    // })

    // service.connections.allowFromAnyIpv4(Port.allTcp())
    // service.connections.allowToAnyIpv4(Port.allTcp())

    // const backendDefinition = new TaskDefinition(this, 'backendDef', {
    //   cpu: '512',
    //   memoryMiB: '1024',
    //   compatibility: Compatibility.EC2_AND_FARGATE,
    //   networkMode: NetworkMode.AWS_VPC,
    //   taskRole: fargateServiceRole,
    //   executionRole: fargateServiceRole,
    // })

    // backendDefinition.addContainer('backendContainer', {
    //   portMappings: [{containerPort: 3001}],
    //   memoryLimitMiB: 1024,
    //   image: ContainerImage.fromRegistry("nykaelad/graphql-server:latest"),
    //   environment: {
    //     DATABASE_URL: 'postgresql://postgres:02xyTZoJD44p0P6JFeaX5LWJRv4KY0ry@rdsstack-skoposdb8d0389a4-wwyutxef2wps.cml9wgvriihj.us-east-1.rds.amazonaws.com:5432/prisma?schema=public',
    //     LAMBDA_ARN: 'arn:aws:lambda:us-east-1:385379134803:function:run-scheduled-collection',
    //     PORT: '3001',
    //   },
    //   containerName: 'backendContainer',
    //   essential: true,
    // })

    // const backendService = new FargateService(this, 'BackendService', {
    //   assignPublicIp: true,
    //   cluster,
    //   desiredCount: 1,
    //   taskDefinition: backendDefinition,
    // })

    // backendService.connections.allowFromAnyIpv4(Port.allTcp())
    // backendService.connections.allowToAnyIpv4(Port.allTcp())

    // this.graphqlService = new ApplicationLoadBalancedFargateService(this, 'GraphqlService', {
    //   assignPublicIp: true,
    //   cluster: graphqlCluster,
    //   //healthCheckGracePeriod: Duration.seconds(120),
    //   desiredCount: 1,
    //   openListener: true,
    //   publicLoadBalancer: true,
    //   //protocol: ApplicationProtocol.HTTP,
    //   serviceName: 'graphql-service',
    //   //targetProtocol: ApplicationProtocol.HTTP,
    //   taskSubnets: { subnets: [...vpc.isolatedSubnets, ...vpc.publicSubnets]},
    //   taskImageOptions: {
    //     containerPort: 3001,
    //     environment: {
    //       DATABASE_URL: `postgres://${props.dbCredentials.username}:${props.dbCredentials.password}${db.instanceEndpoint.hostname}:${db.instanceEndpoint.port}`,
    //       PORT: '3001',
    //     },
    //     // image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'skopos-collection-runner-repo', 'skopos-collection-runner')),
    //     image: ContainerImage.fromRegistry("nykaelad/graphql-service:latest"),
    //     taskRole: fargateServiceRole,
    //     executionRole: fargateServiceRole,
    //   },
    // })

    // // // allow graphql load balance out anywhere
    // this.graphqlService.loadBalancer.connections.allowToAnyIpv4(Port.allTcp())

    // // // allow graphql to connect to RDS
    // this.graphqlService.loadBalancer.connections.allowTo(db, Port.tcp(5432))

    // this.collectionRunnerService = new ApplicationLoadBalancedFargateService(this, 'CollectionRunnerService', {
    //   assignPublicIp: true,
    //   desiredCount: 1,
    //   cluster: collectionRunnerCluster,
    //   publicLoadBalancer: true,
    //   //protocol: ApplicationProtocol.HTTP,
    //   serviceName: 'collection-runner-service',
    //   cpu: 512,
    //   memoryLimitMiB: 1024,
    //   taskImageOptions: {
    //     containerPort: 3003,
    //     environment: {
    //       GRAPHQL_URL: `http://${this.graphqlService.loadBalancer.loadBalancerFullName}`,
    //       AWS_REGION: 'us-east-1'
    //     },
    //     executionRole: fargateServiceRole,
    //     taskRole: fargateServiceRole,
    //     image: ContainerImage.fromRegistry(
    //       "nykaelad/collection-runner:latest"
    //     ),

    //   },
    // })

    // this.collectionRunnerService.targetGroup.configureHealthCheck({
    //   port: '3003',
    //   path: '/health',
    // })
    // //

    // const taskDefinition = new TaskDefinition(this, 'collection-runner-task', {
    //   taskRole: role,
    //   executionRole: role,
    //   compatibility: Compatibility.EC2_AND_FARGATE,
    //   networkMode: NetworkMode.AWS_VPC,
    //   cpu: '512',
    //   memoryMiB: '1GB',
    // })
    //
    // taskDefinition.addContainer('collection-runner-container', {
    //   cpu: 512,
    //   memoryLimitMiB: 1024,
    //   image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'collection-runner-repo', 'skopos-collection-runner')),
    //   portMappings: [{containerPort: 3003, hostPort: 3003, protocol: Protocol.TCP}],
    //   essential: true,
    //   environment: {
    //     GRAPHQL_URL: `http://${this.graphqlService.loadBalancer.loadBalancerFullName}`,
    //     AWS_REGION: 'us-east-1'
    //   },
    // })
    //

    // this.collectionRunnerService = new FargateService(this, 'collection-runner-service', {
    //   serviceName: 'collection-runner-service',
    //   assignPublicIp: true,
    //   cluster,
    //   vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
    //   taskDefinition
    // })

    // const backendLoadBalancer = new ApplicationLoadBalancer(this, 'SkoposBackendLB', {
    //   vpc,
    //   loadBalancerName: 'skoposBackend-lb',
    //   internetFacing: true,
    //   vpcSubnets: {subnetGroupName: 'elb_public'},
    // })

    // backendLoadBalancer.connections.allowFromAnyIpv4(Port.tcp(80))
    // backendLoadBalancer.connections.allowToAnyIpv4(Port.allTcp())
    //
    // const backendListener = backendLoadBalancer.addListener('BackendHTTPListener', {
    //   port: 80,
    //   open: true
    // })

    //
    // const collectionRunnerLoadBalancer = new ApplicationLoadBalancer(this, 'SkoposCollectionRunnerLB', {
    //   vpc,
    //   loadBalancerName: 'skoposCollectionRunner-lb',
    //   internetFacing: true,
    //   vpcSubnets: {subnetGroupName: 'elb_public'},
    // })

    // const collectionRunnerListener = backendLoadBalancer.addListener('CollectionRunnerHTTPListener', {
    //   open: true,
    //   port: 80,
    //   protocol: ApplicationProtocol.HTTP,
    // })

    // const backendService = new FargateService(this, 'skopos-backend-service', {
    //   cluster,
    //   desiredCount: 1,
    //   vpcSubnets: {subnetGroupName: 'ecs_private'},
    //   assignPublicIp: true,
    //   serviceName: 'skopos-backend-service',
    //   taskDefinition: new FargateTaskDefinition(this, 'skopos-backend-definition', {
    //     taskRole: role,
    //     executionRole: role,
    //   })
    // })

    // db.connections.allowFrom(backendService, Port.tcp(5432))
    // // postgresql://postgres:secret@localhost:5432/prisma?schema=public
    // backendService.taskDefinition.addContainer('BackendContainer', {
    //   image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'skopos-backend-repo', 'skopos-backend')),
    //   cpu: 1024,
    //   memoryLimitMiB: 2048,
    //   essential: true,
    //   portMappings: [{containerPort: 3001, hostPort: 3001}],
    //   environment: {
    //     // DATABASE_URL: `postgres://${username}:${password}@${dbInstance.instanceEndpoint.hostname}:${dbInstance.dbInstanceEndpointPort}/prisma?schema=public`,
    //     LAMBDA_URL: 'arn:aws:lambda:us-east-1:385379134803:function:run-scheduled-collection',
    //     COLLECTION_RUNNER_URL: `http://${collectionRunnerLoadBalancer.loadBalancerDnsName}`,
    //     PORT: '3001',
    //   }
    // })

    // backendService.connections.allowFrom(backendLoadBalancer, Port.allTcp(), 'Allow from load balancer')

    // backendListener.addTargets('backend-default', {
    //   port: 3001,
    //   protocol: ApplicationProtocol.HTTP,
    //   targets: [backendService],
    //   healthCheck: {path: '/health'}
    // })

    // const runnerService = new FargateService(this, 'collection-runner-service', {
    //   cluster,
    //   desiredCount: 1,
    //   vpcSubnets: {subnetGroupName: 'ecs_private'},
    //   assignPublicIp: true,
    //   serviceName: 'collection-runner-service',
    //   taskDefinition: new FargateTaskDefinition(this, 'collection-runner-task', {
    //     taskRole: role,
    //     executionRole: role,
    //   })
    // })

    // runnerService.taskDefinition.addContainer('RunnerContainer', {
    //   image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'skopos-collection-runner-repo', 'skopos-collection-runner')),
    //   cpu: 1024,
    //   memoryLimitMiB: 2048,
    //   portMappings: [{containerPort: 3003}],
    //   essential: true,
    //   environment: {
    //     GRAPHQL_URL: `http://${backendLoadBalancer.loadBalancerDnsName}/graphql`,
    //     AWS_REGION: 'us-east-1',
    //     PORT: '3003',
    //   }
    // })

    // collectionRunnerListener.addTargets('cLB-default-listener', {
    //   port: 3003,
    //   protocol: ApplicationProtocol.HTTP,
    //   targets: [runnerService],
    //   healthCheck: {path: '/health'}
    // })

    // collectionRunnerLoadBalancer.connections.allowFromAnyIpv4(Port.tcp(80))
    // runnerService.connections.allowToAnyIpv4(Port.allTcp(), 'Allow HTTP anywhere')
    // runnerService.connections.allowFrom(collectionRunnerLoadBalancer, Port.allTcp())
    // runnerService.connections.allowFrom(backendLoadBalancer, Port.allTcp())

    // new CfnOutput(this, 'BackendLoadBalancerDNSName', {
    //   value: this.graphqlService.loadBalancer.loadBalancerDnsName,
    // })

    // new CfnOutput(this, 'CollectionRunnerLoadBalancerDNSName', {
    //   value: collectionRunnerLoadBalancer.loadBalancerDnsName,
    // })
  }
}
