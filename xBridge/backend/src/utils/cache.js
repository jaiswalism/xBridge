/**
 * Create a cache with time-to-live functionality
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Object} Cache object
 */
function cacheWithTTL(ttl) {
    const cache = new Map();
    
    return {
      /**
       * Set a value in the cache
       * @param {string} key - Cache key
       * @param {*} value - Value to cache
       */
      set(key, value) {
        const now = Date.now();
        cache.set(key, {
          value,
          expiry: now + ttl
        });
      },
      
      /**
       * Get a value from the cache
       * @param {string} key - Cache key
       * @returns {*} Cached value or undefined if expired/not found
       */
      get(key) {
        const entry = cache.get(key);
        
        if (!entry) {
          return undefined;
        }
        
        const now = Date.now();
        
        if (now > entry.expiry) {
          // Expired, remove from cache
          cache.delete(key);
          return undefined;
        }
        
        return entry.value;
      },
      
      /**
       * Delete a value from the cache
       * @param {string} key - Cache key
       */
      delete(key) {
        cache.delete(key);
      },
      
      /**
       * Clear all entries from the cache
       */
      clear() {
        cache.clear();
      },
      
      /**
       * Get cache statistics
       * @returns {Object} Cache statistics
       */
      getStats() {
        const now = Date.now();
        let total = 0;
        let expired = 0;
        
        cache.forEach((entry) => {
          total++;
          if (now > entry.expiry) {
            expired++;
          }
        });
        
        return {
          total,
          expired,
          active: total - expired,
          memoryUsage: approximateMemoryUsage()
        };
      }
    };
  }
  
  /**
   * Create a cache with size limit
   * @param {number} maxSize - Maximum number of entries
   * @returns {Object} Cache object
   */
  function cacheLRU(maxSize) {
    const cache = new Map();
    const accessOrder = [];
    
    return {
      /**
       * Set a value in the cache
       * @param {string} key - Cache key
       * @param {*} value - Value to cache
       */
      set(key, value) {
        // Remove key from access order if it exists
        const existingIndex = accessOrder.indexOf(key);
        if (existingIndex >= 0) {
          accessOrder.splice(existingIndex, 1);
        }
        
        // Add key to the end of access order
        accessOrder.push(key);
        
        // Add value to cache
        cache.set(key, value);
        
        // If cache is too large, remove least recently used item
        if (accessOrder.length > maxSize) {
          const oldest = accessOrder.shift();
          cache.delete(oldest);
        }
      },
      
      /**
       * Get a value from the cache
       * @param {string} key - Cache key
       * @returns {*} Cached value or undefined if not found
       */
      get(key) {
        const value = cache.get(key);
        
        if (value !== undefined) {
          // Update access order (move to end)
          const existingIndex = accessOrder.indexOf(key);
          if (existingIndex >= 0) {
            accessOrder.splice(existingIndex, 1);
            accessOrder.push(key);
          }
        }
        
        return value;
      },
      
      /**
       * Delete a value from the cache
       * @param {string} key - Cache key
       */
      delete(key) {
        cache.delete(key);
        
        // Remove from access order
        const existingIndex = accessOrder.indexOf(key);
        if (existingIndex >= 0) {
          accessOrder.splice(existingIndex, 1);
        }
      },
      
      /**
       * Clear all entries from the cache
       */
      clear() {
        cache.clear();
        accessOrder.length = 0;
      },
      
      /**
       * Get cache statistics
       * @returns {Object} Cache statistics
       */
      getStats() {
        return {
          total: cache.size,
          memoryUsage: approximateMemoryUsage()
        };
      }
    };
  }
  
  /**
   * Approximate memory usage of the cache
   * This is very rough and only for informational purposes
   * @returns {number} Approximate bytes used
   */
  function approximateMemoryUsage() {
    // Not a real implementation, would require serializing objects
    // to get accurate size estimation
    return 0;
  }
  
  module.exports = {
    cacheWithTTL,
    cacheLRU
  };
  