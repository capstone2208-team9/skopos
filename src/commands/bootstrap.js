import chalk from 'chalk';
import { execaCommand } from 'execa';
import ora from 'ora';
import { cdkDirectoryPath } from './index.js';
import { validateEnvironment } from '../lib/helpers.js';
export default async function bootstrap() {
    let spinner;
    validateEnvironment();
    try {
        spinner = ora(chalk.blueBright('Bootstrapping your AWS account...')).start();
        const subProcess = execaCommand('cdk bootstrap', { cwd: cdkDirectoryPath });
        subProcess.stderr.on('data', (data) => {
            const value = data.toString();
            const shouldPrint = value.includes('Bootstrapping') || value.includes('Environment');
            shouldPrint && console.log('\n', chalk.blueBright(value));
        });
        await subProcess;
        if (subProcess.exitCode === 0) {
            spinner.succeed(chalk.greenBright('Skopos ready to deploy'));
        }
    }
    catch (e) {
        spinner.fail(`An error occurred: ${e.message}`);
    }
}
//# sourceMappingURL=bootstrap.js.map