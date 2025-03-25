import inquirer from 'inquirer';
import { restoreKeys } from '@services/backup/backup';
import { loadEncryptionKey } from '@services/auth';
import { getProvider, createProviderInstance } from '@services/backup/cloud/remoteBackup';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive';
import path from 'path';
import fs from 'fs/promises';
import { getBackupDir } from '@utils/fileUtils';
import { getVerifiedPassword } from './utils';

const LOCAL_BACKUP_DIR = getBackupDir();

export async function restoreBackup({ optionalBackupPath }: { optionalBackupPath?: string }) {
    try {
        console.log('Starting the restore process...');

        const secretKey = await getVerifiedPassword()
        if (!secretKey) return
        let backupFilePath: string | undefined = optionalBackupPath;
        if (!optionalBackupPath) {
            // Ask user where the backup is stored
            const { backupLocation } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'backupLocation',
                    message: 'Where is your backup stored?',
                    choices: ['Local File', 'Google Drive'],
                },
            ]);

            if (backupLocation === 'Local File') {
                // List available backups in the local backup directory
                const files = await fs.readdir(LOCAL_BACKUP_DIR);
                if (files.length === 0) {
                    console.error('❌ No backup files found in the local backup directory.');
                    return;
                }

                const { selectedFile } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectedFile',
                        message: 'Select a backup file:',
                        choices: files,
                    },
                ]);

                backupFilePath = path.join(LOCAL_BACKUP_DIR, selectedFile);
            } else if (backupLocation === 'Google Drive') {
                // Handle Google Drive backup
                const provider = getProvider('google_drive');
                if (!provider) {
                    console.error('❌ Unsupported backup provider.');
                    return;
                }

                const providerInstance = await createProviderInstance(provider);
                if (!(providerInstance instanceof GoogleDriveBackup)) {
                    console.error('❌ Failed to initialize Google Drive provider.');
                    return;
                }

                const remoteFiles = await providerInstance.listFilesInDirectory();
                if (!remoteFiles) {
                    console.error('❌ No backup files found in the cloud backup directory.');
                    return;
                }

                const { selectedRemoteFile } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectedRemoteFile',
                        message: 'Select a backup file from Google Drive:',
                        choices: remoteFiles.map((content) => content.name).filter((name): name is string => !!name),
                    },
                ]);

                // const selectedFileID = remoteFiles.find((files) => files.name === selectedRemoteFile)?.id

                const localTempPath = path.join('/tmp', selectedRemoteFile);
                await providerInstance.downloadBackup(selectedRemoteFile, localTempPath);
                backupFilePath = localTempPath;
            }
        }

        if (!backupFilePath) {
            console.error('❌ Backup file path could not be determined.');
            return;
        }

        // Confirm overwrite behavior
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Do you want to overwrite existing keys if they already exist?',
                default: false,
            },
        ]);

        // Restore keys from the backup file
        await restoreKeys(secretKey.toString('hex'), backupFilePath, overwrite);
        console.log('🎉 Restore process completed successfully.');
    } catch (error) {
        throw error
    }
}