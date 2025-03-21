const axios = require('axios');
const { ethers } = require('ethers');
const LiFiAdapterABI = require('../abis/LiFiAdapter.json');
const { getAdapter } = require('./contractService');
const { getProviderForChain } = require('./providerService');
const { cacheWithTTL } = require('../utils/cache');
const { logError, logInfo } = require('../utils/logger');

// LI.FI API base URL
const LIFI_API_URL = 'https://li.quest/v1';

// Cache for quotes with 30 second TTL
const quoteCache = cacheWithTTL(30000); // 30 seconds

/**
 * Get a swap quote from LI.FI
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @returns {Promise<object>} Quote information
 */
async function getLiFiQuote(fromToken, toToken, amount, fromChain, toChain = fromChain) {
  try {
    const cacheKey = `${fromToken}-${toToken}-${amount}-${fromChain}-${toChain}`;
    
    // Check cache
    const cachedQuote = quoteCache.get(cacheKey);
    if (cachedQuote) {
      return cachedQuote;
    }
    
    // Prepare request parameters
    const params = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount,
      fromAddress: ethers.constants.AddressZero, // Will be replaced by actual sender
      slippage: 1 // Default 1% slippage
    };
    
    // Make API request
    const response = await axios.get(`${LIFI_API_URL}/quote`, { params });
    
    // Process the response
    const quote = processLiFiResponse(response.data);
    
    // Cache the result
    quoteCache.set(cacheKey, quote);
    
    return quote;
  } catch (error) {
    logError('Error getting LI.FI quote', error);
    throw new Error(`Failed to get quote: ${error.message}`);
  }
}

/**
 * Build transaction data for a swap/bridge
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID
 * @param {string} slippage - Slippage tolerance percentage
 * @param {string} fromAddress - User's wallet address
 * @param {string} toAddress - Recipient address
 * @returns {Promise<object>} Transaction data
 */
async function getLiFiSwapTransaction(
  fromToken,
  toToken,
  amount,
  fromChain,
  toChain,
  slippage,
  fromAddress,
  toAddress
) {
  try {
    // Get adapter contract
    const adapter = getAdapter(fromChain);
    
    // Prepare request parameters for LI.FI
    const params = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount,
      fromAddress,
      toAddress,
      slippage
    };
    
    // Get route from LI.FI API
    const response = await axios.get(`${LIFI_API_URL}/route`, { params });
    const route = response.data;
    
    // Determine if this is a cross-chain transaction
    const isCrossChain = fromChain !== toChain;
    
    // Prepare transaction data
    let txData;
    
    if (isCrossChain) {
      // Bridge transaction
      txData = {
        to: adapter.address,
        data: adapter.interface.encodeFunctionData('executeBridgeWithFee', [
          fromToken,
          amount,
          toChain,
          route.transactionRequest.data
        ]),
        value: fromToken === ethers.constants.AddressZero ? amount : '0',
      };
    } else {
      // Regular swap
      txData = {
        to: adapter.address,
        data: fromToken === ethers.constants.AddressZero
          ? adapter.interface.encodeFunctionData('executeWithFee', [route.transactionRequest.data])
          : adapter.interface.encodeFunctionData('executeWithTokenFee', [
              fromToken,
              amount,
              route.transactionRequest.data
            ]),
        value: fromToken === ethers.constants.AddressZero ? amount : '0',
      };
    }
    
    // Add gas estimate
    txData.gasLimit = ethers.utils.hexlify(3000000); // Safe default, can be estimated more precisely
    
    return {
      txData,
      route: processLiFiResponse(route)
    };
  } catch (error) {
    logError('Error building LI.FI transaction', error);
    throw new Error(`Failed to build transaction: ${error.message}`);
  }
}

/**
 * Process and format LI.FI API response
 * @param {object} response - LI.FI API response
 * @returns {object} Formatted response
 */
function processLiFiResponse(response) {
  // Extract relevant information based on whether it's a quote or route
  if (response.action) {
    // It's a route response
    return {
      id: response.id,
      fromChain: response.fromChainId,
      toChain: response.toChainId,
      fromToken: {
        address: response.fromToken.address,
        symbol: response.fromToken.symbol,
        decimals: response.fromToken.decimals,
        amount: response.fromAmount
      },
      toToken: {
        address: response.toToken.address,
        symbol: response.toToken.symbol,
        decimals: response.toToken.decimals,
        amount: response.toAmount
      },
      steps: response.steps.map(step => ({
        type: step.type,
        tool: step.tool,
        action: step.action,
        estimate: {
          fromAmount: step.estimate?.fromAmount,
          toAmount: step.estimate?.toAmount,
          executionDuration: step.estimate?.executionDuration
        }
      })),
      gasCost: response.gasCost,
      executionTime: response.estimate?.executionTime || 0,
      feeCosts: response.estimate?.feeCosts || []
    };
  } else {
    // It's a quote response
    return {
      id: response.id,
      fromChain: response.fromChainId,
      toChain: response.toChainId,
      fromToken: {
        address: response.fromToken.address,
        symbol: response.fromToken.symbol,
        decimals: response.fromToken.decimals,
        amount: response.fromAmount
      },
      toToken: {
        address: response.toToken.address,
        symbol: response.toToken.symbol,
        decimals: response.toToken.decimals,
        amount: response.toAmount
      },
      routes: response.routes?.map(route => ({
        routeId: route.routeId,
        fromAmount: route.fromAmount,
        toAmount: route.toAmount,
        executionTime: route.executionTime,
        gasCostUSD: route.gasCostUSD,
        steps: route.steps?.map(step => ({
          type: step.type,
          tool: step.tool,
          toolDetails: {
            name: step.toolDetails?.name,
            logoURI: step.toolDetails?.logoURI
          }
        }))
      })) || []
    };
  }
}

