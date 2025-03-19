"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  connect: (walletName: string) => void
  disconnect: () => void
  wallets: Array<{ id: string, name: string, icon: string }>
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "",
  balance: "0",
  connect: () => {},
  disconnect: () => {},
  wallets: []
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { wallets: solanaWallets, select, connect: solanaConnect, disconnect: solanaDisconnect, publicKey, connected } = useSolanaWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState("0")

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        const balance = await connection.getBalance(publicKey)
        setBalance((balance / 1e9).toFixed(4))
      } else {
        setBalance("0")
      }
    }
    fetchBalance()
  }, [connected, publicKey, connection])

  // Map Solana wallets to your UI structure
  const wallets = solanaWallets.map(wallet => ({
    id: wallet.adapter.name.toLowerCase(),
    name: wallet.adapter.name,
    icon: wallet.adapter.icon
  }))

  const connect = (walletName: string) => {
    const wallet = solanaWallets.find(w => w.adapter.name.toLowerCase() === walletName)
    if (wallet) {
      select(wallet.adapter.name)
      solanaConnect().catch(console.error)
    }
  }

  const disconnect = () => {
    solanaDisconnect().catch(console.error)
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected: connected,
        address: publicKey?.toBase58() || "",
        balance,
        connect,
        disconnect,
        wallets
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}