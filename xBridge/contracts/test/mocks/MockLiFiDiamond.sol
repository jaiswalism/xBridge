// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "...contracts/interfaces/ILiFiDiamond.sol";

/**
 * @title MockLiFiDiamond
 * @dev Mock implementation of LI.FI Diamond for testing
 */
contract MockLiFiDiamond {
    using SafeERC20 for IERC20;
    
    // State for testing
    address public lastTokenSent;
    uint256 public lastTokenAmount;
    address public lastRecipient;
    uint256 public lastDestinationChainId;
    bytes32 public lastTransactionId;
    
    // Events for testing
    event SwapExecuted(bytes32 transactionId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event BridgeExecuted(bytes32 transactionId, address token, uint256 amount, uint256 destinationChainId, address recipient);
    
    /**
     * @dev Mock implementation of swap
     * @param _lifiData Core transaction data
     * @param _swapData Swap data
     */
    function swap(
        ILiFiDiamond.LiFiData calldata _lifiData,
        ILiFiDiamond.SwapData[] calldata _swapData
    ) external payable {
        lastTransactionId = _lifiData.transactionId;
        lastRecipient = _lifiData.receiver;
        
        for (uint256 i = 0; i < _swapData.length; i++) {
            // For the sake of testing, we just store the last values
            lastTokenSent = _swapData[i].sendingAssetId;
            lastTokenAmount = _swapData[i].fromAmount;
            
            // If it's a token swap, transfer tokens to the recipient
            if (lastTokenSent != address(0)) {
                // Transfer the tokens from the sender to this contract
                IERC20(lastTokenSent).safeTransferFrom(msg.sender, lastRecipient, lastTokenAmount);
            } else if (msg.value > 0) {
                // If ETH was sent, forward it to the recipient
                (bool success, ) = lastRecipient.call{value: msg.value}("");
                require(success, "ETH transfer failed");
            }
            
            emit SwapExecuted(
                lastTransactionId,
                _swapData[i].sendingAssetId,
                _swapData[i].receivingAssetId,
                _swapData[i].fromAmount,
                _swapData[i].fromAmount // For simplicity, we use the same amount
            );
        }
    }
    
    /**
     * @dev Mock implementation of swapAndBridge
     * @param _lifiData Core transaction data
     * @param _swapData Swap data
     * @param _bridgeData Bridge data
     */
    function swapAndBridge(
        ILiFiDiamond.LiFiData calldata _lifiData,
        ILiFiDiamond.SwapData[] calldata _swapData,
        ILiFiDiamond.BridgeData calldata _bridgeData
    ) external payable {
        lastTransactionId = _lifiData.transactionId;
        lastRecipient = _lifiData.receiver;
        lastDestinationChainId = _bridgeData.destinationChainId;
        
        // Handle swaps first
        if (_swapData.length > 0) {
            for (uint256 i = 0; i < _swapData.length; i++) {
                lastTokenSent = _swapData[i].sendingAssetId;
                lastTokenAmount = _swapData[i].fromAmount;
                
                // In a real implementation, tokens would be swapped here
            }
        } else {
            // If no swaps, use the bridge token directly
            lastTokenSent = _bridgeData.sendingAssetId;
        }
        
        // For bridge simulation, we just transfer the tokens to this contract
        if (lastTokenSent != address(0)) {
            // For tokens
            IERC20(lastTokenSent).safeTransferFrom(msg.sender, address(this), lastTokenAmount);
        } else if (msg.value > 0) {
            // For ETH
            lastTokenAmount = msg.value;
        }
        
        emit BridgeExecuted(
            lastTransactionId,
            lastTokenSent,
            lastTokenAmount,
            lastDestinationChainId,
            lastRecipient
        );
    }
    
    /**
     * @dev Mock implementation of getQuote
     */
    function getQuote(
        ILiFiDiamond.LiFiData calldata _lifiData,
        ILiFiDiamond.SwapData[] calldata _swapData,
        ILiFiDiamond.BridgeData calldata _bridgeData
    ) external view returns (bytes memory) {
        // Just return some mock data
        return abi.encode(_lifiData.transactionId, _swapData.length, _bridgeData.destinationChainId);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}