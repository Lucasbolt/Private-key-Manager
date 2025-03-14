import { Level } from 'level';
import { 
    storeKey,
    getKey,
    listKeys,
    deleteKey
 } from "../../src/services/storage";

import { encryptKey, decryptKey } from "../../src/services/encryption";

jest.mock('level');
const db = {
    put: jest.fn((key, value) => Promise.resolve()),
    get: jest.fn((key) => Promise.resolve('')),
    keys: jest.fn().mockReturnValue([]),
    del: jest.fn()
};


jest.mock('../../src/services/encryption', () => ({
    encryptKey: jest.fn((key) => `encrypted-${key}`),
    decryptKey: jest.fn((encrypted) => encrypted.replace('encrypted-', '')),
}));

(Level as unknown as jest.Mock).mockImplementation(() => db);

describe('Storage Service', () => {

    const alias = 'testAlias';
    const privateKey = 'testPrivateKey';
    const encryptedData = 'encrypted-testPrivateKey';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('storeKey should store the key', async () => {

        await storeKey(alias, privateKey);
        expect(encryptKey).toHaveBeenCalledWith(privateKey);
        expect(db.put).toHaveBeenCalledWith(alias.toLocaleLowerCase(), JSON.stringify(encryptedData));
    });

    test('getKey should get the key', async () => {
        
        db.get.mockResolvedValue(encryptedData);
        (decryptKey as jest.Mock).mockReturnValue(privateKey);
        
        const key = await getKey(alias);
        expect(db.get).toHaveBeenCalledWith(alias.toLocaleLowerCase());
        expect(db.get(alias.toLocaleLowerCase())).resolves.toBe(encryptedData);
        expect(decryptKey as jest.Mock).toHaveBeenCalledWith(encryptedData);
        expect(key).toBe(privateKey);
    });

    test('getKey should return null if key is not found', async () => {
        db.get.mockRejectedValue(new Error('Key not found'));
        const key = await getKey(alias);
        expect(key).toBeNull();
    });

    test('listKeys should return a list of keys', async () => {
        const keys = await listKeys();
        expect(db.keys).toHaveBeenCalled();
        expect(keys).toEqual([]);
    })

    test('deleteKey should delete the key', async () => {
        await deleteKey(alias);
        expect(db.del).toHaveBeenCalledWith(alias);
    });
});