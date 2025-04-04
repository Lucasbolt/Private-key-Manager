import inquirer from 'inquirer';
import { restoreKeys } from '@services/backup/backup';
import { getProvider, createProviderInstance } from '@services/backup/cloud/remoteBackup';
import { GoogleDriveBackup } from '@services/backup/cloud/google/googlDrive';
import path from 'path';
import fs from 'fs/promises';
import { getBackupDir, getTempDir } from '@utils/fileUtils';
import { getVerifiedPassword } from './utils';
import { logAction, logError, logWarning } from '@utils/logger';
import { cliFeedback as feedBack } from '@utils/cliFeedback';

const LOCAL_BACKUP_DIR = getBackupDir();
const LOCAL_TEMP_DIR = getTempDir();

export async function restoreBackup({ optionalBackupPath }: { optionalBackupPath?: string }) {
    try {
        logAction('Restore process started');
        feedBack.info('Starting the restore process...');

        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            logWarning('Restore process aborted due to failed password verification');
            return;
        }

        let backupFilePath: string | undefined = optionalBackupPath;
        if (!optionalBackupPath) {
            const { backupLocation } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'backupLocation',
                    message: 'Where is your backup stored?',
                    choices: ['Local File', 'Google Drive'],
                },
            ]);

            if (backupLocation === 'Local File') {
                const files = await fs.readdir(LOCAL_BACKUP_DIR);
                if (files.length === 0) {
                    logWarning('No backup files found in the local backup directory');
                    feedBack.warn('No backup files found in the local backup directory.');
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
                logAction('Local backup file selected', { backupFilePath });
            } else if (backupLocation === 'Google Drive') {
                const provider = getProvider('google_drive');
                if (!provider) {
                    logError('Unsupported backup provider');
                    feedBack.error('Unsupported backup provider.');
                    return;
                }

                const providerInstance = await createProviderInstance(provider);
                if (!(providerInstance instanceof GoogleDriveBackup)) {
                    logError('Failed to initialize Google Drive provider');
                    feedBack.error('Failed to initialize Google Drive provider.');
                    return;
                }

                const remoteFiles = await providerInstance.listFilesInDirectory();
                if (!remoteFiles) {
                    logWarning('No backup files found in the cloud backup directory');
                    feedBack.warn('No backup files found in the cloud backup directory.');
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

                const localTempPath = path.join(LOCAL_TEMP_DIR, selectedRemoteFile);
                await providerInstance.downloadBackup(selectedRemoteFile, localTempPath);
                backupFilePath = localTempPath;
                logAction('Backup file downloaded from Google Drive', { backupFilePath });
            }
        }

        if (!backupFilePath) {
            logError('Backup file path could not be determined');
            feedBack.error('❌ Backup file path could not be determined.');
            return;
        }

        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Do you want to overwrite existing keys if they already exist?',
                default: false,
            },
        ]);

        await restoreKeys(secretKey.toString('hex'), backupFilePath, overwrite);
        logAction('Restore process completed successfully');
        feedBack.success('🎉 Restore process completed successfully.');
    } catch (error) {
        logError('Error during restore process', { error });
        throw error;
    }
}