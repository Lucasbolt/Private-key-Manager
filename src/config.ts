import path from 'path';
import envPaths from 'env-paths';

const paths = envPaths('private-key-manager', { suffix: '' });

const configDir = paths.config;
const dataDir = paths.data
const logDir = paths.log
const tempDir = paths.temp
export default {
    AUTH_FILE: path.join(configDir, 'auth.json'),
    LOG_DIR: logDir,
    TOKEN_FILE: path.join(configDir, 'token.json'),
    DB_DIR: path.join(dataDir, 'database'),
    BACKUP_DIR: path.join(dataDir, 'backup-files'),
    CREDENTIALS_FILE: path.join(configDir, 'credentials.json'),
    TEMP_DIR: tempDir

}