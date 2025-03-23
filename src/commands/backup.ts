import { BackupProvider, createProviderInstance, getProvider } from '@services/backup/cloud/remoteBackup';
import inquirer from 'inquirer';
import { getPassword } from './utils';
import { loadEncryptionKey } from '@services/auth';
import { backupKeys } from '@services/backup/backup';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive';
import path from 'path';


export async function testBackup() {
    console.log('Starting the backup process...');
    
    const { answer } = await inquirer.prompt([
        {
            type: 'list',
            name: 'answer',
            message: 'Choose a cloud storage option:',
            choices: ['Google Drive', 'Dropbox', 'OneDrive', 'iCloud'],
            default: 'Google Drive',
        },
    ]);

    console.log(`You selected: ${answer}`);
    
    try {
        console.log('Retrieving the backup provider...');
        const provider = getProvider('google_drive');
        const providerInstance = await createProviderInstance(provider as BackupProvider);

        console.log('Fetching encryption password...');
        const password = await getPassword();

        console.log('Loading encryption key...');
        const secret_key = await loadEncryptionKey(password);

        console.log('Backing up keys...');
        const backupLocation = await backupKeys(secret_key.toString('hex'));

        console.log('Uploading backup to the cloud...');
        await (providerInstance as GoogleDriveBackup).uploadBackup(backupLocation, path.basename(backupLocation));

        console.log('Backup process completed successfully.');
    } catch (error) {
        console.error('An error occurred during the backup process:', error);
    }
}