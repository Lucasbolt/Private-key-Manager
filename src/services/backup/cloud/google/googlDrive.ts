import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib';


export class GoogleDriveBackup implements RemoteBackupProvider {
    private auth: any;
    static type: ACCESS_TYPE = 'oauth';

    constructor(authToken: any) {
        this.auth = new google.auth.OAuth2();
        this.auth.setCredentials(authToken);
    }

    async uploadBackup(filePath: string, remotePath: string): Promise<void> {
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
        const token = JSON.parse(await fs.readFile('token.json', 'utf8'));
        this.auth.setCredentials(token);
    }
}
