"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptKey = encryptKey;
exports.decryptKey = decryptKey;
exports.encryptBackup = encryptBackup;
exports.decryptBackup = decryptBackup;
var crypto_1 = __importDefault(require("crypto"));
var logger_1 = require("@utils/logger");
var ALGORITHM = 'aes-256-gcm';
var IV_LENGTH = 12;
/**
 * Encrypts a private key using AES-256-GCM.
 * @param secret_key The password or key for encryption.
 * @param privateKey The private key to encrypt.
 * @returns A Base64 string containing IV + AuthTag + Encrypted Data.
 */
function encryptKey(secret_key, privateKey) {
    try {
        var key = crypto_1.default.createHash('sha256').update(secret_key).digest(); // Ensure 32-byte key
        var iv = crypto_1.default.randomBytes(IV_LENGTH);
        var cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        var encrypted = cipher.update(privateKey, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        var authTag = cipher.getAuthTag().toString('hex');
        var result = Buffer.from(iv.toString('hex') + authTag + encrypted, 'hex').toString('base64');
        (0, logger_1.logAction)('Key encrypted successfully');
        return result;
    }
    catch (error) {
        (0, logger_1.logError)('Error encrypting key', { error: error });
        throw error;
    }
}
/**
 * Decrypts an encrypted private key.
 * @param secret_key The password or key for decryption.
 * @param encryptedData The Base64 encoded IV + AuthTag + Encrypted Data.
 * @returns The decrypted private key as a string.
 */
function decryptKey(secret_key, encryptedData) {
    try {
        var key = crypto_1.default.createHash('sha256').update(secret_key).digest();
        // Decode Base64 back to hex
        var rawData = Buffer.from(encryptedData, 'base64').toString('hex');
        // Extract IV, AuthTag, and Encrypted Data
        var iv = Buffer.from(rawData.slice(0, 24), 'hex');
        var authTag = Buffer.from(rawData.slice(24, 56), 'hex');
        var encrypted = rawData.slice(56);
        var decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        var decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        (0, logger_1.logAction)('Key decrypted successfully');
        return decrypted;
    }
    catch (error) {
        (0, logger_1.logError)('Error decrypting key', { error: error });
        throw error;
    }
}
function encryptBackup(secretKey, data) {
    try {
        var iv = crypto_1.default.randomBytes(IV_LENGTH);
        var cipher = crypto_1.default.createCipheriv(ALGORITHM, secretKey, iv);
        var encrypted = cipher.update(data, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        var result = {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex'),
        };
        (0, logger_1.logAction)('Backup data encrypted successfully');
        return result;
    }
    catch (error) {
        (0, logger_1.logError)('Error encrypting backup data', { error: error });
        throw error;
    }
}
/**
 * Decrypts backup data using AES-256-GCM
 */
function decryptBackup(secretKey, encryptedData) {
    try {
        if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
            throw new Error('Invalid encrypted data format');
        }
        var encrypted = encryptedData.encrypted, iv = encryptedData.iv, authTag = encryptedData.authTag;
        var decipher = crypto_1.default.createDecipheriv(ALGORITHM, secretKey, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        var decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        (0, logger_1.logAction)('Backup data decrypted successfully');
        return decrypted;
    }
    catch (error) {
        (0, logger_1.logError)('Error decrypting backup data', { error: error });
        throw error;
    }
}
// const secretKey = crypto.createHash('sha256').update('your-password').digest(); // Ensure consistency
// const testData = 'Hello, backup!';
// const encryptedData = encryptBackup(secretKey, testData);
// console.log('Encrypted:', encryptedData);
// const decryptedData = decryptBackup(secretKey, encryptedData);
// console.log('Decrypted:', decryptedData);
