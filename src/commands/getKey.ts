import { getKey } from "@services/storage";
import inquirer from 'inquirer';
import { getVerifiedPassword } from "./utils";
import { cliLogger } from '@utils/cliLogger';
import { cliFeedback as feedBack } from '@utils/cliFeedback';

export async function getKeyCommand() {
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        const { alias } = await inquirer.prompt([
            { type: 'input', name: 'alias', message: 'Enter key alias to retrieve:' },
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