const express = require('express');
const router = express.Router();
const { getRegisteredTokens, getEquivalentToken } = require('../services/contractService');
const { getTokensForChain } = require('../services/lifiService');
const { validateChainId, validateAddress } = require('../utils/validators');
const { logError } = require('../utils/logger');

/**
 * @route GET /api/tokens
 * @description Get list of supported tokens
 * @param {string} chainId - Chain ID to filter tokens
 * @param {boolean} includeExternal - Whether to include external tokens from LI.FI
 * @returns {Array} List of tokens
 */
router.get('/', async (req, res, next) => {
  try {
    const { chainId, includeExternal } = req.query;
    
    // Validate parameters
    validateChainId(chainId, 'Invalid chainId');
    
    // Get registered tokens
    const registeredTokens = await getRegisteredTokens(chainId);
    
    let tokens = registeredTokens;
    
    // Get external tokens if requested
    if (includeExternal === 'true') {
      try {
        const externalTokens = await getTokensForChain(chainId);
        
        // Create a set of addresses for O(1) lookup
        const registeredAddresses = new Set(registeredTokens.map(token => token.address.toLowerCase()));
        
        // Add external tokens that are not already registered
        for (const token of externalTokens) {
          if (!registeredAddresses.has(token.address.toLowerCase())) {
            tokens.push({
              address: token.address,
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              logoURI: token.logoURI,
              external: true
            });
          }
        }
      } catch (error) {
        // Log but don't fail if we can't get external tokens
        logError('Error getting external tokens', error);
      }
    }
    
    res.json(tokens);
  } catch (error) {
    logError('Error in /tokens', error);
    next(error);
  }
});

/**
 * @route GET /api/tokens/equivalent
 * @description Get equivalent token on another chain
 * @param {string} srcChainId - Source chain ID
 * @param {string} destChainId - Destination chain ID
 * @param {string} tokenAddress - Token address on source chain
 * @returns {object} Equivalent token information
 */
router.get('/equivalent', async (req, res, next) => {
  try {
    const { srcChainId, destChainId, tokenAddress } = req.query;
    
    // Validate parameters
    validateChainId(srcChainId, 'Invalid srcChainId');
    validateChainId(destChainId, 'Invalid destChainId');
    validateAddress(tokenAddress, 'Invalid tokenAddress');
    
    // Get equivalent token
    const equivalentTokenAddress = await getEquivalentToken(srcChainId, destChainId, tokenAddress);
    
    if (!equivalentTokenAddress || equivalentTokenAddress === '0x0000000000000000000000000000000000000000') {
      // No equivalent token found
      return res.json({ found: false });
    }
    
    // Get token information
    try {
      const tokensOnDestChain = await getRegisteredTokens(destChainId);
      const token = tokensOnDestChain.find(t => t.address.toLowerCase() === equivalentTokenAddress.toLowerCase());
      
      if (token) {
        return res.json({
          found: true,
          token: {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.logoURI
          }
        });
      }
    } catch (error) {
      // Log but don't fail
      logError('Error getting token information', error);
    }
    
    // Return just the address if we couldn't get token information
    res.json({
      found: true,
      token: {
        address: equivalentTokenAddress
      }
    });
  } catch (error) {
    logError('Error in /tokens/equivalent', error);
    next(error);
  }
});

/**
 * @route GET /api/tokens/:address
 * @description Get information about a specific token
 * @param {string} address - Token address
 * @param {string} chainId - Chain ID
 * @returns {object} Token information
 */
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { chainId } = req.query;
    
    // Validate parameters
    validateAddress(address, 'Invalid token address');
    validateChainId(chainId, 'Invalid chainId');
    
    // Get token information from registry
    try {
      const tokens = await getRegisteredTokens(chainId, false);
      const token = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      
      if (token) {
        return res.json(token);
      }
    } catch (error) {
      // Log but don't fail
      logError('Error getting token from registry', error);
    }
    
    // If not found in registry, try LI.FI
    try {
      const externalTokens = await getTokensForChain(chainId);
      const token = externalTokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      
      if (token) {
        return res.json({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logoURI: token.logoURI,
          external: true
        });
      }
    } catch (error) {
      // Log but don't fail
      logError('Error getting token from LI.FI', error);
    }
    
    // Token not found
    res.status(404).json({ error: 'Token not found' });
  } catch (error) {
    logError('Error in /tokens/:address', error);
    next(error);
  }
});

module.exports = router;