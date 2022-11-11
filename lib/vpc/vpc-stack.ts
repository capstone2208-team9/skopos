import * as cdk from 'aws-cdk-lib'
import {IpAddresses, Vpc} from 'aws-cdk-lib/aws-ec2'
import {Construct} from 'constructs'

export class VpcStack extends cdk.Stack {
  readonly vpc: Vpc
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.vpc = new Vpc(this, 'SkoposVPC', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      vpcName: 'SkoposVPC',
      maxAzs: 2,
    })
  }
}
