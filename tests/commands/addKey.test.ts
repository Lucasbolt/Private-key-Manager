import { addKey } from '../../src/commands/addKey';
import { storeKey } from '../../src/services/storage';
import inquirer from 'inquirer';

jest.mock('inquirer');
jest.mock('../../src/services/storage');

describe('addKey', () => {
    it('should prompt for alias and private key and store the key', async () => {
        const mockAlias = 'testAlias';
        const mockPrivateKey = 'testPrivateKey';
        
        (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ alias: mockAlias, privateKey: mockPrivateKey });
        (storeKey as jest.Mock).mockResolvedValue(undefined);

        console.log = jest.fn();

        await addKey();

        expect(inquirer.prompt).toHaveBeenCalledWith([
            { type: 'input', name: 'alias', message: 'Enter key alias:' },
            { type: 'password', name: 'privateKey', message: 'Enter private key:', mask: '*' },
        ]);
        expect(storeKey).toHaveBeenCalledWith(mockAlias, mockPrivateKey);
        expect(console.log).toHaveBeenCalledWith(`✅ Key '${mockAlias}' stored securely.`);
    });
});