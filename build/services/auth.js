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
exports.setupMasterPassword = setupMasterPassword;
exports.loadEncryptionKey = loadEncryptionKey;
var crypto_1 = __importDefault(require("crypto"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var promises_1 = __importDefault(require("fs/promises"));
var fileUtils_1 = require("@utils/fileUtils");
var error_1 = require("@utils/error");
var logger_1 = require("@utils/logger");
// const ALGORITHM = 'aes-256-gcm';
var SALT_LENGTH = 16;
var KEY_LENGTH = 32;
var ITERATIONS = 100000;
var SALT_ROUND = 10;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcrypt_1.default.genSalt(SALT_ROUND)];
                case 1:
                    salt = _a.sent();
                    return [4 /*yield*/, bcrypt_1.default.hash(password, salt)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function verifyHash(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcrypt_1.default.compare(password, hash)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function generateKey(password, salt) {
    return crypto_1.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}
function setupMasterPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, salt, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!password) {
                        (0, logger_1.logError)('Password is required for setup');
                        return [2 /*return*/, Promise.reject(new Error(error_1.ERROR_MESSAGES.PASSWORD_REQUIRED))];
                    }
                    return [4 /*yield*/, (0, fileUtils_1.fileExists)((0, fileUtils_1.getAuthFilePath)())];
                case 1:
                    if (_a.sent()) {
                        (0, logger_1.logError)('Master password setup attempted but key already exists');
                        throw new Error(error_1.ERROR_MESSAGES.KEY_EXISTS);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, hashPassword(password)];
                case 3:
                    passwordHash = _a.sent();
                    salt = crypto_1.default.randomBytes(SALT_LENGTH);
                    generateKey(password, salt);
                    return [4 /*yield*/, promises_1.default.writeFile((0, fileUtils_1.getAuthFilePath)(), JSON.stringify({ salt: salt.toString('hex'), passwordHash: passwordHash }))];
                case 4:
                    _a.sent();
                    (0, logger_1.logAction)('Master password setup successfully');
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    (0, logger_1.logError)('Error setting up master password', { error: error_2 });
                    throw error_2;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function loadEncryptionKey(password) {
    return __awaiter(this, void 0, void 0, function () {
        var authData, _a, _b, salt, passwordHash, validPassword, derivedKey, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    if (!password) {
                        (0, logger_1.logError)('Password is required to load encryption key');
                        return [2 /*return*/, Promise.reject(new Error(error_1.ERROR_MESSAGES.PASSWORD_REQUIRED))];
                    }
                    return [4 /*yield*/, (0, fileUtils_1.fileExists)((0, fileUtils_1.getAuthFilePath)())];
                case 1:
                    if (!(_c.sent())) {
                        (0, logger_1.logError)('Encryption key file not found');
                        throw new Error(error_1.ERROR_MESSAGES.KEY_NOT_FOUND);
                    }
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, promises_1.default.readFile((0, fileUtils_1.getAuthFilePath)(), 'utf-8')];
                case 2:
                    authData = _b.apply(_a, [_c.sent()]);
                    salt = Buffer.from(authData.salt, 'hex');
                    passwordHash = authData.passwordHash;
                    return [4 /*yield*/, verifyHash(password, passwordHash)];
                case 3:
                    validPassword = _c.sent();
                    if (validPassword) {
                        derivedKey = generateKey(password, salt);
                        (0, logger_1.logAction)('Encryption key loaded successfully');
                        return [2 /*return*/, derivedKey];
                    }
                    (0, logger_1.logError)('Invalid password provided for encryption key');
                    throw new Error(error_1.ERROR_MESSAGES.INVALID_PASSWORD);
                case 4:
                    error_3 = _c.sent();
                    (0, logger_1.logError)('Error loading encryption key', { error: error_3 });
                    throw error_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
