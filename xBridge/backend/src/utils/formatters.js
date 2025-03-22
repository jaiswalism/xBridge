const { ethers } = require('ethers');

/**
 * Format a token amount with proper decimals
 * @param {string|number} amount - Amount in wei/smallest unit
 * @param {number} decimals - Token decimals
 * @param {number} maxDecimals - Maximum decimals to display
 * @param {boolean} addCommas - Whether to add commas for thousands
 * @returns {string} Formatted amount
 */
function formatTokenAmount(amount, decimals = 18, maxDecimals = 6, addCommas = true) {
  if (!amount) return '0';
  
  try {
    // Convert to BigNumber if it's not already
    const bn = ethers.BigNumber.from(amount.toString());
    
    // Format with ethers
    let formatted = ethers.utils.formatUnits(bn, decimals);
    
    // Remove trailing zeros and decimal point if needed
    formatted = formatted.replace(/\.?0+$/, '');
    
    // Apply max decimals
    if (formatted.includes('.')) {
      const parts = formatted.split('.');
      if (parts[1].length > maxDecimals) {
        formatted = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
      }
    }
    
    // Add commas for thousands if requested
    if (addCommas) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

/**
 * Format an address for display (truncated)
 * @param {string} address - Ethereum address
 * @param {number} prefixLength - Length of prefix to keep
 * @param {number} suffixLength - Length of suffix to keep
 * @returns {string} Formatted address
 */
function formatAddress(address, prefixLength = 6, suffixLength = 4) {
  if (!address) return '';
  if (!ethers.utils.isAddress(address)) return address;
  
  const prefix = address.substring(0, prefixLength + 2); // +2 for '0x'
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
}

/**
 * Format price with currency symbol
 * @param {string|number} price - Price value
 * @param {string} currency - Currency symbol
 * @param {number} decimals - Maximum decimals to display
 * @returns {string} Formatted price
 */
function formatPrice(price, currency = ', decimals = 2) {
  if (price === null || price === undefined) return `${currency}0`;
  
  let formattedPrice;
  
  try {
    // Format the number
    formattedPrice = Number(price).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0
    });
    
    // Remove trailing zeros and decimal point if needed
    formattedPrice = formattedPrice.replace(/\.?0+$/, '');
    
    return `${currency}${formattedPrice}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return `${currency}0`;
  }
}

/**
 * Format transaction data for display
 * @param {Object} tx - Transaction data
 * @returns {Object} Formatted transaction data
 */
function formatTransaction(tx) {
  return {
    hash: tx.hash,
    from: formatAddress(tx.from),
    to: formatAddress(tx.to),
    value: tx.value ? formatTokenAmount(tx.value) : '0',
    gas: tx.gasLimit ? tx.gasLimit.toString() : '',
    gasPrice: tx.gasPrice ? formatTokenAmount(tx.gasPrice, 9) : '',
    nonce: tx.nonce,
    data: tx.data && tx.data.length > 66 ? `${tx.data.substring(0, 66)}...` : tx.data
  };
}

/**
 * Format a date in ISO format
 * @param {Date|number|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a percentage value
 * @param {number|string} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimals
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '0%';
  
  try {
    const numValue = Number(value);
    return `${numValue.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '0%';
  }
}

module.exports = {
  formatTokenAmount,
  formatAddress,
  formatPrice,
  formatTransaction,
  formatDate,
  formatPercentage
};