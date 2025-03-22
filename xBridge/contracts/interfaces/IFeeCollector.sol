// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFeeCollector
 * @dev Interface for the FeeCollector contract
 */
interface IFeeCollector {
    /**
     * @dev Collect fee for a specific token
     * @param token Address of the token
     * @param amount Amount of fee to collect
     */
    function collectFee(address token, uint256 amount) external;
    
    /**
     * @dev Withdraw collected fees
     * @param token Address of the token to withdraw
     * @param recipient Address to send the fees to
     * @param amount Amount to withdraw
     */
    function withdrawFee(address token, address recipient, uint256 amount) external;
    
    /**
     * @dev Update fee percentage
     * @param _feePercentage New fee percentage in basis points
     */
    function setFeePercentage(uint256 _feePercentage) external;
    
    /**
     * @dev Get collected fees for a token
     * @param token Address of the token
     * @return Amount of collected fees
     */
    function getCollectedFees(address token) external view returns (uint256);
    
    /**
     * @dev Get the current fee percentage
     * @return Current fee percentage in basis points
     */
    function feePercentage() external view returns (uint256);
    
    /**
     * @dev Calculate fee amount for a given amount
     * @param amount Amount to calculate fee for
     * @return Fee amount
     */
    function calculateFee(uint256 amount) external view returns (uint256);
    
    /**
     * @dev Emitted when fees are collected
     */
    event FeeCollected(address indexed token, uint256 amount);
    
    /**
     * @dev Emitted when fees are withdrawn
     */
    event FeeWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    
    /**
     * @dev Emitted when fee percentage is updated
     */
    event FeePercentageUpdated(uint256 oldPercentage, uint256 newPercentage);
}