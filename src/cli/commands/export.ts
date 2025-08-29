import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { getVerifiedPassword } from './utils.js';
import { backupKeys } from '@services/backup/backup.js';
import path from 'path';
import { cliLogger } from '@utils/cliLogger.js';
import { genBackupFileName } from '@root/src/utils/fileUtils.js';


interface ExportOptions {
    outputFile: string
}
export async function exportKeysCommand(options: ExportOptions): Promise<void> {
    try {
        const fileName  = options.outputFile ?? genBackupFileName()
        feedBack.info('Starting the key export process...');

        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting export process.');
            return;
        }
    
        const exportLocation = await backupKeys(secretKey.toString('hex'), fileName);
        feedBack.success(`Keys exported successfully to: ${path.resolve(exportLocation)}`);
    } catch (error) {
        feedBack.error('Error occurred during the export process.');
        cliLogger.error('Error during export process', error as Error);
        throw error;
    }
}