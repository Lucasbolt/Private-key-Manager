"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = logAction;
exports.logError = logError;
exports.logWarning = logWarning;
exports.logDebug = logDebug;
var winston_1 = __importDefault(require("winston"));
var winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
var fileUtils_1 = require("./fileUtils");
var LOG_DIR = (0, fileUtils_1.getLogDir)();
var ENV = process.env.NODE_ENV || 'development';
var LOG_LEVEL = process.env.LOG_LEVEL || (ENV === 'production' ? 'info' : 'debug');
var logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), ENV === 'production'
    ? winston_1.default.format.json() // JSON format for production
    : winston_1.default.format.printf(function (_a) {
        var timestamp = _a.timestamp, level = _a.level, message = _a.message, meta = __rest(_a, ["timestamp", "level", "message"]);
        var metaString = Object.keys(meta).length ? " | Meta: ".concat(JSON.stringify(meta)) : '';
        return "[".concat(timestamp, "] ").concat(level.toUpperCase(), ": ").concat(message).concat(metaString);
    }));
var transports = [
    new winston_1.default.transports.Console({
        format: ENV === 'production' ? winston_1.default.format.simple() : winston_1.default.format.colorize(),
    }),
    new winston_daily_rotate_file_1.default({
        dirname: LOG_DIR,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '30d',
    }),
];
var logger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    format: logFormat,
    transports: transports,
});
// Function to log important actions
function logAction(action, details) {
    logger.info("[ACTION] ".concat(action), details);
}
// Function to log errors
function logError(error, context) {
    logger.error("[ERROR] ".concat(error instanceof Error ? error.stack : error), context);
}
// Function to log warnings
function logWarning(warning, context) {
    logger.warn("[WARNING] ".concat(warning), context);
}
// Function to log debug messages
function logDebug(message, context) {
    logger.debug("[DEBUG] ".concat(message), context);
}
// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', function (error) {
    logger.error("[UNCAUGHT EXCEPTION] ".concat(error.stack || error));
    process.exit(1);
});
process.on('unhandledRejection', function (reason) {
    logger.error("[UNHANDLED REJECTION] ".concat(reason));
});
exports.default = logger;
