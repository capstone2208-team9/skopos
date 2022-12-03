import chalk from 'chalk';
import { exec } from 'child_process';
import ora from 'ora';
import * as path from 'path';
import { parseStacks, validateEnvironment } from '../lib/helpers.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(import.meta.url);
const cwd = path.join(__dirname, '..', '..', 'cdk');
export default async function destroy(stacks, options) {
    const stackOpts = parseStacks(stacks, options.all);
    validateEnvironment();
    const message = stackOpts === '--all' ? 'Tearing down Skopos resources' : `Tearing down ${stacks}`;
    try {
        const spinner = ora(chalk.blueBright(`${message} from your AWS account. This will take some time...`)).start();
        const { stderr, stdout } = exec(`cdk destroy ${stackOpts} --force`, { cwd });
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