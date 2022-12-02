import chalk from 'chalk';
import { exec } from 'child_process';
import ora from 'ora';
import * as path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(import.meta.url);
const cwd = path.join(__dirname, '..', '..', 'cdk');
export default async function destroy() {
    try {
        const spinner = ora(chalk.blueBright('Removing Skopos resources from your AWS account. This will take some time...')).start();
        const { stderr, stdout } = exec('cdk destroy --all --force', { cwd });
        stderr.on('data', (data) => {
            const value = data.toString();
            console.log('\n', chalk.blueBright(value));
        });
        stdout.on('end', () => {
            spinner.succeed(chalk.greenBright('Process complete!!'));
        });
        stdout.on('error', (err) => {
            spinner.succeed(chalk.red(`An error occurred ${err.message}`));
        });
    }
    catch (err) {
        console.log(chalk.red(`An error occurred ${err.message}`));
    }
}
//# sourceMappingURL=destroy.js.map