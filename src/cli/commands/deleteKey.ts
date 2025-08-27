import { deleteKey, getKey, listKeys } from '@services/storage.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { getVerifiedPassword } from './utils.js';
import { cliLogger } from '@utils/cliLogger.js';
import { safePrompt } from '@root/src/utils/processHandlers.js';

interface Options {
    alias: string | undefined
}
export async function removeKey(option: Options = {alias: undefined}): Promise<void> {
    try {
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn("Password verification failed. Aborting operation.");
            return;
        }

        // Resolve alias (either from options or via prompt)
        const alias = await resolveAlias(option.alias);
        if (!alias) return;

        // Validate existence of key
        const keyExists = await getKey(secretKey.toString(), alias);
        if (!keyExists) {
            feedBack.warn(`Key '${alias}' does not exist.`);
            return;
        }

        // Confirm deletion
        const confirmed = await confirmDeletion(alias);
        if (!confirmed) {
            feedBack.info("Operation cancelled.");
            return;
        }

        // Perform deletion
        await deleteKey(alias);
        feedBack.success(`Key '${alias}' deleted.`);
        cliLogger.success(`Key '${alias}' deleted.`);

    } catch (error) {
        cliLogger.error("Error deleting key", error as Error);
        throw error; // rethrow for upstream handling
    }
}

/** Helper: Resolve alias either from provided option or user prompt */
async function resolveAlias(
    providedAlias: string | undefined
): Promise<string | null> {
    if (providedAlias) return providedAlias;

    const keys = await listKeys();
    if (!keys.length) {
        feedBack.warn("No stored keys.");
        return null;
    }

    const { alias } = await safePrompt([
        {
            type: "list",
            name: "alias",
            message: "Select key to delete",
            choices: keys,
        },
    ]);

    return alias;
}

/** Helper: Confirm deletion with the user */
async function confirmDeletion(alias: string): Promise<boolean> {
    const { confirm } = await safePrompt([
        {
            type: "confirm",
            name: "confirm",
            message: `Are you sure you want to delete the key '${alias}'?`,
            default: false,
        },
    ]);
    return confirm;
}



