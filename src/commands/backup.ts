import { BackupProvider, createProviderInstance, getProvider, PROVIDERS } from '@services/backup/cloud/remoteBackup';
import inquirer from 'inquirer';
import { getVerifiedPassword } from './utils';
import { backupKeys } from '@services/backup/backup';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive';
import path from 'path';
import { cliLogger } from '@utils/cliLogger';

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
        cliLogger.info('Retrieving the backup provider...');
        const provider = getProvider(providerName.toLowerCase().replace(' ', '_'));
        if (!provider) {
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        const providerInstance = await createProviderInstance(provider as BackupProvider);

        cliLogger.info('Backing up keys...');
        const backupLocation = await backupKeys(secretKey);

        cliLogger.info('Uploading backup to the cloud...');
        await (providerInstance as GoogleDriveBackup).uploadBackup(backupLocation, path.basename(backupLocation));

        cliLogger.success('Backup process completed successfully.');
    } catch (error) {
        cliLogger.error('Error during backup process', (error as Error));
        throw error;
    }
}

export async function testBackup(): Promise<void> {
    cliLogger.info('Starting the backup process...');
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            cliLogger.warn('Password verification failed. Aborting backup process.');
            return;
        }

        const selectedProvider = await selectBackupProvider();
        cliLogger.info(`You selected: ${selectedProvider}`);

        await performBackup(secretKey.toString('hex'), selectedProvider);
    } catch (error) {
        cliLogger.error('An error occurred during the backup process', (error as Error));
    }
}