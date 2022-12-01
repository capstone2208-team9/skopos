import {CDKCommands, executeCommand} from '../lib/index.js'


export default async function deploy() {
    await executeCommand('cdk', CDKCommands.deploy)
}
