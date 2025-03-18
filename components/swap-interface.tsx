"use client"

import { useState } from "react"
import { ArrowDown, Shield, Zap, BarChart3 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import TokenSelector from "@/components/token-selector"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function SwapInterface() {
  const { isConnected, balance } = useWallet()
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")

  const handleSwap = () => {
    if (!isConnected) return
    // Swap logic would go here
    console.log("Swapping", fromAmount, fromToken, "to", toToken)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">Swap & Bridge Together</h2>
        <Shield className="w-5 h-5 text-[#BE3144]" />
      </div>

      {isConnected && <div className="text-sm text-[#BE3144] mb-4">Balance: {balance} ETH</div>}

      <Tabs defaultValue="swap" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">From</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
                <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value)
                  // Mock conversion rate
                  setToAmount((Number.parseFloat(e.target.value) * 1850).toString())
                }}
                placeholder="0.0"
                className="w-full text-2xl bg-transparent outline-none"
              />
              <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} isConnected={isConnected} />
            </div>

            {isConnected && (
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>
                  Available: {balance} {fromToken}
                </span>
                <button
                  className="text-[#BE3144] font-medium"
                  onClick={() => {
                    setFromAmount(balance)
                    setToAmount((Number.parseFloat(balance) * 1850).toString())
                  }}
                >
                  MAX
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <div className="bg-[#BE3144]/10 p-2 rounded-full">
              <ArrowDown className="w-5 h-5 text-[#BE3144]" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">To</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
                <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => {
                  setToAmount(e.target.value)
                  // Mock reverse conversion
                  setFromAmount((Number.parseFloat(e.target.value) / 1850).toString())
                }}
                placeholder="0.0"
                className="w-full text-2xl bg-transparent outline-none"
              />
              <TokenSelector selectedToken={toToken} onSelectToken={setToToken} isConnected={isConnected} />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-[#BE3144] mr-2" />
                <span className="text-sm font-medium">Estimated Gas</span>
              </div>
              <span className="text-sm">~$5.24</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 text-[#BE3144] mr-2" />
                <span className="text-sm font-medium">Slippage Tolerance</span>
              </div>
              <div className="flex space-x-1">
                {["0.5", "1.0", "2.0"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`text-xs px-2 py-1 rounded ${
                      slippage === value ? "bg-[#BE3144] text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bridge">
          <div className="h-40 flex items-center justify-center text-gray-500">Bridge functionality coming soon</div>
        </TabsContent>

        <TabsContent value="liquidity">
          <div className="h-40 flex items-center justify-center text-gray-500">Liquidity functionality coming soon</div>
        </TabsContent>
      </Tabs>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwap}
              disabled={!isConnected}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isConnected ? "bg-[#BE3144] hover:bg-[#9e2938]" : "bg-[#BE3144] opacity-50 cursor-not-allowed"
              }`}
            >
              Confirm Swap
            </motion.button>
          </TooltipTrigger>
          {!isConnected && (
            <TooltipContent>
              <p>Connect wallet to swap</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
        <Shield className="w-3 h-3 mr-1" />
        Audited by <span className="font-medium ml-1">CertiK</span>
      </div>
    </motion.div>
  )
}

