import inquirer from 'inquirer';
import { storeKey, getKey } from '@services/storage.js';
import { loadEncryptionKey } from '@services/auth';
import { cliLogger } from '@utils/cliLogger';

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
        const { privateKey } = await inquirer.prompt([
            { type: 'password', name: 'privateKey', message: 'Enter private key:', mask: '*' },
        ]);

        if (isValidPrivateKey(privateKey)) {
            return privateKey;
        }

        const remainingAttempts = MAX_ATTEMPTS - attempt;
        
        if (remainingAttempts > 0) {
            cliLogger.warn(`Private key must be at least ${MIN_KEY_LENGTH} characters long. ${remainingAttempts} attempts left.`);
        }
    }
    cliLogger.error('Max attempts reached. Private key not stored.');
    return null;
}

/**
 * Adds a new private key securely.
 */
export async function addKey() {
    try {
        const { alias } = await inquirer.prompt([
            { type: 'input', name: 'alias', message: 'Enter key alias:' },
        ]);

        const { password } = await inquirer.prompt([
            { type: 'password', name: 'password', message: 'Enter your password:', mask: '*' },
        ]);

        const secretKey = await loadEncryptionKey(password)
        const existingKey = await getKey(secretKey.toString(), alias);
        if (existingKey) {
            cliLogger.warn(`Key '${alias}' already exists.`);
            
            const { overwrite } = await inquirer.prompt([
                { type: 'confirm', name: 'overwrite', message: 'Do you want to overwrite the existing key?', default: false },
            ]);

            if (!overwrite) {
                cliLogger.info('Operation cancelled. No key was stored.');
                return;
            }
        }
        const privateKey = await promptForPrivateKey();
        if (!privateKey) return;
        await storeKey(secretKey.toString(), alias, privateKey);
        cliLogger.success(`Key '${alias}' stored securely.`);
    } catch (error) {
        cliLogger.error('Error adding key', (error as Error));
    }
}
