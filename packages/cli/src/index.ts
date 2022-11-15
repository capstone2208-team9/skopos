#!/usr/bin/env node

import chalk from 'chalk'
import clear from 'clear'
import {program} from 'commander'
import figlet from 'figlet'
import destroy from './commands/destroy.js'
import deploy from './commands/deploy.js'

clear()
console.log(
  chalk.blueBright(
    figlet.textSync('Skopos-CLI', {horizontalLayout: 'full'})
  )
)

program
  .name('skopos-cli')
  .version('0.0.1')
  .description('A CLI tool to deploy Skopos API Monitoring App to your AWS Account')
  .command('deploy')
  .action(deploy)

program.command('destroy')
  .action(destroy)

program.parse()