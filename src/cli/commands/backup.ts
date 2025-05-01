import inquirer from 'inquirer';
import { BackupProvider, createProviderInstance, getProvider, PROVIDERS } from '@services/backup/cloud/remoteBackup.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { getVerifiedPassword } from './utils.js';
import { backupKeys } from '@services/backup/backup.js';
import path from 'path';
import { cliLogger } from '@utils/cliLogger.js';
import { RemoteBackupProvider } from '@root/src/services/backup/cloud/lib.js';

async function selectBackupProvider(): Promise<string | null> {
    const providers = Object.keys(PROVIDERS).map((item) => item.toUpperCase().replace(/_/g, ' '))
    providers.push('None (only local backup)')

    const { answer } = await inquirer.prompt([
        {
            type: 'list',
            name: 'answer',
            message: 'Choose a cloud storage option:',
            choices: providers,
            default: 'Google Drive',
        },
    ]);
    if ((answer as string).includes('only local backup')) return null
    return answer;
}

async function performBackup(secretKey: string, providerName: string | null): Promise<void> {
    try {

        feedBack.info('Starting the key backup process...');
        const backupLocation = await backupKeys(secretKey);

        if (!providerName) {
            feedBack.success('Backup completed successfully. The backup is stored locally as no cloud provider was selected.');
            return;
        }

        feedBack.success('Local backup completed successfully.');
        feedBack.loading('Connecting to cloud provider...');
        const provider = getProvider(providerName.toLowerCase().replace(' ', '_'));
        
        if (!provider) {
            throw new Error(`The selected cloud provider "${providerName}" is not supported.`);
        }
        const providerInstance = await createProviderInstance(provider as BackupProvider);
        feedBack.info('Uploading the backup to the selected cloud provider...');
        await (providerInstance as RemoteBackupProvider).uploadBackup(backupLocation, path.basename(backupLocation));
        feedBack.success('Backup successfully uploaded to the cloud.');
    } catch (error) {
        feedBack.error('Error occured during backup process.')
        cliLogger.error('Error during backup process', (error as Error));
        throw error;
    }
}

export async function testBackup(): Promise<void> {
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting backup process.');
            return;
        }

        const selectedProvider = await selectBackupProvider();

        if (!selectedProvider) {
            feedBack.warn('No cloud storage provider selected. Backup will only be stored locally.')
        } else {
            feedBack.info(`You selected: ${selectedProvider}`);
        }
        await performBackup(secretKey.toString('hex'), selectedProvider);
    } catch (error) {
        // feedBack.error('Error occured during the backup process')
        cliLogger.error('An error occurred during the backup process', (error as Error));
        throw error
    }
}