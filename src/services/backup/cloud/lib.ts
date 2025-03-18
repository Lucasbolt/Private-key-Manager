export interface RemoteBackupProvider {
    uploadBackup(filePath: string, remotePath: string): Promise<void>;
    downloadBackup(remotePath: string, localPath: string): Promise<void>;
}

export type ACCESS_TYPE = "oauth" | "access_key"