import { BackupProvider, createProviderInstance, getProvider, PROVIDERS } from '@services/backup/cloud/remoteBackup';
import inquirer from 'inquirer';
import { getVerifiedPassword } from './utils';
import { backupKeys } from '@services/backup/backup';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive';
import path from 'path';

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
    console.log('Retrieving the backup provider...');
    const provider = getProvider(providerName.toLowerCase().replace(' ', '_'));
    if (!provider) {
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    const providerInstance = await createProviderInstance(provider as BackupProvider);

    console.log('Backing up keys...');
    const backupLocation = await backupKeys(secretKey);

    console.log('Uploading backup to the cloud...');
    await (providerInstance as GoogleDriveBackup).uploadBackup(backupLocation, path.basename(backupLocation));

    console.log('Backup process completed successfully.');
}

export async function testBackup(): Promise<void> {
    console.log('Starting the backup process...');

    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            console.warn('Password verification failed. Aborting backup process.');
            return;
        }

        const selectedProvider = await selectBackupProvider();
        console.log(`You selected: ${selectedProvider}`);

        await performBackup(secretKey.toString('hex'), selectedProvider);
    } catch (error) {
        console.error('An error occurred during the backup process:', (error as Error).message || error);
    }
}