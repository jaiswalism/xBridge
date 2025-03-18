"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  connect: (provider: string) => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "",
  balance: "0",
  connect: () => {},
  disconnect: () => {},
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("0")

  // Mock wallet connection
  const connect = (provider: string) => {
    console.log(`Connecting to ${provider}...`)

    // Generate a random address
    const randomAddress = "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")

    // Set random balance
    const randomBalance = (Math.random() * 10).toFixed(4)

    setIsConnected(true)
    setAddress(randomAddress)
    setBalance(randomBalance)
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress("")
    setBalance("0")
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

