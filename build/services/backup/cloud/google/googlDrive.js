"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.GoogleDriveBackup = void 0;
exports.createGoogleDriveBackupInstance = createGoogleDriveBackupInstance;
var googleapis_1 = require("googleapis");
var fs_1 = __importDefault(require("fs"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var error_js_1 = require("@utils/error.js");
var fileUtils_js_1 = require("@utils/fileUtils.js");
var auth_js_1 = require("./auth.js");
var logger_1 = require("@utils/logger");
var DEFAULT_DIR = 'PRIVATE-KEY-MANAGER';
var tokenPath = (0, fileUtils_js_1.getTokenFilePath)();
var credentialsPath = (0, fileUtils_js_1.getCredentialsFilePath)();
var GoogleDriveBackup = /** @class */ (function () {
    function GoogleDriveBackup(credentials, authToken) {
        if (authToken === void 0) { authToken = null; }
        var client_id = credentials.client_id, client_secret = credentials.client_secret, redirect_uris = credentials.redirect_uris;
        this.auth = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        if (authToken) {
            this.auth.setCredentials(authToken);
            this.initializedWithAuth = true;
        }
        else {
            this.initializedWithAuth = false;
        }
    }
    GoogleDriveBackup.loadCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, _a, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, promises_1.default.readFile(credentialsPath, 'utf8')];
                    case 1:
                        credentials = _b.apply(_a, [_c.sent()]);
                        (0, logger_1.logAction)('Google Drive credentials loaded successfully');
                        return [2 /*return*/, credentials.installed];
                    case 2:
                        error_1 = _c.sent();
                        (0, logger_1.logError)('Error loading Google Drive credentials', { error: error_1 });
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.prototype.uploadBackup = function (filePath, remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            var drive, folderId, fileMetadata, media, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.initializedWithAuth) {
                            throw new Error(error_js_1.ERROR_MESSAGES.UNINITIALIZED_AUTH);
                        }
                        drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
                        return [4 /*yield*/, this.createDirectory(DEFAULT_DIR)];
                    case 1:
                        folderId = _a.sent();
                        fileMetadata = __assign({ name: path_1.default.basename(remotePath) }, (folderId && { parents: [folderId] }));
                        media = {
                            mimeType: 'application/octet-stream',
                            body: fs_1.default.createReadStream(filePath),
                        };
                        return [4 /*yield*/, drive.files.create({
                                requestBody: fileMetadata,
                                media: media,
                            })];
                    case 2:
                        _a.sent();
                        (0, logger_1.logAction)('Backup uploaded to Google Drive', { remotePath: remotePath });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        (0, logger_1.logError)('Error uploading backup to Google Drive', { filePath: filePath, remotePath: remotePath, error: error_2 });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.prototype.downloadBackup = function (remotePath, localPath) {
        return __awaiter(this, void 0, void 0, function () {
            var drive, folderId, response, fileId, file, writeStream, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!this.initializedWithAuth) {
                            throw new Error(error_js_1.ERROR_MESSAGES.UNINITIALIZED_AUTH);
                        }
                        drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
                        return [4 /*yield*/, this.createDirectory(DEFAULT_DIR)];
                    case 1:
                        folderId = _a.sent();
                        return [4 /*yield*/, drive.files.list({
                                q: "name = \"".concat(path_1.default.basename(remotePath), "\" ").concat(folderId ? "and \"".concat(folderId, "\" in parents") : ''),
                                fields: 'files(id)',
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.data.files || response.data.files.length === 0) {
                            (0, logger_1.logWarning)("File not found on Google Drive", { remotePath: remotePath });
                            throw new Error("File ".concat(remotePath, " not found on Google Drive"));
                        }
                        fileId = response.data.files[0].id;
                        return [4 /*yield*/, drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' })];
                    case 3:
                        file = _a.sent();
                        return [4 /*yield*/, promises_1.default.open(localPath, 'w')];
                    case 4:
                        writeStream = _a.sent();
                        file.data.pipe(writeStream.createWriteStream());
                        (0, logger_1.logAction)('Backup downloaded from Google Drive', { localPath: localPath });
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        (0, logger_1.logError)('Error downloading backup from Google Drive', { remotePath: remotePath, localPath: localPath, error: error_3 });
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.prototype.loadAuthToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, _a, _b, error_4;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, promises_1.default.readFile(tokenPath, 'utf8')];
                    case 1:
                        token = _b.apply(_a, [_c.sent()]);
                        this.auth.setCredentials(token);
                        this.auth.on('tokens', function (newTokens) { return __awaiter(_this, void 0, void 0, function () {
                            var currentTokens, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!newTokens.refresh_token) return [3 /*break*/, 2];
                                        return [4 /*yield*/, promises_1.default.writeFile(tokenPath, JSON.stringify(newTokens))];
                                    case 1:
                                        _c.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        _b = (_a = JSON).parse;
                                        return [4 /*yield*/, promises_1.default.readFile(tokenPath, 'utf8')];
                                    case 3:
                                        currentTokens = _b.apply(_a, [_c.sent()]);
                                        return [4 /*yield*/, promises_1.default.writeFile(tokenPath, JSON.stringify(__assign(__assign({}, currentTokens), newTokens)))];
                                    case 4:
                                        _c.sent();
                                        _c.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); });
                        this.initializedWithAuth = true;
                        (0, logger_1.logAction)('Google Drive auth token loaded successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _c.sent();
                        (0, logger_1.logError)('Error loading Google Drive auth token', { error: error_4 });
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.prototype.initAuth = function (auth) {
        this.auth = auth;
        this.initializedWithAuth = true;
        (0, logger_1.logAction)('Google Drive auth initialized successfully');
    };
    GoogleDriveBackup.prototype.createDirectory = function (directoryName_1) {
        return __awaiter(this, arguments, void 0, function (directoryName, parentId) {
            var folderId, drive, folderQuery, folderMetadata, folderResponse, error_5;
            if (parentId === void 0) { parentId = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        folderId = void 0;
                        drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
                        return [4 /*yield*/, drive.files.list({
                                q: "name=\"".concat(directoryName, "\" and mimeType=\"application/vnd.google-apps.folder\" ").concat(parentId ? "and \"".concat(parentId, "\" in parents") : ''),
                                fields: 'files(id)',
                                spaces: 'drive',
                            })];
                    case 1:
                        folderQuery = _a.sent();
                        if (!(folderQuery.data && folderQuery.data.files && folderQuery.data.files.length > 0)) return [3 /*break*/, 2];
                        folderId = folderQuery.data.files[0].id; // Use existing folder
                        return [3 /*break*/, 4];
                    case 2:
                        folderMetadata = __assign({ name: directoryName, mimeType: 'application/vnd.google-apps.folder' }, (parentId && { parents: [parentId] }));
                        return [4 /*yield*/, drive.files.create({
                                requestBody: folderMetadata,
                                fields: 'id',
                            })];
                    case 3:
                        folderResponse = _a.sent();
                        folderId = folderResponse.data.id;
                        (0, logger_1.logAction)('Google Drive directory created', { directoryName: directoryName, folderId: folderId });
                        _a.label = 4;
                    case 4: return [2 /*return*/, folderId];
                    case 5:
                        error_5 = _a.sent();
                        (0, logger_1.logError)('Error creating Google Drive directory', { directoryName: directoryName, parentId: parentId, error: error_5 });
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.prototype.listFilesInDirectory = function () {
        return __awaiter(this, arguments, void 0, function (directoryName, parentId) {
            var drive, folderQuery, folderId, fileQuery, files, error_6;
            var _a;
            if (directoryName === void 0) { directoryName = DEFAULT_DIR; }
            if (parentId === void 0) { parentId = null; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
                        return [4 /*yield*/, drive.files.list({
                                q: "name=\"".concat(directoryName, "\" and mimeType=\"application/vnd.google-apps.folder\" ").concat(parentId ? "and \"".concat(parentId, "\" in parents") : ''),
                                fields: 'files(id)',
                                spaces: 'drive',
                            })];
                    case 1:
                        folderQuery = _b.sent();
                        if (!((_a = folderQuery.data.files) === null || _a === void 0 ? void 0 : _a.length)) {
                            (0, logger_1.logWarning)("Directory not found on Google Drive", { directoryName: directoryName });
                            return [2 /*return*/, null]; // Directory doesn’t exist
                        }
                        folderId = folderQuery.data.files[0].id;
                        return [4 /*yield*/, drive.files.list({
                                q: "\"".concat(folderId, "\" in parents and mimeType != \"application/vnd.google-apps.folder\""), // Exclude subfolders
                                fields: 'files(id, name)',
                                spaces: 'drive',
                            })];
                    case 2:
                        fileQuery = _b.sent();
                        files = fileQuery.data.files;
                        if (!files || files.length === 0) {
                            (0, logger_1.logWarning)("No files found in directory", { directoryName: directoryName });
                            return [2 /*return*/, null]; // Directory is empty
                        }
                        (0, logger_1.logAction)('Files listed in Google Drive directory', { directoryName: directoryName, fileCount: files.length });
                        return [2 /*return*/, files]; // Array of { id, name }
                    case 3:
                        error_6 = _b.sent();
                        (0, logger_1.logError)('Error listing files in Google Drive directory', { directoryName: directoryName, parentId: parentId, error: error_6 });
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GoogleDriveBackup.type = 'oauth';
    return GoogleDriveBackup;
}());
exports.GoogleDriveBackup = GoogleDriveBackup;
function createGoogleDriveBackupInstance() {
    return __awaiter(this, arguments, void 0, function (auth_credentials) {
        var credentials, instance_1, instance_2, auth, instance, error_7;
        if (auth_credentials === void 0) { auth_credentials = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, GoogleDriveBackup.loadCredentials()];
                case 1:
                    credentials = _a.sent();
                    if (auth_credentials) {
                        instance_1 = new GoogleDriveBackup(credentials, auth_credentials);
                        (0, logger_1.logAction)('Google Drive backup instance created with provided auth credentials');
                        return [2 /*return*/, instance_1];
                    }
                    return [4 /*yield*/, (0, fileUtils_js_1.fileExists)(tokenPath)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    instance_2 = new GoogleDriveBackup(credentials);
                    return [4 /*yield*/, instance_2.loadAuthToken()];
                case 3:
                    _a.sent();
                    (0, logger_1.logAction)('Google Drive backup instance created with stored auth token');
                    return [2 /*return*/, instance_2];
                case 4: return [4 /*yield*/, (0, auth_js_1.getAuthenticatedClient)()];
                case 5:
                    auth = _a.sent();
                    instance = new GoogleDriveBackup(credentials);
                    instance.initAuth(auth);
                    (0, logger_1.logAction)('Google Drive backup instance created with new authentication');
                    return [2 /*return*/, instance];
                case 6:
                    error_7 = _a.sent();
                    (0, logger_1.logError)('Error creating Google Drive backup instance', { error: error_7 });
                    throw error_7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
