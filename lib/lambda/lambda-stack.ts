import {CfnOutput} from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export class LambdaStack extends cdk.Stack {
  readonly function: lambda.Function
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.function = new lambda.Function(this, 'call-collection-runner', {
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

    new CfnOutput(this, 'LambdaARN', {
      value: this.function.functionArn
    })
  }
}