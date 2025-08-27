/* eslint-disable @typescript-eslint/no-explicit-any */
import inquirer from 'inquirer';
import { cliLogger } from "@utils/cliLogger.js";
import { cliFeedback as feedBack } from "@utils/cliFeedback.js";
import { dbClient } from "../db.js";


export async function handleShutdown(signal: string) {
  feedBack.warn(`Received ${signal}. Shutting down gracefully...`);

  const shutdownTimeout = setTimeout(() => {
    feedBack.error("Force exit due to slow shutdown");
    process.exit(1);
  }, 10000).unref();

  try {
    await dbClient.close();
    feedBack.info("Database closed.");
    clearTimeout(shutdownTimeout);

  } catch (err) {
    cliLogger.error("Error during shutdown", err as Error);
    process.exit(1);
  }
}


export async function safePrompt(questions: any): Promise<any | null> {
  try {
    const answers = await inquirer.prompt(questions);
    return answers;
  } catch (err: any) {
    if (err.isTtyError) {
      cliLogger.error("Prompt couldn't be rendered in the current environment.");
      throw err
    } else {
        await handleShutdown("SIGINT");
        process.exit(0);
    }
    return null;
  }
}
