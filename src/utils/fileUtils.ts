import fs from 'fs/promises';
import path from "path";
import config from 'src/config.js';
import { logError } from './logger.js';


export function safeTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

export async function getBackupFilePath(filePath?: string): Promise<string> {
  const suffix = ".enc";

  let backupFile = filePath || path.join(
    config.BACKUP_DIR,
    `backup_${safeTimestamp()}${suffix}`
  );


  if (!backupFile.endsWith(suffix)) {
    backupFile += suffix;
  }


  await fs.mkdir(path.dirname(backupFile), { recursive: true });

  return backupFile;
}


export async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path);
        return true;
    }
    catch (error) {
        logError('Error occured', { error })
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
