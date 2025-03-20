"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { formatEther } from 'viem'

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "",
  balance: "0",
  connect: () => {},
  disconnect: () => {}
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({
    address: address,
    query: { enabled: !!address }
  })
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  
  const balance = balanceData ? formatEther(balanceData.value).substring(0, 6) : "0"

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || "",
        balance,
        connect: openConnectModal || (() => {}),
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
