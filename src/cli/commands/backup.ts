import inquirer from 'inquirer';
import { BackupProvider, createProviderInstance, getProvider, PROVIDERS } from '@services/backup/cloud/remoteBackup.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { getVerifiedPassword } from './utils.js';
import { backupKeys } from '@services/backup/backup.js';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive.js';
import path from 'path';
import { cliLogger } from '@utils/cliLogger.js';

async function selectBackupProvider(): Promise<string> {
    const { answer } = await inquirer.prompt([
        {
            type: 'list',
            name: 'answer',
            message: 'Choose a cloud storage option:',
            choices: Object.keys(PROVIDERS).map((item) => item.toUpperCase().replace(/_/g, ' ')),
            default: 'Google Drive',
        },
    ]);
    return answer;
}

async function performBackup(secretKey: string, providerName: string): Promise<void> {
    try {
        feedBack.loading('Retrieving the backup provider...');
        const provider = getProvider(providerName.toLowerCase().replace(' ', '_'));
        if (!provider) {
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        const providerInstance = await createProviderInstance(provider as BackupProvider);

        feedBack.info('Backing up keys...');
        const backupLocation = await backupKeys(secretKey);

        feedBack.info('Uploading backup to the cloud...');
        await (providerInstance as GoogleDriveBackup).uploadBackup(backupLocation, path.basename(backupLocation));

        feedBack.success('Backup process completed successfully.');
    } catch (error) {
        feedBack.error('Error occured during backup process.')
        cliLogger.error('Error during backup process', (error as Error));
        throw error;
    }
}

export async function testBackup(): Promise<void> {
    feedBack.loading('Starting the backup process...');
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting backup process.');
            return;
        }

        const selectedProvider = await selectBackupProvider();
        feedBack.info(`You selected: ${selectedProvider}`);

        await performBackup(secretKey.toString('hex'), selectedProvider);
    } catch (error) {
        // feedBack.error('Error occured during the backup process')
        cliLogger.error('An error occurred during the backup process', (error as Error));
        throw error
    }
}