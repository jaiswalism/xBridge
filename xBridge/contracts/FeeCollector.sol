// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeCollector
 * @dev Contract to collect and manage fees from xBridge transactions
 */
contract FeeCollector is Ownable {
    using SafeERC20 for IERC20;
    
    // State variables
    mapping(address => uint256) public collectedFees;
    uint256 public feePercentage; // in basis points (e.g., 30 = 0.3%)
    uint256 private constant FEE_DENOMINATOR = 10000;
    
    // Events
    event FeeCollected(address indexed token, uint256 amount);
    event FeeWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    event FeePercentageUpdated(uint256 oldPercentage, uint256 newPercentage);
    
    // Errors
    error InvalidFeePercentage();
    error InvalidRecipient();
    error InsufficientFees();
    
    /**
     * @dev Constructor
     * @param _feePercentage Initial fee percentage in basis points (1 basis point = 0.01%)
     */
    constructor(uint256 _feePercentage) Ownable(msg.sender) {
        if (_feePercentage > 500) revert InvalidFeePercentage(); // Max 5%
        feePercentage = _feePercentage;
    }
    
    /**
     * @dev Collect fee for a specific token
     * @param token Address of the token
     * @param amount Amount of fee to collect
     */
    function collectFee(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        collectedFees[token] += amount;
        emit FeeCollected(token, amount);
    }
    
    /**
     * @dev Withdraw collected fees
     * @param token Address of the token to withdraw
     * @param recipient Address to send the fees to
     * @param amount Amount to withdraw
     */
    function withdrawFee(address token, address recipient, uint256 amount) external onlyOwner {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount > collectedFees[token]) revert InsufficientFees();
        
        collectedFees[token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);
        emit FeeWithdrawn(token, recipient, amount);
    }
    
    /**
     * @dev Update fee percentage
     * @param _feePercentage New fee percentage in basis points
     */
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        if (_feePercentage > 500) revert InvalidFeePercentage(); // Max 5%
        
        uint256 oldPercentage = feePercentage;
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(oldPercentage, _feePercentage);
    }
    
    /**
     * @dev Get collected fees for a token
     * @param token Address of the token
     * @return Amount of collected fees
     */
    function getCollectedFees(address token) external view returns (uint256) {
        return collectedFees[token];
    }
    
    /**
     * @dev Calculate fee amount for a given amount
     * @param amount Amount to calculate fee for
     * @return Fee amount
     */
    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * feePercentage) / FEE_DENOMINATOR;
    }
}