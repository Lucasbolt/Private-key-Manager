import crypto from 'crypto';
import { logAction, logError } from '@utils/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; 

export interface EncryptedBackupData {
    encrypted: string;
    iv: string;
    authTag: string;
    salt: string;
}

/**
 * Encrypts a private key using AES-256-GCM.
 * @param secret_key The password or key for encryption.
 * @param privateKey The private key to encrypt.
 * @returns A Base64 string containing IV + AuthTag + Encrypted Data.
 */
export function encryptKey(secret_key: string, privateKey: string): string {
    try {
        const key = crypto.createHash('sha256').update(secret_key).digest(); // Ensure 32-byte key
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(privateKey, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        const result = Buffer.from(iv.toString('hex') + authTag + encrypted, 'hex').toString('base64');
        logAction('Key encrypted successfully');
        return result;
    } catch (error) {
        logError('Error encrypting key', { error });
        throw error;
    }
}

/**
 * Decrypts an encrypted private key.
 * @param secret_key The password or key for decryption.
 * @param encryptedData The Base64 encoded IV + AuthTag + Encrypted Data.
 * @returns The decrypted private key as a string.
 */
export function decryptKey(secret_key: string, encryptedData: string): string {
    try {
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
        logAction('Key decrypted successfully');
        return decrypted;
    } catch (error) {
        logError('Error decrypting key', { error });
        throw error;
    }
}


export function encryptBackup(secretKey: Buffer, data: string, salt: string): EncryptedBackupData {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);

        let encrypted = cipher.update(data, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        const result = {
            encrypted,
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex'),
            salt
        };
        logAction('Backup data encrypted successfully');
        return result;
    } catch (error) {
        logError('Error encrypting backup data', { error });
        throw error;
    }
}



export function decryptBackup(secretKey: Buffer, encryptedData: EncryptedBackupData): string {
    try {
        if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
            throw new Error('Invalid encrypted data format');
        }
        const { encrypted, iv, authTag } = encryptedData;
        const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        logAction('Backup data decrypted successfully');
        return decrypted;
    } catch (error) {
        logError('Error decrypting backup data', { error });
        throw error;
    }
}
