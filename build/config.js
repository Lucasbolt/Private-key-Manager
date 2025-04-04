"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var env_paths_1 = __importDefault(require("env-paths"));
var paths = (0, env_paths_1.default)('private-key-manager', { suffix: '' });
var configDir = paths.config;
var dataDir = paths.data;
var logDir = paths.log;
var tempDir = paths.temp;
exports.default = {
    AUTH_FILE: path_1.default.join(configDir, 'auth.json'),
    LOG_DIR: logDir,
    TOKEN_FILE: path_1.default.join(configDir, 'token.json'),
    DB_DIR: path_1.default.join(dataDir, 'database'),
    BACKUP_DIR: path_1.default.join(dataDir, 'backup-files'),
    CREDENTIALS_FILE: path_1.default.join(configDir, 'credentials.json'),
    TEMP_DIR: tempDir
};
