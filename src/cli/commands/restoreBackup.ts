import { restoreKeys } from "@services/backup/backup.js";
import { getProvider, createProviderInstance } from "@services/backup/cloud/remoteBackup.js";
import { GoogleDriveBackup } from "@services/backup/cloud/google/googlDrive.js";
import path from "path";
import fs from "fs/promises";
import { fileExists, getBackupDir, getTempDir } from "@utils/fileUtils.js";
import { getVerifiedPassword } from "./utils.js";
import { logAction, logError, logWarning } from "@utils/logger.js";
import { cliFeedback as feedback } from "@utils/cliFeedback.js";
import { safePrompt } from "@root/src/utils/processHandlers.js";

const LOCAL_BACKUP_DIR = getBackupDir();
const LOCAL_TEMP_DIR = getTempDir();

interface Options {
  file?: string;
}

/**
 * Prompt user to select a backup file from the local backup directory.
 */
async function selectBackupFileFromLocal(): Promise<string | null> {
  const files = await fs.readdir(LOCAL_BACKUP_DIR).catch(() => []);
  if (files.length === 0) {
    logWarning("No backup files found in the local backup directory");
    feedback.warn("No backup files found in the local backup directory.");
    return null;
  }

  const { selectedFile } = await safePrompt([
    {
      type: "list",
      name: "selectedFile",
      message: "Select a backup file:",
      choices: files,
    },
  ]);

  const backupFilePath = path.join(LOCAL_BACKUP_DIR, selectedFile);
  logAction("Local backup file selected", { backupFilePath });
  return backupFilePath;
}

/**
 * Prompt user to select a backup file from Google Drive and download it locally.
 */
async function selectBackupFileFromGoogleDrive(): Promise<string | null> {
  const provider = getProvider("google_drive");
  if (!provider) {
    logError("Unsupported backup provider");
    feedback.error("Unsupported backup provider.");
    return null;
  }

  const providerInstance = await createProviderInstance(provider);
  if (!(providerInstance instanceof GoogleDriveBackup)) {
    logError("Failed to initialize Google Drive provider");
    feedback.error("Failed to initialize Google Drive provider.");
    return null;
  }

  const remoteFiles = await providerInstance.listFilesInDirectory();
  const fileNames = remoteFiles?.map((f) => f.name).filter((n): n is string => !!n) ?? [];

  if (fileNames.length === 0) {
    logWarning("No backup files found in the cloud backup directory");
    feedback.warn("No backup files found in the cloud backup directory.");
    return null;
  }

  const { selectedRemoteFile } = await safePrompt([
    {
      type: "list",
      name: "selectedRemoteFile",
      message: "Select a backup file from Google Drive:",
      choices: fileNames,
    },
  ]);

  const localTempPath = path.join(LOCAL_TEMP_DIR, selectedRemoteFile);
  await providerInstance.downloadBackup(selectedRemoteFile, localTempPath);

  logAction("Backup file downloaded from Google Drive", { backupFilePath: localTempPath });
  return localTempPath;
}

/**
 * Resolve the backup file path either from CLI option or user prompt.
 */
async function resolveBackupFilePath(option: Options): Promise<string | null> {
  if (option.file) return option.file;

  const { backupLocation } = await safePrompt([
    {
      type: "list",
      name: "backupLocation",
      message: "Where is your backup stored?",
      choices: ["Local File", "Google Drive"],
    },
  ]);

  return backupLocation === "Local File"
    ? await selectBackupFileFromLocal()
    : await selectBackupFileFromGoogleDrive();
}

/**
 * Confirm if existing keys should be overwritten.
 */
async function confirmOverwrite(): Promise<boolean> {
  const { overwrite } = await safePrompt([
    {
      type: "confirm",
      name: "overwrite",
      message: "Do you want to overwrite existing keys if they already exist?",
      default: false,
    },
  ]);
  return overwrite;
}

/**
 * Orchestrates the restore backup process.
 */
export async function restoreBackup(option: Options = {}): Promise<void> {
  try {
    const secretKey = await getVerifiedPassword();
    if (!secretKey) {
      logWarning("Restore process aborted due to failed password verification");
      return;
    }

    logAction("Restore process started");
    feedback.info("Starting the restore process...");

    const backupFilePath = await resolveBackupFilePath(option);
    if (!backupFilePath) return;

    if (!(await fileExists(backupFilePath))) {
      logError("Backup file does not exist.");
      feedback.warn(
        "Backup file path is invalid. Please check for possible file path error and try again."
      );
      return;
    }

    const overwrite = await confirmOverwrite();
    await restoreKeys(secretKey.toString("hex"), backupFilePath, overwrite);

    logAction("Restore process completed successfully");
    feedback.success("Restore process completed successfully.");
  } catch (error) {
    logError("Error during restore process", { error });
    throw error;
  }
}
