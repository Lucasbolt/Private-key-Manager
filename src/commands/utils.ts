import inquirer from 'inquirer';
import { loadEncryptionKey } from '@services/auth';
import { logAction, logError, logWarning } from '@utils/logger';
import { cliFeedback as feedBack } from '@utils/cliFeedback';

export async function getPassword(): Promise<string> {
    try {
        const response = await inquirer.prompt([
            {
                type: 'password',
                name: 'password',
                message: 'Enter your password:',
                mask: '*',
            },
        ]);
        logAction('Password input received');
        return response.password;
    } catch (error) {
        logError('Error during password input', { error });
        throw error;
    }
}

export async function getVerifiedPassword(): Promise<Buffer<ArrayBufferLike> | null> {
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const password = await getPassword();
        const remainingAttempts = MAX_ATTEMPTS - attempt;
        try {
            const secret_key = await loadEncryptionKey(password);
            logAction('Password verified successfully');
            return secret_key;
        } catch (error) {
            if (remainingAttempts > 0) {
                logWarning('Invalid password attempt', { attempt, remainingAttempts });
                feedBack.warn(`Invalid password. ${remainingAttempts} attempts left.`);
            } else {
                logError('Max password attempts reached', { attempt });
            }
        }
    }

    feedBack.error('Max attempts reached. Operation failed.');
    return null;
}

