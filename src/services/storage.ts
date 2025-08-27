import { encryptKey, decryptKey } from './encryption.js';
import { logAction, logError, logWarning } from '@utils/logger.js';
import { dbClient } from '../db.js';


// Store encrypted key
export async function storeKey(secret_key: string, alias: string, privateKey: string): Promise<void> {
    const normalizedAlias = alias.trim().toLowerCase();
    const encryptedData = encryptKey(secret_key, privateKey);
    await dbClient.put(normalizedAlias, encryptedData);
    logAction('Key stored', { alias: normalizedAlias });
}

// Retrieve and decrypt key
export async function getKey(secret_key: string, alias: string): Promise<string | null> {
    try {
        const normalizedAlias = alias.trim().toLowerCase();
        const encryptedData = await dbClient.get(normalizedAlias);
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
        for await (const key of dbClient.keys()) {
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
        await dbClient.del(normalizedAlias);
        logAction('Key deleted', { alias: normalizedAlias });
    } catch (error) {
        logError('Error deleting key', { alias: normalizedAlias, error });
        throw error;
    }
}


// function to list keys in paginated fashion
export async function listKeysPaginated(cursor: string | null, limit: number): Promise<{ keys: string[], nextCursor: string | null }> {
    const keys: string[] = [];
    let foundCursor = cursor === null ? true : false;
    let nextCursor: string | null = null;

    try {
        for await (const key of dbClient.keys({})) {
            if (!foundCursor) {
                if (key === cursor) {
                    foundCursor = true; // Start collecting from the next key
                }
                continue;
            }

            if (keys.length < limit) {
                keys.push(key);
            } else {
                nextCursor = key;
                break;
            }
        }

        logAction('Keys paginated', { fetched: keys.length, nextCursor });
        return { keys, nextCursor };
    } catch (error) {
        logError('Error paginating keys', { error });
        throw error;
    }
}
