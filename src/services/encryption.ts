import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; 

/**
 * Encrypts a private key using AES-256-GCM.
 * @param secret_key The password or key for encryption.
 * @param privateKey The private key to encrypt.
 * @returns A Base64 string containing IV + AuthTag + Encrypted Data.
 */
export function encryptKey(secret_key: string, privateKey: string): string {
    const key = crypto.createHash('sha256').update(secret_key).digest(); // Ensure 32-byte key
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(privateKey, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Concatenate IV + AuthTag + Encrypted and encode in Base64
    return Buffer.from(iv.toString('hex') + authTag + encrypted, 'hex').toString('base64');
}

/**
 * Decrypts an encrypted private key.
 * @param secret_key The password or key for decryption.
 * @param encryptedData The Base64 encoded IV + AuthTag + Encrypted Data.
 * @returns The decrypted private key as a string.
 */
export function decryptKey(secret_key: string, encryptedData: string): string {
    const key = crypto.createHash('sha256').update(secret_key).digest();
    
    // Decode Base64 back to hex
    const rawData = Buffer.from(encryptedData, 'base64').toString('hex');

    // Extract IV, AuthTag, and Encrypted Data
    const iv = Buffer.from(rawData.slice(0, 24), 'hex'); 
    const authTag = Buffer.from(rawData.slice(24, 56), 'hex'); 
    const encrypted = rawData.slice(56); 

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}


export function encryptBackup(secretKey: Buffer, data: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);

    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: cipher.getAuthTag().toString('hex'),
    };
}

/**
 * Decrypts backup data using AES-256-GCM
 */
export function decryptBackup(secretKey: Buffer, encryptedData: { encrypted: string; iv: string; authTag: string }): string {
    if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
        throw new Error('Invalid encrypted data format');
    }
    const { encrypted, iv, authTag } = encryptedData;
    const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}


// const secretKey = crypto.createHash('sha256').update('your-password').digest(); // Ensure consistency
// const testData = 'Hello, backup!';

// const encryptedData = encryptBackup(secretKey, testData);
// console.log('Encrypted:', encryptedData);

// const decryptedData = decryptBackup(secretKey, encryptedData);
// console.log('Decrypted:', decryptedData);