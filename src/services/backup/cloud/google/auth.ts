import fs from 'fs/promises';
import { google } from 'googleapis';
import open from 'open';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Grant access to Google Drive

export async function getAuthenticatedClient() {
    const credentials = JSON.parse(await fs.readFile('credentials.json', 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    auth.on('tokens', async (token) => {
        try {
          if (token.refresh_token) {
            // Initial token with refresh_token
            await fs.writeFile('token.json', JSON.stringify(token, null, 2));
            console.log('✅ Initial token saved to token.json');
          } else {
            // Refreshed token (no refresh_token, just access_token)
            const currentTokens = JSON.parse(await fs.readFile('token.json', 'utf8'));
            await fs.writeFile('token.json', JSON.stringify({ ...currentTokens, ...token }, null, 2));
            console.log('✅ Refreshed token updated in token.json');
          }
        } catch (error) {
          console.error('❌ Failed to save tokens:', (error as Error).message);
        }
    });

    const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log(`Open this URL in your browser:\n${authUrl}`);
    await open(authUrl);

    const code = await askQuestion('Enter the authorization code from the browser: ');

    const token = await auth.getToken(code);
    console.log(token)
    auth.setCredentials(token.tokens);

    return auth;
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

// Run authentication
// getAuthenticatedClient().catch(console.error);
