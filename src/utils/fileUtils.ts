import fs from 'fs/promises';
import config from '@src/config';

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

export function getDatabaseDir() {
    return config.DB_DIR
}