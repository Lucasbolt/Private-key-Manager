import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib.js';
import { ERROR_MESSAGES } from '@utils/error.js';
import { fileExists } from '@utils/fileUtils.js';
import { getAuthenticatedClient } from './auth.js';

export interface TOKEN {
    access_toke: string,
    refresh_token: string,
    scope: string,
    token_type: string,
    refresh_token_expires_in: number,
    expiry_date: number
}

export interface AUTH_CREDENTIALS extends Partial<TOKEN> {
    refresh_token: string
}

export class GoogleDriveBackup implements RemoteBackupProvider {
    private auth: any;
    private initializedWithAuth: boolean
    static type: ACCESS_TYPE = 'oauth';

    constructor(authToken: AUTH_CREDENTIALS | null = null) {
        this.auth = new google.auth.OAuth2();
        if (authToken) {
            this.auth.setCredentials(authToken);
            this.initializedWithAuth = true
        } else {
            this.initializedWithAuth = false
        }
    }

    async uploadBackup(filePath: string, remotePath: string): Promise<void> {
        if (!this.initializedWithAuth) {
            throw new Error (ERROR_MESSAGES.UNINITIALIZED_AUTH)
        }
        const drive = google.drive({ version: 'v3', auth: this.auth });

        const fileMetadata = {
            name: path.basename(remotePath),
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: await fs.readFile(filePath),
        };

        await drive.files.create({
            requestBody: fileMetadata,
            media: media,
        });

        console.log(`✅ Backup uploaded to Google Drive: ${remotePath}`);
    }

    async downloadBackup(remotePath: string, localPath: string): Promise<void> {
        if (!this.initializedWithAuth) {
            throw new Error (ERROR_MESSAGES.UNINITIALIZED_AUTH)
        }
        const drive = google.drive({ version: 'v3', auth: this.auth });

        const response = await drive.files.list({
            q: `name = '${path.basename(remotePath)}'`,
        });

        if (!response.data.files || response.data.files.length === 0) {
            throw new Error(`❌ File ${remotePath} not found on Google Drive`);
        }

        const fileId = response.data.files[0].id!;
        const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

        const writeStream = await fs.open(localPath, 'w');
        file.data.pipe(writeStream.createWriteStream());

        console.log(`✅ Backup downloaded from Google Drive: ${localPath}`);
    }

    async loadAuthToken() {
        const token:TOKEN = JSON.parse(await fs.readFile('token.json', 'utf8'));
        this.auth.setCredentials(token);
    }

    initAuth(auth: OAuth2Client) {
        this.auth = auth
    }
}


export async function createGoogleDriveBackupInstance (
    auth_credentials: AUTH_CREDENTIALS | null = null
) {

    if (auth_credentials) {
        return new GoogleDriveBackup(auth_credentials)
    }
    if (await fileExists('token.json')) {
        const instance = new GoogleDriveBackup()
        await instance.loadAuthToken();
        return instance;
    }
    const auth = await getAuthenticatedClient();
    const instance = new GoogleDriveBackup()
    instance.initAuth(auth)
    return instance
}