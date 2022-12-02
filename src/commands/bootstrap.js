import chalk from 'chalk';
import { exec } from 'child_process';
import ora from 'ora';
import * as path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(import.meta.url);
const cwd = path.join(__dirname, '..', '..', 'cdk');
export default async function bootstrap() {
    try {
        const spinner = ora(chalk.blueBright('Preparing your AWS account...')).start();
        const { stderr, stdout } = exec('cdk bootstrap', { cwd });
        stderr.on('data', (data) => {
            const value = data.toString();
            const shouldPrint = value.includes('Bootstrapping') || value.includes('Environment');
            shouldPrint && console.log('\n', chalk.blueBright(value));
        });
        stdout.on('end', () => {
            spinner.succeed(chalk.greenBright('Ready to deploy!!'));
        });
        stdout.on('error', (err) => {
            spinner.succeed(chalk.red(`An error occurred ${err.message}`));
        });
    }
    catch (e) {
        console.log(chalk.red(`An error occurred ${e.message}`));
    }
}
//# sourceMappingURL=bootstrap.js.map