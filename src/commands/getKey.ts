import { getKey } from "@services/storage";
import inquirer from 'inquirer';

export async function getKeyCommand() {
    const { alias } = await inquirer.prompt([
        { type: 'input', name: 'alias', message: 'Enter key alias to get:' },
    ]);

    const key = await getKey(alias);
    if (key) {
        console.log(`🔑 Key '${alias}': ${key}`);
    } else {
        console.log(`❌ Key '${alias}' not found.`);
    }
}