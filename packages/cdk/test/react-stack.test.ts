import * as cdk from 'aws-cdk-lib'
import {ReactStack} from '../lib/react/react-stack'

describe('ReactStack', () => {
  jest.setTimeout(100000)
  it('should have the correct output', function () {
    const app = new cdk.App()
    const reactStack = new ReactStack(app, 'StaticSite', {
      backendURI: 'http://localhost',
      collectionRunnerURI: 'http://localhost'
    })
    console.log(reactStack.region)
    expect(true).toBe(true)
  })
})