import {CDKCommands, executeCommand} from '../lib/index.js'

export default async function destroy() {
  await executeCommand('cdk', CDKCommands.destroy)
}

