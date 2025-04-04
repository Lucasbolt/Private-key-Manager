"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreBackup = restoreBackup;
var inquirer_1 = __importDefault(require("inquirer"));
var backup_1 = require("@services/backup/backup");
var remoteBackup_1 = require("@services/backup/cloud/remoteBackup");
var googlDrive_1 = require("@services/backup/cloud/google/googlDrive");
var path_1 = __importDefault(require("path"));
var promises_1 = __importDefault(require("fs/promises"));
var fileUtils_1 = require("@utils/fileUtils");
var utils_1 = require("./utils");
var logger_1 = require("@utils/logger");
var LOCAL_BACKUP_DIR = (0, fileUtils_1.getBackupDir)();
var LOCAL_TEMP_DIR = (0, fileUtils_1.getTempDir)();
function restoreBackup(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var secretKey, backupFilePath, backupLocation, files, selectedFile, provider, providerInstance, remoteFiles, selectedRemoteFile, localTempPath, overwrite, error_1;
        var optionalBackupPath = _b.optionalBackupPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 13, , 14]);
                    (0, logger_1.logAction)('Restore process started');
                    console.log('Starting the restore process...');
                    return [4 /*yield*/, (0, utils_1.getVerifiedPassword)()];
                case 1:
                    secretKey = _c.sent();
                    if (!secretKey) {
                        (0, logger_1.logWarning)('Restore process aborted due to failed password verification');
                        return [2 /*return*/];
                    }
                    backupFilePath = optionalBackupPath;
                    if (!!optionalBackupPath) return [3 /*break*/, 10];
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'backupLocation',
                                message: 'Where is your backup stored?',
                                choices: ['Local File', 'Google Drive'],
                            },
                        ])];
                case 2:
                    backupLocation = (_c.sent()).backupLocation;
                    if (!(backupLocation === 'Local File')) return [3 /*break*/, 5];
                    return [4 /*yield*/, promises_1.default.readdir(LOCAL_BACKUP_DIR)];
                case 3:
                    files = _c.sent();
                    if (files.length === 0) {
                        (0, logger_1.logWarning)('No backup files found in the local backup directory');
                        console.error('❌ No backup files found in the local backup directory.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'selectedFile',
                                message: 'Select a backup file:',
                                choices: files,
                            },
                        ])];
                case 4:
                    selectedFile = (_c.sent()).selectedFile;
                    backupFilePath = path_1.default.join(LOCAL_BACKUP_DIR, selectedFile);
                    (0, logger_1.logAction)('Local backup file selected', { backupFilePath: backupFilePath });
                    return [3 /*break*/, 10];
                case 5:
                    if (!(backupLocation === 'Google Drive')) return [3 /*break*/, 10];
                    provider = (0, remoteBackup_1.getProvider)('google_drive');
                    if (!provider) {
                        (0, logger_1.logError)('Unsupported backup provider');
                        console.error('❌ Unsupported backup provider.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, remoteBackup_1.createProviderInstance)(provider)];
                case 6:
                    providerInstance = _c.sent();
                    if (!(providerInstance instanceof googlDrive_1.GoogleDriveBackup)) {
                        (0, logger_1.logError)('Failed to initialize Google Drive provider');
                        console.error('❌ Failed to initialize Google Drive provider.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, providerInstance.listFilesInDirectory()];
                case 7:
                    remoteFiles = _c.sent();
                    if (!remoteFiles) {
                        (0, logger_1.logWarning)('No backup files found in the cloud backup directory');
                        console.error('❌ No backup files found in the cloud backup directory.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'selectedRemoteFile',
                                message: 'Select a backup file from Google Drive:',
                                choices: remoteFiles.map(function (content) { return content.name; }).filter(function (name) { return !!name; }),
                            },
                        ])];
                case 8:
                    selectedRemoteFile = (_c.sent()).selectedRemoteFile;
                    localTempPath = path_1.default.join(LOCAL_TEMP_DIR, selectedRemoteFile);
                    return [4 /*yield*/, providerInstance.downloadBackup(selectedRemoteFile, localTempPath)];
                case 9:
                    _c.sent();
                    backupFilePath = localTempPath;
                    (0, logger_1.logAction)('Backup file downloaded from Google Drive', { backupFilePath: backupFilePath });
                    _c.label = 10;
                case 10:
                    if (!backupFilePath) {
                        (0, logger_1.logError)('Backup file path could not be determined');
                        console.error('❌ Backup file path could not be determined.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'confirm',
                                name: 'overwrite',
                                message: 'Do you want to overwrite existing keys if they already exist?',
                                default: false,
                            },
                        ])];
                case 11:
                    overwrite = (_c.sent()).overwrite;
                    return [4 /*yield*/, (0, backup_1.restoreKeys)(secretKey.toString('hex'), backupFilePath, overwrite)];
                case 12:
                    _c.sent();
                    (0, logger_1.logAction)('Restore process completed successfully');
                    console.log('🎉 Restore process completed successfully.');
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _c.sent();
                    (0, logger_1.logError)('Error during restore process', { error: error_1 });
                    throw error_1;
                case 14: return [2 /*return*/];
            }
        });
    });
}
