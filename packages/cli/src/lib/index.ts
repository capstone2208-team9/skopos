import chalk from 'chalk'
import {exec} from 'child_process'
import * as path from 'path'
import * as url from 'url'

const __dirname = url.fileURLToPath(import.meta.url)

export const ROOT_PATH = path.join(__dirname, '../../../../cdk')

export enum CDKCommands {
  bootstrap = 'npm run bootstrap',
  deploy = 'npm run deploy --require-approval never',
  destroy = 'npm run destroy --force'
}

export async function executeCommand(cwd: string, command: string) {
  const process = exec(command, {cwd})

  process.stdout.on('data', (data: string) =>
    console.log(chalk.blueBright(data.toString())))

  process.stderr.on('data', (data: string) =>
    console.log(chalk.blue(data.toString())))

  process.stdout.on('exit', (code) =>
    console.log(chalk.blue(`process exited with code ${code.toString()}`)))
}
