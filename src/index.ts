import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import { addKey } from './commands/addKey';
import { listStoredKeys } from './commands/listKeys';
import { removeKey } from './commands/deleteKey';
import { getKeyCommand } from './commands/getKey';
import { testBackup } from 'commands/backup';
import { fileExists } from '@utils/fileUtils';
import config from 'config';
import inquirer from 'inquirer';
import { setupMasterPassword } from '@services/auth';

const program = new Command();

async function initializeAuthorizationData() {
    console.log('Initializing authorization data...');

    if (!(await fileExists(config.AUTH_FILE))) {
        console.log('Authorization data file not found. Starting initialization process.');

        const { password } = await inquirer.prompt([
            {
                type: 'password',
                name: 'password',
                message: 'Enter a strong password to secure your data: ',
                mask: '*'
            }
        ]);

        const { confirmPassword } = await inquirer.prompt([
            {
                type: 'password',
                name: 'confirmPassword',
                message: 'Enter password again: ',
                mask: '*'
            }
        ]);

        if (password === confirmPassword) {
            console.log('Passwords match. Setting up master password...');
            await setupMasterPassword(password);
            console.log('Master password setup successfully.');
        } else {
            console.error('Passwords do not match. Authorization data initialization failed.');
            process.exit(1); // Exit the program if initialization fails
        }
    } else {
        console.log('Authorization data file already exists. Skipping initialization.');
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

program.parse(process.argv);
