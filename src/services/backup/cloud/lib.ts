import { drive_v3 } from 'googleapis';
export interface RemoteBackupProvider {
    uploadBackup(filePath: string, remotePath: string): Promise<void>;
    downloadBackup(remotePath: string, localPath: string): Promise<void>;
    listFilesInDirectory(directoryName: string, parentId: string | null): Promise<string[] | drive_v3.Schema$File[] | null >
}

export type ACCESS_TYPE = "oauth" | "access_key";
export const DEFAULT_DIR = 'PRIVATE-KEY-MANAGER';