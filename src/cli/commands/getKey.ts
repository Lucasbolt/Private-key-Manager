import { getKey, listKeys } from "@services/storage.js";
import { getVerifiedPassword } from "./utils.js";
import { cliLogger } from '@utils/cliLogger.js';
import { cliFeedback as feedBack } from '@utils/cliFeedback.js';
import { safePrompt } from "@root/src/utils/processHandlers.js";
import chalk from 'chalk';

interface Options {
    alias: string | undefined;
}

export async function getKeyCommand(options: Options = { alias: undefined }) {
    try {
        let alias;
        const secretKey = await getVerifiedPassword();
        if (!secretKey) {
            feedBack.warn('Password verification failed. Aborting operation.');
            return;
        }

        if (!options.alias) {
            const keys = await listKeys();
            if (keys.length < 1) {
                feedBack.warn('No stored keys.');
                return;
            }

            const result = await safePrompt([
                {
                    type: 'list',
                    name: 'alias',
                    message: 'Select key to retrieve',
                    choices: keys,
                },
            ]);
            alias = result.alias;
        } else {
            alias = options.alias;
        }

        const key = await getKey(secretKey.toString(), alias);
        if (key) {
            const maskedKey = `${key.slice(0, 4)}...${key.slice(-4)}`;
            console.log(chalk.bold.underline(`Key Details:`));
            console.log(`${chalk.cyan('Alias:')} ${chalk.green(alias)}`);
            console.log(`${chalk.cyan('Key:')} ${chalk.green(maskedKey)}`);

            const { reveal } = await safePrompt([
                {
                    type: 'confirm',
                    name: 'reveal',
                    message: 'Do you want to reveal the full key?',
                    default: false,
                },
            ]);

            if (reveal) {
                console.log(`${chalk.cyan('Full Key:')} ${chalk.green(key)}`);
            } else {
                feedBack.info('Full key not revealed.');
            }

            feedBack.success(`Key '${alias}' retrieved successfully.`);
        } else {
            feedBack.warn(`Key '${alias}' not found.`);
        }
    } catch (error) {
        cliLogger.error('Error retrieving key', error as Error);
        throw error;
    }
}