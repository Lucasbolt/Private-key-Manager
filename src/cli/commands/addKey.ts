import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { storeKey, getKey } from '@services/storage.js';
// import { loadEncryptionKey } from '@services/auth.js';
import { cliLogger } from '@utils/cliLogger.js';
import { getVerifiedPassword } from './utils.js';
import { safePrompt } from '@root/src/utils/processHandlers.js';

const MIN_KEY_LENGTH = 8;
const MAX_ATTEMPTS = 3;

/**
 * Validates the private key length.
 */
function isValidPrivateKey(privateKey: string): boolean {
    return privateKey.length >= MIN_KEY_LENGTH;
}

/**
 * Prompts the user to enter a private key with validation and retry logic.
 */
async function promptForPrivateKey(): Promise<string | null> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const { privateKey } = await safePrompt([
            { type: 'password', name: 'privateKey', message: 'Enter private key:', mask: '*' },
        ]);

        if (isValidPrivateKey(privateKey)) {
            return privateKey;
        }

        const remainingAttempts = MAX_ATTEMPTS - attempt;
        
        if (remainingAttempts > 0) {
            feedBack.warn(`Private key must be at least ${MIN_KEY_LENGTH} characters long. ${remainingAttempts} attempts left.`);
        }
    }
    feedBack.error('Max attempts reached. Private key not stored.');
    return null;
}

/**
 * Adds a new private key securely.
 */
export async function addKey() {
    try {
        const secretKey = await getVerifiedPassword()
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting backup process.')
            return
        }

        const { alias } = await safePrompt([
            { type: 'input', name: 'alias', message: 'Enter key alias:' },
        ]);
        
        const existingKey = await getKey(secretKey.toString(), alias);
        if (existingKey) {
            feedBack.warn(`Key '${alias}' already exists.`);
            
            const { overwrite } = await safePrompt([
                { type: 'confirm', name: 'overwrite', message: 'Do you want to overwrite the existing key?', default: false },
            ]);

            if (!overwrite) {
                feedBack.info('Operation cancelled. No key was stored.');
                return;
            }
        }
        const privateKey = await promptForPrivateKey();
        if (!privateKey) return;
        await storeKey(secretKey.toString(), alias, privateKey);
        feedBack.success(`Key '${alias}' stored securely.`);
    } catch (error) {
        cliLogger.error('Error adding key', (error as Error));
        throw error
    }
}
