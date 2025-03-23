require('dotenv').config();

/**
 * Application configuration
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  },
  
  // LI.FI configuration
  lifi: {
    apiUrl: 'https://li.quest/v1',
    apiKey: process.env.LIFI_API_KEY,
    defaultSlippage: 1, // 1%
    defaultIntegrator: 'xbridge'
  },
  
  // Chain configurations
  chains: {
    // Ethereum Mainnet
    '1': {
      name: 'Ethereum',
      rpcUrls: [
        process.env.MAINNET_RPC_URL,
        'https://eth-mainnet.g.alchemy.com/v2/demo',
        'https://cloudflare-eth.com'
      ],
      blockExplorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    
    // Polygon
    '137': {
      name: 'Polygon',
      rpcUrls: [
        process.env.POLYGON_RPC_URL,
        'https://polygon-rpc.com'
      ],
      blockExplorer: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    
    // Arbitrum
    '42161': {
      name: 'Arbitrum',
      rpcUrls: [
        process.env.ARBITRUM_RPC_URL,
        'https://arb1.arbitrum.io/rpc'
      ],
      blockExplorer: 'https://arbiscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
  },
  
  // Contract addresses by chain
  contracts: {
    // Ethereum Mainnet
    '1': {
      lifiDiamond: process.env.MAINNET_LIFI_DIAMOND_ADDRESS || '0x1231dEB6f5E883c2ff8a59B7a61f2A18D167f366',
      lifiAdapter: process.env.MAINNET_LIFI_ADAPTER_ADDRESS,
      feeCollector: process.env.MAINNET_FEE_COLLECTOR_ADDRESS,
      tokenRegistry: process.env.MAINNET_TOKEN_REGISTRY_ADDRESS
    },
    
    // Polygon
    '137': {
      lifiDiamond: process.env.POLYGON_LIFI_DIAMOND_ADDRESS || '0x1231dEB6f5E883c2ff8a59B7a61f2A18D167f366',
      lifiAdapter: process.env.POLYGON_LIFI_ADAPTER_ADDRESS,
      feeCollector: process.env.POLYGON_FEE_COLLECTOR_ADDRESS,
      tokenRegistry: process.env.POLYGON_TOKEN_REGISTRY_ADDRESS
    },
    
    // Arbitrum
    '42161': {
      lifiDiamond: process.env.ARBITRUM_LIFI_DIAMOND_ADDRESS || '0x1231dEB6f5E883c2ff8a59B7a61f2A18D167f366',
      lifiAdapter: process.env.ARBITRUM_LIFI_ADAPTER_ADDRESS,
      feeCollector: process.env.ARBITRUM_FEE_COLLECTOR_ADDRESS,
      tokenRegistry: process.env.ARBITRUM_TOKEN_REGISTRY_ADDRESS
    }
  },
  
  // Fee configuration
  fees: {
    defaultFeePercentage: 30, // 0.3% in basis points
    feeRecipient: process.env.FEE_RECIPIENT
  }
};

module.exports = config;