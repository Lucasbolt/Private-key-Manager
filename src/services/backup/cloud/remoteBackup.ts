import { AUTH_CREDENTIALS, createGoogleDriveBackupInstance, GoogleDriveBackup } from "./google/googlDrive";
import { S3Backup } from "./amazonS3/s3";
import { ACCESS_TYPE } from "./lib";


interface BackupProvider {
    new(...args: any[]): any,
    type: ACCESS_TYPE
}
interface GoogleProviderOption extends AUTH_CREDENTIALS {}

const PROVIDERS: Record<string, BackupProvider> = {
    google_drive: GoogleDriveBackup,
    amazon_s3: S3Backup
}

export function getProvider (provider: string): BackupProvider | null {
    const backupProvider = PROVIDERS[provider];

    if (!backupProvider) {
        console.warn(`⚠️ Unsupported backup provider: "${provider}"`);
        return null;
    }

    return backupProvider;
}

export async function createProviderInstance(
    provider: BackupProvider,
    providerOptions: GoogleProviderOption | null = null
) {
    if (provider.type === 'oauth') {
        //create and return google instance
        createGoogleDriveBackupInstance(providerOptions)   
    }

    if (provider.type === 'access_key') {
        //create and return s3 instance
    }
    
    console.warn(`⚠️ Unsupported backup provider: "${provider}"`);
    return null;
}