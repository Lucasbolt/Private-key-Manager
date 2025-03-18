import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto'
import { getDbInstance, listKeys, getDbInstance as db } from '../storage';
import { getBackupDir } from '@utils/fileUtils';
import logger, { logAction, logError } from '@utils/logger';
import { decryptBackup, encryptBackup } from '../encryption';

export async function backupKeys(secret_key: string, filePath?: string): Promise<void> {
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

    const backupFile = filePath || path.join(backupDir, `backup_${Date.now()}.json.enc`);
    await fs.writeFile(backupFile, JSON.stringify(encryptedData, null, 2), 'utf-8');

    logAction(`✅ Encrypted backup saved to: ${backupFile}`);
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
                logger.info(`⚠️ Key '${alias}' already exists. Skipping.`);
                continue;
            }
            await db.put(alias, encryptedKey as string);
            logAction(`✅ Restored '${alias}'.`);
        }

        logAction('🎉 Restore complete!');
    } catch (error) {
        logError(`❌ Restore failed: ${(error as any).message}`);
    }
}
