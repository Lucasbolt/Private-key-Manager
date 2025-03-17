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
