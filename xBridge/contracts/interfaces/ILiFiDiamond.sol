// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILiFiDiamond
 * @dev Interface for interacting with the LI.FI Diamond contract
 * @notice This is a simplified interface. The actual LI.FI Diamond has many more functions.
 */
interface ILiFiDiamond {
    /**
     * @dev Core transaction data structure
     */
    struct LiFiData {
        bytes32 transactionId;
        string integrator;
        string referrer;
        address sender;
        address receiver;
        address destinationChainFallbackAddress;
        uint256 destinationChainId;
    }
    
    /**
     * @dev Swap data structure
     */
    struct SwapData {
        address callTo;
        address approveTo;
        address sendingAssetId;
        address receivingAssetId;
        uint256 fromAmount;
        bytes callData;
    }
    
    /**
     * @dev Bridge data structure
     */
    struct BridgeData {
        address bridge;
        address sendingAssetId;
        address receiver;
        uint256 minAmount;
        uint256 destinationChainId;
        bool hasSourceSwaps;
        bool hasDestinationCall;
    }
    
    /**
     * @dev Swap and bridge tokens in one transaction
     * @param _lifiData Core transaction data
     * @param _swapData Swap data (can be multiple)
     * @param _bridgeData Bridge data
     */
    function swapAndBridge(
        LiFiData calldata _lifiData,
        SwapData[] calldata _swapData,
        BridgeData calldata _bridgeData
    ) external payable;
    
    /**
     * @dev Perform only a swap
     * @param _lifiData Core transaction data
     * @param _swapData Swap data (can be multiple)
     */
    function swap(
        LiFiData calldata _lifiData,
        SwapData[] calldata _swapData
    ) external payable;
    
    /**
     * @dev Get a quote for a cross-chain swap
     * @param _lifiData Core transaction data
     * @param _swapData Swap data
     * @param _bridgeData Bridge data
     * @return Quote result
     */
    function getQuote(
        LiFiData calldata _lifiData,
        SwapData[] calldata _swapData,
        BridgeData calldata _bridgeData
    ) external view returns (bytes memory);
}