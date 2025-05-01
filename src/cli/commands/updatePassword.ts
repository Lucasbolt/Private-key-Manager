import { loadEncryptionKey, setupMasterPassword } from "@root/src/services/auth.js";
import { getPassword, getVerifiedPassword } from "./utils.js";
import { cliLogger } from "@root/src/utils/cliLogger.js";
import { cliFeedback as feedBack } from "@root/src/utils/cliFeedback.js";
import { getKey, listKeysPaginated, storeKey } from "@root/src/services/storage.js";


async function confirmNewPassword(attempts: number): Promise<string | null> {
    let count = attempts;

    while (count > 0) {
        const np1 = await getPassword('Enter new password');
        const np2 = await getPassword('Confirm password');

        if (np1 !== np2) {
            feedBack.warn(`Passwords do not match. You have ${count - 1} attempts left.`);
            count--;
            continue;
        }

        return np1; 
    }

    feedBack.error('Maximum attempts reached. Password change failed.');
    return null;
}


export async function updatePassword () {
    try {
       const currentSecretKey = (await getVerifiedPassword())?.toString()
       if (!currentSecretKey) {
        feedBack.error('Password verification failed. Aborting operation')
        return
       }
       const newPassword = await confirmNewPassword(3)
       if (!newPassword) {
        feedBack.error('Maximum attempts reached. Password change failed.')
        return
       }
       feedBack.info('Updating master password...')
       await setupMasterPassword(newPassword, true)
       feedBack.success('Master password updated.')
       feedBack.info('Generating new encryption key...')
       const newSecret = (await loadEncryptionKey(newPassword)).toString()
       feedBack.loading('Re-encrypting stored keys with new encryption key')

       const pageSize = 100;
       let cursor: string | null = null;
       let totalProcessed = 0;

       do {
        const { keys, nextCursor } = await listKeysPaginated(cursor, pageSize);

        await Promise.all(keys.map(async (key) => {
            const data = await getKey(currentSecretKey.toString(), key);
            if (data) {
              await storeKey(newSecret, key, data as string);
            }
          }));

        totalProcessed += keys.length;
        feedBack.info(`Re-encrypted ${totalProcessed} keys so far...`);
        cursor = nextCursor;
    } while (cursor);

    feedBack.success(`Data encryption completed. Password updated successfully. Total keys processed: ${totalProcessed}`);
    } catch (error) {
        feedBack.error('Error occured while updating password')
        cliLogger.error(`Error updating password`, (error as Error))
        throw error
    }
}