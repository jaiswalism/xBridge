// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../lib/forge-std/src/Test.sol";
import "../../contracts/TokenRegistry.sol";

contract TokenRegistryTest is Test {
    TokenRegistry public registry;
    
    address public owner = address(1);
    address public user = address(2);
    
    address public tokenA = address(0x1111);
    address public tokenB = address(0x2222);
    address public tokenC = address(0x3333);
    
    function setUp() public {
        vm.startPrank(owner);
        registry = new TokenRegistry();
        vm.stopPrank();
    }
    
    function testAddToken() public {
        vm.startPrank(owner);
        
        registry.addToken(
            tokenA,
            "Token A",
            "TKA",
            18,
            "https://example.com/token-a.png"
        );
        
        vm.stopPrank();
        
        (string memory name, string memory symbol, uint8 decimals, bool active, string memory logoURI) = registry.getTokenInfo(tokenA);
        
        assertEq(name, "Token A");
        assertEq(symbol, "TKA");
        assertEq(decimals, 18);
        assertTrue(active);
        assertEq(logoURI, "https://example.com/token-a.png");
        
        address[] memory tokens = registry.getTokens();
        assertEq(tokens.length, 1);
        assertEq(tokens[0], tokenA);
    }
    
    function testUpdateToken() public {
        vm.startPrank(owner);
        
        registry.addToken(
            tokenA,
            "Token A",
            "TKA",
            18,
            "https://example.com/token-a.png"
        );
        
        registry.updateToken(
            tokenA,
            "Updated Token A",
            "UTKA",
            12,
            "https://example.com/updated-token-a.png",
            true
        );
        
        vm.stopPrank();
        
        (string memory name, string memory symbol, uint8 decimals, bool active, string memory logoURI) = registry.getTokenInfo(tokenA);
        
        assertEq(name, "Updated Token A");
        assertEq(symbol, "UTKA");
        assertEq(decimals, 12);
        assertTrue(active);
        assertEq(logoURI, "https://example.com/updated-token-a.png");
    }
    
    function testSetTokenStatus() public {
        vm.startPrank(owner);
        
        registry.addToken(
            tokenA,
            "Token A",
            "TKA",
            18,
            "https://example.com/token-a.png"
        );
        
        // Deactivate the token
        registry.setTokenStatus(tokenA, false);
        
        vm.stopPrank();
        
        (,,,bool active,) = registry.getTokenInfo(tokenA);
        assertFalse(active);
        
        // Check active tokens list
        address[] memory activeTokens = registry.getActiveTokens();
        assertEq(activeTokens.length, 0);
        
        // Reactivate the token
        vm.startPrank(owner);
        registry.setTokenStatus(tokenA, true);
        vm.stopPrank();
        
        (,,,active,) = registry.getTokenInfo(tokenA);
        assertTrue(active);
        
        // Check active tokens list again
        activeTokens = registry.getActiveTokens();
        assertEq(activeTokens.length, 1);
        assertEq(activeTokens[0], tokenA);
    }
    
    function testGetActiveTokens() public {
        vm.startPrank(owner);
        
        // Add three tokens
        registry.addToken(tokenA, "Token A", "TKA", 18, "");
        registry.addToken(tokenB, "Token B", "TKB", 18, "");
        registry.addToken(tokenC, "Token C", "TKC", 18, "");
        
        // Deactivate one token
        registry.setTokenStatus(tokenB, false);
        
        vm.stopPrank();
        
        // Get all tokens
        address[] memory allTokens = registry.getTokens();
        assertEq(allTokens.length, 3);
        
        // Get active tokens
        address[] memory activeTokens = registry.getActiveTokens();
        assertEq(activeTokens.length, 2);
        
        // Check active tokens are tokenA and tokenC
        bool foundTokenA = false;
        bool foundTokenC = false;
        
        for (uint256 i = 0; i < activeTokens.length; i++) {
            if (activeTokens[i] == tokenA) {
                foundTokenA = true;
            } else if (activeTokens[i] == tokenC) {
                foundTokenC = true;
            }
        }
        
        assertTrue(foundTokenA);
        assertTrue(foundTokenC);
    }
    
    function testChainTokenMapping() public {
        vm.startPrank(owner);
        
        registry.addToken(tokenA, "Token A", "TKA", 18, "");
        
        uint256 destChainId = 137; // Polygon
        address destToken = address(0x4444);
        
        registry.setChainTokenMapping(destChainId, tokenA, destToken);
        
        vm.stopPrank();
        
        address mappedToken = registry.getChainToken(destChainId, tokenA);
        assertEq(mappedToken, destToken);
    }
    
    function testFailAddTokenAsNonOwner() public {
        vm.startPrank(user);
        
        registry.addToken(
            tokenA,
            "Token A",
            "TKA",
            18,
            "https://example.com/token-a.png"
        );
        
        vm.stopPrank();
    }
    
    function testFailUpdateNonExistentToken() public {
        vm.startPrank(owner);
        
        registry.updateToken(
            tokenA,
            "Token A",
            "TKA",
            18,
            "https://example.com/token-a.png",
            true
        );
        
        vm.stopPrank();
    }
    
    function testFailAddTokenTwice() public {
        vm.startPrank(owner);
        
        registry.addToken(tokenA, "Token A", "TKA", 18, "");
        registry.addToken(tokenA, "Token A Again", "TKAA", 18, "");
        
        vm.stopPrank();
    }
    
    function testFailAddInvalidToken() public {
        vm.startPrank(owner);
        
        registry.addToken(address(0), "Zero Token", "ZERO", 18, "");
        
        vm.stopPrank();
    }
}