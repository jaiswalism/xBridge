// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenRegistry
 * @dev Interface for the TokenRegistry contract
 */
interface ITokenRegistry {
    /**
     * @dev Token information structure
     */
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        bool active;
        string logoURI;
    }
    
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
    ) external;
    
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
    ) external;
    
    /**
     * @dev Set token status (active/inactive)
     * @param token Address of the token
     * @param active New status
     */
    function setTokenStatus(address token, bool active) external;
    
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
    ) external;
    
    /**
     * @dev Get all tokens
     * @return Array of token addresses
     */
    function getTokens() external view returns (address[] memory);
    
    /**
     * @dev Get active tokens
     * @return Array of active token addresses
     */
    function getActiveTokens() external view returns (address[] memory);
    
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
    );
    
    /**
     * @dev Get the equivalent token on another chain
     * @param chainId The destination chain ID
     * @param srcToken The source token address
     * @return The destination token address
     */
    function getChainToken(uint256 chainId, address srcToken) external view returns (address);
    
    /**
     * @dev Emitted when a token is added
     */
    event TokenAdded(address indexed token, string name, string symbol, uint8 decimals, string logoURI);
    
    /**
     * @dev Emitted when a token is updated
     */
    event TokenUpdated(address indexed token, string name, string symbol, uint8 decimals, string logoURI, bool active);
    
    /**
     * @dev Emitted when a token's status is updated
     */
    event TokenStatusUpdated(address indexed token, bool active);
    
    /**
     * @dev Emitted when a chain token mapping is updated
     */
    event ChainTokenMappingUpdated(uint256 indexed chainId, address indexed srcToken, address indexed destToken);
}