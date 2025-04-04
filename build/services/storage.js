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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbInstance = getDbInstance;
exports.storeKey = storeKey;
exports.getKey = getKey;
exports.listKeys = listKeys;
exports.deleteKey = deleteKey;
var level_1 = require("level");
var encryption_1 = require("./encryption");
var fileUtils_1 = require("@utils/fileUtils");
var logger_1 = require("@utils/logger");
var db;
// Get or initialize database instance
function getDbInstance() {
    if (!db) {
        db = new level_1.Level((0, fileUtils_1.getDatabaseDir)(), { valueEncoding: 'json' });
    }
    return db;
}
// Store encrypted key
function storeKey(secret_key, alias, privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        var normalizedAlias, encryptedData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    normalizedAlias = alias.trim().toLowerCase();
                    encryptedData = (0, encryption_1.encryptKey)(secret_key, privateKey);
                    return [4 /*yield*/, getDbInstance().put(normalizedAlias, encryptedData)];
                case 1:
                    _a.sent();
                    (0, logger_1.logAction)('Key stored', { alias: normalizedAlias });
                    return [2 /*return*/];
            }
        });
    });
}
// Retrieve and decrypt key
function getKey(secret_key, alias) {
    return __awaiter(this, void 0, void 0, function () {
        var normalizedAlias, encryptedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    normalizedAlias = alias.trim().toLowerCase();
                    return [4 /*yield*/, getDbInstance().get(normalizedAlias)];
                case 1:
                    encryptedData = _a.sent();
                    if (!encryptedData) {
                        (0, logger_1.logWarning)('Key not found', { alias: normalizedAlias });
                        return [2 /*return*/, null];
                    }
                    (0, logger_1.logAction)('Key retrieved', { alias: normalizedAlias });
                    return [2 /*return*/, (0, encryption_1.decryptKey)(secret_key, encryptedData)];
                case 2:
                    error_1 = _a.sent();
                    (0, logger_1.logError)('Error retrieving key', { alias: alias, error: error_1 });
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
//the frontend should call the authorization functions before calling this
function listKeys() {
    return __awaiter(this, void 0, void 0, function () {
        var keys, _a, _b, _c, key, e_1_1, error_2;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    keys = [];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 14, , 15]);
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 7, 8, 13]);
                    _a = true, _b = __asyncValues(getDbInstance().keys());
                    _g.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    _f = _c.value;
                    _a = false;
                    key = _f;
                    keys.push(key);
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    (0, logger_1.logAction)('Keys listed', { count: keys.length });
                    return [3 /*break*/, 15];
                case 14:
                    error_2 = _g.sent();
                    (0, logger_1.logError)('Error listing keys', { error: error_2 });
                    throw error_2;
                case 15: return [2 /*return*/, keys];
            }
        });
    });
}
//the frontend should call the authorization functions before calling this
function deleteKey(alias) {
    return __awaiter(this, void 0, void 0, function () {
        var normalizedAlias, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    normalizedAlias = alias.trim().toLowerCase();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getDbInstance().del(normalizedAlias)];
                case 2:
                    _a.sent();
                    (0, logger_1.logAction)('Key deleted', { alias: normalizedAlias });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    (0, logger_1.logError)('Error deleting key', { alias: normalizedAlias, error: error_3 });
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
