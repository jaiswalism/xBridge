"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

const tokens = [
  { symbol: "ETH", name: "Ethereum", balance: "1.25", chainIcon: "🔵", price: "$3,450.20" },
  { symbol: "USDC", name: "USD Coin", balance: "1250.00", chainIcon: "🟢", price: "$1.00" },
  { symbol: "USDT", name: "Tether", balance: "500.00", chainIcon: "🟢", price: "$1.00" },
  { symbol: "DAI", name: "Dai", balance: "750.00", chainIcon: "🟡", price: "$1.00" },
  { symbol: "BTC", name: "Bitcoin", balance: "0.05", chainIcon: "🟠", price: "$65,750.30" },
  { symbol: "MATIC", name: "Polygon", balance: "2500.00", chainIcon: "🟣", price: "$0.58" },
  { symbol: "SOL", name: "Solana", balance: "35.00", chainIcon: "🟣", price: "$145.20" },
  { symbol: "AVAX", name: "Avalanche", balance: "100.00", chainIcon: "🔴", price: "$35.75" },
]

interface TokenSelectorProps {
  selectedToken: string
  onSelectToken: (token: string) => void
  isConnected: boolean
}

export default function TokenSelector({ selectedToken, onSelectToken, isConnected }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken)

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
        >
          <div className="w-6 h-6 rounded-full bg-[#BE3144]/20 flex items-center justify-center mr-2">
            <span>{selectedTokenData?.chainIcon || "🔵"}</span>
          </div>
          <span>{selectedToken}</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BE3144]/50"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <DropdownMenuItem
                key={token.symbol}
                onClick={() => {
                  onSelectToken(token.symbol)
                  setIsOpen(false)
                  setSearchQuery("")
                }}
                className="flex justify-between items-center py-2 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#BE3144]/10 flex items-center justify-center mr-2">
                    <span>{token.chainIcon}</span>
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  {isConnected && <div className="text-sm font-medium">{token.balance}</div>}
                  <div className="text-xs text-gray-500">{token.price}</div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-2 text-center text-sm text-gray-500">No tokens found</div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center text-[#BE3144] cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          <span>View all tokens</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

