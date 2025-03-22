// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/FeeCollector.sol";
import "../contracts/LiFiAdapter.sol";
import "../contracts/TokenRegistry.sol";

/**
 * @title DeployScript
 * @dev Script to deploy xBridge contracts
 */
contract DeployScript is Script {
    function run() external {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        // Get configuration from environment
        address lifiDiamond = vm.envAddress("LIFI_DIAMOND_ADDRESS");
        uint256 feePercentage = vm.envUint("FEE_PERCENTAGE");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contracts
        FeeCollector feeCollector = new FeeCollector(feePercentage);
        console.log("FeeCollector deployed to:", address(feeCollector));
        
        LiFiAdapter adapter = new LiFiAdapter(lifiDiamond, address(feeCollector));
        console.log("LiFiAdapter deployed to:", address(adapter));
        
        TokenRegistry registry = new TokenRegistry();
        console.log("TokenRegistry deployed to:", address(registry));
        
        // Register some initial tokens if needed
        if (block.chainid == 1) {
            // Ethereum Mainnet tokens
            registerMainnetTokens(registry);
        } else if (block.chainid == 137) {
            // Polygon tokens
            registerPolygonTokens(registry);
        } else if (block.chainid == 42161) {
            // Arbitrum tokens
            registerArbitrumTokens(registry);
        }
        
        vm.stopBroadcast();
    }
    
    function registerMainnetTokens(TokenRegistry registry) internal {
        // WETH
        registry.addToken(
            0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,
            "Wrapped Ether",
            "WETH",
            18,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
        );
        
        // USDC
        registry.addToken(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
            "USD Coin",
            "USDC",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        );
        
        // USDT
        registry.addToken(
            0xdAC17F958D2ee523a2206206994597C13D831ec7,
            "Tether USD",
            "USDT",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
        );
        
        // DAI
        registry.addToken(
            0x6B175474E89094C44Da98b954EedeAC495271d0F,
            "Dai Stablecoin",
            "DAI",
            18,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
        );
    }
    
    function registerPolygonTokens(TokenRegistry registry) internal {
        // WMATIC
        registry.addToken(
            0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270,
            "Wrapped Matic",
            "WMATIC",
            18,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png"
        );
        
        // USDC
        registry.addToken(
            0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,
            "USD Coin (PoS)",
            "USDC",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png"
        );
        
        // USDT
        registry.addToken(
            0xc2132D05D31c914a87C6611C10748AEb04B58e8F,
            "Tether USD (PoS)",
            "USDT",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png"
        );
        
        // DAI
        registry.addToken(
            0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063,
            "Dai Stablecoin (PoS)",
            "DAI",
            18,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png"
        );
    }
    
    function registerArbitrumTokens(TokenRegistry registry) internal {
        // WETH
        registry.addToken(
            0x82aF49447D8a07e3bd95BD0d56f35241523fBab1,
            "Wrapped Ether",
            "WETH",
            18,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
        );
        
        // USDC
        registry.addToken(
            0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8,
            "USD Coin (Arb1)",
            "USDC",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
        );
        
        // USDT
        registry.addToken(
            0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9,
            "Tether USD (Arb1)",
            "USDT",
            6,
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png"
        );
    }}