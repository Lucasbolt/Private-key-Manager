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
exports.getAuthenticatedClient = getAuthenticatedClient;
var fileUtils_1 = require("@utils/fileUtils");
var promises_1 = __importDefault(require("fs/promises"));
var googleapis_1 = require("googleapis");
var open_1 = __importDefault(require("open"));
var readline_1 = __importDefault(require("readline"));
var logger_1 = require("@utils/logger");
var SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Grant access to Google Drive
var credentialsPath = (0, fileUtils_1.getCredentialsFilePath)();
var tokenPath = (0, fileUtils_1.getTokenFilePath)();
function getAuthenticatedClient() {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, _a, _b, _c, client_secret, client_id, redirect_uris, auth, authUrl, code, token, error_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, promises_1.default.readFile(credentialsPath, 'utf8')];
                case 1:
                    credentials = _b.apply(_a, [_d.sent()]);
                    (0, logger_1.logAction)('Google Drive credentials loaded successfully');
                    _c = credentials.installed, client_secret = _c.client_secret, client_id = _c.client_id, redirect_uris = _c.redirect_uris;
                    auth = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
                    auth.on('tokens', function (token) { return __awaiter(_this, void 0, void 0, function () {
                        var currentTokens, _a, _b, error_2;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 6, , 7]);
                                    if (!token.refresh_token) return [3 /*break*/, 2];
                                    return [4 /*yield*/, promises_1.default.writeFile(tokenPath, JSON.stringify(token, null, 2))];
                                case 1:
                                    _c.sent();
                                    (0, logger_1.logAction)('Initial token saved to token.json');
                                    return [3 /*break*/, 5];
                                case 2:
                                    _b = (_a = JSON).parse;
                                    return [4 /*yield*/, promises_1.default.readFile(tokenPath, 'utf8')];
                                case 3:
                                    currentTokens = _b.apply(_a, [_c.sent()]);
                                    return [4 /*yield*/, promises_1.default.writeFile(tokenPath, JSON.stringify(__assign(__assign({}, currentTokens), token), null, 2))];
                                case 4:
                                    _c.sent();
                                    (0, logger_1.logAction)('Refreshed token updated in token.json');
                                    _c.label = 5;
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    error_2 = _c.sent();
                                    (0, logger_1.logError)('Failed to save tokens', { error: error_2 });
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    authUrl = auth.generateAuthUrl({
                        access_type: 'offline',
                        scope: SCOPES,
                    });
                    (0, logger_1.logAction)('Generated Google Drive authentication URL');
                    console.log("Open this URL in your browser:\n".concat(authUrl));
                    return [4 /*yield*/, (0, open_1.default)(authUrl)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, askQuestion('Enter the authorization code from the browser: ')];
                case 3:
                    code = _d.sent();
                    return [4 /*yield*/, auth.getToken(code)];
                case 4:
                    token = _d.sent();
                    auth.setCredentials(token.tokens);
                    (0, logger_1.logAction)('Google Drive authentication completed successfully');
                    return [2 /*return*/, auth];
                case 5:
                    error_1 = _d.sent();
                    (0, logger_1.logError)('Error during Google Drive authentication', { error: error_1 });
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function askQuestion(query) {
    var rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(function (resolve) { return rl.question(query, function (answer) {
        rl.close();
        resolve(answer);
    }); });
}
