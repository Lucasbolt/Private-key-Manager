import 'dotenv/config';
import { encryptKey, decryptKey } from '../../src/services/encryption';

describe('Encryption Service', () => {
    const privateKey = 'test-private-key';

    test('encryptKey should return encrypted data', () => {
        const encryptedData = encryptKey(privateKey);
        expect(encryptedData).toHaveProperty('encrypted');
        expect(encryptedData).toHaveProperty('iv');
        expect(encryptedData).toHaveProperty('authTag');
    });

    test('decryptKey should return the original private key', () => {
        const encryptedData = encryptKey(privateKey);
        const decryptedKey = decryptKey(encryptedData);
        expect(decryptedKey).toBe(privateKey);
    });
});
