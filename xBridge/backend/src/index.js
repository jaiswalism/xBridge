const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

// Import configuration
const config = require('./config');

// Import routes
const swapRoutes = require('./routes/swap');
const tokenRoutes = require('./routes/tokens');

// Import utils
const { logError, logInfo, httpLogger } = require('./utils/logger');

// Create Express app
const app = express();
const PORT = config.server.port;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.server.cors)); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined')); // HTTP request logging
app.use(httpLogger); // Custom HTTP request logging

// Register routes
app.use('/api/swap', swapRoutes);
app.use('/api/tokens', tokenRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'xBridge API',
    version: process.env.npm_package_version || '1.0.0',
    supportedChains: Object.keys(config.chains).map(chainId => ({
      id: chainId,
      name: config.chains[chainId].name
    }))
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logError(`API Error: ${req.method} ${req.originalUrl}`, err);
  
  // Format error message
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';
  
  // Send error response
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logInfo(`xBridge API server running on port ${PORT}`);
  logInfo(`Supported chains: ${Object.keys(config.chains).map(id => config.chains[id].name).join(', ')}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  // Graceful shutdown
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Promise Rejection', reason);
});

module.exports = app;