import { getCredentialsFilePath, getTokenFilePath } from '@utils/fileUtils';
import fs from 'fs/promises';
import { google } from 'googleapis';
import open from 'open';
import readline from 'readline';
import { logAction, logError } from '@utils/logger';

const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Grant access to Google Drive

const credentialsPath = getCredentialsFilePath();
const tokenPath = getTokenFilePath();

export async function getAuthenticatedClient() {
    try {
        const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
        logAction('Google Drive credentials loaded successfully');

        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        auth.on('tokens', async (token) => {
            try {
                if (token.refresh_token) {
                    await fs.writeFile(tokenPath, JSON.stringify(token, null, 2));
                    logAction('Initial token saved to token.json');
                } else {
                    const currentTokens = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
                    await fs.writeFile(tokenPath, JSON.stringify({ ...currentTokens, ...token }, null, 2));
                    logAction('Refreshed token updated in token.json');
                }
            } catch (error) {
                logError('Failed to save tokens', { error });
            }
        });

        const authUrl = auth.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        logAction('Generated Google Drive authentication URL');
        console.log(`Open this URL in your browser:\n${authUrl}`);
        await open(authUrl);

        const code = await askQuestion('Enter the authorization code from the browser: ');

        const token = await auth.getToken(code);
        auth.setCredentials(token.tokens);
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
