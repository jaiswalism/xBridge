"use client"

import { useState } from "react"
import { ArrowDown, Shield, Zap } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import TokenSelector from "@/components/token-selector"
import ChainSelector from "@/components/chain-selector"
import { chains, Chain } from "@/components/available-chains-tokens"

export default function SwapInterface() {
  const { isConnected, balance, address } = useWallet()
  const [fromChain, setFromChain] = useState<Chain>(chains[0])
  const [toChain, setToChain] = useState<Chain>(chains[1])
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("ETH")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  const handleSwap = () => {
    if (!isConnected) return
    console.log("Swapping", fromAmount, fromToken, "from", fromChain.id, "to", toChain.id)
  }

  const calculateToAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return ""
    return (Number.parseFloat(amount) * 0.9995).toFixed(7)
  }

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromAmount(value)
    setToAmount(calculateToAmount(value))
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ""
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  // Swap the from and to chains and tokens
  const handleSwapDirection = () => {
    const tempChain = fromChain
    setFromChain(toChain)
    setToChain(tempChain)

    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)

    const tempAmount = fromAmount
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-4 z-10">
      {/* From Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">From</span>
        </div>
        
        <ChainSelector 
          selectedChain={fromChain} 
          onSelectChain={setFromChain} 
          zIndex={30}
        />
        
        <div className="flex justify-between items-end mb-1 mt-3">
          <input
            type="text"
            value={fromAmount}
            onChange={handleFromAmountChange}
            placeholder="0.001"
            className="w-3/5 text-3xl bg-transparent outline-none"
          />
          <TokenSelector
            selectedToken={fromToken}
            onSelectToken={setFromToken}
            isConnected={isConnected}
          />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">${fromAmount ? (Number(fromAmount) * 1980).toFixed(2) : "1.98"}</span>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">Balance: {balance || "0.00202"}</span>
            <button
              onClick={() => {
                if (balance) {
                  setFromAmount(balance)
                  setToAmount(calculateToAmount(balance))
                }
              }}
              className="text-[#BE3144] font-medium"
            >
              MAX
            </button>
          </div>
        </div>
      </div>
      
      {/* Arrow */}
      <div className="flex justify-center -my-2 relative z-20">
        <button 
          onClick={handleSwapDirection}
          className="bg-white rounded-full p-2 shadow hover:shadow-md transition-shadow"
        >
          <ArrowDown size={20} className="text-gray-400" />
        </button>
      </div>
      
      {/* To Section */}
      <div className="mb-4 mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">To</span>
          {/* <div className="flex items-center space-x-1">
            <img src="WalletIcon" alt="Wallet" className="w-5 h-5" />
            <span className="text-sm text-gray-500">{formatAddress(address)}</span>
          </div> */}
        </div>
        
        <ChainSelector 
          selectedChain={toChain} 
          onSelectChain={setToChain} 
          zIndex={10}
        />
        
        <div className="flex justify-between items-end mb-1 mt-3">
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0009995"
            className="w-3/5 text-3xl bg-transparent outline-none"
          />
          <TokenSelector
            selectedToken={toToken}
            onSelectToken={setToToken}
            isConnected={isConnected}
          />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">${toAmount ? (Number(toAmount) * 1980).toFixed(2) : "1.98"} (-0.04%)</span>
          <span className="text-gray-500">Balance: 0.00009</span>
        </div>
      </div>
      
      {/* Exchange Rate */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4 mt-2">
        <span>1 ETH = 0.99958 ETH</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Zap size={14} className="mr-1 text-green-500" />
            <span>~ 2s</span>
          </div>
          <div className="flex items-center">
            <Shield size={14} className="mr-1 text-blue-500" />
            <span>&lt; $0.01</span>
          </div>
        </div>
      </div>
      
      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className="w-full bg-[#BE3144] text-white py-3 rounded-lg font-medium hover:bg-[#c33e50] transition-colors"
      >
        Swap
      </button>
    </div>
  )
}
