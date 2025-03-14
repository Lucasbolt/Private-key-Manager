import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import { addKey } from './commands/addKey';
import { listStoredKeys } from './commands/listKeys';
import { removeKey } from './commands/deleteKey';
import { getKeyCommand } from './commands/getKey';

const program = new Command();

program
    .version('1.0.0')
    .description('Private Key Manager CLI');

program
    .command('add')
    .description('Add a new private key')
    .action(addKey);

program
    .command('get')
    .description('Get a stored key')
    .action(getKeyCommand);

program
    .command('list')
    .description('List stored keys')
    .action(listStoredKeys);

program
    .command('delete')
    .description('Delete a stored key')
    .action(removeKey);

program.parse(process.argv);
