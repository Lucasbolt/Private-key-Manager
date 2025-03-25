import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib.js';
import { ERROR_MESSAGES } from '@utils/error.js';
import { fileExists } from '@utils/fileUtils.js';
import { getAuthenticatedClient } from './auth.js';

export interface TOKEN {
    access_token: string,
    refresh_token: string,
    scope: string,
    token_type: string,
    refresh_token_expires_in: number,
    expiry_date: number
}

export interface AUTH_CREDENTIALS extends Partial<TOKEN> {
    refresh_token: string
}

const DEFAULT_DIR = 'PRIVATE-KEY-MANAGER'

export class GoogleDriveBackup implements RemoteBackupProvider {
    private auth: any;
    private initializedWithAuth: boolean
    static type: ACCESS_TYPE = 'oauth';

    constructor(credentials: { client_id: string; client_secret: string; redirect_uris: string[] }, authToken: AUTH_CREDENTIALS | null = null) {
        const { client_id, client_secret, redirect_uris } = credentials;
        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        if (authToken) {
            this.auth.setCredentials(authToken);
            this.initializedWithAuth = true;
        } else {
            this.initializedWithAuth = false;
        }
    }

    static async loadCredentials(): Promise<{ client_id: string; client_secret: string; redirect_uris: string[] }> {
        const credentials = JSON.parse(await fsPromises.readFile('credentials.json', 'utf8'));
        return credentials.installed;
    }

    async uploadBackup(filePath: string, remotePath: string): Promise<void> {
        try {
            if (!this.initializedWithAuth) {
                throw new Error (ERROR_MESSAGES.UNINITIALIZED_AUTH)
            }
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderId = await this.createDirectory(DEFAULT_DIR)
            const fileMetadata = {
                name: path.basename(remotePath),
                ...(folderId && {parents: [folderId]})
            };
    
            const media = {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(filePath),
            };
    
            await drive.files.create({
                requestBody: fileMetadata,
                media: media,
            });
    
            console.log(`✅ Backup uploaded to Google Drive: ${remotePath}`);
        } catch (error) {
            throw error
        }
    }

    async downloadBackup(remotePath: string, localPath: string): Promise<void> {
        try {
            if (!this.initializedWithAuth) {
                throw new Error (ERROR_MESSAGES.UNINITIALIZED_AUTH)
            }
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderId = await this.createDirectory(DEFAULT_DIR)
            const response = await drive.files.list({
                q: `name = "${path.basename(remotePath)}" ${folderId ? `and "${folderId}" in parents` : ''}`,
                fields: 'files(id)'
            });
    
            if (!response.data.files || response.data.files.length === 0) {
                throw new Error(`❌ File ${remotePath} not found on Google Drive`);
            }
    
            const fileId = response.data.files[0].id!;
            const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    
            const writeStream = await fsPromises.open(localPath, 'w');
            file.data.pipe(writeStream.createWriteStream());
    
            console.log(`✅ Backup downloaded from Google Drive: ${localPath}`);
        } catch (error) {
            throw error
        }
    }

    async loadAuthToken() {
        const token:TOKEN = JSON.parse(await fsPromises.readFile('token.json', 'utf8'));
        this.auth.setCredentials(token);
        this.auth.on('tokens', async (newTokens: Record<string, any>) => {
            console.log('Tokens refreshed:', newTokens);
            if (newTokens.refresh_token) {
              // Update stored tokens if a new refresh token is issued
              await fsPromises.writeFile('token.json', JSON.stringify(newTokens));
            } else {
              // Update only access token and expiry
              const currentTokens = JSON.parse(await fsPromises.readFile('token.json', 'utf8'));
              await fsPromises.writeFile('token.json', JSON.stringify({ ...currentTokens, ...newTokens }));
            }
          });
        this.initializedWithAuth = true
    }

    initAuth(auth: OAuth2Client) {
        this.auth = auth
        this.initializedWithAuth = true
    }

    async createDirectory (directoryName: string, parentId: string | null = null) {
        try {
            let folderId;

            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderQuery = await drive.files.list({
                q: `name="${directoryName}" and mimeType="application/vnd.google-apps.folder" ${parentId ? `and "${parentId}" in parents` : ''}`,
                fields: 'files(id)',
                spaces: 'drive',
            });

            if (
                folderQuery.data &&
                folderQuery.data.files &&
                folderQuery.data.files.length > 0
            ) {
                folderId = folderQuery.data.files[0].id; // Use existing folder
              } else {
                const folderMetadata = {
                  name: directoryName,
                  mimeType: 'application/vnd.google-apps.folder',
                  ...(parentId && { parents: [parentId] }),
                };
                const folderResponse = await drive.files.create({
                  requestBody: folderMetadata,
                  fields: 'id',
                });
                folderId = folderResponse.data.id;
                console.log(`Created directory: ${directoryName} (ID: ${folderId})`);
              }
            return folderId
        } catch (error) {
            throw error
        }
    }

    async listFilesInDirectory(directoryName:string = DEFAULT_DIR, parentId: string | null = null) {
        try {
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderQuery = await drive.files.list({
                q: `name="${directoryName}" and mimeType="application/vnd.google-apps.folder" ${parentId ? `and "${parentId}" in parents` : ''}`,
                fields: 'files(id)',
                spaces: 'drive',
            });
      
            if (
                !folderQuery.data.files?.length
            ) {
                console.log(`Directory "${directoryName}" not found.`);
                return null; // Directory doesn’t exist
            }
        
            const folderId = folderQuery.data.files[0].id;
        
            // Step 2: List files in the directory
            const fileQuery = await drive.files.list({
                q: `"${folderId}" in parents and mimeType != "application/vnd.google-apps.folder"`, // Exclude subfolders
                fields: 'files(id, name)',
                spaces: 'drive',
            });
        
            const files = fileQuery.data.files;
            if (!files || files.length === 0) {
                console.log(`No files found in "${directoryName}".`);
                return null; // Directory is empty
            }
        
            console.log(`Files in "${directoryName}":`, files);
            return files; // Array of { id, name }
        } catch (error) {
          console.error('Error in listFilesInDirectory:', (error as any).message);
          throw error;
        }
    }
}


export async function createGoogleDriveBackupInstance (
    auth_credentials: AUTH_CREDENTIALS | null = null
) {
    const credentials = await GoogleDriveBackup.loadCredentials()
    if (auth_credentials) {
        
        return new GoogleDriveBackup(credentials, auth_credentials)
    }
    if (await fileExists('token.json')) {
        const instance = new GoogleDriveBackup(credentials)
        await instance.loadAuthToken();
        return instance;
    }

    const auth = await getAuthenticatedClient();
    const instance = new GoogleDriveBackup(credentials)
    instance.initAuth(auth)
    return instance
}
