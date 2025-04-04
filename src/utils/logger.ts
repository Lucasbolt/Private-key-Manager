import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getLogDir } from './fileUtils';


const LOG_DIR = getLogDir();
const ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (ENV === 'production' ? 'info' : 'debug');
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    ENV === 'production'
        ? winston.format.json() // JSON format for production
        : winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaString = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
              return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
          })
);


const transports = [
    new winston.transports.Console({
        format: ENV === 'production' ? winston.format.simple() : winston.format.colorize(),
    }),
    new DailyRotateFile({
        dirname: LOG_DIR,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '30d',
    }),
];


const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: logFormat,
    transports,
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