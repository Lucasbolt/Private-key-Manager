import inquirer from 'inquirer';
import { getKey, listKeys } from "@services/storage.js";
import { getVerifiedPassword } from "./utils.js";
import { cliLogger } from '@utils/cliLogger.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';

export async function getKeyCommand() {
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        const keys = await listKeys()
        if (keys.length < 1) {
            feedBack.warn('No stored keys.')
            return
        }

        const { alias } = await inquirer.prompt([
            { 
                type: 'list',
                name: 'alias',
                message: 'Select key to retrieve',
                choices: keys
            },
        ]);

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