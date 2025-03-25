import { getKey } from "@services/storage";
import inquirer from 'inquirer';
import { getVerifiedPassword } from "./utils";

export async function getKeyCommand() {
    try {
        const secretKey = await getVerifiedPassword()
        
        if (!secretKey) return

        const { alias } = await inquirer.prompt([
            { type: 'input', name: 'alias', message: 'Enter key alias to retrieve:' },
        ]);

        const key = await getKey(secretKey.toString(), alias);
        console.log(`🔑 Key '${alias}': ${key}`);
    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
    }
}