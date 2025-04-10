import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib.js';
import { ERROR_MESSAGES } from '@utils/error.js';
import { fileExists, getCredentialsFilePath, getTokenFilePath } from '@utils/fileUtils.js';
import { getAuthenticatedClient } from './auth.js';
import { logAction, logError, logWarning } from '@utils/logger';

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

const DEFAULT_DIR = 'PRIVATE-KEY-MANAGER';
const remoteFileLink = 'https://drive.google.com/uc?export=download&id=1YdX8MBXNgqoamf2pXq7EdXbWZte3PcSq'
const tokenPath = getTokenFilePath();
const credentialsPath = getCredentialsFilePath();

export class GoogleDriveBackup implements RemoteBackupProvider {
    private auth: any;
    private initializedWithAuth: boolean;
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
    static async fetchRemoteCredentials(): Promise<void> {
        try {
            const response = await axios.get(remoteFileLink, { responseType: 'stream' });
            const writeStream = await fsPromises.open(credentialsPath, 'w');
            response.data.pipe(writeStream.createWriteStream());
            await new Promise((resolve, reject) => {
                response.data.on('end', resolve);
                response.data.on('error', reject);
            });
            logAction('Google Drive credentials file downloaded successfully');
        } catch (error) {
            logError('Error fetching Google Drive credentials file', { error });
            throw error;
        }
    }

    static async loadCredentials(): Promise<{ client_id: string; client_secret: string; redirect_uris: string[] }> {
        try {
            if (!(await fileExists(credentialsPath))) {
                logAction('Credentials file not found locally. Fetching from remote link...');
                await this.fetchRemoteCredentials();
            }
            const credentials = JSON.parse(await fsPromises.readFile(credentialsPath, 'utf8'));
            logAction('Google Drive credentials loaded successfully');
            return credentials.installed;
        } catch (error) {
            logError('Error loading Google Drive credentials', { error });
            throw error;
        }
    }

    async uploadBackup(filePath: string, remotePath: string): Promise<void> {
        try {
            if (!this.initializedWithAuth) {
                throw new Error(ERROR_MESSAGES.UNINITIALIZED_AUTH);
            }
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderId = await this.createDirectory(DEFAULT_DIR);
            const fileMetadata = {
                name: path.basename(remotePath),
                ...(folderId && { parents: [folderId] }),
            };

            const media = {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(filePath),
            };

            await drive.files.create({
                requestBody: fileMetadata,
                media: media,
            });

            logAction('Backup uploaded to Google Drive', { remotePath });
        } catch (error) {
            logError('Error uploading backup to Google Drive', { filePath, remotePath, error });
            throw error;
        }
    }

    async downloadBackup(remotePath: string, localPath: string): Promise<void> {
        try {
            if (!this.initializedWithAuth) {
                throw new Error(ERROR_MESSAGES.UNINITIALIZED_AUTH);
            }
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderId = await this.createDirectory(DEFAULT_DIR);
            const response = await drive.files.list({
                q: `name = "${path.basename(remotePath)}" ${folderId ? `and "${folderId}" in parents` : ''}`,
                fields: 'files(id)',
            });

            if (!response.data.files || response.data.files.length === 0) {
                logWarning(`File not found on Google Drive`, { remotePath });
                throw new Error(`File ${remotePath} not found on Google Drive`);
            }

            const fileId = response.data.files[0].id!;
            const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

            const writeStream = await fsPromises.open(localPath, 'w');
            file.data.pipe(writeStream.createWriteStream());

            logAction('Backup downloaded from Google Drive', { localPath });
        } catch (error) {
            logError('Error downloading backup from Google Drive', { remotePath, localPath, error });
            throw error;
        }
    }

    async loadAuthToken() {
        try {
            const token: TOKEN = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));
            this.auth.setCredentials(token);
            this.auth.on('tokens', async (newTokens: Record<string, any>) => {
                if (newTokens.refresh_token) {
                    await fsPromises.writeFile(tokenPath, JSON.stringify(newTokens));
                } else {
                    const currentTokens = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));
                    await fsPromises.writeFile(tokenPath, JSON.stringify({ ...currentTokens, ...newTokens }));
                }
            });
            this.initializedWithAuth = true;
            logAction('Google Drive auth token loaded successfully');
        } catch (error) {
            logError('Error loading Google Drive auth token', { error });
            throw error;
        }
    }

    initAuth(auth: OAuth2Client) {
        this.auth = auth;
        this.initializedWithAuth = true;
        logAction('Google Drive auth initialized successfully');
    }

    async createDirectory(directoryName: string, parentId: string | null = null) {
        try {
            let folderId;

            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderQuery = await drive.files.list({
                q: `name="${directoryName}" and mimeType="application/vnd.google-apps.folder" ${parentId ? `and "${parentId}" in parents` : ''}`,
                fields: 'files(id)',
                spaces: 'drive',
            });

            if (folderQuery.data && folderQuery.data.files && folderQuery.data.files.length > 0) {
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
                logAction('Google Drive directory created', { directoryName, folderId });
            }
            return folderId;
        } catch (error) {
            logError('Error creating Google Drive directory', { directoryName, parentId, error });
            throw error;
        }
    }

    async listFilesInDirectory(directoryName: string = DEFAULT_DIR, parentId: string | null = null) {
        try {
            const drive = google.drive({ version: 'v3', auth: this.auth });
            const folderQuery = await drive.files.list({
                q: `name="${directoryName}" and mimeType="application/vnd.google-apps.folder" ${parentId ? `and "${parentId}" in parents` : ''}`,
                fields: 'files(id)',
                spaces: 'drive',
            });

            if (!folderQuery.data.files?.length) {
                logWarning(`Directory not found on Google Drive`, { directoryName });
                return null; // Directory doesn’t exist
            }

            const folderId = folderQuery.data.files[0].id;

            const fileQuery = await drive.files.list({
                q: `"${folderId}" in parents and mimeType != "application/vnd.google-apps.folder"`, // Exclude subfolders
                fields: 'files(id, name)',
                spaces: 'drive',
            });

            const files = fileQuery.data.files;
            if (!files || files.length === 0) {
                logWarning(`No files found in directory`, { directoryName });
                return null; // Directory is empty
            }

            logAction('Files listed in Google Drive directory', { directoryName, fileCount: files.length });
            return files; // Array of { id, name }
        } catch (error) {
            logError('Error listing files in Google Drive directory', { directoryName, parentId, error });
            throw error;
        }
    }
}

export async function createGoogleDriveBackupInstance(
    auth_credentials: AUTH_CREDENTIALS | null = null
) {
    try {
        const credentials = await GoogleDriveBackup.loadCredentials();
        if (auth_credentials) {
            const instance = new GoogleDriveBackup(credentials, auth_credentials);
            logAction('Google Drive backup instance created with provided auth credentials');
            return instance;
        }
        if (await fileExists(tokenPath)) {
            const instance = new GoogleDriveBackup(credentials);
            await instance.loadAuthToken();
            logAction('Google Drive backup instance created with stored auth token');
            return instance;
        }

        const auth = await getAuthenticatedClient();
        const instance = new GoogleDriveBackup(credentials);
        instance.initAuth(auth);
        logAction('Google Drive backup instance created with new authentication');
        return instance;
    } catch (error) {
        logError('Error creating Google Drive backup instance', { error });
        throw error;
    }
}
