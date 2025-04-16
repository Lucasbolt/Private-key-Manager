import { Level } from 'level';
import { encryptKey, decryptKey } from './encryption.js';
import { getDatabaseDir } from '@utils/fileUtils.js';
import { logAction, logError, logWarning } from '@utils/logger.js';

let db: Level<string, string>;

// Get or initialize database instance
export function getDbInstance(): Level<string, string> {
    if (!db) {
        db = new Level(getDatabaseDir(), { valueEncoding: 'json' });
    }
    return db;
}

// Store encrypted key
export async function storeKey(secret_key: string, alias: string, privateKey: string): Promise<void> {
    const normalizedAlias = alias.trim().toLowerCase();
    const encryptedData = encryptKey(secret_key, privateKey);
    await getDbInstance().put(normalizedAlias, encryptedData);
    logAction('Key stored', { alias: normalizedAlias });
}

// Retrieve and decrypt key
export async function getKey(secret_key: string, alias: string): Promise<string | null> {
    try {
        const normalizedAlias = alias.trim().toLowerCase();
        const encryptedData = await getDbInstance().get(normalizedAlias);
        if (!encryptedData) {
            logWarning('Key not found', { alias: normalizedAlias });
            return null;
        }
        logAction('Key retrieved', { alias: normalizedAlias });
        return decryptKey(secret_key, encryptedData);
    } catch (error) {
        logError('Error retrieving key', { alias, error });
        throw error;
    }
}

//the frontend should call the authorization functions before calling this
export async function listKeys(): Promise<string[]> {
    const keys: string[] = [];
    try {
        for await (const key of getDbInstance().keys()) {
            keys.push(key);
        }
        logAction('Keys listed', { count: keys.length });
    } catch (error) {
        logError('Error listing keys', { error });
        throw error;
    }
    return keys;
}

//the frontend should call the authorization functions before calling this
export async function deleteKey(alias: string): Promise<void> {
    const normalizedAlias = alias.trim().toLowerCase();
    try {
        await getDbInstance().del(normalizedAlias);
        logAction('Key deleted', { alias: normalizedAlias });
    } catch (error) {
        logError('Error deleting key', { alias: normalizedAlias, error });
        throw error;
    }
}

