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
exports.testBackup = testBackup;
var inquirer_1 = __importDefault(require("inquirer"));
var remoteBackup_1 = require("@services/backup/cloud/remoteBackup");
var cliFeedback_1 = require("@utils/cliFeedback");
var utils_1 = require("./utils");
var backup_1 = require("@services/backup/backup");
var path_1 = __importDefault(require("path"));
var cliLogger_1 = require("@utils/cliLogger");
function selectBackupProvider() {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            type: 'list',
                            name: 'answer',
                            message: 'Choose a cloud storage option:',
                            choices: Object.keys(remoteBackup_1.PROVIDERS).map(function (item) { return item.toUpperCase().replace(/_/g, ' '); }),
                            default: 'Google Drive',
                        },
                    ])];
                case 1:
                    answer = (_a.sent()).answer;
                    return [2 /*return*/, answer];
            }
        });
    });
}
function performBackup(secretKey, providerName) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, providerInstance, backupLocation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    cliFeedback_1.cliFeedback.loading('Retrieving the backup provider...');
                    provider = (0, remoteBackup_1.getProvider)(providerName.toLowerCase().replace(' ', '_'));
                    if (!provider) {
                        throw new Error("Unsupported provider: ".concat(providerName));
                    }
                    return [4 /*yield*/, (0, remoteBackup_1.createProviderInstance)(provider)];
                case 1:
                    providerInstance = _a.sent();
                    cliFeedback_1.cliFeedback.info('Backing up keys...');
                    return [4 /*yield*/, (0, backup_1.backupKeys)(secretKey)];
                case 2:
                    backupLocation = _a.sent();
                    cliFeedback_1.cliFeedback.info('Uploading backup to the cloud...');
                    return [4 /*yield*/, providerInstance.uploadBackup(backupLocation, path_1.default.basename(backupLocation))];
                case 3:
                    _a.sent();
                    cliFeedback_1.cliFeedback.success('Backup process completed successfully.');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    cliFeedback_1.cliFeedback.error('Error occured during backup process.');
                    cliLogger_1.cliLogger.error('Error during backup process', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function testBackup() {
    return __awaiter(this, void 0, void 0, function () {
        var secretKey, selectedProvider, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cliFeedback_1.cliFeedback.loading('Starting the backup process...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, utils_1.getVerifiedPassword)()];
                case 2:
                    secretKey = _a.sent();
                    if (!secretKey) {
                        cliFeedback_1.cliFeedback.warn('Password verification failed. Aborting backup process.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, selectBackupProvider()];
                case 3:
                    selectedProvider = _a.sent();
                    cliFeedback_1.cliFeedback.info("You selected: ".concat(selectedProvider));
                    return [4 /*yield*/, performBackup(secretKey.toString('hex'), selectedProvider)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    // feedBack.error('Error occured during the backup process')
                    cliLogger_1.cliLogger.error('An error occurred during the backup process', error_2);
                    throw error_2;
                case 6: return [2 /*return*/];
            }
        });
    });
}
