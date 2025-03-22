const express = require('express');
const router = express.Router();
const { getLiFiQuote, getLiFiSwapTransaction, getRoutes, trackTransaction } = require('../services/lifiService');
const { calculateFee, getFeeInfo } = require('../services/contractService');
const { validateAddress, validateAmount, validateChainId } = require('../utils/validators');
const { logError, logInfo } = require('../utils/logger');

/**
 * @route GET /api/swap/quote
 * @description Get a quote for swapping tokens
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @returns {object} Quote information
 */
router.get('/quote', async (req, res, next) => {
  try {
    const { fromToken, toToken, amount, fromChain, toChain } = req.query;
    
    // Validate parameters
    validateAddress(fromToken, 'Invalid fromToken address');
    validateAddress(toToken, 'Invalid toToken address');
    validateAmount(amount, 'Invalid amount');
    validateChainId(fromChain, 'Invalid fromChain');
    
    if (toChain) {
      validateChainId(toChain, 'Invalid toChain');
    }
    
    // Get quote
    const quote = await getLiFiQuote(fromToken, toToken, amount, fromChain, toChain || fromChain);
    
    // Calculate fee
    const feeInfo = await getFeeInfo(fromChain);
    const feeAmount = await calculateFee(fromChain, amount);
    
    // Add fee information to the response
    quote.fee = {
      percentage: feeInfo.feePercentage,
      percentageFormatted: feeInfo.feePercentageFormatted,
      amount: feeAmount,
      token: fromToken
    };
    
    res.json(quote);
  } catch (error) {
    logError('Error in /swap/status', error);
    next(error);
  }
});

/**
 * @route GET /api/swap/fee
 * @description Get fee information for a chain
 * @param {string} chainId - Chain ID
 * @returns {object} Fee information
 */
router.get('/fee', async (req, res, next) => {
  try {
    const { chainId } = req.query;
    
    // Validate parameters
    validateChainId(chainId, 'Invalid chainId');
    
    // Get fee information
    const feeInfo = await getFeeInfo(chainId);
    
    res.json({
      percentage: feeInfo.feePercentage,
      percentageFormatted: feeInfo.feePercentageFormatted
    });
  } catch (error) {
    logError('Error in /swap/fee', error);
    next(error);
  }
});

/**
 * @route POST /api/swap/calculate-fee
 * @description Calculate fee for a specific amount
 * @param {string} chainId - Chain ID
 * @param {string} amount - Amount to calculate fee for
 * @param {string} token - Token address (optional)
 * @returns {object} Fee amount
 */
router.post('/calculate-fee', async (req, res, next) => {
  try {
    const { chainId, amount, token } = req.body;
    
    // Validate parameters
    validateChainId(chainId, 'Invalid chainId');
    validateAmount(amount, 'Invalid amount');
    
    if (token) {
      validateAddress(token, 'Invalid token address');
    }
    
    // Calculate fee
    const feeAmount = await calculateFee(chainId, amount);
    
    res.json({
      amount: feeAmount,
      token: token || 'native'
    });
  } catch (error) {
    logError('Error in /swap/calculate-fee', error);
    next(error);
  }
});

module.exports = router;Error('Error in /swap/quote', error);
    next(error);
  }
});

/**
 * @route POST /api/swap/transaction
 * @description Get transaction data for executing a swap
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @param {string} slippage - Slippage tolerance percentage
 * @param {string} fromAddress - User's wallet address
 * @param {string} toAddress - Recipient address (optional)
 * @returns {object} Transaction data
 */
router.post('/transaction', async (req, res, next) => {
  try {
    const { 
      fromToken, 
      toToken, 
      amount, 
      fromChain, 
      toChain, 
      slippage, 
      fromAddress,
      toAddress
    } = req.body;
    
    // Validate parameters
    validateAddress(fromToken, 'Invalid fromToken address');
    validateAddress(toToken, 'Invalid toToken address');
    validateAmount(amount, 'Invalid amount');
    validateChainId(fromChain, 'Invalid fromChain');
    validateAddress(fromAddress, 'Invalid fromAddress');
    
    if (toChain) {
      validateChainId(toChain, 'Invalid toChain');
    }
    
    if (toAddress) {
      validateAddress(toAddress, 'Invalid toAddress');
    }
    
    // Get transaction data
    const result = await getLiFiSwapTransaction(
      fromToken,
      toToken,
      amount,
      fromChain,
      toChain || fromChain,
      slippage || '1',
      fromAddress,
      toAddress || fromAddress
    );
    
    // Add fee information
    const feeInfo = await getFeeInfo(fromChain);
    const feeAmount = await calculateFee(fromChain, amount);
    
    result.fee = {
      percentage: feeInfo.feePercentage,
      percentageFormatted: feeInfo.feePercentageFormatted,
      amount: feeAmount,
      token: fromToken
    };
    
    res.json(result);
  } catch (error) {
    logError('Error in /swap/transaction', error);
    next(error);
  }
});

/**
 * @route GET /api/swap/routes
 * @description Get available routes for a swap
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @returns {Array} Available routes
 */
router.get('/routes', async (req, res, next) => {
  try {
    const { fromToken, toToken, amount, fromChain, toChain } = req.query;
    
    // Validate parameters
    validateAddress(fromToken, 'Invalid fromToken address');
    validateAddress(toToken, 'Invalid toToken address');
    validateAmount(amount, 'Invalid amount');
    validateChainId(fromChain, 'Invalid fromChain');
    
    if (toChain) {
      validateChainId(toChain, 'Invalid toChain');
    }
    
    // Get routes
    const routes = await getRoutes(fromToken, toToken, amount, fromChain, toChain || fromChain);
    
    res.json(routes);
  } catch (error) {
    logError('Error in /swap/routes', error);
    next(error);
  }
});

/**
 * @route GET /api/swap/status
 * @description Track a transaction status
 * @param {string} txHash - Transaction hash
 * @param {string} chainId - Chain ID
 * @returns {object} Transaction status
 */
router.get('/status', async (req, res, next) => {
  try {
    const { txHash, chainId } = req.query;
    
    // Validate parameters
    if (!txHash) {
      throw new Error('Missing txHash parameter');
    }
    
    validateChainId(chainId, 'Invalid chainId');
    
    // Get status
    const status = await trackTransaction(txHash, chainId);
    
    res.json(status);
  } catch (error) {
    log