import { listKeys } from '@services/storage';
import { getVerifiedPassword } from './utils';

export async function listStoredKeys() {
    const verifiedPassword = await getVerifiedPassword()
    if (!verifiedPassword) return
    const keys = await listKeys();
    console.log(keys.length ? `🔑 Stored Keys: ${keys.join(', ')}` : '🔑 Stored Keys: No keys found.');
}
