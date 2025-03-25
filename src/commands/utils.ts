import inquirer from 'inquirer';
import { loadEncryptionKey } from '@services/auth';

export async function getPassword(): Promise<string> {
    const response = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password:',
            mask: '*',
        },
    ]);

    return response.password;
}

export async function getVerifiedPassword(): Promise<Buffer<ArrayBufferLike> | null> {
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const password = await getPassword();
        const remainingAttempts = MAX_ATTEMPTS - attempt
        try {
            const secret_key = await loadEncryptionKey(password); 
            return secret_key;
        } catch (error) {
            if (remainingAttempts > 0) {
                console.error(`❌ Invalid password. ${remainingAttempts} attempts left.`);
            }
        }
    }

    console.error('❌ Max attempts reached. Operation failed.');
    return null;
}