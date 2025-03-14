import {Level} from 'level';
import { encryptKey, decryptKey } from './encryption';

// const db = new Level('./keys-db');

let db: Level<string, string>;
export function getDbInstance(): Level<string, string> {
    if (!db) {
        db = new Level('./keys-db');
    }
    return db;
}

export async function storeKey(alias: string, privateKey: string): Promise<void> {
    const encryptedData = encryptKey(privateKey);
    await getDbInstance().put(alias.toLocaleLowerCase(), JSON.stringify(encryptedData));
}

export async function getKey(alias: string): Promise<string | null> {
    try {
        const encryptedData = JSON.parse(await getDbInstance().get(alias.toLocaleLowerCase()));
        return decryptKey(encryptedData);
    } catch (error) {
        return null;
    }
}

export async function listKeys(): Promise<string[]> {
    const keys: string[] = [];
    for await (const key of getDbInstance().keys()) {
        keys.push(key);
    }
    return keys;
}

export async function deleteKey(alias: string): Promise<void> {
    await getDbInstance().del(alias);
}
