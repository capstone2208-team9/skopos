import chalk from 'chalk'
import {execaSync} from 'execa'
import ora from 'ora'

export const stackOptions = ['VpcStack', 'RDSStack', 'EcsStack', 'ReactStack'] as const

export type StackType = typeof stackOptions[number]

const checkCDKInstalled = () => {
  try {
    execaSync('which', ['cdk'], )
  } catch (e) {
    console.log(chalk.redBright(`aborting... aws-cdk not installed...`))
    process.exit(1)
  }
}

const checkAWSUser = () => {
  try {
    const stdout = execaSync('aws', ['sts', 'get-caller-identity'], ).stdout
    const {Account} = JSON.parse(stdout)
    return `\nconfirmed aws account# ${Account}`
  } catch (e) {
    console.log(chalk.redBright(`\naws not configured...aborting`))
    process.exit(1)
  }
}

export const validateEnvironment = () => {
  const spinner = ora(chalk.blueBright('Checking environment is ready')).start()
  const text = checkAWSUser()
  spinner.succeed(text).start('checking cdk installed...')
  checkCDKInstalled()
  spinner.succeed('cdk installed')
}

export const parseStacks = (stacks: StackType[], all: boolean) => {
  if (all) return '--all'
  const isValid = stacks.length > 0 && stacks.every(stack => stackOptions.includes(stack))
  if (!isValid) {
    console.log(chalk.redBright.bold(`Invalid stack detected or empty stack list`))
    console.log(chalk.bold(`Valid stacks are:\n${stackOptions.join(' ')}`))
    process.exit(1)
  }
  return stacks.join(' ')
}