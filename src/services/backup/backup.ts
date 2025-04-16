import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getDbInstance, listKeys, getDbInstance as db } from '../storage.js';
import { getBackupDir } from '@utils/fileUtils.js';
import { logAction, logError, logWarning } from '@utils/logger.js';
import { decryptBackup, encryptBackup } from '../encryption.js';

export async function backupKeys(secret_key: string, filePath?: string): Promise<string> {
    try {
        const backupDir = getBackupDir();
        await fs.mkdir(backupDir, { recursive: true });

        const keys = await listKeys();
        const backupData: Record<string, any> = {};

        for (const key of keys) {
            backupData[key] = await db().get(key);
        }

        const jsonData = JSON.stringify(backupData, null, 2);

        const secretKeyBuffer = crypto.createHash('sha256').update(secret_key).digest();
        const encryptedData = encryptBackup(secretKeyBuffer, jsonData);

        const backupFile = filePath || path.join(backupDir, `backup_${new Date().toISOString()}.json.enc`);
        await fs.writeFile(backupFile, JSON.stringify(encryptedData, null, 2), 'utf-8');

        logAction('Encrypted backup created successfully', { backupFile });
        return backupFile;
    } catch (error) {
        logError('Error creating backup', { error });
        throw error;
    }
}

export async function restoreKeys(secret_key: string, filePath: string, overwrite = false): Promise<void> {
    const db = getDbInstance();

    try {
        const encryptedData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        const secretKeyBuffer = crypto.createHash('sha256').update(secret_key).digest();
        const jsonData = decryptBackup(secretKeyBuffer, encryptedData);
        const backupData = JSON.parse(jsonData);

        for (const [alias, encryptedKey] of Object.entries(backupData)) {
            const keyExists = await db.get(alias).catch(() => null);
            if (keyExists && !overwrite) {
                logWarning(`Key '${alias}' already exists. Skipping.`, { alias });
                continue;
            }
            await db.put(alias, encryptedKey as string);
            logAction('Key restored successfully', { alias });
        }

        logAction('Restore process completed successfully');
    } catch (error) {
        logError('Error restoring keys', { filePath, error });
        throw error;
    }
}
