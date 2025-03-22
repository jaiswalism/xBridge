// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenRegistry
 * @dev Contract to maintain a registry of supported tokens
 */
contract TokenRegistry is Ownable {
    // Struct to store token information
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        bool active;
        string logoURI;
    }
    
    // State variables
    mapping(address => TokenInfo) public tokens;
    address[] public tokenList;
    mapping(uint256 => mapping(address => address)) public chainTokenMap; // chainId => srcToken => destToken
    
    // Events
    event TokenAdded(address indexed token, string name, string symbol, uint8 decimals, string logoURI);
    event TokenUpdated(address indexed token, string name, string symbol, uint8 decimals, string logoURI, bool active);
    event TokenStatusUpdated(address indexed token, bool active);
    event ChainTokenMappingUpdated(uint256 indexed chainId, address indexed srcToken, address indexed destToken);
    
    // Errors
    error TokenAlreadyExists();
    error TokenDoesNotExist();
    error InvalidToken();
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Add a new token to the registry
     * @param token Address of the token
     * @param name Name of the token
     * @param symbol Symbol of the token
     * @param decimals Decimals of the token
     * @param logoURI URI for the token logo
     */
    function addToken(
        address token,
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        string calldata logoURI
    ) external onlyOwner {
        if (token == address(0)) revert InvalidToken();
        if (tokens[token].decimals != 0) revert TokenAlreadyExists();
        
        tokens[token] = TokenInfo({
            name: name,
            symbol: symbol,
            decimals: decimals,
            active: true,
            logoURI: logoURI
        });
        
        tokenList.push(token);
        
        emit TokenAdded(token, name, symbol, decimals, logoURI);
    }
    
    /**
     * @dev Update an existing token
     * @param token Address of the token
     * @param name New name of the token
     * @param symbol New symbol of the token
     * @param decimals New decimals of the token
     * @param logoURI New URI for the token logo
     * @param active Whether the token is active
     */
    function updateToken(
        address token,
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        string calldata logoURI,
        bool active
    ) external onlyOwner {
        if (tokens[token].decimals == 0) revert TokenDoesNotExist();
        
        tokens[token] = TokenInfo({
            name: name,
            symbol: symbol,
            decimals: decimals,
            active: active,
            logoURI: logoURI
        });
        
        emit TokenUpdated(token, name, symbol, decimals, logoURI, active);
    }
    
    /**
     * @dev Set token status (active/inactive)
     * @param token Address of the token
     * @param active New status
     */
    function setTokenStatus(address token, bool active) external onlyOwner {
        if (tokens[token].decimals == 0) revert TokenDoesNotExist();
        
        tokens[token].active = active;
        
        emit TokenStatusUpdated(token, active);
    }
    
    /**
     * @dev Map a token to its equivalent on another chain
     * @param chainId The destination chain ID
     * @param srcToken The source token address
     * @param destToken The destination token address
     */
    function setChainTokenMapping(
        uint256 chainId,
        address srcToken,
        address destToken
    ) external onlyOwner {
        if (tokens[srcToken].decimals == 0) revert TokenDoesNotExist();
        
        chainTokenMap[chainId][srcToken] = destToken;
        
        emit ChainTokenMappingUpdated(chainId, srcToken, destToken);
    }
    
    /**
     * @dev Get all tokens
     * @return Array of token addresses
     */
    function getTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Get active tokens
     * @return Array of active token addresses
     */
    function getActiveTokens() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active tokens
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokens[tokenList[i]].active) {
                activeCount++;
            }
        }
        
        // Create array of active tokens
        address[] memory activeTokens = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokens[tokenList[i]].active) {
                activeTokens[index] = tokenList[i];
                index++;
            }
        }
        
        return activeTokens;
    }
    
    /**
     * @dev Get token information
     * @param token Address of the token
     * @return name Name of the token
     * @return symbol Symbol of the token
     * @return decimals Decimals of the token
     * @return active Whether the token is active
     * @return logoURI URI for the token logo
     */
    function getTokenInfo(address token) external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        bool active,
        string memory logoURI
    ) {
        TokenInfo memory info = tokens[token];
        return (info.name, info.symbol, info.decimals, info.active, info.logoURI);
    }
    
    /**
     * @dev Get the equivalent token on another chain
     * @param chainId The destination chain ID
     * @param srcToken The source token address
     * @return The destination token address
     */
    function getChainToken(uint256 chainId, address srcToken) external view returns (address) {
        return chainTokenMap[chainId][srcToken];
    }
}