import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Fetches the latest version of the application from the package.json file.
 * @returns {Promise<string>} The latest version string.
 */
export async function getLatestVersion(): Promise<string> {
    try {
        const fileName = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(fileName)
        const packageJsonPath = path.resolve(__dirname, '../package.json');
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        return packageJson.version;
    } catch (error) {
        console.error('Error fetching the latest version:', error);
        throw new Error('Unable to fetch the latest version.');
    }
}