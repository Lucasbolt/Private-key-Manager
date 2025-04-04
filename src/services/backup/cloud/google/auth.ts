import { getCredentialsFilePath, getTokenFilePath } from '@utils/fileUtils';
import fs from 'fs/promises';
import { google } from 'googleapis';
import open from 'open';
import readline from 'readline';
import { logAction, logError } from '@utils/logger';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const credentialsPath = getCredentialsFilePath();
const tokenPath = getTokenFilePath();

async function loadCredentials(): Promise<any> {
    try {
        const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
        logAction('Google Drive credentials loaded successfully');
        return credentials;
    } catch (error) {
        logError('Failed to load Google Drive credentials', { error });
        throw error;
    }
}

async function loadToken(): Promise<any> {
    try {
        const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
        return token;
    } catch (error) {
        // Token file doesn't exist or is invalid
        return null;
    }
}

async function saveToken(token: any): Promise<void> {
    try {
        await fs.writeFile(tokenPath, JSON.stringify(token, null, 2));
        logAction('Token saved to token.json');
    } catch (error) {
        logError('Failed to save token', { error });
    }
}

export async function getAuthenticatedClient(): Promise<any> {
    try {
        const credentials = await loadCredentials();
        const token = await loadToken();

        const { client_id, client_secret } = credentials.installed;
        const auth = new google.auth.OAuth2(client_id, client_secret);

        if (token) {
            auth.setCredentials(token);
        } else {
            const authUrl = auth.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });

            logAction('Generated Google Drive authentication URL');
            console.log(`Open this URL in your browser:\n${authUrl}`);
            await open(authUrl);

            const code = await askQuestion('Enter the authorization code from the browser: ');

            const tokenResponse = await auth.getToken(code);
            auth.setCredentials(tokenResponse.tokens);
            await saveToken(tokenResponse.tokens);
        }

        logAction('Google Drive authentication completed successfully');
        return auth;
    } catch (error) {
        logError('Error during Google Drive authentication', { error });
        throw error;
    }
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}