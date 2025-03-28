import 'module-alias/register';
import dotenv from 'dotenv';
import chalk from 'chalk';
import figlet from 'figlet';
dotenv.config();
import { Command } from 'commander';
import { addKey } from './commands/addKey';
import { listStoredKeys } from './commands/listKeys';
import { removeKey } from './commands/deleteKey';
import { getKeyCommand } from './commands/getKey';
import { testBackup } from 'commands/backup';
import { fileExists, getAuthFilePath } from '@utils/fileUtils';
import inquirer from 'inquirer';
import { setupMasterPassword } from '@services/auth';
import { restoreBackup } from 'commands/restoreBackup';
import { ensureStorageDirectory } from '@utils/storagePaths';
import { cliLogger } from '@utils/cliLogger';

const title = "Private Key Manager";

const Banner = async () => {
    try {
        const bannerText = figlet.textSync(title, {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        });

        console.log(chalk.green.bold('=========================================='));
        console.log(chalk.blueBright(bannerText)); // Display the banner in blue
        console.log(chalk.green.bold('=========================================='));
        console.log(chalk.yellowBright('🔑 Welcome to the Private Key Manager CLI 🔑'));
        console.log(chalk.cyan('Manage your private keys securely and efficiently.'));
        console.log(chalk.green.bold('==========================================\n'));
        cliLogger.info('Banner displayed successfully');
    } catch (error) {
        cliLogger.error('Error displaying banner', (error as Error));
    }
};

Banner().catch((error) => cliLogger.error('Error initializing banner', error));

const program = new Command();

async function initializeAuthorizationData() {
    try {
        await ensureStorageDirectory();
        cliLogger.info('Initializing authorization data...');

        if (!(await fileExists(getAuthFilePath()))) {
            cliLogger.warn('Authorization data file not found. Starting initialization process.');

            const { password } = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'password',
                    message: 'Enter a strong password to secure your data: ',
                    mask: '*',
                },
            ]);

            const { confirmPassword } = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'confirmPassword',
                    message: 'Enter password again: ',
                    mask: '*',
                },
            ]);

            if (password === confirmPassword) {
                cliLogger.info('Passwords match. Setting up master password...');
                await setupMasterPassword(password);
                cliLogger.success('Master password setup successfully.');
            } else {
                cliLogger.error('Passwords do not match. Authorization data initialization failed.');
                process.exit(1); // Exit the program if initialization fails
            }
        } else {
            cliLogger.info('Authorization data file already exists. Skipping initialization.');
        }
    } catch (error) {
        cliLogger.error('Error during authorization data initialization', (error as Error));
        process.exit(1);
    }
}

// Hook to run initialization before any command
program.hook('preAction', async () => {
    await initializeAuthorizationData();
});

program
    .version('1.0.0')
    .description('Private Key Manager CLI');

program
    .command('add')
    .description('Add a new private key')
    .action(addKey);

program
    .command('get')
    .description('Get a stored key')
    .action(getKeyCommand);

program
    .command('list')
    .description('List stored keys')
    .action(listStoredKeys);

program
    .command('delete')
    .description('Delete a stored key')
    .action(removeKey);

program
    .command('backup')
    .description('Backup private keys')
    .action(testBackup);

program
    .command('restore')
    .description('Restore private keys data from backup files')
    .action(restoreBackup);

try {
    program.parse(process.argv);
    cliLogger.info('CLI program executed successfully');
} catch (error) {
    cliLogger.error('Error executing CLI program', (error as Error));
}
