import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getLogDir } from './fileUtils';

// Define log file location
const LOG_DIR = getLogDir() //path.join(process.cwd(), 'logs');

// Log format: Include timestamp, log level, and message
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

// Create a rotating file transport (daily rotation)
const fileTransport = new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m', // Limit individual file size to 10MB
    maxFiles: '30d', // Keep logs for 14 days
});

// Create the Winston logger instance
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: logFormat,
    transports: [
        new winston.transports.Console(), // Log to console
        fileTransport, // Log to rotating files
    ],
});

// Function to log important actions
export function logAction(action: string, details?: object) {
    logger.info(`[ACTION] ${action} ${details ? JSON.stringify(details) : ''}`);
}

// Function to log errors
export function logError(error: string | Error) {
    logger.error(`[ERROR] ${error instanceof Error ? error.stack : error}`);
}

export default logger;
