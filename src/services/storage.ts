import {Level} from 'level';
import { encryptKey, decryptKey } from './encryption';
import { getDatabaseDir } from '@src/utils/fileUtils';

// const db = new Level('./keys-db');

let db: Level<string, string>;

export function getDbInstance(): Level<string, string> {
    if (!db) {
        db = new Level(getDatabaseDir());
    }
    return db;
}

export async function storeKey(secret_key: string, alias: string, privateKey: string): Promise<void> {
    const encryptedData = encryptKey(secret_key, privateKey);
    await getDbInstance().put(alias.toLocaleLowerCase(), JSON.stringify(encryptedData));
}

export async function getKey(secret_key: string, alias: string): Promise<string | null> {
    try {
        const encryptedData = JSON.parse(await getDbInstance().get(alias.toLocaleLowerCase()));
        return decryptKey(secret_key, encryptedData);
    } catch (error) {
        return null;
    }
}


//this will need authorization which the front will responsible for calling for 
export async function listKeys(): Promise<string[]> {
    const keys: string[] = [];
    for await (const key of getDbInstance().keys()) {
        keys.push(key);
    }
    return keys;
}

//this will need authorization which the front will responsible for calling for 
export async function deleteKey(alias: string): Promise<void> {
    await getDbInstance().del(alias);
}
