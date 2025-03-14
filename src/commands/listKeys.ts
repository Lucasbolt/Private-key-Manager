import { listKeys } from '../services/storage';

export async function listStoredKeys() {
    const keys = await listKeys();
    console.log(keys.length ? `🔑 Stored Keys: ${keys.join(', ')}` : '🔑 Stored Keys: No keys found.');
}
