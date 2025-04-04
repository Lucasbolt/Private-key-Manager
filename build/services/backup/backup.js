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
exports.backupKeys = backupKeys;
exports.restoreKeys = restoreKeys;
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var crypto_1 = __importDefault(require("crypto"));
var storage_1 = require("../storage");
var fileUtils_1 = require("@utils/fileUtils");
var logger_1 = require("@utils/logger");
var encryption_1 = require("../encryption");
function backupKeys(secret_key, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var backupDir, keys, backupData, _i, keys_1, key, _a, _b, jsonData, secretKeyBuffer, encryptedData, backupFile, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    backupDir = (0, fileUtils_1.getBackupDir)();
                    return [4 /*yield*/, promises_1.default.mkdir(backupDir, { recursive: true })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, storage_1.listKeys)()];
                case 2:
                    keys = _c.sent();
                    backupData = {};
                    _i = 0, keys_1 = keys;
                    _c.label = 3;
                case 3:
                    if (!(_i < keys_1.length)) return [3 /*break*/, 6];
                    key = keys_1[_i];
                    _a = backupData;
                    _b = key;
                    return [4 /*yield*/, (0, storage_1.getDbInstance)().get(key)];
                case 4:
                    _a[_b] = _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    jsonData = JSON.stringify(backupData, null, 2);
                    secretKeyBuffer = crypto_1.default.createHash('sha256').update(secret_key).digest();
                    encryptedData = (0, encryption_1.encryptBackup)(secretKeyBuffer, jsonData);
                    backupFile = filePath || path_1.default.join(backupDir, "backup_".concat(new Date().toISOString(), ".json.enc"));
                    return [4 /*yield*/, promises_1.default.writeFile(backupFile, JSON.stringify(encryptedData, null, 2), 'utf-8')];
                case 7:
                    _c.sent();
                    (0, logger_1.logAction)('Encrypted backup created successfully', { backupFile: backupFile });
                    return [2 /*return*/, backupFile];
                case 8:
                    error_1 = _c.sent();
                    (0, logger_1.logError)('Error creating backup', { error: error_1 });
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function restoreKeys(secret_key_1, filePath_1) {
    return __awaiter(this, arguments, void 0, function (secret_key, filePath, overwrite) {
        var db, encryptedData, _a, _b, secretKeyBuffer, jsonData, backupData, _i, _c, _d, alias, encryptedKey, keyExists, error_2;
        if (overwrite === void 0) { overwrite = false; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    db = (0, storage_1.getDbInstance)();
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 8, , 9]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, promises_1.default.readFile(filePath, 'utf-8')];
                case 2:
                    encryptedData = _b.apply(_a, [_e.sent()]);
                    secretKeyBuffer = crypto_1.default.createHash('sha256').update(secret_key).digest();
                    jsonData = (0, encryption_1.decryptBackup)(secretKeyBuffer, encryptedData);
                    backupData = JSON.parse(jsonData);
                    _i = 0, _c = Object.entries(backupData);
                    _e.label = 3;
                case 3:
                    if (!(_i < _c.length)) return [3 /*break*/, 7];
                    _d = _c[_i], alias = _d[0], encryptedKey = _d[1];
                    return [4 /*yield*/, db.get(alias).catch(function () { return null; })];
                case 4:
                    keyExists = _e.sent();
                    if (keyExists && !overwrite) {
                        (0, logger_1.logWarning)("Key '".concat(alias, "' already exists. Skipping."), { alias: alias });
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, db.put(alias, encryptedKey)];
                case 5:
                    _e.sent();
                    (0, logger_1.logAction)('Key restored successfully', { alias: alias });
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    (0, logger_1.logAction)('Restore process completed successfully');
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _e.sent();
                    (0, logger_1.logError)('Error restoring keys', { filePath: filePath, error: error_2 });
                    throw error_2;
                case 9: return [2 /*return*/];
            }
        });
    });
}
