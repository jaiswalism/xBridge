// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockLiFiDiamond
 * @dev Minimal mock for testing, with no external dependencies
 */
contract MockLiFiDiamond {
    // State for testing
    address public lastTokenSent;
    uint256 public lastTokenAmount;
    address public lastRecipient;
    uint256 public lastDestinationChainId;
    
    /**
     * @dev Simple function that can be called with any data
     */
    function someFunction() external payable {
        // This is just to have a valid function that can be called
    }
    
    /**
     * @dev Set destination chain ID for bridge tests
     */
    function setBridgeDestination(uint256 chainId) external {
        lastDestinationChainId = chainId;
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        lastTokenAmount = msg.value;
    }
}