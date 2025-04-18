import inquirer from 'inquirer';
import { getKey, listKeys } from "@services/storage.js";
import { getVerifiedPassword } from "./utils.js";
import { cliLogger } from '@utils/cliLogger.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';

interface Options {
    alias: string | undefined
}


export async function getKeyCommand(options: Options = { alias: undefined}) {
    try {
        let alias
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        if (!options.alias) {
            const keys = await listKeys()
            if (keys.length < 1) {
                feedBack.warn('No stored keys.')
                return
            }
    
            const result = await inquirer.prompt([
                { 
                    type: 'list',
                    name: 'alias',
                    message: 'Select key to retrieve',
                    choices: keys
                },
            ]);
            alias = result.alias
        } else {
            alias = options.alias
        }

        const key = await getKey(secretKey.toString(), alias);
        if (key) {
            feedBack.success(`Key '${alias}': ${key}`);
        } else {
            feedBack.warn(`Key '${alias}' not found.`);
        }
    } catch (error) {
        cliLogger.error('Error retrieving key', (error as Error));
        throw error
    }
}