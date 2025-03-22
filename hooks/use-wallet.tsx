"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';

interface WalletContextType {
  isConnected: boolean;
  address: string;
  balance: string;
  balances: Record<string, string>; // Add a mapping of token addresses to balances
  connect: () => void;
  disconnect: () => void;
  updateTokenBalance: (tokenAddress: string, balance: string) => void; // Add function to update token balance
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "",
  balance: "0",
  balances: {},
  connect: () => {},
  disconnect: () => {},
  updateTokenBalance: () => {}
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    query: { enabled: !!address }
  });
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  
  // Native token balance (ETH)
  const balance = balanceData ? formatEther(balanceData.value).substring(0, 6) : "0";
  
  // Add a state to track all token balances
  const [balances, setBalances] = useState<Record<string, string>>({});
  
  // Set the native token balance whenever it changes
  useEffect(() => {
    if (balanceData && address) {
      // Format the balance with 6 decimal places
      const formattedBalance = formatEther(balanceData.value);
      
      // Store native token balance with the zero address as key
      setBalances(prev => ({
        ...prev,
        "0x0000000000000000000000000000000000000000": formattedBalance
      }));
      
      console.log("Updated native token balance:", formattedBalance);
    }
  }, [balanceData, address]);
  
  // Function to update balance for a specific token
  const updateTokenBalance = useCallback((tokenAddress: string, tokenBalance: string) => {
    setBalances(prev => ({
      ...prev,
      [tokenAddress]: tokenBalance
    }));
    
    console.log(`Updated balance for token ${tokenAddress}:`, tokenBalance);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || "",
        balance, // Keep the original balance property for backward compatibility
        balances, // Add the new balances object
        connect: openConnectModal || (() => {}),
        disconnect,
        updateTokenBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}