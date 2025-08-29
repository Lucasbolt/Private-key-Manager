import chalk from 'chalk';

class CliFeedback {
    /**
     * Displays a success message to the user.
     * @param message The success message to display.
     */
    success(message: string): void {
        console.log(chalk.green.bold(`✅ ${message}`));
    }

    /**
     * Displays an informational message to the user.
     * @param message The informational message to display.
     */
    info(message: string): void {
        console.log(chalk.cyan(`ℹ️  ${message}`));
    }

    /**
     * Displays a warning message to the user.
     * @param message The warning message to display.
     */
    warn(message: string): void {
        console.log(chalk.yellow.bold(`⚠️  ${message}`));
    }

    /**
     * Displays an error message to the user.
     * @param message The error message to display.
     */
    error(message: string): void {
        console.log(chalk.red.bold(`❌ ${message}`));
    }

    /**
     * Displays a loading message to the user.
     * @param message The loading message to display.
     */
    loading(message: string): void {
        console.log(chalk.blue(`🔄 ${message}`));
    }

    /**
     * Displays a formatted list of items to the user.
     * @param items The list of items to display.
     * @param title Optional title for the list.
     */
    list(items: string[], title?: string): void {
        if (title) {
            console.log(chalk.bold.underline(title));
        }

        if (items.length === 0) {
            console.log(chalk.yellow('No items found.'));
            return;
        }

        items.forEach((item, index) => {
            console.log(`${chalk.cyan(`${index + 1}.`)} ${chalk.green(item)}`);
        });
    }
}

export const cliFeedback = new CliFeedback();