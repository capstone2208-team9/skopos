import path from 'path'
import url from 'url'
import {CDKCommands, executeCommand} from '../lib/index.js'

const __dirname = url.fileURLToPath(import.meta.url)
export const ROOT_PATH = path.join(__dirname, '../../../../cdk')

export default async function destroy() {
  await executeCommand(ROOT_PATH, CDKCommands.destroy)
}

