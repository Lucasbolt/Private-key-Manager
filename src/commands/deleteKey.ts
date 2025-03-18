import { deleteKey } from '@services/storage';
import inquirer from 'inquirer';

export async function removeKey() {
    const { alias } = await inquirer.prompt([
        { type: 'input', name: 'alias', message: 'Enter key alias to delete:' },
    ]);
    
    await deleteKey(alias);
    console.log(`❌ Key '${alias}' deleted.`);
}
