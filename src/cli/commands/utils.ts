import { loadEncryptionKey } from '@services/auth.js';
import { logAction, logError, logWarning } from '@utils/logger.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { safePrompt } from '@root/src/utils/processHandlers.js';

export async function getPassword(prompt: string | null = null): Promise<string> {
    try {
        const response = await safePrompt([
            {
                type: 'password',
                name: 'password',
                message: prompt ?? 'Enter your password:',
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
                logWarning('Invalid password attempt', { attempt, remainingAttempts, error });
                feedBack.warn(`Invalid password. ${remainingAttempts} attempts left.`);
            } else {
                logError('Max password attempts reached', { attempt, error });
            }
        }
    }

    feedBack.error('Max attempts reached. Operation failed.');
    return null;
}

