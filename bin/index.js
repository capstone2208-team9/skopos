#!/usr/bin/env node
import fs from 'fs-extra';
import chalk from 'chalk';
import clear from 'clear';
import { program } from 'commander';
import figlet from 'figlet';
import { stackOptions } from '../src/lib/helpers.js';
import bootstrap from '../src/commands/bootstrap.js';
import destroy from '../src/commands/destroy.js';
import deploy from '../src/commands/deploy.js';
const jsonFile = await fs.readFile(new URL('../package.json', import.meta.url), 'utf-8');
const packageJson = JSON.parse(jsonFile);
clear();
console.log(chalk.blueBright(figlet.textSync('Skopos', { horizontalLayout: 'full' })));
program
    .name('skopos')
    .version(packageJson.version)
    .description('Deploy Skopos API Monitoring App to your AWS Account');
program
    .command('list')
    .description('list Skopos stacks')
    .action(() => {
    console.log(chalk.bold('Available stacks to deploy:'));
    console.log(chalk.blueBright(stackOptions.join(', ')));
    process.exit(0);
});
program
    .command('bootstrap')
    .description('Prepare your AWS account for deployment')
    .action(bootstrap);
program
    .command('deploy')
    .description('Stacks to deploy')
    .option('-a, --all', 'Deploy all stacks')
    .argument('[stacks...]', 'Space separated list of stacks to deploy')
    .action(deploy);
program
    .command('destroy')
    .description('Stacks to destroy')
    .option('-a, --all', 'Remove all resources from your AWS account')
    .argument('[stacks...]', 'Space separated list of stacks to destroy')
    .action(destroy);
program.parse(process.argv);
//# sourceMappingURL=index.js.map