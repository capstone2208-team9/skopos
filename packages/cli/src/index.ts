#!/usr/bin/env node

import chalk from 'chalk'
import clear from 'clear'
import {program} from 'commander'
import figlet from 'figlet'
import bootstrap from './commands/bootstrap'
import destroy from './commands/destroy.js'
import deploy from './commands/deploy.js'

clear()
console.log(
  chalk.blueBright(
    figlet.textSync('Skopos', {horizontalLayout: 'full'})
  )
)

program
  .name('skopos')
  .version('0.0.1')
  .description('Deploy Skopos API Monitoring App to your AWS Account')

program
  .command('bootstrap')
  .action(bootstrap)


program
  .command('deploy')
  .action(deploy)

program
  .command('destroy')
  .action(destroy)

program.parse()