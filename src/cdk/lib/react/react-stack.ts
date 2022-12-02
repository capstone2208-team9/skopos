import {CfnOutput} from 'aws-cdk-lib'
import * as cdk from 'aws-cdk-lib'
import {Construct} from 'constructs'
import {ReactStaticSite} from '../../constructs/ReactStaticSite.js'

export interface ReactStackProps extends cdk.StackProps {
  backendURI: string
  collectionRunnerURI: string
}

export class ReactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ReactStackProps) {
    super(scope, id, props)
    const site = new ReactStaticSite(this, 'SkoposFrontend', {
      path: '../react-app',
      environment: {
        REACT_APP_GRAPHQL_URL: `http://${props.backendURI}/graphql`,
        REACT_APP_BACKEND_URL: `http://${props.collectionRunnerURI}`
      }
    });

    // bucket website url
    new CfnOutput(this, 'ReactSiteURL', {
      value: site.url
    })

    new CfnOutput(this, 'ReactSiteBucketName', {
      value: site.bucketName
    })
  }
}
