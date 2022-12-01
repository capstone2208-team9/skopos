import {CDKCommands, executeCommand} from '../lib/index.js'


export default async function bootstrap() {
  await executeCommand('skopos-cdk', CDKCommands.bootstrap)
}
