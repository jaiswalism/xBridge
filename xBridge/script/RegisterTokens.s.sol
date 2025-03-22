// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/TokenRegistry.sol";

/**
 * @title RegisterTokensScript
 * @dev Script to register tokens in the TokenRegistry contract
 */
contract RegisterTokensScript is Script {
    // Token info struct
    struct TokenData {
        address addr;
        string name;
        string symbol;
        uint8 decimals;
        string logoURI;
    }
    
    // Network-specific token addresses
    mapping(uint256 => TokenData[]) private networkTokens;
    
    function run() external {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        // Get registry address from environment
        address registryAddress = vm.envAddress("TOKEN_REGISTRY_ADDRESS");
        TokenRegistry registry = TokenRegistry(registryAddress);
        
        // Determine network
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        
        // Initialize tokens
        initializeTokens();
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Register tokens for the current network
        TokenData[] storage tokens = networkTokens[chainId];
        
        for (uint256 i = 0; i < tokens.length; i++) {
            TokenData memory token = tokens[i];
            registry.addToken(
                token.addr,
                token.name,
                token.symbol,
                token.decimals,
                token.logoURI
            );
            
            console.log("Registered token:", token.name);
        }
        
        // Setup token mappings for cross-chain
        setupTokenMappings(registry, chainId);
        
        vm.stopBroadcast();
    }
    
    function initializeTokens() internal {
        // Ethereum Mainnet (Chain ID: 1)
        networkTokens[1].push(TokenData({
            addr: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
        }));
        
        networkTokens[1].push(TokenData({
            addr: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        }));
        
        networkTokens[1].push(TokenData({
            addr: 0xdAC17F958D2ee523a2206206994597C13D831ec7,
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
        }));
        
        networkTokens[1].push(TokenData({
            addr: 0x6B175474E89094C44Da98b954EedeAC495271d0F,
            name: "Dai Stablecoin",
            symbol: "DAI",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
        }));
        
        // Polygon (Chain ID: 137)
        networkTokens[137].push(TokenData({
            addr: 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270,
            name: "Wrapped Matic",
            symbol: "WMATIC",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png"
        }));
        
        networkTokens[137].push(TokenData({
            addr: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,
            name: "USD Coin (PoS)",
            symbol: "USDC",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png"
        }));
        
        networkTokens[137].push(TokenData({
            addr: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F,
            name: "Tether USD (PoS)",
            symbol: "USDT",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png"
        }));
        
        networkTokens[137].push(TokenData({
            addr: 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063,
            name: "Dai Stablecoin (PoS)",
            symbol: "DAI",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png"
        }));
        
        // Arbitrum (Chain ID: 42161)
        networkTokens[42161].push(TokenData({
            addr: 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1,
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
        }));
        
        networkTokens[42161].push(TokenData({
            addr: 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8,
            name: "USD Coin (Arb1)",
            symbol: "USDC",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
        }));
        
        networkTokens[42161].push(TokenData({
            addr: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9,
            name: "Tether USD (Arb1)",
            symbol: "USDT",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png"
        }));
        
        networkTokens[42161].push(TokenData({
            addr: 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1,
            name: "Dai Stablecoin (Arb1)",
            symbol: "DAI",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1/logo.png"
        }));
        
        // Base (Chain ID: 8453)
        networkTokens[8453].push(TokenData({
            addr: 0x4200000000000000000000000000000000000006,
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
        }));
        
        networkTokens[8453].push(TokenData({
            addr: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        }));
        
        networkTokens[8453].push(TokenData({
            addr: 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb,
            name: "Dai Stablecoin",
            symbol: "DAI",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
        }));
    }
    
    function setupTokenMappings(TokenRegistry registry, uint256 chainId) internal {
        if (chainId == 1) {
            // Ethereum to Polygon mappings
            registry.setChainTokenMapping(
                137, // Polygon
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC on Ethereum
                0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174  // USDC on Polygon
            );
            
            registry.setChainTokenMapping(
                137, // Polygon
                0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT on Ethereum
                0xc2132D05D31c914a87C6611C10748AEb04B58e8F  // USDT on Polygon
            );
            
            registry.setChainTokenMapping(
                137, // Polygon
                0x6B175474E89094C44Da98b954EedeAC495271d0F, // DAI on Ethereum
                0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063  // DAI on Polygon
            );
            
            // Ethereum to Arbitrum mappings
            registry.setChainTokenMapping(
                42161, // Arbitrum
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC on Ethereum
                0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8  // USDC on Arbitrum
            );
            
            registry.setChainTokenMapping(
                42161, // Arbitrum
                0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT on Ethereum
                0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9  // USDT on Arbitrum
            );
            
            registry.setChainTokenMapping(
                42161, // Arbitrum
                0x6B175474E89094C44Da98b954EedeAC495271d0F, // DAI on Ethereum
                0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1  // DAI on Arbitrum
            );
            
            // Ethereum to Base mappings
            registry.setChainTokenMapping(
                8453, // Base
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC on Ethereum
                0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  // USDC on Base
            );
            
            registry.setChainTokenMapping(
                8453, // Base
                0x6B175474E89094C44Da98b954EedeAC495271d0F, // DAI on Ethereum
                0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb  // DAI on Base
            );
        } else if (chainId == 137) {
            // Polygon to Ethereum mappings
            registry.setChainTokenMapping(
                1, // Ethereum
                0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, // USDC on Polygon
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC on Ethereum
            );
            
            // Add more mappings as needed
        } else if (chainId == 42161) {
            // Arbitrum to Ethereum mappings
            registry.setChainTokenMapping(
                1, // Ethereum
                0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8, // USDC on Arbitrum
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC on Ethereum
            );
            
            // Add more mappings as needed
        } else if (chainId == 8453) {
            // Base to Ethereum mappings
            registry.setChainTokenMapping(
                1, // Ethereum
                0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // USDC on Base
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC on Ethereum
            );
            
            // Add more mappings as needed
        }
    }
}