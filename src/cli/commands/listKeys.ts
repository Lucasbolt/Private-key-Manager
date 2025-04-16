import { listKeys } from '@services/storage.js';
import { getVerifiedPassword } from './utils.js';
import { cliLogger } from '@utils/cliLogger.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';

export async function listStoredKeys() {
    try {
        const verifiedPassword = await getVerifiedPassword();
        if (!verifiedPassword) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        const keys = await listKeys();
        if (keys.length) {
            feedBack.success(`Stored Keys: ${keys.join(', ')}`);
        } else {
            feedBack.info('No keys found.');
        }
    } catch (error) {
        cliLogger.error('Error listing stored keys', (error as Error));
        throw error
    }
}
