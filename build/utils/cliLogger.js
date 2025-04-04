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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliLogger = void 0;
var chalk_1 = __importDefault(require("chalk"));
var logger_1 = __importDefault(require("./logger"));
var ENV = process.env.NODE_ENV || 'development';
var CliLogger = /** @class */ (function () {
    function CliLogger() {
    }
    CliLogger.prototype.success = function (message, details) {
        if (ENV !== 'production') {
            console.log(chalk_1.default.green("\u2705 ".concat(message)));
        }
        logger_1.default.info("[SUCCESS] ".concat(message), details);
    };
    CliLogger.prototype.info = function (message, details) {
        if (ENV !== 'production') {
            console.log(chalk_1.default.cyan("\u2139\uFE0F  ".concat(message)));
        }
        logger_1.default.info("[INFO] ".concat(message), details);
    };
    CliLogger.prototype.warn = function (message, details) {
        if (ENV !== 'production') {
            console.log(chalk_1.default.yellow("\u26A0\uFE0F  ".concat(message)));
        }
        logger_1.default.warn("[WARNING] ".concat(message), details);
    };
    CliLogger.prototype.error = function (message, error, details) {
        if (ENV !== 'production') {
            console.log(chalk_1.default.red("\u274C ".concat(message)));
        }
        logger_1.default.error("[ERROR] ".concat(message), __assign({ error: error instanceof Error ? error.stack : error }, details));
    };
    CliLogger.prototype.debug = function (message, details) {
        if (ENV !== 'production') {
            console.log(chalk_1.default.gray("[DEBUG] ".concat(message)));
        }
        logger_1.default.debug("[DEBUG] ".concat(message), details);
    };
    return CliLogger;
}());
exports.cliLogger = new CliLogger();
