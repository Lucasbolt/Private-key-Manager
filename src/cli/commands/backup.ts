
interface BackupOptions {
    provider: string | null
}

export async function selectBackupProvider(): Promise<string | null> {
    const { safePrompt } = await import('@root/src/utils/processHandlers.js');
    const { PROVIDERS } = await import('@services/backup/cloud/remoteBackup.js');

    const providers = Object.keys(PROVIDERS).map((item) => item.toUpperCase().replace(/_/g, ' '));
    providers.push('None (only local backup)');

    const { answer } = await safePrompt([
        {
            type: 'list',
            name: 'answer',
            message: 'Choose a cloud storage option:',
            choices: providers,
            default: 'Google Drive',
        },
    ]);
    if ((answer as string).includes('only local backup')) return null;
    return answer;
}

export async function performBackup(secretKey: string, providerName: string | null): Promise<void> {
    try {
        const { backupKeys } = await import('@services/backup/backup.js');
        const { getProvider, createProviderInstance } = await import('@services/backup/cloud/remoteBackup.js');
        const { cliFeedback: feedBack } = await import('@utils/cliFeedback.js');
        const path = await import('path');

        feedBack.info('Starting the key backup process...');
        const backupLocation = await backupKeys(secretKey);

        if (!providerName) {
            feedBack.success('Backup completed successfully. The backup is stored locally as no cloud provider was selected.');
            return;
        }

        feedBack.success('Local backup completed successfully.');
        feedBack.loading('Connecting to cloud provider...');
        const provider = getProvider(providerName.toLowerCase().replace(' ', '_'));

        if (!provider) {
            throw new Error(`The selected cloud provider "${providerName}" is not supported.`);
        }
        const providerInstance = await createProviderInstance(provider);
        feedBack.info('Uploading the backup to the selected cloud provider...');
        await providerInstance!.uploadBackup(backupLocation, path.basename(backupLocation));
        feedBack.success('Backup successfully uploaded to the cloud.');
    } catch (error) {
        const { cliFeedback: feedBack } = await import('@utils/cliFeedback.js');
        const { cliLogger } = await import('@utils/cliLogger.js');
        feedBack.error('Error occurred during backup process.');
        cliLogger.error('Error during backup process', error as Error);
        throw error;
    }
}

export async function testBackup(options: BackupOptions = { provider: null }): Promise<void> {
  try {
    // Lazy load only when function is called
    const [{ getVerifiedPassword }, { cliFeedback: feedback }] = await Promise.all([
      import("./utils.js"),
      import("@utils/cliFeedback.js"),
    ]);

    const secretKey = await getVerifiedPassword();
    if (!secretKey) {
      feedback.warn("Password verification failed. Aborting backup process.");
      return;
    }

    // If listing backups instead of creating
    if (options.provider) {
      await listBackupFiles(options.provider);
      return;
    }
    const selectedProvider = await selectBackupProvider();

    if (!selectedProvider) {
      feedback.warn("No cloud storage provider selected. Backup will only be stored locally.");
    } else {
      feedback.info(`You selected: ${selectedProvider}`);
    }

    await performBackup(secretKey.toString("hex"), selectedProvider);
  } catch (error) {
    const [{ cliLogger }, { cliFeedback: feedback }] = await Promise.all([
      import("@utils/cliLogger.js"),
      import("@utils/cliFeedback.js"),
    ]);
    feedback.error((error as Error).message);
    cliLogger.error("Backup process failed", error as Error);
    throw error;
  }
}

export async function listBackupFiles(providerName: string | null): Promise<void> {
  try {
    const [
      { getBackupFiles, getCloudBackupFiles },
      { cliFeedback: feedback },
    ] = await Promise.all([
      import("@services/backup/backup.js"),
      import("@utils/cliFeedback.js"),
    ]);

    feedback.loading("Fetching the list of backup files...");

    let files: string[] = [];
    if (!providerName || providerName === "local") {
      files = await getBackupFiles();
      if (files.length === 0) {
        feedback.warn("No backup files found locally.");
        return;
      }
      feedback.list(files, "Available local backup files");
    } else {
      files = await getCloudBackupFiles(providerName);
      if (!files || files.length === 0) {
        feedback.warn(`No backup files found on the selected cloud provider (${providerName}).`);
        return;
      }

      feedback.list(files, `Available backup files on ${providerName}`)
    }

  } catch (error) {
    const [{ cliFeedback: feedback }, { cliLogger }] = await Promise.all([
      import("@utils/cliFeedback.js"),
      import("@utils/cliLogger.js"),
    ]);
    feedback.error("Error occurred while listing backup files.");
    cliLogger.error("Error listing backup files", error as Error);
    return
  }
}
