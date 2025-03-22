"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useAccount, useBalance } from "wagmi"
import { tokens } from "@/components/available-chains-tokens"
import Image from "next/image"

const fallbackPrices: Record<string, number> = {
  "ETH": 2050.20,
  "USDC": 1.00,
  "USDT": 1.00,
  "DAI": 1.00,
  "WBTC": 85050.30,
  "MATIC": 0.58,
  "AVAX": 35.75,
}

const priceCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Use CMC for token icons
const getTokenIcon = (token: any) => {
  return token.cmcId ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.cmcId}.png` : "/fallback-icon.png";
};

interface TokenSelectorProps {
  selectedToken: string
  onSelectToken: (token: string) => void
  isConnected: boolean
}

export default function TokenSelector({ selectedToken, onSelectToken, isConnected }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { address } = useAccount()
  
  const selectedTokenObj = tokens.find(t => t.symbol === selectedToken) || tokens[0];

  return (
    <div className="relative z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg">
            <img 
              src={getTokenIcon(selectedTokenObj)} 
              alt={selectedToken} 
              className="w-6 h-6" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fallback-icon.png";
              }}
            />
            <span className="font-medium">{selectedToken}</span>
            <ChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] p-2 z-50">
          <input
            type="text"
            placeholder="Search tokens"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-red-500 mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {tokens
              .filter(token =>
                token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(token => (
                <TokenItem
                  key={token.symbol}
                  token={token}
                  address={address}
                  isConnected={isConnected}
                  onSelect={() => {
                    onSelectToken(token.symbol)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                />
              ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function TokenItem({ token, address, isConnected, onSelect }: any) {
  const [price, setPrice] = useState<number | null>(null)
  const { data: balanceData } = useBalance({ address, token: token.address })

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (priceCache.has(token.symbol) && (Date.now() - priceCache.get(token.symbol).timestamp) < CACHE_DURATION) {
          setPrice(priceCache.get(token.symbol).price);
          return;
        }

        const response = await fetch(`/api/crypto-prices?symbol=${token.symbol}`)
        if (!response.ok) throw new Error("Failed to fetch price")
        const data = await response.json()
        const fetchedPrice = data.data?.[token.symbol]?.quote?.USD?.price || fallbackPrices[token.symbol]
        priceCache.set(token.symbol, { price: fetchedPrice, timestamp: Date.now() })
        setPrice(fetchedPrice)
      } catch (error) {
        console.error("Price fetch error:", error)
        setPrice(fallbackPrices[token.symbol])
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [token.symbol])

  const balanceInUSD = price && balanceData?.formatted
    ? (Number(balanceData.formatted) * price).toFixed(2)
    : "0.00";

  return (
    <div 
      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center space-x-2">
        <img 
          src={getTokenIcon(token)} 
          alt={token.symbol} 
          className="w-6 h-6" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback-icon.png";
          }}
        />
        <div>
          <div className="font-medium">{token.symbol}</div>
          <div className="text-xs text-gray-500">{token.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm">${price?.toFixed(2) || "0.00"}</div>
        {isConnected && (
          <div className="text-xs text-gray-500">${balanceInUSD}</div>
        )}
      </div>
    </div>
  )
}
