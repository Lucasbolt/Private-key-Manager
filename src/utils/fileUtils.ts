import fs from 'fs/promises';
import config from 'src/config.js';

export async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path);
        return true;
    }
    catch (error) {
        return false;
    }
}

export function getLogDir():string {
    return config.LOG_DIR
}

export function getAuthFilePath (): string {
    return config.AUTH_FILE
}

export function getDatabaseDir(): string {
    return config.DB_DIR
}

export function getBackupDir (): string {
    return config.BACKUP_DIR
}

export function getCredentialsFilePath (): string {
    return config.CREDENTIALS_FILE
}

export function getTokenFilePath (): string {
    return config.TOKEN_FILE
}

export function getTempDir (): string {
    return config.TEMP_DIR
}