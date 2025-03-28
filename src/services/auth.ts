import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import { fileExists, getAuthFilePath } from '@utils/fileUtils';
import { ERROR_MESSAGES } from '@utils/error';
import { logAction, logError } from '@utils/logger';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const SALT_ROUND = 10;

interface AUTH_DATA {
    salt: string,
    passwordHash: string
}

async function hashPassword(password:string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUND)
    return await bcrypt.hash(password, salt)
}

async function verifyHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}

function generateKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

export async function setupMasterPassword(password: string): Promise<void> {
    if (!password) {
        logError('Password is required for setup');
        return Promise.reject(new Error(ERROR_MESSAGES.PASSWORD_REQUIRED));
    }
    if (await fileExists(getAuthFilePath())) {
        logError('Master password setup attempted but key already exists');
        throw new Error(ERROR_MESSAGES.KEY_EXISTS);
    }
    try {
        const passwordHash = await hashPassword(password);
        const salt = crypto.randomBytes(SALT_LENGTH);
        generateKey(password, salt);
        await fs.writeFile(getAuthFilePath(), JSON.stringify({ salt: salt.toString('hex'), passwordHash }));
        logAction('Master password setup successfully');
    } catch (error) {
        logError('Error setting up master password', { error });
        throw error;
    }
}

export async function loadEncryptionKey(password: string): Promise<Buffer> {
    try {
        if (!password) {
            logError('Password is required to load encryption key');
            return Promise.reject(new Error(ERROR_MESSAGES.PASSWORD_REQUIRED));
        }
        if (!await fileExists(getAuthFilePath())) {
            logError('Encryption key file not found');
            throw new Error(ERROR_MESSAGES.KEY_NOT_FOUND);
        }
        const authData: AUTH_DATA = JSON.parse(await fs.readFile(getAuthFilePath(), 'utf-8'));
        const salt = Buffer.from(authData.salt, 'hex');
        const passwordHash = authData.passwordHash;
        const validPassword = await verifyHash(password, passwordHash);
        if (validPassword) {
            const derivedKey = generateKey(password, salt);
            logAction('Encryption key loaded successfully');
            return derivedKey;
        }
        logError('Invalid password provided for encryption key');
        throw new Error(ERROR_MESSAGES.INVALID_PASSWORD);
    } catch (error) {
        logError('Error loading encryption key', { error });
        throw error;
    }
}