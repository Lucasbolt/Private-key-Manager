import chalk from 'chalk';
import logger from './logger.js';

const verbose = () => process.env.LOG_VERBOSE === 'true' ? true : false;

class CliLogger {
    success(message: string, details?: object) {
        if (verbose()) {
            console.log(chalk.green(`✅ ${message}`));
        }
        logger.info(`[SUCCESS] ${message}`, details);
    }

    info(message: string, details?: object) {
        if (verbose()) {
            console.log(chalk.cyan(`ℹ️  ${message}`));
        }
        logger.info(`[INFO] ${message}`, details);
    }

    warn(message: string, details?: object) {
        if (verbose()) {
            console.log(chalk.yellow(`⚠️  ${message}`));
        }
        logger.warn(`[WARNING] ${message}`, details);
    }

    error(message: string, error?: Error | string, details?: object) {
        if (verbose()) {
            console.log(chalk.red(`❌ ${message}`));
        }
        logger.error(`[ERROR] ${message}`, {
            error: error instanceof Error ? error.stack : error,
            ...details,
        });
    }

    debug(message: string, details?: object) {
        if (verbose()) {
            console.log(chalk.gray(`[DEBUG] ${message}`));
        }
        logger.debug(`[DEBUG] ${message}`, details);
    }
}

export const cliLogger = new CliLogger();