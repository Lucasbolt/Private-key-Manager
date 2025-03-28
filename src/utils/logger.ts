import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getLogDir } from './fileUtils';


const LOG_DIR = getLogDir();


const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
    })
);


const fileTransport = new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m', // Limit individual file size to 10MB
    maxFiles: '30d', // Keep logs for 30 days
});


const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default logging level, configurable via environment variable
    format: logFormat,
    transports: [
        new winston.transports.Console(), // Log to console
        fileTransport, // Log to rotating files
    ],
});

// Function to log important actions
export function logAction(action: string, details?: object) {
    logger.info(`[ACTION] ${action}`, details);
}

// Function to log errors
export function logError(error: string | Error, context?: object) {
    logger.error(`[ERROR] ${error instanceof Error ? error.stack : error}`, context);
}

// Function to log warnings
export function logWarning(warning: string, context?: object) {
    logger.warn(`[WARNING] ${warning}`, context);
}

// Function to log debug messages
export function logDebug(message: string, context?: object) {
    logger.debug(`[DEBUG] ${message}`, context);
}

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
    logger.error(`[UNCAUGHT EXCEPTION] ${error.stack || error}`);
    process.exit(1); 
});

process.on('unhandledRejection', (reason) => {
    logger.error(`[UNHANDLED REJECTION] ${reason}`);
});

export default logger;