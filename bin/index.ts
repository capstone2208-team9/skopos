#!/usr/bin/env node

import fs from 'fs-extra'
import chalk from 'chalk'
import clear from 'clear'
import {program} from 'commander'
import figlet from 'figlet'
import bootstrap from '../src/commands/bootstrap.js'
import destroy from '../src/commands/destroy.js'
import deploy from '../src/commands/deploy.js'

const jsonFile = await fs.readFile(new URL('../package.json', import.meta.url), 'utf-8')
const packageJson = JSON.parse(jsonFile)

clear()
console.log(
  chalk.blueBright(
    figlet.textSync('Skopos', {horizontalLayout: 'full'})
  )
)

program
  .name('skopos-cli')
  .version(packageJson.version)
  .description('Deploy Skopos API Monitoring App to your AWS Account')

program.
command('bootstrap')
  .action(bootstrap)

program.
  command('deploy')
  .action(deploy)

program.command('destroy')
  .action(destroy)

program.parse()