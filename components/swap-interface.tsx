"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import TokenSelector from "@/components/token-selector";
import ChainSelector from "@/components/chain-selector";
import { chains } from "@/shared/constants/chains";
import debounce from "lodash.debounce";
import { parseUnits, formatUnits } from "ethers";

export default function SwapInterface() {
  const { isConnected, address, balances, updateTokenBalance } = useWallet();
  const [fromChain, setFromChain] = useState<any>(chains[0]);
  const [toChain, setToChain] = useState<any>(chains[1]);
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [transactionFee, setTransactionFee] = useState<number | null>(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayBalance, setDisplayBalance] = useState<string>("0.000000");

  useEffect(() => {
    if (!fromChain || !toChain) return;

    async function fetchTokens() {
      try {
        // Use the API route to avoid CORS issues
        const response = await fetch("/api/lifi/tokens");
        if (!response.ok) throw new Error("Failed to fetch tokens");
        const data = await response.json();

        const fromTokens = data.tokens[fromChain.id] || [];
        const toTokens = data.tokens[toChain.id] || [];

        setFromToken(fromTokens.find((token: any) => token.symbol === "ETH") || fromTokens[0]);
        setToToken(toTokens.find((token: any) => token.symbol === "ETH") || toTokens[0]);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError("Failed to load tokens. Please try again later.");
      }
    }

    fetchTokens();
  }, [fromChain, toChain]);

  // Update displayed balance whenever fromToken or balances change
  useEffect(() => {
    if (fromToken && balances) {
      console.log("All balances:", balances);
      console.log("From token address:", fromToken.address);
      
      // Get the balance for the selected token
      const tokenBalance = balances[fromToken.address] || "0";
      console.log("Raw token balance:", tokenBalance);
      
      try {
        // Convert to number and format with 6 decimal places
        const balanceNum = parseFloat(tokenBalance);
        const formattedBalance = balanceNum.toFixed(6);
        setDisplayBalance(formattedBalance);
        
        console.log("Formatted display balance:", formattedBalance);
      } catch (error) {
        console.error("Error formatting balance:", error);
        setDisplayBalance("0.000000");
      }
    } else {
      setDisplayBalance("0.000000");
    }
  }, [fromToken, balances]);

  // Debounced fetch function
  const fetchSwapDetails = useCallback(
    debounce(async () => {
      if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0) {
        setToAmount("");
        setExchangeRate(null);
        setTransactionFee(null);
        return;
      }
      
      if (!address) {
        console.error("Wallet not connected");
        setError("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Convert amount to Wei using the token's decimals
        const amountInWei = parseUnits(fromAmount, fromToken.decimals).toString();

        // Log parameters for debugging
        console.log("Quote request parameters:", {
          fromChain: fromChain.id,
          toChain: toChain.id,
          fromToken: fromToken.address,
          toToken: toToken.address,
          fromAmount: amountInWei,
          fromAddress: address
        });

        const response = await fetch(
          `/api/lifi/quote?fromChain=${fromChain.id}&toChain=${toChain.id}&fromToken=${fromToken.address}&toToken=${toToken.address}&fromAmount=${amountInWei}&fromAddress=${address}`
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error("Quote API error response:", errorData);
          } catch (e) {
            console.error("Could not parse error response");
          }
          throw new Error(errorData?.error || errorData?.detail || `Failed to fetch quote: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Quote response:", data);

        // Process the response data
        if (data.estimate) {
          // Properly format the received amount using the token's decimals
          const formattedToAmount = data.estimate.toAmount 
            ? formatUnits(data.estimate.toAmount, toToken.decimals)
            : "0";
          setToAmount(parseFloat(formattedToAmount).toFixed(6));
          
          // Calculate exchange rate properly
          if (data.estimate.toAmount && fromAmount) {
            const fromAmountFloat = parseFloat(fromAmount);
            const toAmountFloat = parseFloat(formattedToAmount);
            const rate = toAmountFloat / fromAmountFloat;
            setExchangeRate(rate);
          } else {
            setExchangeRate(null);
          }
          
          // Extract fee information if available
          setTransactionFee(data.estimate.feeCosts?.[0]?.amountUSD 
            ? parseFloat(data.estimate.feeCosts[0].amountUSD) 
            : null);
        } else if (data.toAmount) {
          // Fallback for older API response format
          const formattedToAmount = formatUnits(data.toAmount, toToken.decimals);
          setToAmount(parseFloat(formattedToAmount).toFixed(6));
          
          if (data.toAmount && fromAmount) {
            const fromAmountFloat = parseFloat(fromAmount);
            const toAmountFloat = parseFloat(formattedToAmount);
            const rate = toAmountFloat / fromAmountFloat;
            setExchangeRate(rate);
          } else {
            setExchangeRate(null);
          }
          
          setTransactionFee(data.feeCosts?.[0]?.amountUSD 
            ? parseFloat(data.feeCosts[0].amountUSD) 
            : null);
        } else {
          throw new Error("Unexpected response format from quote API");
        }
      } catch (error) {
        console.error("Error fetching swap details:", error);
        setError(error instanceof Error ? error.message : "Failed to get swap quote. Please try again.");
        setToAmount("");
        setExchangeRate(null);
        setTransactionFee(null);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [fromChain, toChain, fromToken, toToken, fromAmount, address]
  );

  useEffect(() => {
    fetchSwapDetails();
    
    // Clear error when input changes
    if (error) setError(null);
  }, [fromAmount, fetchSwapDetails, error]);

  // Validate balance with proper comparison - FIXED IMPLEMENTATION
  useEffect(() => {
    if (!fromToken || !balances || !fromAmount) {
      setInsufficientBalance(false);
      return;
    }

    const tokenAddress = fromToken.address;
    const tokenBalance = balances[tokenAddress] || "0";
    
    // Log values for debugging
    console.log("Checking balance for:", fromToken.symbol);
    console.log("Token balance string:", tokenBalance);
    
    // Convert balance and input to numbers for accurate comparison
    const userBalance = parseFloat(tokenBalance);
    const inputAmount = parseFloat(fromAmount);
    
    // Apply a tiny gas buffer for native tokens (ETH, BNB, etc.)
    const isNativeToken = tokenAddress === "0x0000000000000000000000000000000000000000";
    // Even smaller buffer - 0.00001 ETH (approximately $0.02)
    const gasBuffer = isNativeToken ? 0.00001 : 0;
    const effectiveBalance = Math.max(0, userBalance - gasBuffer);
    
    console.log({
      userBalance,
      inputAmount,
      gasBuffer,
      effectiveBalance,
      isInsufficient: inputAmount > effectiveBalance
    });
    
    setInsufficientBalance(inputAmount > effectiveBalance);
  }, [fromAmount, fromToken, balances]);

  const handleSwap = () => {
    if (!isConnected || insufficientBalance || isLoading) return;
    // Implement the actual swap functionality here
    console.log("Swapping", fromAmount, fromToken?.symbol, "from", fromChain.name, "to", toChain.name);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  // Helper function to format exchange rate display
  const formatExchangeRate = (rate: number | null) => {
    if (rate === null) return "";
    if (rate > 1000000) return "≈ High conversion rate";
    return rate.toFixed(6);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-4 z-10">
      {/* From Section */}
      <div className="mb-4">
        <ChainSelector selectedChain={fromChain} onSelectChain={setFromChain} zIndex={30} />
        <div className="flex justify-between items-end mb-1 mt-3">
          <input
            type="text"
            value={fromAmount}
            onChange={handleAmountChange}
            placeholder="0.001"
            className={`w-3/5 text-3xl bg-transparent outline-none ${insufficientBalance ? "text-red-500" : ""}`}
          />
          <TokenSelector
            selectedToken={fromToken}
            onSelectToken={setFromToken}
            selectedChain={fromChain}
            isConnected={isConnected}
            updateBalance={updateTokenBalance} 
          />
        </div>
        {insufficientBalance && <p className="text-red-500 text-sm mt-1">Insufficient balance</p>}
        {fromToken && (
          <p className="text-sm text-gray-500">
            Available: {displayBalance} {fromToken.symbol}
          </p>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-20">
        <button
          onClick={() => {
            setFromChain(toChain);
            setToChain(fromChain);
            setFromToken(toToken);
            setToToken(fromToken);
            setFromAmount(toAmount);
            setToAmount(fromAmount);
          }}
          className="bg-white rounded-full p-2 shadow hover:shadow-md transition-shadow"
        >
          <ArrowDown size={20} className="text-gray-400" />
        </button>
      </div>

      {/* To Section */}
      <div className="mb-4 mt-2">
        <ChainSelector selectedChain={toChain} onSelectChain={setToChain} zIndex={10} />
        <div className="flex justify-between items-end mb-1 mt-3">
          <input 
            type="text" 
            value={isLoading ? "Loading..." : toAmount} 
            readOnly 
            placeholder="0.000000" 
            className="w-3/5 text-3xl bg-transparent outline-none" 
          />
          <TokenSelector 
            selectedToken={toToken} 
            onSelectToken={setToToken} 
            selectedChain={toChain} 
            isConnected={isConnected}
            updateBalance={updateTokenBalance}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {/* Live Calculation Details */}
      <div className="text-sm text-gray-500 mb-4">
        {fromAmount && fromToken && (
          <p>
            You entered: <span className="font-medium">{fromAmount} {fromToken?.symbol}</span>
          </p>
        )}
        {exchangeRate && fromToken && toToken && (
          <p>
            1 {fromToken?.symbol} ≈ {formatExchangeRate(exchangeRate)} {toToken?.symbol}
          </p>
        )}
        {transactionFee !== null && (
          <p>
            Estimated Fee: <span className="font-medium">${transactionFee.toFixed(4)}</span>
          </p>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          !isConnected || insufficientBalance || isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#BE3144] text-white hover:bg-[#c33e50]"
        }`}
        disabled={!isConnected || insufficientBalance || isLoading}
      >
        {isLoading ? "Loading..." : insufficientBalance ? "Insufficient Balance" : "Swap"}
      </button>
    </div>
  );
}