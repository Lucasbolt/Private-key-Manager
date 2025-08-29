#!/usr/bin/env node
import 'dotenv/config';
// import chalk from 'chalk';
import { FastCLI } from './fastcli.js';
import { cliLogger } from '@utils/cliLogger.js';
import { getLatestVersion } from '@utils/version.js';
import { currentLogFile } from '../utils/logger.js';
import { handleShutdown, safePrompt } from '../utils/processHandlers.js';
import { verifyAuthorizationDataExists, setupMasterPassword } from '@services/auth.js';

// const Banner = async () => {
//     console.log(chalk.green.bold('=========================================='));
//     console.log(chalk.yellowBright('🔑 Private Key Manager CLI 🔑'));
//     console.log(chalk.cyan('Manage your private keys securely and efficiently.'));
//     console.log(chalk.green.bold('==========================================\n'));
// };


const cli = new FastCLI();


async function initializeAuthorizationData(): Promise<void> {
    cliLogger.info('Initializing authorization data...');
    if (!(await verifyAuthorizationDataExists())) {
        cliLogger.warn('Authorization data not found. Starting initialization...');

        const { password } = await safePrompt([
            { type: 'password', name: 'password', message: 'Enter master password:', mask: '*' },
        ]);

        const { confirmPassword } = await safePrompt([
            { type: 'password', name: 'confirmPassword', message: 'Confirm master password:', mask: '*' },
        ]);

        if (password !== confirmPassword) {
            cliLogger.error('Passwords do not match.');
            process.exit(1);
        }

        await setupMasterPassword(password);
        cliLogger.success('Master password setup successfully.');
    }
}


cli.setVersion(getLatestVersion())
   .setDescription('A secure and efficient command-line tool for managing private keys.')
   .option('-v, --verbose', 'Enable verbose logging');


cli.hook('preAction', async () => {
    if (cli.opts().verbose) process.env.LOG_VERBOSE = 'true';
    // await Banner();
    await initializeAuthorizationData();
});


cli.command('add')
   .setDescription('Add a new private key')
   .setAction(async () => {
       const { addKey } = await import('./commands/addKey.js');
       await addKey();
   });

cli.command('get')
   .option('-a, --alias <name>', 'key alias to fetch')
   .setDescription('Get a stored key')
   .setAction(async (options) => {
       const { getKeyCommand } = await import('./commands/getKey.js');
       await getKeyCommand({ alias: options.alias });
   });

cli.command('list')
   .setDescription('List stored keys')
   .setAction(async () => {
       const { listStoredKeys } = await import('./commands/listKeys.js');
       await listStoredKeys();
   });

cli.command('delete')
   .option('-a, --alias <name>', 'key alias to delete')
   .setDescription('Delete a stored key')
   .setAction(async (options) => {
       const { removeKey } = await import('./commands/deleteKey.js');
       await removeKey({alias: options.alias});
   });

cli.command('backup')
   .option('-l, --list <provider>', 'List all backups on the machine.', 'local')
   .setDescription('Backup private keys locally or to cloud drives.')
   .setAction(async (options) => {
       const { testBackup } = await import('./commands/backup.js');
       await testBackup({ provider: options.list});
   });

cli.command('export')
   .setDescription('Export backup file')
   .option('-o, --output-file <file>', 'File to write the export to.')
   .setAction(async (options) => {
    const { exportKeysCommand } = await import('./commands/export.js')
    await exportKeysCommand({outputFile: options.outputfile})
   })
cli.command('restore')
   .option('-f, --file <file>', 'backup file path')
   .setDescription('Restore from backup')
   .setAction(async (options) => {
       const { restoreBackup } = await import('./commands/restoreBackup.js');
       await restoreBackup(options.file);
   });

cli.command('update-password')
   .setDescription('Update master password')
   .setAction(async () => {
       const { updatePassword } = await import('./commands/updatePassword.js');
       await updatePassword();
   });



async function main () {
    let interrupted = true;

    const cliTask = cli.parse();

    const signalTask = new Promise<void>(resolve => {
        ['SIGINT', 'SIGTERM'].forEach(sig => {
            process.on(sig, async () => {
                if (interrupted) resolve();
                interrupted = true;
                cliLogger.warn(`⚠️  Received ${sig}, shutting down gracefully...`);
                await handleShutdown(sig);
                process.exit(0)
            })
        });
    })

    await Promise.race([cliTask, signalTask])
}


main().catch(error => {
    cliLogger.error('Fatal error', error as Error);
    console.error(`Error! Check log: ${currentLogFile()}`);
})