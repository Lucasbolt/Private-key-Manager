import AWS from 'aws-sdk';
import fs from 'fs/promises';
import { ACCESS_TYPE, RemoteBackupProvider } from '../lib';

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
        const fileData = await fs.readFile(filePath);

        await this.s3
            .upload({
                Bucket: this.bucketName,
                Key: remotePath,
                Body: fileData,
            })
            .promise();

        console.log(`✅ Backup uploaded to S3: ${remotePath}`);
    }

    async downloadBackup(remotePath: string, localPath: string): Promise<void> {
        const file = await this.s3.getObject({ Bucket: this.bucketName, Key: remotePath }).promise();

        if (!file.Body) {
            throw new Error(`❌ File ${remotePath} not found in S3`);
        }

        await fs.writeFile(localPath, Buffer.from(file.Body as Uint8Array));
        console.log(`✅ Backup downloaded from S3: ${localPath}`);
    }
}
