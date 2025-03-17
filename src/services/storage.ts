import { Level } from 'level';
import { encryptKey, decryptKey } from './encryption';
import { getDatabaseDir } from '@src/utils/fileUtils';

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
}

// Retrieve and decrypt key
export async function getKey(secret_key: string, alias: string): Promise<string> {
    try {
        const normalizedAlias = alias.trim().toLowerCase();
        const encryptedData = await getDbInstance().get(normalizedAlias);
        return decryptKey(secret_key, encryptedData);
    } catch (error) {
        if ((error as any).notFound) {
            throw new Error(`Key '${alias}' not found.`);
        }
        throw new Error('Invalid password or corrupted data.');
    }
}

//the frontend should call the authorization functions before calling this
export async function listKeys(): Promise<string[]> {
    const keys: string[] = [];
    for await (const key of getDbInstance().keys()) {
        keys.push(key);
    }
    return keys;
}

//the frontend should call the authorization functions before calling this
export async function deleteKey(alias: string): Promise<void> {
    await getDbInstance().del(alias.trim().toLowerCase());
}