/**
 * Get available routes for a swap
 * @param {string} fromToken - Token address to swap from
 * @param {string} toToken - Token address to swap to
 * @param {string} amount - Amount to swap in wei
 * @param {string} fromChain - Source chain ID
 * @param {string} toChain - Destination chain ID (optional)
 * @returns {Promise<Array>} Available routes
 */
async function getRoutes(fromToken, toToken, amount, fromChain, toChain = fromChain) {
  try {
    // Prepare request parameters
    const params = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount,
      fromAddress: ethers.constants.AddressZero, // Will be replaced by actual sender
    };
    
    // Make API request
    const response = await axios.get(`${LIFI_API_URL}/routes`, { params });
    
    // Process the response
    return response.data.routes.map(route => ({
      routeId: route.routeId,
      fromAmount: route.fromAmount,
      toAmount: route.toAmount,
      executionTime: route.executionTime,
      gasCostUSD: route.gasCostUSD,
      steps: route.steps.map(step => ({
        type: step.type,
        tool: step.tool,
        toolDetails: {
          name: step.toolDetails?.name,
          logoURI: step.toolDetails?.logoURI
        }
      }))
    }));
  } catch (error) {
    logError('Error getting LI.FI routes', error);
    throw new Error(`Failed to get routes: ${error.message}`);
  }
}

/**
 * Track a LI.FI transaction
 * @param {string} txHash - Transaction hash
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Transaction status
 */
async function trackTransaction(txHash, chainId) {
  try {
    const response = await axios.get(`${LIFI_API_URL}/status`, {
      params: {
        txHash,
        chainId
      }
    });
    
    return {
      status: response.data.status,
      substatus: response.data.substatus,
      receiving: response.data.receiving,
      sending: response.data.sending,
      timestamp: response.data.timestamp,
      steps: response.data.steps?.map(step => ({
        type: step.type,
        status: step.status,
        tool: step.tool,
        message: step.message
      })) || []
    };
  } catch (error) {
    logError('Error tracking LI.FI transaction', error);
    throw new Error(`Failed to track transaction: ${error.message}`);
  }
}

/**
 * Get gas price for a chain
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Gas price information
 */
async function getGasPrice(chainId) {
  try {
    const provider = getProviderForChain(chainId);
    const gasPrice = await provider.getGasPrice();
    const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
    
    return {
      gasPrice: gasPrice.toString(),
      gasPriceGwei: parseFloat(gasPriceGwei)
    };
  } catch (error) {
    logError('Error getting gas price', error);
    throw new Error(`Failed to get gas price: ${error.message}`);
  }
}

/**
 * Get supported chains from LI.FI
 * @returns {Promise<Array>} Supported chains
 */
async function getSupportedChains() {
  try {
    const response = await axios.get(`${LIFI_API_URL}/chains`);
    return response.data.chains.map(chain => ({
      id: chain.id,
      name: chain.name,
      key: chain.key,
      logoURI: chain.logoURI,
      tokenlistUrl: chain.tokenlistUrl
    }));
  } catch (error) {
    logError('Error getting supported chains', error);
    throw new Error(`Failed to get supported chains: ${error.message}`);
  }
}

/**
 * Get tokens from LI.FI for a specific chain
 * @param {string} chainId - Chain ID
 * @returns {Promise<Array>} Tokens
 */
async function getTokensForChain(chainId) {
  try {
    const response = await axios.get(`${LIFI_API_URL}/tokens`, {
      params: { chains: chainId }
    });
    
    return response.data.tokens[chainId] || [];
  } catch (error) {
    logError('Error getting tokens for chain', error);
    throw new Error(`Failed to get tokens: ${error.message}`);
  }
}

module.exports = {
  getLiFiQuote,
  getLiFiSwapTransaction,
  getRoutes,
  trackTransaction,
  getGasPrice,
  getSupportedChains,
  getTokensForChain
};