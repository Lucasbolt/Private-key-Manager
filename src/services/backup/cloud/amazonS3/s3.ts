import AWS from 'aws-sdk';
import fs from 'fs/promises';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib.js';
import { logAction, logError } from '@utils/logger';


export class S3Backup implements RemoteBackupProvider {
    private s3: AWS.S3;
    private bucketName: string;
    static type: ACCESS_TYPE = 'access_key';

    constructor(accessKeyId: string, secretAccessKey: string, region: string, bucketName: string) {
        this.s3 = new AWS.S3({
            accessKeyId,
            secretAccessKey,
            region,
        });
        this.bucketName = bucketName;
    }

    async uploadBackup(filePath: string, remotePath: string): Promise<void> {
        try {
            const fileData = await fs.readFile(filePath);

            await this.s3
                .upload({
                    Bucket: this.bucketName,
                    Key: remotePath,
                    Body: fileData,
                })
                .promise();

            logAction('Backup uploaded to S3', { remotePath, bucketName: this.bucketName });
        } catch (error) {
            logError('Error uploading backup to S3', { filePath, remotePath, bucketName: this.bucketName, error });
            throw error;
        }
    }

    async downloadBackup(remotePath: string, localPath: string): Promise<void> {
        try {
            const file = await this.s3.getObject({ Bucket: this.bucketName, Key: remotePath }).promise();

            if (!file.Body) {
                logError('File not found in S3', { remotePath, bucketName: this.bucketName });
                throw new Error(`File ${remotePath} not found in S3`);
            }

            await fs.writeFile(localPath, Buffer.from(file.Body as Uint8Array));
            logAction('Backup downloaded from S3', { remotePath, localPath, bucketName: this.bucketName });
        } catch (error) {
            logError('Error downloading backup from S3', { remotePath, localPath, bucketName: this.bucketName, error });
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async listFilesInDirectory(directoryName: string, parentId: string | null): Promise<string[] > {
        return []
    }
}
