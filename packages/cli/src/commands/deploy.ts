import * as path from 'path'
import {executeCommand} from '../lib/index.js'
import * as url from 'url'
const __dirname = url.fileURLToPath(import.meta.url)

const ROOT_PATH = path.join(__dirname, '../../../../../')

enum CDKCommands {
  build = 'npm run build --w packages/cdk',
  bootstrap = 'npm run bootstrap --workspaces --if-present',
  deploy = 'npm run deploy --workspaces --if-present'
}


export default async function deploy() {
  for (const command of Object.values(CDKCommands)) {
    console.log(command)
    await executeCommand(ROOT_PATH, command)
  }
}
