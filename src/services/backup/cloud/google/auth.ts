import fs from 'fs/promises';
import { google } from 'googleapis';
import open from 'open';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Grant access to Google Drive

async function getAuthenticatedClient() {
    const credentials = JSON.parse(await fs.readFile('credentials.json', 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log(`Open this URL in your browser:\n${authUrl}`);
    await open(authUrl);

    const code = await askQuestion('Enter the authorization code from the browser: ');
    const token = await auth.getToken(code);
    auth.setCredentials(token.tokens);

    await fs.writeFile('token.json', JSON.stringify(token.tokens, null, 2));
    console.log('✅ Authentication successful! Token saved to token.json');

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
getAuthenticatedClient().catch(console.error);
