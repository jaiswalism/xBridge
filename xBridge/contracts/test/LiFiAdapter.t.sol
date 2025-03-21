// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/LiFiAdapter.sol";
import "../contracts/FeeCollector.sol";
import "./mocks/MockERC20.sol";
import "./mocks/MockLiFiDiamond.sol";

contract LiFiAdapterTest is Test {
    LiFiAdapter public adapter;
    FeeCollector public feeCollector;
    MockLiFiDiamond public lifiDiamond;
    MockERC20 public token;
    
    address public owner = address(1);
    address public user = address(2);
    
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant INITIAL_TOKEN_AMOUNT = 1000 ether;
    
    event SwapInitiated(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn);
    event BridgeInitiated(address indexed user, address indexed token, uint256 amount, uint256 destinationChainId);
    event LiFiDiamondUpdated(address oldDiamond, address newDiamond);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    
    function setUp() public {
        vm.startPrank(owner);
        feeCollector = new FeeCollector(FEE_PERCENTAGE);
        lifiDiamond = new MockLiFiDiamond();
        adapter = new LiFiAdapter(address(lifiDiamond), address(feeCollector));
        token = new MockERC20("Test Token", "TEST", 18);
        vm.stopPrank();
        
        // Give tokens to user
        vm.startPrank(owner);
        token.mint(user, INITIAL_TOKEN_AMOUNT);
        vm.stopPrank();
    }
    
    function testExecuteWithFee() public {
        uint256 amount = 1 ether;
        bytes memory callData = abi.encodeWithSignature("someFunction()");
        
        vm.deal(user, amount);
        
        vm.startPrank(user);
        
        vm.expectEmit(true, true, true, true);
        emit SwapInitiated(user, address(0), address(0), amount);
        
        adapter.executeWithFee{value: amount}(callData);
        vm.stopPrank();
        
        assertEq(address(lifiDiamond).balance, amount);
    }
    
    function testExecuteWithTokenFee() public {
        uint256 amount = 100 ether;
        bytes memory callData = abi.encodeWithSignature("someFunction()");
        uint256 expectedFee = (amount * FEE_PERCENTAGE) / 10000;
        uint256 amountAfterFee = amount - expectedFee;
        
        vm.startPrank(user);
        token.approve(address(adapter), amount);
        
        vm.expectEmit(true, true, true, true);
        emit SwapInitiated(user, address(token), address(0), amount);
        
        adapter.executeWithTokenFee(address(token), amount, callData);
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(feeCollector)), expectedFee);
        assertEq(lifiDiamond.lastTokenAmount(), amountAfterFee);
    }
    
    function testExecuteBridgeWithFee() public {
        uint256 amount = 100 ether;
        uint256 destinationChainId = 137; // Polygon
        bytes memory callData = abi.encodeWithSignature("someFunction()");
        uint256 expectedFee = (amount * FEE_PERCENTAGE) / 10000;
        uint256 amountAfterFee = amount - expectedFee;
        
        vm.startPrank(user);
        token.approve(address(adapter), amount);
        
        vm.expectEmit(true, true, true, true);
        emit BridgeInitiated(user, address(token), amount, destinationChainId);
        
        adapter.executeBridgeWithFee(address(token), amount, destinationChainId, callData);
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(feeCollector)), expectedFee);
        assertEq(lifiDiamond.lastTokenAmount(), amountAfterFee);
        assertEq(lifiDiamond.lastDestinationChainId(), destinationChainId);
    }
    
    function testSetLiFiDiamond() public {
        address newDiamond = address(999);
        
        vm.startPrank(owner);
        
        vm.expectEmit(true, true, true, true);
        emit LiFiDiamondUpdated(address(lifiDiamond), newDiamond);
        
        adapter.setLiFiDiamond(newDiamond);
        vm.stopPrank();
        
        assertEq(adapter.lifiDiamondAddress(), newDiamond);
    }
    
    function testSetFeeCollector() public {
        address newCollector = address(888);
        
        vm.startPrank(owner);
        
        vm.expectEmit(true, true, true, true);
        emit FeeCollectorUpdated(address(feeCollector), newCollector);
        
        adapter.setFeeCollector(newCollector);
        vm.stopPrank();
        
        assertEq(address(adapter.feeCollector()), newCollector);
    }
    
    function testRecoverTokens() public {
        uint256 amount = 10 ether;
        address recipient = address(777);
        
        // Transfer tokens to adapter
        vm.startPrank(owner);
        token.mint(address(adapter), amount);
        vm.stopPrank();
        
        // Try to recover tokens as non-owner
        vm.startPrank(user);
        vm.expectRevert();
        adapter.recoverTokens(address(token), recipient, amount);
        vm.stopPrank();
    }
}
();
        
        assertEq(token.balanceOf(address(adapter)), amount);
        
        // Recover tokens
        vm.startPrank(owner);
        adapter.recoverTokens(address(token), recipient, amount);
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(adapter)), 0);
        assertEq(token.balanceOf(recipient), amount);
    }
    
    function testFailExecuteWithZeroAmount() public {
        bytes memory callData = abi.encodeWithSignature("someFunction()");
        
        vm.startPrank(user);
        adapter.executeWithFee{value: 0}(callData);
        vm.stopPrank();
    }
    
    function testFailExecuteWithTokenFeeZeroAmount() public {
        bytes memory callData = abi.encodeWithSignature("someFunction()");
        
        vm.startPrank(user);
        adapter.executeWithTokenFee(address(token), 0, callData);
        vm.stopPrank();
    }
    
    function testFailSetLiFiDiamondAsNonOwner() public {
        address newDiamond = address(999);
        
        vm.startPrank(user);
        adapter.setLiFiDiamond(newDiamond);
        vm.stopPrank();
    }
    
    function testFailSetFeeCollectorAsNonOwner() public {
        address newCollector = address(888);
        
        vm.startPrank(user);
        adapter.setFeeCollector(newCollector);
        vm.stopPrank();
    }
    
    function testFailRecoverTokensAsNonOwner() public {
        uint256 amount = 10 ether;
        address recipient = address(777);
        
        // Transfer tokens to adapter
        vm.startPrank(owner);
        token.mint(address(adapter), amount);
        vm.stopPrank