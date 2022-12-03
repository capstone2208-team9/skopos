import chalk from 'chalk'
import ora from 'ora'
import * as path from 'path'
import {exec} from 'child_process'
import {parseStacks, StackType, validateEnvironment} from '../lib/helpers.js'
import url from 'url'

const __dirname = url.fileURLToPath(import.meta.url)
const cwd = path.join(__dirname, '..', '..', 'cdk')
export default async function deploy(stacks: StackType[], options: {all: true}) {
  const stackOpts = parseStacks(stacks, options.all)
  validateEnvironment()
  const message = stackOpts === '--all' ? 'Deploying Skopos' : `Deploying ${stacks}`
  let spinner
  try {
    spinner =  ora(chalk.blueBright(`${message}, this will take some time...`)).start()
    const { stderr, stdout } = exec(`cdk deploy ${stackOpts} --require-approval never`, {cwd})
    stderr.on('data', (data) => console.log(chalk.blue(data.toString())))

    stdout.on('end', () => {
      spinner.succeed(chalk.greenBright(`Process complete`))
    })
    stdout.on('error', (err) => {
      spinner.succeed(chalk.red(`An error occurred ${err.message}`))
    })
  } catch (e) {
    spinner.fail(`An error occurred ${e.message}`)
  }
}
