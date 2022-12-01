import {CDKCommands, executeCommand} from '../lib/index.js'

export default async function destroy() {
  await executeCommand('skopos-cdk', CDKCommands.destroy)
}

