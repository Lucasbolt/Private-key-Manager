import path from 'path';

export default {
    AUTH_FILE: 'auth.json',
    LOG_DIR: path.join(process.cwd(), 'logs'),
    DB_DIR: path.join(process.cwd(), 'keys-db')
}