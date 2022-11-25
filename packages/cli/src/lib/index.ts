import * as url from 'url'
import chalk from 'chalk'
import {exec} from 'child_process'
import * as path from 'path'
const __dirname = url.fileURLToPath(import.meta.url)

export const ROOT_PATH = path.join(__dirname, '../../../../../')

export async function executeCommand(cwd: string, command: string) {
  const process = exec(command, {cwd})

  process.stdout.on('data', (data: string) =>
    console.log(chalk.blueBright(data.toString())))

  process.stderr.on('data', (data: string) =>
    console.log(chalk.redBright(data.toString())))

  process.stdout.on('exit', (code) =>
    console.log(chalk.redBright(`process exited with code ${code.toString()}`)))
}
