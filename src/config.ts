import path from 'path';

const baseDir = process.cwd();

export default {
    AUTH_FILE: 'auth.json',
    LOG_DIR: path.join(baseDir, 'logs'),
    DB_DIR: path.join(baseDir, 'database'),
    BACKUP_DIR: path.join(baseDir, 'backup-files')
}