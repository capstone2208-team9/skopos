import * as cdk from 'aws-cdk-lib'
import {CfnOutput, Duration} from 'aws-cdk-lib'
import {Port, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2'
import {Repository} from 'aws-cdk-lib/aws-ecr'
import {
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  NetworkMode,
  Protocol,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'
import {ApplicationProtocol} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {Role} from 'aws-cdk-lib/aws-iam'
import {DatabaseInstance} from 'aws-cdk-lib/aws-rds'
import {Construct} from 'constructs'

export interface EcsStackProps extends cdk.StackProps {
  db: DatabaseInstance
  dbCredentials: {username: string, password: string}
  vpc: Vpc
  role: Role
}

export class EcsStack extends cdk.Stack {
  readonly collectionRunnerService: FargateService
  readonly graphqlService: ApplicationLoadBalancedFargateService

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props)
    const {role, vpc, db} = props

    const cluster = new Cluster(this, 'SkoposECSCluster', {vpc, containerInsights: true})

    this.graphqlService = new ApplicationLoadBalancedFargateService(this, 'GraphqlService', {
      assignPublicIp: true,
      cluster,
      healthCheckGracePeriod: Duration.seconds(120),
      desiredCount: 1,
      openListener: true,
      publicLoadBalancer: true,
      protocol: ApplicationProtocol.HTTP,
      serviceName: 'graphql-service',
      targetProtocol: ApplicationProtocol.HTTP,
      taskSubnets: { subnets: [...vpc.isolatedSubnets, ...vpc.publicSubnets]},
      taskImageOptions: {
        containerPort: 3001,
        environment: {
          DATABASE_URL: `postgres://${props.dbCredentials.username}:${props.dbCredentials.password}${db.instanceEndpoint.hostname}:${db.instanceEndpoint.port}`,
          PORT: '3001',
        },
        image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'skopos-collection-runner-repo', 'skopos-collection-runner')),
        taskRole: role,
      },
    })

    this.graphqlService.loadBalancer.connections.allowToAnyIpv4(Port.allTcp())
    this.graphqlService.loadBalancer.connections.allowTo(db, Port.tcp(5432))

    // this.collectionRunnerService = new ApplicationLoadBalancedFargateService(this, 'CollectionRunnerService', {
    //   assignPublicIp: true,
    //   desiredCount: 1,
    //   cluster,
    //   publicLoadBalancer: true,
    //   protocol: ApplicationProtocol.HTTP,
    //   serviceName: 'collection-runner-service',
    //   cpu: 1024,
    //   memoryLimitMiB: 512,
    //   taskImageOptions: {
    //     environment: {
    //       GRAPHQL_URL: `http://${this.graphqlService.loadBalancer.loadBalancerFullName}`,
    //       AWS_REGION: 'us-east-1'
    //     },
    //     executionRole: role,
    //     taskRole: role,
    //     image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'collection-runner-repo', 'skopos-collection-runner')),
    //   },
    //   vpc,
    // })
    //

    const taskDefinition = new TaskDefinition(this, 'collection-runner-task', {
      taskRole: role,
      executionRole: role,
      compatibility: Compatibility.EC2_AND_FARGATE,
      networkMode: NetworkMode.AWS_VPC,
      cpu: '512',
      memoryMiB: '1GB',
    })

    taskDefinition.addContainer('collection-runner-container', {
      cpu: 512,
      memoryLimitMiB: 1024,
      image: ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'collection-runner-repo', 'skopos-collection-runner')),
      portMappings: [{containerPort: 3003, hostPort: 3003, protocol: Protocol.TCP}],
      essential: true,
      environment: {
        GRAPHQL_URL: `http://${this.graphqlService.loadBalancer.loadBalancerFullName}`,
        AWS_REGION: 'us-east-1'
      },
    })

    this.collectionRunnerService = new FargateService(this, 'collection-runner-service', {
      serviceName: 'collection-runner-service',
      cluster,
      vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED},
      taskDefinition
    })

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


    new CfnOutput(this, 'BackendLoadBalancerDNSName', {
      value: this.graphqlService.loadBalancer.loadBalancerDnsName,
    })

    // new CfnOutput(this, 'CollectionRunnerLoadBalancerDNSName', {
    //   value: collectionRunnerLoadBalancer.loadBalancerDnsName,
    // })
  }
}
