import crypto from 'crypto';
import bcrypt from 'bcrypt'
import fs from 'fs/promises';
import path from 'path';
import config from 'config';
import { fileExists } from '@utils/fileUtils';
import { ERROR_MESSAGES } from '@utils/error';
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
        return Promise.reject(new Error(ERROR_MESSAGES.PASSWORD_REQUIRED));

    }
    if (await fileExists(config.AUTH_FILE)) {
        throw new Error(ERROR_MESSAGES.KEY_EXISTS);
    }
    const passwordHash = await hashPassword(password)
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = generateKey(password, salt);
    return await fs.writeFile(config.AUTH_FILE, JSON.stringify({ salt: salt.toString('hex'), passwordHash }));
}

export async function loadEncryptionKey(password: string,):Promise<Buffer> {
    try {
        if (!password) {
            return Promise.reject(new Error(ERROR_MESSAGES.PASSWORD_REQUIRED));
        }
        if (!await fileExists(config.AUTH_FILE)) {
            throw new Error(ERROR_MESSAGES.KEY_NOT_FOUND);
        }
        const authData: AUTH_DATA = JSON.parse(await fs.readFile(config.AUTH_FILE, 'utf-8'));
    
        const salt = Buffer.from(authData.salt, 'hex');
        const passwordHash = authData.passwordHash
        const validPassword = await verifyHash(password, passwordHash)
        if (validPassword) {
            const derivedKey = generateKey(password, salt);
            return derivedKey;
        }
        throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)
    } catch (error) {
        throw error
    }
}