import chalk from 'chalk'
import * as path from 'path'
import * as url from 'url'
import {exec} from 'child_process'
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

async function executeCommand(cwd: string, command: string) {
  const process = exec(command, {cwd})

  process.stdout.on('data', (data: string) =>
    console.log(chalk.blueBright(data.toString())))

  process.stdout.on('data', (data: string) =>
    console.log(chalk.redBright(data.toString())))

  process.stdout.on('exit', (code) =>
    console.log(chalk.redBright(`process exited with code ${code.toString()}`)))
}