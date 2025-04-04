import { deleteKey } from '@services/storage';
import inquirer from 'inquirer';
import { cliFeedback as feedBack } from '@utils/cliFeedback';
import { getVerifiedPassword } from './utils';
import { cliLogger } from '@utils/cliLogger';

export async function removeKey() {
    try {
        const verifiedPassword = await getVerifiedPassword();
        if (!verifiedPassword) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        const { alias } = await inquirer.prompt([
            { type: 'input', name: 'alias', message: 'Enter key alias to delete:' },
        ]);

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