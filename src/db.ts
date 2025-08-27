import { Level } from 'level';
import { getDatabaseDir } from '@utils/fileUtils.js';


export function getDbInstance(): Level<string, string> {
    return new Level(getDatabaseDir(), { valueEncoding: 'json' });
}

export const dbClient = getDbInstance()

