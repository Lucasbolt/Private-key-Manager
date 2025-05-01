import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getDbInstance, listKeys, getDbInstance as db } from '../storage.js';
import { getBackupDir } from '@utils/fileUtils.js';
import { logAction, logError, logWarning } from '@utils/logger.js';
import { decryptBackup, decryptKey, encryptBackup, EncryptedBackupData, encryptKey } from '../encryption.js';
import { compareSalt, generateKey, getAuthSalt } from '../auth.js';
import { getPassword } from '@root/src/cli/commands/utils.js';

export async function backupKeys(secret_key: string, filePath?: string): Promise<string> {
    try {
        const backupDir = getBackupDir();
        await fs.mkdir(backupDir, { recursive: true });

        const keys = await listKeys();
        const backupData: Record<string, string> = {};

        for (const key of keys) {
            backupData[key] = await db().get(key);
        }

        const jsonData = JSON.stringify(backupData, null, 2);

        const secretKeyBuffer = crypto.createHash('sha256').update(secret_key).digest();

        const salt = await getAuthSalt()
        const encryptedData = encryptBackup(secretKeyBuffer, jsonData, salt);

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
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const encryptedData: EncryptedBackupData = JSON.parse(fileContent);

        const isPasswordChanged = !(await compareSalt(encryptedData.salt));
        let decryptionKey = secret_key;

        if (isPasswordChanged) {
            const oldPassword = await getPassword('Enter password used to backup data');
            decryptionKey = generateKey(oldPassword, Buffer.from(encryptedData.salt, 'hex')).toString('hex');
        }

        const secretKeyBuffer = crypto.createHash('sha256').update(decryptionKey).digest();
        const decryptedJson = decryptBackup(secretKeyBuffer, encryptedData);
        const backupData = JSON.parse(decryptedJson);

        if (typeof backupData !== 'object' || backupData === null) {
            throw new Error('Invalid backup data format.');
        }

        const ops: { type: 'put'; key: string; value: string }[] = [];

        for (const [alias, encryptedKey] of Object.entries(backupData)) {
            const normalizedAlias = alias.trim().toLowerCase();
            const keyExists = await db.get(normalizedAlias).catch(() => null);

            if (keyExists && !overwrite) {
                logWarning(`Key '${normalizedAlias}' already exists. Skipping.`, { alias: normalizedAlias });
                continue;
            }

            let valueToStore: string;

            if (isPasswordChanged) {
                const decryptedData = decryptKey(decryptionKey, encryptedKey as string);
                valueToStore = encryptKey(secret_key, decryptedData);
            } else {
                valueToStore = encryptedKey as string;
            }

            ops.push({ type: 'put', key: normalizedAlias, value: valueToStore });
        }

        if (ops.length > 0) {
            await db.batch(ops);
            logAction('Restore completed successfully', { restoredKeys: ops.length });
        } else {
            logWarning('No keys were restored.', {});
        }

    } catch (error) {
        logError('Error restoring keys', { filePath, error });
        console.error(error)
        throw error;
    }
}