const { ethers } = require('ethers');
const { getProviderForChain } = require('./providerService');
const LiFiAdapterABI = require('../abis/LiFiAdapter.json');
const FeeCollectorABI = require('../abis/FeeCollector.json');
const TokenRegistryABI = require('../abis/TokenRegistry.json');
const { logError, logInfo } = require('../utils/logger');
const config = require('../config');

// Cache for contract instances
const contractCache = new Map();

/**
 * Get the LiFiAdapter contract instance for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {ethers.Contract} LiFiAdapter contract instance
 */
function getAdapter(chainId) {
  const cacheKey = `adapter-${chainId}`;
  
  if (contractCache.has(cacheKey)) {
    return contractCache.get(cacheKey);
  }
  
  try {
    const provider = getProviderForChain(chainId);
    const adapterAddress = config.contracts[chainId]?.lifiAdapter;
    
    if (!adapterAddress) {
      throw new Error(`No adapter address configured for chain ${chainId}`);
    }
    
    const adapter = new ethers.Contract(adapterAddress, LiFiAdapterABI, provider);
    contractCache.set(cacheKey, adapter);
    
    return adapter;
  } catch (error) {
    logError('Error getting LiFiAdapter contract', error);
    throw new Error(`Failed to get adapter: ${error.message}`);
  }
}

/**
 * Get the FeeCollector contract instance for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {ethers.Contract} FeeCollector contract instance
 */
function getFeeCollector(chainId) {
  const cacheKey = `feeCollector-${chainId}`;
  
  if (contractCache.has(cacheKey)) {
    return contractCache.get(cacheKey);
  }
  
  try {
    const provider = getProviderForChain(chainId);
    const adapter = getAdapter(chainId);
    
    // Get fee collector address from adapter
    const feeCollectorAddress = adapter.feeCollector();
    
    const feeCollector = new ethers.Contract(feeCollectorAddress, FeeCollectorABI, provider);
    contractCache.set(cacheKey, feeCollector);
    
    return feeCollector;
  } catch (error) {
    logError('Error getting FeeCollector contract', error);
    throw new Error(`Failed to get fee collector: ${error.message}`);
  }
}

/**
 * Get the TokenRegistry contract instance for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {ethers.Contract} TokenRegistry contract instance
 */
function getTokenRegistry(chainId) {
  const cacheKey = `tokenRegistry-${chainId}`;
  
  if (contractCache.has(cacheKey)) {
    return contractCache.get(cacheKey);
  }
  
  try {
    const provider = getProviderForChain(chainId);
    const registryAddress = config.contracts[chainId]?.tokenRegistry;
    
    if (!registryAddress) {
      throw new Error(`No token registry address configured for chain ${chainId}`);
    }
    
    const registry = new ethers.Contract(registryAddress, TokenRegistryABI, provider);
    contractCache.set(cacheKey, registry);
    
    return registry;
  } catch (error) {
    logError('Error getting TokenRegistry contract', error);
    throw new Error(`Failed to get token registry: ${error.message}`);
  }
}

/**
 * Get fee information for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Fee information
 */
async function getFeeInfo(chainId) {
  try {
    const feeCollector = getFeeCollector(chainId);
    const feePercentage = await feeCollector.feePercentage();
    
    return {
      feePercentage: feePercentage.toNumber(),
      feePercentageFormatted: feePercentage.toNumber() / 100 // Convert basis points to percentage
    };
  } catch (error) {
    logError('Error getting fee information', error);
    throw new Error(`Failed to get fee info: ${error.message}`);
  }
}

/**
 * Calculate the fee amount for a given amount
 * @param {string} chainId - Chain ID
 * @param {string} amount - Amount to calculate fee for
 * @returns {Promise<string>} Fee amount
 */
async function calculateFee(chainId, amount) {
  try {
    const feeCollector = getFeeCollector(chainId);
    const feeAmount = await feeCollector.calculateFee(amount);
    
    return feeAmount.toString();
  } catch (error) {
    logError('Error calculating fee', error);
    throw new Error(`Failed to calculate fee: ${error.message}`);
  }
}

/**
 * Get registered tokens from TokenRegistry
 * @param {string} chainId - Chain ID
 * @param {boolean} activeOnly - Get only active tokens
 * @returns {Promise<Array>} Tokens
 */
async function getRegisteredTokens(chainId, activeOnly = true) {
  try {
    const registry = getTokenRegistry(chainId);
    const tokenAddresses = activeOnly 
      ? await registry.getActiveTokens()
      : await registry.getTokens();
    
    const tokens = [];
    
    for (const address of tokenAddresses) {
      const info = await registry.getTokenInfo(address);
      
      tokens.push({
        address,
        name: info.name,
        symbol: info.symbol,
        decimals: info.decimals,
        active: info.active,
        logoURI: info.logoURI
      });
    }
    
    return tokens;
  } catch (error) {
    logError('Error getting registered tokens', error);
    throw new Error(`Failed to get tokens: ${error.message}`);
  }
}

/**
 * Get equivalent token on another chain
 * @param {string} chainId - Source chain ID
 * @param {string} destChainId - Destination chain ID
 * @param {string} tokenAddress - Token address on source chain
 * @returns {Promise<string>} Token address on destination chain
 */
async function getEquivalentToken(chainId, destChainId, tokenAddress) {
  try {
    const registry = getTokenRegistry(chainId);
    const destToken = await registry.getChainToken(destChainId, tokenAddress);
    
    return destToken;
  } catch (error) {
    logError('Error getting equivalent token', error);
    throw new Error(`Failed to get equivalent token: ${error.message}`);
  }
}

/**
 * Execute a transaction with a signer
 * @param {string} chainId - Chain ID
 * @param {object} txData - Transaction data
 * @param {ethers.Signer} signer - Signer
 * @returns {Promise<ethers.providers.TransactionResponse>} Transaction response
 */
async function executeTransaction(chainId, txData, signer) {
  try {
    const tx = await signer.sendTransaction(txData);
    logInfo(`Transaction sent: ${tx.hash}`);
    
    return tx;
  } catch (error) {
    logError('Error executing transaction', error);
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Clear the contract cache
 * @param {string} chainId - Chain ID (optional, clears all if not provided)
 */
function clearContractCache(chainId) {
  if (chainId) {
    // Clear specific chain contracts
    contractCache.delete(`adapter-${chainId}`);
    contractCache.delete(`feeCollector-${chainId}`);
    contractCache.delete(`tokenRegistry-${chainId}`);
  } else {
    // Clear all contracts
    contractCache.clear();
  }
}

module.exports = {
  getAdapter,
  getFeeCollector,
  getTokenRegistry,
  getFeeInfo,
  calculateFee,
  getRegisteredTokens,
  getEquivalentToken,
  executeTransaction,
  clearContractCache
};