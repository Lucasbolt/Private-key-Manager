import chalk from 'chalk';

class CliFeedback {
    /**
     * Displays a success message to the user.
     * @param nessage The success message to dislay.
     */
    success (message: string): void {
        console.log(chalk.green.bold(`✅ ${message}`));
    }

    /**
     * Displays an informational message to the user.
     * @param message The informatioonal message to display.
     */
    info (message: string): void {
        console.log(chalk.cyan(`i ${message}`));
    }

    /**
     * Displays a warning message to the user.
     * @param message The warning message to display.
     */
    warn (message: string): void {
        console.log(chalk.yellow.bold(`⚠️  ${message}`))
    }

    /**
     * Displays an error message to the user.
     * @param message The error message to display
     */
    error (message: string): void {
        console.log(chalk.red.bold(`❌ ${message}`))
    }

    /**
     * Displays a loading meesage to the user.
     * @param message The loading message to display
     */
    loading (message: string): void {
        console.log(chalk.blue(`🔄 ${message}`))
    }
}

export const cliFeedback = new CliFeedback()