import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { exec } from 'child_process';
import url from 'url';
const __dirname = url.fileURLToPath(import.meta.url);
const cwd = path.join(__dirname, '..', '..', 'cdk');
export default async function deploy() {
    try {
        const spinner = ora(chalk.blueBright('Deploying Skopos, this will take some time...')).start();
        const { stderr, stdout } = exec('cdk deploy --all --require-approval never', { cwd });
        stderr.on('data', (data) => console.log(chalk.blue(data.toString())));
        stdout.on('end', () => {
            spinner.succeed(chalk.greenBright(`Process complete`));
        });
        stdout.on('error', (err) => {
            spinner.succeed(chalk.red(`An error occurred ${err.message}`));
        });
    }
    catch (e) {
        console.log(chalk.red(`An error occurred ${e.message}`));
    }
}
//# sourceMappingURL=deploy.js.map