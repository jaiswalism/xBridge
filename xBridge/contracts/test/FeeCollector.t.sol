// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/FeeCollector.sol";
import "./mocks/MockERC20.sol";

contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;
    MockERC20 public token;
    
    address public owner = address(1);
    address public user = address(2);
    address public recipient = address(3);
    
    uint256 public constant INITIAL_FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant INITIAL_TOKEN_AMOUNT = 1000 ether;
    
    event FeeCollected(address indexed token, uint256 amount);
    event FeeWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    event FeePercentageUpdated(uint256 oldPercentage, uint256 newPercentage);
    
    function setUp() public {
        vm.startPrank(owner);
        feeCollector = new FeeCollector(INITIAL_FEE_PERCENTAGE);
        token = new MockERC20("Test Token", "TEST", 18);
        vm.stopPrank();
        
        // Give tokens to user
        vm.startPrank(owner);
        token.mint(user, INITIAL_TOKEN_AMOUNT);
        vm.stopPrank();
    }
    
    function testInitialState() public {
        assertEq(feeCollector.feePercentage(), INITIAL_FEE_PERCENTAGE);
        assertEq(feeCollector.getCollectedFees(address(token)), 0);
    }
    
    function testCollectFee() public {
        uint256 amount = 100 ether;
        
        vm.startPrank(user);
        token.approve(address(feeCollector), amount);
        
        vm.expectEmit(true, false, false, true);
        emit FeeCollected(address(token), amount);
        
        feeCollector.collectFee(address(token), amount);
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(feeCollector)), amount);
        assertEq(feeCollector.getCollectedFees(address(token)), amount);
        assertEq(token.balanceOf(user), INITIAL_TOKEN_AMOUNT - amount);
    }
    
    function testWithdrawFee() public {
        uint256 amount = 100 ether;
        
        // First collect some fees
        vm.startPrank(user);
        token.approve(address(feeCollector), amount);
        feeCollector.collectFee(address(token), amount);
        vm.stopPrank();
        
        // Then withdraw
        vm.startPrank(owner);
        
        vm.expectEmit(true, true, false, true);
        emit FeeWithdrawn(address(token), recipient, amount);
        
        feeCollector.withdrawFee(address(token), recipient, amount);
        vm.stopPrank();
        
        assertEq(token.balanceOf(recipient), amount);
        assertEq(feeCollector.getCollectedFees(address(token)), 0);
    }
    
    function testSetFeePercentage() public {
        uint256 newFeePercentage = 50; // 0.5%
        
        vm.startPrank(owner);
        
        vm.expectEmit(false, false, false, true);
        emit FeePercentageUpdated(INITIAL_FEE_PERCENTAGE, newFeePercentage);
        
        feeCollector.setFeePercentage(newFeePercentage);
        vm.stopPrank();
        
        assertEq(feeCollector.feePercentage(), newFeePercentage);
    }
    
    function testCalculateFee() public {
        uint256 amount = 1000 ether;
        uint256 expectedFee = (amount * INITIAL_FEE_PERCENTAGE) / 10000; // 0.3% of 1000 = 3
        
        assertEq(feeCollector.calculateFee(amount), expectedFee);
    }
    
    function testFailWithdrawTooMuch() public {
        uint256 amount = 100 ether;
        
        // First collect some fees
        vm.startPrank(user);
        token.approve(address(feeCollector), amount);
        feeCollector.collectFee(address(token), amount);
        vm.stopPrank();
        
        // Try to withdraw more than collected
        vm.startPrank(owner);
        feeCollector.withdrawFee(address(token), recipient, amount + 1);
        vm.stopPrank();
    }
    
    function testFailSetTooHighFeePercentage() public {
        uint256 tooHighFeePercentage = 600; // 6%, max is 5%
        
        vm.startPrank(owner);
        feeCollector.setFeePercentage(tooHighFeePercentage);
        vm.stopPrank();
    }
    
    function testFailWithdrawAsNonOwner() public {
        uint256 amount = 100 ether;
        
        // First collect some fees
        vm.startPrank(user);
        token.approve(address(feeCollector), amount);
        feeCollector.collectFee(address(token), amount);
        
        // Try to withdraw as non-owner
        feeCollector.withdrawFee(address(token), recipient, amount);
        vm.stopPrank();
    }
    
    function testFailSetFeePercentageAsNonOwner() public {
        uint256 newFeePercentage = 50; // 0.5%
        
        vm.startPrank(user);
        feeCollector.setFeePercentage(newFeePercentage);
        vm.stopPrank();
    }
}