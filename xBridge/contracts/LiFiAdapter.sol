// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IFeeCollector.sol";

/**
 * @title LiFiAdapter
 * @dev Contract to interact with LI.FI Diamond for cross-chain swaps and bridges
 */
contract LiFiAdapter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // State variables
    IFeeCollector public feeCollector;
    address public lifiDiamondAddress;
    
    // Events
    event SwapInitiated(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn);
    event BridgeInitiated(address indexed user, address indexed token, uint256 amount, uint256 destinationChainId);
    event LiFiDiamondUpdated(address oldDiamond, address newDiamond);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    
    // Errors
    error InvalidLiFiDiamond();
    error InvalidFeeCollector();
    error SwapFailed();
    error BridgeFailed();
    error ZeroAmount();
    error InvalidToken();
    
    /**
     * @dev Constructor
     * @param _lifiDiamond Address of the LI.FI Diamond contract
     * @param _feeCollector Address of the fee collector contract
     */
    constructor(address _lifiDiamond, address _feeCollector) Ownable(msg.sender) {
        if (_lifiDiamond == address(0)) revert InvalidLiFiDiamond();
        if (_feeCollector == address(0)) revert InvalidFeeCollector();
        
        lifiDiamondAddress = _lifiDiamond;
        feeCollector = IFeeCollector(_feeCollector);
    }
    
    /**
     * @dev Forward a call to LI.FI Diamond with ETH
     * @param _callData The calldata to forward
     */
    function executeWithFee(bytes calldata _callData) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        
        // Calculate fee (for accounting only, we don't actually take ETH fee)
        uint256 fee = feeCollector.calculateFee(msg.value);
        
        // Forward the call to LI.FI diamond
        (bool success, ) = lifiDiamondAddress.call{value: msg.value}(_callData);
        if (!success) revert SwapFailed();
        
        // Emit event
        emit SwapInitiated(msg.sender, address(0), address(0), msg.value);
    }
    
    /**
     * @dev Forward a call to LI.FI Diamond with ERC20 tokens
     * @param token Address of the token
     * @param amount Amount of tokens
     * @param _callData The calldata to forward
     */
    function executeWithTokenFee(address token, uint256 amount, bytes calldata _callData) external nonReentrant {
        if (token == address(0)) revert InvalidToken();
        if (amount == 0) revert ZeroAmount();
        
        // Calculate fee
        uint256 fee = feeCollector.calculateFee(amount);
        uint256 amountAfterFee = amount - fee;
        
        // Transfer tokens from sender
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Collect fee
        if (fee > 0) {
            IERC20(token).safeApprove(address(feeCollector), fee);
            feeCollector.collectFee(token, fee);
        }
        
        // Approve LI.FI to spend tokens
        IERC20(token).safeApprove(lifiDiamondAddress, amountAfterFee);
        
        // Forward the call to LI.FI diamond
        (bool success, ) = lifiDiamondAddress.call(_callData);
        if (!success) revert SwapFailed();
        
        // Emit event
        emit SwapInitiated(msg.sender, token, address(0), amount);
    }
    
    /**
     * @dev Execute a bridge transaction via LI.FI
     * @param token Address of the token to bridge
     * @param amount Amount of tokens to bridge
     * @param destinationChainId Target chain ID
     * @param _callData The calldata for the bridge operation
     */
    function executeBridgeWithFee(
        address token, 
        uint256 amount, 
        uint256 destinationChainId, 
        bytes calldata _callData
    ) external nonReentrant {
        if (token == address(0)) revert InvalidToken();
        if (amount == 0) revert ZeroAmount();
        
        // Calculate fee
        uint256 fee = feeCollector.calculateFee(amount);
        uint256 amountAfterFee = amount - fee;
        
        // Transfer tokens from sender
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Collect fee
        if (fee > 0) {
            IERC20(token).safeApprove(address(feeCollector), fee);
            feeCollector.collectFee(token, fee);
        }
        
        // Approve LI.FI to spend tokens
        IERC20(token).safeApprove(lifiDiamondAddress, amountAfterFee);
        
        // Forward the call to LI.FI diamond
        (bool success, ) = lifiDiamondAddress.call(_callData);
        if (!success) revert BridgeFailed();
        
        // Emit event
        emit BridgeInitiated(msg.sender, token, amount, destinationChainId);
    }
    
    /**
     * @dev Update LI.FI Diamond address
     * @param _lifiDiamond New LI.FI Diamond address
     */
    function setLiFiDiamond(address _lifiDiamond) external onlyOwner {
        if (_lifiDiamond == address(0)) revert InvalidLiFiDiamond();
        
        address oldDiamond = lifiDiamondAddress;
        lifiDiamondAddress = _lifiDiamond;
        emit LiFiDiamondUpdated(oldDiamond, _lifiDiamond);
    }
    
    /**
     * @dev Update fee collector address
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        if (_feeCollector == address(0)) revert InvalidFeeCollector();
        
        address oldCollector = address(feeCollector);
        feeCollector = IFeeCollector(_feeCollector);
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }
    
    /**
     * @dev Recover any ERC20 tokens accidentally sent to this contract
     * @param token Address of the token
     * @param recipient Address to send the tokens to
     * @param amount Amount to recover
     */
    function recoverTokens(address token, address recipient, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(recipient, amount);
    }
    
    /**
     * @dev Function to receive ETH
     */
    receive() external payable {}
}