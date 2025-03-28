import path from 'path';
import envPaths from 'env-paths';

const paths = envPaths('private-key-manager', { suffix: '' });

const dir = [
    paths.config,
    paths.data,
    paths.log,
    paths.temp
]
export const getStoragePath = (fileName: string): string => {
    return path.join(paths.config, fileName);
};

export const ensureStorageDirectory = async (): Promise<void> => {
    const fsPromises = await import('fs/promises');
    try {
        await Promise.all(dir.map((storage) => fsPromises.mkdir(storage, {recursive: true})))
    } catch (error) {
        console.error(`Failed to create storage directory: ${(error as Error).message}`);
        throw error;
    }
};

