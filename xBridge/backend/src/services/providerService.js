const { ethers } = require('ethers');
const config = require('../config');
const { logError, logInfo, logWarning } = require('../utils/logger');

// Cache for providers
const providerCache = new Map();

/**
 * Get provider for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {ethers.providers.Provider} Provider instance
 */
function getProviderForChain(chainId) {
  if (providerCache.has(chainId)) {
    return providerCache.get(chainId);
  }
  
  try {
    const chainConfig = config.chains[chainId];
    
    if (!chainConfig) {
      throw new Error(`No configuration found for chain ${chainId}`);
    }
    
    // Use the first RPC URL from the list
    const rpcUrl = chainConfig.rpcUrls[0];
    
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ${chainId}`);
    }
    
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // Setup listeners for provider
    setupProviderListeners(provider, chainId);
    
    // Cache the provider
    providerCache.set(chainId, provider);
    
    return provider;
  } catch (error) {
    logError(`Error creating provider for chain ${chainId}`, error);
    throw new Error(`Failed to get provider: ${error.message}`);
  }
}

/**
 * Setup event listeners for provider
 * @param {ethers.providers.Provider} provider - Provider instance
 * @param {string} chainId - Chain ID
 */
function setupProviderListeners(provider, chainId) {
  provider.on('error', (error) => {
    logError(`Provider error for chain ${chainId}`, error);
    // Try to reconnect
    reconnectProvider(chainId);
  });
  
  provider.on('disconnect', (error) => {
    logWarning(`Provider disconnected for chain ${chainId}`, error);
    // Try to reconnect
    reconnectProvider(chainId);
  });
}

/**
 * Reconnect a provider
 * @param {string} chainId - Chain ID
 */
function reconnectProvider(chainId) {
  try {
    const chainConfig = config.chains[chainId];
    
    if (!chainConfig) {
      throw new Error(`No configuration found for chain ${chainId}`);
    }
    
    // Get the next RPC URL (round-robin)
    const currentProvider = providerCache.get(chainId);
    const currentUrl = currentProvider?.connection?.url;
    const rpcUrls = chainConfig.rpcUrls;
    
    let nextUrlIndex = 0;
    
    if (currentUrl) {
      const currentIndex = rpcUrls.indexOf(currentUrl);
      nextUrlIndex = (currentIndex + 1) % rpcUrls.length;
    }
    
    const nextUrl = rpcUrls[nextUrlIndex];
    
    if (!nextUrl) {
      throw new Error(`No alternative RPC URL available for chain ${chainId}`);
    }
    
    // Create new provider
    const provider = new ethers.providers.JsonRpcProvider(nextUrl);
    
    // Setup listeners
    setupProviderListeners(provider, chainId);
    
    // Update cache
    providerCache.set(chainId, provider);
    
    logInfo(`Provider reconnected for chain ${chainId} using ${nextUrl}`);
    
    return provider;
  } catch (error) {
    logError(`Error reconnecting provider for chain ${chainId}`, error);
    throw new Error(`Failed to reconnect provider: ${error.message}`);
  }
}

/**
 * Get all configured providers
 * @returns {Object} Map of chainId to provider
 */
function getAllProviders() {
  const providers = {};
  
  for (const chainId in config.chains) {
    try {
      providers[chainId] = getProviderForChain(chainId);
    } catch (error) {
      logError(`Error getting provider for chain ${chainId}`, error);
    }
  }
  
  return providers;
}

/**
 * Clear provider cache
 * @param {string} chainId - Chain ID (optional, clears all if not provided)
 */
function clearProviderCache(chainId) {
  if (chainId) {
    providerCache.delete(chainId);
  } else {
    providerCache.clear();
  }
}

/**
 * Check if a provider is connected
 * @param {string} chainId - Chain ID
 * @returns {Promise<boolean>} True if connected
 */
async function isProviderConnected(chainId) {
  try {
    const provider = getProviderForChain(chainId);
    await provider.getBlockNumber();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getProviderForChain,
  getAllProviders,
  clearProviderCache,
  isProviderConnected,
  reconnectProvider
};