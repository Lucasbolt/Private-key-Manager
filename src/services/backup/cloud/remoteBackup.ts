import { AUTH_CREDENTIALS, createGoogleDriveBackupInstance, GoogleDriveBackup } from "./google/googlDrive";
// import { S3Backup } from "./amazonS3/s3";
import { ACCESS_TYPE } from "./lib";
import { logAction, logError, logWarning } from '@utils/logger';

export interface BackupProvider {
    new(...args: any[]): any,
    type: ACCESS_TYPE
}
export interface GoogleProviderOption extends AUTH_CREDENTIALS {}

export const PROVIDERS: Record<string, BackupProvider> = {
    google_drive: GoogleDriveBackup,
    // amazon_s3: S3Backup
}

export function getProvider(provider: string): BackupProvider | null {
    const backupProvider = PROVIDERS[provider];

    if (!backupProvider) {
        logWarning(`Unsupported backup provider: "${provider}"`);
        return null;
    }

    logAction('Backup provider retrieved successfully', { provider });
    return backupProvider;
}

export async function createProviderInstance(
    provider: BackupProvider,
    providerOptions: GoogleProviderOption | null = null
) {
    try {
        if (provider.type === 'oauth') {
            logAction('Creating Google Drive backup instance');
            return await createGoogleDriveBackupInstance(providerOptions);
        }

        if (provider.type === 'access_key') {
            logAction('Creating S3 backup instance');
            // Create and return S3 instance
        }

        logWarning(`Unsupported backup provider type: "${provider.type}"`);
        return null;
    } catch (error) {
        logError('Error creating provider instance', { providerType: provider.type, error });
        throw error;
    }
}