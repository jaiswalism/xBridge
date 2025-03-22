const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Tell winston that we want to use the colors
winston.addColors(colors);

// Create the logger format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log'
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports
});

/**
 * Log an information message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function logInfo(message, meta) {
  logger.info(message + (meta ? `: ${JSON.stringify(meta)}` : ''));
}

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function logWarning(message, meta) {
  logger.warn(message + (meta ? `: ${JSON.stringify(meta)}` : ''));
}

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or metadata
 */
function logError(message, error) {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
    logger.debug(error.stack);
  } else if (error) {
    logger.error(`${message}: ${JSON.stringify(error)}`);
  } else {
    logger.error(message);
  }
}

/**
 * Log HTTP request information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function httpLogger(req, res, next) {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
}

/**
 * Log transaction information
 * @param {string} txHash - Transaction hash
 * @param {string} chainId - Chain ID
 * @param {Object} data - Transaction data
 */
function logTransaction(txHash, chainId, data) {
  logger.info(`Transaction ${txHash} on chain ${chainId}: ${JSON.stringify(data)}`);
}

module.exports = {
  logInfo,
  logWarning,
  logError,
  httpLogger,
  logTransaction
};