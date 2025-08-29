import fs from "fs/promises";
import crypto from "crypto";
import { listKeys } from "../storage.js";
import { getBackupDir, getBackupFilePath } from "@utils/fileUtils.js";
import { logAction, logError, logWarning } from "@utils/logger.js";
import {
  decryptBackup,
  decryptKey,
  encryptBackup,
  EncryptedBackupData,
  encryptKey,
} from "../encryption.js";
import { compareSalt, generateKey, getAuthSalt } from "../auth.js";
import { dbClient } from "@root/src/db.js";
import { BackupProvider, createProviderInstance, getProvider } from "./cloud/remoteBackup.js";
import { DEFAULT_DIR, RemoteBackupProvider } from "./cloud/lib.js";
import { drive_v3 } from "googleapis";

export const BACKUP_FILE_SUFFIX = ".enc";

/**
 * Backup all keys into encrypted file.
 */
export async function backupKeys(secret_key: string, filePath?: string): Promise<string> {
  try {
    const keys = await listKeys();

    // Parallel fetch all key values
    const keyValues = await Promise.all(keys.map((k) => dbClient.get(k)));
    const backupData: Record<string, string> = {};
    keys.forEach((k, i) => (backupData[k] = keyValues[i]));

    // Avoid pretty-print for speed + size
    const jsonData = JSON.stringify(backupData);

    const secretKeyBuffer = crypto.createHash("sha256").update(secret_key).digest();
    const salt = await getAuthSalt();

    const encryptedData = encryptBackup(secretKeyBuffer, jsonData, salt);
    const backupFile = await getBackupFilePath(filePath);

    await fs.writeFile(backupFile, JSON.stringify(encryptedData), "utf-8");

    logAction("Encrypted backup created successfully", { backupFile });
    return backupFile;
  } catch (error) {
    logError("Error creating backup", { error });
    throw error;
  }
}

/**
 * Restore encrypted keys from backup file.
 */
export async function restoreKeys(secret_key: string, filePath: string, overwrite = false): Promise<void> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const encryptedData: EncryptedBackupData = JSON.parse(fileContent);

    const isPasswordChanged = !(await compareSalt(encryptedData.salt));

    // Lazy-load password util only when needed
    let decryptionKey = secret_key;
    if (isPasswordChanged) {
      const { getPassword } = await import("@root/src/cli/commands/utils.js");
      const oldPassword = await getPassword("Enter password used to backup data");
      decryptionKey = generateKey(oldPassword, Buffer.from(encryptedData.salt, "hex")).toString("hex");
    }

    const secretKeyBuffer = crypto.createHash("sha256").update(decryptionKey).digest();
    const decryptedJson = decryptBackup(secretKeyBuffer, encryptedData);
    const backupData = JSON.parse(decryptedJson);

    if (typeof backupData !== "object" || backupData === null) {
      throw new Error("Invalid backup data format.");
    }

    const ops: { type: "put"; key: string; value: string }[] = [];

    // Run decrypt+re-encrypt in parallel, but with controlled concurrency
    const entries = Object.entries(backupData);
    await Promise.all(
      entries.map(async ([alias, encryptedKey]) => {
        const normalizedAlias = alias.trim().toLowerCase();
        const keyExists = await dbClient.get(normalizedAlias).catch(() => null);

        if (keyExists && !overwrite) {
          logWarning(`Key '${normalizedAlias}' already exists. Skipping.`, { alias: normalizedAlias });
          return;
        }

        let valueToStore: string;
        if (isPasswordChanged) {
          const decryptedData = decryptKey(decryptionKey, encryptedKey as string);
          valueToStore = encryptKey(secret_key, decryptedData);
        } else {
          valueToStore = encryptedKey as string;
        }

        ops.push({ type: "put", key: normalizedAlias, value: valueToStore });
      })
    );

    if (ops.length > 0) {
      await dbClient.batch(ops);
      logAction("Restore completed successfully", { restoredKeys: ops.length });
    } else {
      logWarning("No keys were restored.", {});
    }
  } catch (error) {
    logError("Error restoring keys", { filePath, error });
    throw error;
  }
}

export async function getBackupFiles() {
  try {
    const backupPath = getBackupDir();
    const backupList = await fs.readdir(backupPath);
    if (!backupList) return [];
    return backupList.filter((file) => file.endsWith(BACKUP_FILE_SUFFIX));
  } catch (error) {
    logError("Error reading backup directory");
    throw error;
  }
}


export async function getCloudBackupFiles(providerName: string): Promise<string[]> {
  const provider = getProvider(providerName.toLowerCase().replace(" ", "_"));
  if (!provider) {
    throw new Error(`The selected cloud provider "${providerName}" is not supported.`);
  }

  const providerInstance = await createProviderInstance(provider as BackupProvider);
  if (!providerInstance) {
    logError(`The selected cloud provider "${providerName}" is not supported.`);
    throw new Error(`The selected cloud provider "${providerName}" is not supported.`);
  }


  if (providerInstance.constructor.name === "GoogleDriveBackup") {
    let files;

    try {
      files = await (providerInstance as RemoteBackupProvider).listFilesInDirectory(DEFAULT_DIR, null);
    } catch (error) {
      logError(`Failed to list files from Google Drive: ${error}`);
      throw new Error(`Failed to list files from Google Drive: ${error}`);
    }

    if (!files || files.length === 0) {
      logError(`No backup files found on the selected cloud provider (${providerName}).`);
      return [];
    }

    return (files as drive_v3.Schema$File[])
      .map((file) => file.name)
      .filter((name): name is string => !!name);
  }

  return [];
}
