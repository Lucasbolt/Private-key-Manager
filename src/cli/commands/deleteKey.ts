import inquirer from 'inquirer';
import { deleteKey, listKeys } from '@services/storage.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { getVerifiedPassword } from './utils.js';
import { cliLogger } from '@utils/cliLogger.js';

interface Options {
    alias: string | undefined
}
export async function removeKey(option: Options = { alias: undefined }) {
    try {
        let alias
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        if (!option.alias) {
            const keys = await listKeys()
            if (keys.length < 1) {
                feedBack.warn('No stored keys.')
                return
            };
    
            const result = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'alias',
                    message: 'Select key to delete',
                    choices: keys
                },
            ]);

            alias = result.alias

        } else {
            alias = option.alias
        }

        const { confirm } = await inquirer.prompt([
            { type: 'confirm', name: 'confirm', message: `Are you sure you want to delete the key '${alias}'?`, default: false },
        ]);

        if (confirm) {
            await deleteKey(alias);
            feedBack.success(`Key '${alias}' deleted.`);
            cliLogger.success(`Key '${alias}' deleted.`);
        } else {
            feedBack.info('Operation cancelled.');
        }
    } catch (error) {
        cliLogger.error('Error deleting key', (error as Error));
        throw error
    }
}