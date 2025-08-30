import { cliFeedback as feedback } from "@utils/cliFeedback.js";
import { cliLogger } from "@utils/cliLogger.js";
import { restoreKeys } from "@services/backup/backup.js";
import { fileExists, getBackupDir } from "@utils/fileUtils.js";
import { safePrompt } from "@utils/processHandlers.js";
import path from "path";
import fs from "fs/promises";
import { EncryptedBackupData } from "@root/src/services/encryption.js";

interface ImportBackupOptions {
    filePath: string | null
}

/**
 * Prompt user to select a backup file if none is provided.
 */
async function selectBackupFile(): Promise<string | null> {
  const backupDir = getBackupDir();

  let files: string[];
  try {
    files = await fs.readdir(backupDir);
  } catch {
    feedback.error("Backup directory not found.");
    return null;
  }

  if (files.length === 0) {
    feedback.warn("No backup files found in the backup directory.");
    return null;
  }

  const { selectedFile } = await safePrompt([
    {
      type: "list",
      name: "selectedFile",
      message: "Select a backup file to import:",
      choices: files,
    },
  ]);

  return path.join(backupDir, selectedFile);
}

/**
 * Validate that the file exists and has the correct extension.
 */
async function validateBackupFilePath(filePath: string): Promise<boolean> {
  if (!(await fileExists(filePath))) {
    feedback.error("The specified backup file does not exist.");
    return false;
  }

  if (!filePath.endsWith(".enc")) {
    feedback.error("Invalid file format. Backup files must have a .enc extension.");
    return false;
  }

  return true;
}

/**
 * Read and validate the contents of a backup file.
 */
async function parseAndValidateBackupFile(filePath: string): Promise<EncryptedBackupData | null> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const parsedContent = JSON.parse(fileContent);

    if (
      typeof parsedContent !== "object" ||
      parsedContent === null ||
      !("encrypted" in parsedContent) ||
      !("salt" in parsedContent) ||
      !("authTag" in parsedContent)
    ) {
      feedback.error("The backup file is missing required fields (encryptedData, salt).");
      return null;
    }

    return parsedContent;
  } catch {
    feedback.error("The backup file is corrupted or not valid JSON.");
    return null;
  }
}

/**
 * Prompt user to confirm overwriting existing keys.
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
 * Main entry point for importing a backup file.
 */
export async function importBackupCommand(options: ImportBackupOptions = {filePath: null}): Promise<void> {
  feedback.info("Starting the import backup process...");

  try {
    let { filePath } = options
    if (!filePath) {
      filePath = await selectBackupFile();
      if (!filePath) return; 
    }

    if (!(await validateBackupFilePath(filePath))) return;

    const parsedContent = await parseAndValidateBackupFile(filePath);
    if (!parsedContent) return;

    const overwrite = await confirmOverwrite();

    await restoreKeys(parsedContent.encrypted, filePath, overwrite);

    feedback.success("Backup file imported successfully.");
  } catch (error) {
    feedback.error("An error occurred during the import backup process.");
    cliLogger.error("Error during import backup process", error as Error);
    throw error;
  }
}
