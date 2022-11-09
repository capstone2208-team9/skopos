import * as cdk from 'aws-cdk-lib'
import {CfnOutput} from 'aws-cdk-lib'
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  IpAddresses,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import {Cluster, ContainerImage, FargateService, FargateTaskDefinition} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancer, ApplicationProtocol} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam'
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from 'aws-cdk-lib/aws-rds'
import {Secret} from 'aws-cdk-lib/aws-secretsmanager'
import {StringParameter} from 'aws-cdk-lib/aws-ssm'
import {Construct} from 'constructs'

export class SkoposCloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new Vpc(this, 'SkoposVPC', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {name: 'elb_public', subnetType: SubnetType.PUBLIC},
        {name: 'ecs_private', subnetType: SubnetType.PRIVATE_ISOLATED},
        {name: 'rds_public', subnetType: SubnetType.PRIVATE_ISOLATED},
      ],
    })

    const dbCredentialSecret = new Secret(this, 'SkoposDbSecret', {
      secretName: `skopos-rds-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: `skopos_db_admin`
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      }
    })

    new StringParameter(this, 'DBCredentialsArn', {
      parameterName: `skopos-rds-credentials-arn`,
      stringValue: dbCredentialSecret.secretArn,
    })

    const dbSecurityGroup = new SecurityGroup(this, 'SkoposDBSecurityGroup', {
      vpc
    })
    dbSecurityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(5432))

    const dbInstance = new DatabaseInstance(this, 'skopos-db', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_14_3,
      }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      credentials: Credentials.fromSecret(dbCredentialSecret),
      vpc,
      vpcSubnets: {subnetType: SubnetType.PRIVATE_ISOLATED,},
      allocatedStorage: 100,
      maxAllocatedStorage: 105,
      allowMajorVersionUpgrade: false,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: 'prisma',
      publiclyAccessible: false,
      securityGroups: [dbSecurityGroup]
    })


    const cluster = new Cluster(this, 'SkoposECSCluster', {vpc})

    const backendLoadBalancer = new ApplicationLoadBalancer(this, 'SkoposBackendLB', {
      vpc,
      loadBalancerName: 'skoposBackend-lb',
      internetFacing: true,
      vpcSubnets: {subnetGroupName: 'elb_public'},
    })

    backendLoadBalancer.connections.allowFromAnyIpv4(Port.tcp(80))
    backendLoadBalancer.connections.allowToAnyIpv4(Port.allTcp())

    const backendListener = backendLoadBalancer.addListener('BackendHTTPListener', {
      port: 80,
      open: true
    })

    const collectionRunnerLoadBalancer = new ApplicationLoadBalancer(this, 'SkoposCollectionRunnerLB', {
      vpc,
      loadBalancerName: 'skoposCollectionRunner-lb',
      internetFacing: true,
      vpcSubnets: {subnetGroupName: 'elb_public'},
    })

    const collectionRunnerListener = backendLoadBalancer.addListener('CollectionRunnerHTTPListener', {
      open: true,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
    })

    const ecsFargateServiceRole = new Role(this, 'FargateTaskExecutionServiceRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonECSTaskExecutionRolePolicy')
      ]
    })

    ecsFargateServiceRole.addToPolicy(new PolicyStatement({
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

    const username = dbCredentialSecret.secretValueFromJson('skopos_db_admin').unsafeUnwrap()
    const password = dbCredentialSecret.secretValueFromJson('password').unsafeUnwrap()

    const backendService = new FargateService(this, 'skopos-backend-service', {
      cluster,
      desiredCount: 1,
      vpcSubnets: {subnetGroupName: 'ecs_private'},
      assignPublicIp: true,
      serviceName: 'skopos-backend-service',
      taskDefinition: new FargateTaskDefinition(this, 'skopos-backend-definition', {
        taskRole: ecsFargateServiceRole,
        executionRole: ecsFargateServiceRole,
      })
    })


    dbInstance.connections.allowFrom(backendService, Port.tcp(5432))
    // postgresql://postgres:secret@localhost:5432/prisma?schema=public
    backendService.taskDefinition.addContainer('BackendContainer', {
      image: ContainerImage.fromEcrRepository(ecr.Repository.fromRepositoryName(this, 'skopos-backend-repo', 'skopos-backend')),
      cpu: 1024,
      memoryLimitMiB: 2048,
      essential: true,
      portMappings: [{containerPort: 3001, hostPort: 3001}],
      environment: {
        DATABASE_URL: `postgres://${username}:${password}@${dbInstance.instanceEndpoint.hostname}:${dbInstance.dbInstanceEndpointPort}/prisma?schema=public`,
        LAMBDA_URL: 'arn:aws:lambda:us-east-1:385379134803:function:run-scheduled-collection',
        COLLECTION_RUNNER_URL: `http://${collectionRunnerLoadBalancer.loadBalancerDnsName}`,
        PORT: '3001',
      }
    })

    backendService.connections.allowFrom(backendLoadBalancer, Port.allTcp(), 'Allow from load balancer')

    backendListener.addTargets('backend-default', {
      port: 3001,
      protocol: ApplicationProtocol.HTTP,
      targets: [backendService],
      healthCheck: {path: '/health'}
    })

    const runnerService = new FargateService(this, 'collection-runner-service', {
      cluster,
      desiredCount: 1,
      vpcSubnets: {subnetGroupName: 'ecs_private'},
      assignPublicIp: true,
      serviceName: 'collection-runner-service',
      taskDefinition: new FargateTaskDefinition(this, 'collection-runner-task', {
        taskRole: ecsFargateServiceRole,
        executionRole: ecsFargateServiceRole,
      })
    })


    runnerService.taskDefinition.addContainer('RunnerContainer', {
      image: ContainerImage.fromEcrRepository(ecr.Repository.fromRepositoryName(this, 'skopos-collection-runner-repo', 'skopos-collection-runner')),
      cpu: 1024,
      memoryLimitMiB: 2048,
      portMappings: [{containerPort: 3003}],
      essential: true,
      environment: {
        GRAPHQL_URL: `http://${backendLoadBalancer.loadBalancerDnsName}/graphql`,
        AWS_REGION: 'us-east-1',
        PORT: '3003',
      }
    })

    collectionRunnerListener.addTargets('cLB-default-listener', {
      port: 3003,
      protocol: ApplicationProtocol.HTTP,
      targets: [runnerService],
      healthCheck: {path: '/health'}
    })

    collectionRunnerLoadBalancer.connections.allowFromAnyIpv4(Port.tcp(80))
    runnerService.connections.allowToAnyIpv4(Port.allTcp(), 'Allow HTTP anywhere')
    runnerService.connections.allowFrom(collectionRunnerLoadBalancer, Port.allTcp())
    runnerService.connections.allowFrom(backendLoadBalancer, Port.allTcp())


    new CfnOutput(this, 'dbEndpoint', {
      value: dbInstance.instanceEndpoint.hostname
    })

    new CfnOutput(this, 'secretName', {
      value: dbInstance.secret?.secretName!
    })

    new CfnOutput(this, 'BackendLoadBalancerDNSName', {
      value: backendLoadBalancer.loadBalancerDnsName,
    })

    new CfnOutput(this, 'CollectionRunnerLoadBalancerDNSName', {
      value: collectionRunnerLoadBalancer.loadBalancerDnsName,
    })
  }
}
