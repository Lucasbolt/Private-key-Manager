import inquirer from 'inquirer';
import { storeKey, getKey } from '../services/storage';

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
            console.log(`❌ Private key must be at least ${MIN_KEY_LENGTH} characters long. ${remainingAttempts} attempts left.`);
        }
    }
    console.log('❌ Max attempts reached. Private key not stored.');
    return null;
}

/**
 * Adds a new private key securely.
 */
export async function addKey() {
    const { alias } = await inquirer.prompt([
        { type: 'input', name: 'alias', message: 'Enter key alias:' },
    ]);

    const existingKey = await getKey(alias);
    if (existingKey) {
        console.log(`⚠️ Key '${alias}' already exists.`);
        
        const { overwrite } = await inquirer.prompt([
            { type: 'confirm', name: 'overwrite', message: 'Do you want to overwrite the existing key?', default: false },
        ]);

        if (!overwrite) {
            console.log('❌ Operation cancelled. No key was stored.');
            return;
        }
    }

    const privateKey = await promptForPrivateKey();
    if (!privateKey) return;

    await storeKey(alias, privateKey);
    console.log(`✅ Key '${alias}' stored securely.`);
}
