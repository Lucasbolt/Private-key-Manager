import { listKeys } from '@services/storage';
import { getVerifiedPassword } from './utils';
import { cliLogger } from '@utils/cliLogger';

export async function listStoredKeys() {
    try {
        const verifiedPassword = await getVerifiedPassword();
        if (!verifiedPassword) {
            cliLogger.warn('Password verification failed. Aborting operation.');
            return;
        }

        const keys = await listKeys();
        if (keys.length) {
            cliLogger.success(`Stored Keys: ${keys.join(', ')}`);
        } else {
            cliLogger.info('No keys found.');
        }
    } catch (error) {
        cliLogger.error('Error listing stored keys', (error as Error));
    }
}
