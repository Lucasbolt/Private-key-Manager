#!/usr/bin/env node
import 'dotenv/config';
import chalk from 'chalk';
import { Command } from 'commander';
import { addKey } from './commands/addKey.js';
import { listStoredKeys } from './commands/listKeys.js';
import { removeKey } from './commands/deleteKey.js';
import { getKeyCommand } from './commands/getKey.js';
import { testBackup } from './commands/backup.js';
import inquirer from 'inquirer';
import { setupMasterPassword, verifyAuthorizationDataExists } from '@services/auth.js';
import { restoreBackup } from './commands/restoreBackup.js';
import { cliLogger } from '@utils/cliLogger.js';
import { currentLogFile } from '../utils/logger.js';

const Banner = async () => {
    try {
        console.log(chalk.green.bold('=========================================='));
        console.log(chalk.yellowBright('🔑 Private Key Manager CLI 🔑'));
        console.log(chalk.cyan('Manage your private keys securely and efficiently.'));
        console.log(chalk.green.bold('==========================================\n'));
    } catch (error) {
        cliLogger.error('Error displaying banner', (error as Error));
    }
};

const program = new Command();

async function initializeAuthorizationData() {
    try {
        // await ensureStorageDirectory();
        cliLogger.info('Initializing authorization data...');

        if (!(await verifyAuthorizationDataExists())) {
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
    if (program.opts().verbose) {
        process.env.LOG_VERBOSE = 'true'
    }
    Banner().catch((error) => cliLogger.error('Error initializing banner', error));
    await initializeAuthorizationData();
});

program
    .option('-v, --verbose', 'Enable verbose logging for detailed output')
    .version('1.0.0')
    .description('A secure and efficient command-line tool for managing private keys.');

program
    .command('add')
    .description('Add a new private key')
    .action(addKey);

program
    .command('get')
    .option('-a, --alias <name>', 'key alias to fetch')
    .description('Get a stored key')
    .action(getKeyCommand);

program
    .command('list')
    .description('List stored keys')
    .action(listStoredKeys);

program
    .command('delete')
    .option('-a, --alias <name>', 'key alias to delete')
    .description('Delete a stored key')
    .action(removeKey);

program
    .command('backup')
    .description('Backup private keys')
    .action(testBackup);

program
    .command('restore')
    .option('-f, --file <file_path>', 'file(path) containing(pointing to) backup file.')
    .description('Restore private keys data from backup files')
    .action(restoreBackup);

try {
    program.parse(process.argv);
} catch (error) {
    cliLogger.error('Error executing CLI program', (error as Error));
    console.error(`Error occured! Check the log file for more detail: ${currentLogFile()}`)
}
