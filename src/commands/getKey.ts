import { getKey } from "@services/storage";
import inquirer from 'inquirer';
import { getVerifiedPassword } from "./utils";
import { cliLogger } from '@utils/cliLogger';

export async function getKeyCommand() {
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            cliLogger.warn('Password verification failed. Aborting operation.');
            return;
        }

        const { alias } = await inquirer.prompt([
            { type: 'input', name: 'alias', message: 'Enter key alias to retrieve:' },
        ]);

        const key = await getKey(secretKey.toString(), alias);
        if (key) {
            cliLogger.success(`Key '${alias}': ${key}`);
        } else {
            cliLogger.warn(`Key '${alias}' not found.`);
        }
    } catch (error) {
        cliLogger.error('Error retrieving key', (error as Error));
    }
}