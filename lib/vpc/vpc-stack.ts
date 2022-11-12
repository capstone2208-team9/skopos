import * as cdk from 'aws-cdk-lib'
import {IpAddresses, Vpc, SubnetType} from 'aws-cdk-lib/aws-ec2'
import {Construct} from 'constructs'

export class VpcStack extends cdk.Stack {
  readonly vpc: Vpc
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.vpc = new Vpc(this, 'SkoposVPC', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      vpcName: 'SkoposVPC',
      maxAzs: 2,
      subnetConfiguration: [
      {
        name: "public-subnet-skopos-1",
        subnetType: SubnetType.PUBLIC,
        cidrMask: 24,
      },
      {
        name: "isolated-subnet-database-1",
        subnetType: SubnetType.PRIVATE_ISOLATED,
        cidrMask: 28,
      },
    ],
  })
  }
}
