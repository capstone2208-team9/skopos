import * as path from 'path'
import {CDKCommands, executeCommand} from '../lib/index.js'
import * as url from 'url'
const __dirname = url.fileURLToPath(import.meta.url)
export const ROOT_PATH = path.join(__dirname, '../../../../cdk')


export default async function bootstrap() {
  for (const command of Object.values(CDKCommands)) {
    await executeCommand(ROOT_PATH, command)
  }
}
