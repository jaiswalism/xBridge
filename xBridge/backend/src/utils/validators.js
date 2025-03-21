const { ethers } = require('ethers');
const config = require('../config');

/**
 * Validate an Ethereum address
 * @param {string} address - Address to validate
 * @param {string} errorMessage - Custom error message
 * @throws {Error} If address is invalid
 */
function validateAddress(address, errorMessage = 'Invalid address') {
  if (!address) {
    throw new Error(errorMessage);
  }
  
  try {
    // Special case for zero address which passes ethers.utils.isAddress
    if (address === '0x0000000000000000000000000000000000000000') {
      return; // Zero address is valid in some contexts
    }
    
    if (!ethers.utils.isAddress(address)) {
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error(errorMessage);
  }
}

/**
 * Validate a chain ID
 * @param {string|number} chainId - Chain ID to validate
 * @param {string} errorMessage - Custom error message
 * @throws {Error} If chain ID is invalid
 */
function validateChainId(chainId, errorMessage = 'Invalid chain ID') {
  if (!chainId) {
    throw new Error(errorMessage);
  }
  
  // Convert to string for comparison
  const chainIdStr = chainId.toString();
  
  // Check if chain ID is in our config
  if (!config.chains[chainIdStr]) {
    throw new Error(errorMessage);
  }
}

/**
 * Validate an amount
 * @param {string|number} amount - Amount to validate
 * @param {string} errorMessage - Custom error message
 * @throws {Error} If amount is invalid
 */
function validateAmount(amount, errorMessage = 'Invalid amount') {
  if (!amount) {
    throw new Error(errorMessage);
  }
  
  try {
    // Try to convert to BigNumber
    const bn = ethers.BigNumber.from(amount);
    
    // Check if amount is positive
    if (bn.lte(0)) {
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error(errorMessage);
  }
}

/**
 * Validate a slippage value
 * @param {string|number} slippage - Slippage to validate
 * @param {string} errorMessage - Custom error message
 * @throws {Error} If slippage is invalid
 */
function validateSlippage(slippage, errorMessage = 'Invalid slippage') {
  if (!slippage) {
    throw new Error(errorMessage);
  }
  
  const slippageNum = Number(slippage);
  
  // Check if slippage is a valid number
  if (isNaN(slippageNum)) {
    throw new Error(errorMessage);
  }
  
  // Check if slippage is within reasonable range (0-100%)
  if (slippageNum < 0 || slippageNum > 100) {
    throw new Error(errorMessage);
  }
}

/**
 * Validate all swap parameters
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @throws {Error} If any parameter is invalid
 */
function validateSwapParams(fromToken, toToken, amount, fromChain, toChain) {
  validateAddress(fromToken, 'Invalid fromToken address');
  validateAddress(toToken, 'Invalid toToken address');
  validateAmount(amount, 'Invalid amount');
  validateChainId(fromChain, 'Invalid fromChain');
  
  if (toChain) {
    validateChainId(toChain, 'Invalid toChain');
  }
}

/**
 * Validate transaction parameters
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap
 * @param {string} fromChain - Source chain ID
 * @param {string} fromAddress - User's wallet address
 * @param {string} toChain - Destination chain ID (optional)
 * @param {string} slippage - Slippage tolerance (optional)
 * @param {string} toAddress - Recipient address (optional)
 * @throws {Error} If any parameter is invalid
 */
function validateTransactionParams(
  fromToken,
  toToken,
  amount,
  fromChain,
  fromAddress,
  toChain,
  slippage,
  toAddress
) {
  validateAddress(fromToken, 'Invalid fromToken address');
  validateAddress(toToken, 'Invalid toToken address');
  validateAmount(amount, 'Invalid amount');
  validateChainId(fromChain, 'Invalid fromChain');
  validateAddress(fromAddress, 'Invalid fromAddress');
  
  if (toChain) {
    validateChainId(toChain, 'Invalid toChain');
  }
  
  if (slippage) {
    validateSlippage(slippage, 'Invalid slippage value');
  }
  
  if (toAddress) {
    validateAddress(toAddress, 'Invalid toAddress');
  }
}

module.exports = {
  validateAddress,
  validateChainId,
  validateAmount,
  validateSlippage,
  validateSwapParams,
  validateTransactionParams
};