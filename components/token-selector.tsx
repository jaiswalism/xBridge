"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useAccount, useBalance } from "wagmi"

// Fallback prices in case API fails
const fallbackPrices = {
  "ethereum": 2050.20,
  "usd-coin": 1.00,
  "tether": 1.00,
  "dai": 1.00,
  "wrapped-bitcoin": 85050.30,
  "matic-network": 0.58,
  "avalanche-2": 35.75
}

const priceCache = new Map<string, { price: number, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

const tokens = [
  { symbol: "ETH", name: "Ethereum", chainIcon: "🔵", coingeckoId: "ethereum", address: undefined },
  { symbol: "USDC", name: "USD Coin", chainIcon: "🟢", coingeckoId: "usd-coin", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
  { symbol: "USDT", name: "Tether", chainIcon: "🟢", coingeckoId: "tether", address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
  { symbol: "DAI", name: "Dai", chainIcon: "🟡", coingeckoId: "dai", address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", chainIcon: "🟠", coingeckoId: "wrapped-bitcoin", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
  { symbol: "MATIC", name: "Polygon", chainIcon: "🟣", coingeckoId: "matic-network", address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" },
  { symbol: "AVAX", name: "Avalanche", chainIcon: "🔴", coingeckoId: "avalanche-2", address: "0x85f138bfee4ef8e540890cfb48f620571d67eda3" },
]

interface TokenSelectorProps {
  selectedToken: string
  onSelectToken: (token: string) => void
  isConnected: boolean
}

export default function TokenSelector({ selectedToken, onSelectToken, isConnected }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { address } = useAccount()

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

interface TokenItemProps {
  token: {
    symbol: string
    name: string
    chainIcon: string
    coingeckoId: string
    address?: string
  }
  address?: `0x${string}`
  isConnected: boolean
  onSelect: () => void
}

function TokenItem({ token, address, isConnected, onSelect }: TokenItemProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { data: balanceData } = useBalance({
    address: address,
    token: token.address as `0x${string}` | undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  const fetchPriceWithBackoff = async (retryCount = 0, maxRetries = 3) => {
    try {
      const cachedData = priceCache.get(token.coingeckoId);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        setPrice(cachedData.price);
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token.coingeckoId}&vs_currencies=usd`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        console.log(`Rate limited. Retry after ${retryAfter} seconds`);
        
        if (retryCount < maxRetries) {
          const backoffTime = Math.max(retryAfter * 1000, Math.pow(2, retryCount) * 1000);
          console.log(`Retrying in ${backoffTime/1000} seconds (attempt ${retryCount + 1}/${maxRetries})`);
          
          setTimeout(() => {
            fetchPriceWithBackoff(retryCount + 1, maxRetries);
          }, backoffTime);
          return;
        } else {
          const fallbackPrice = fallbackPrices[token.coingeckoId as keyof typeof fallbackPrices] || null;
          setPrice(fallbackPrice);
          setIsLoading(false);
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedPrice = data[token.coingeckoId]?.usd || null;

      if (fetchedPrice !== null) {
        priceCache.set(token.coingeckoId, {
          price: fetchedPrice,
          timestamp: Date.now()
        });
      }
      
      setPrice(fetchedPrice);
    } catch (error) {
      console.error(`Error fetching price for ${token.symbol}:`, error);

      const fallbackPrice = fallbackPrices[token.coingeckoId as keyof typeof fallbackPrices] || null;
      setPrice(fallbackPrice);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchPriceWithBackoff();
    
    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchPriceWithBackoff();
      }
    }, 300000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [token.coingeckoId, token.symbol]);

  const formattedBalance = balanceData?.formatted 
    ? Number(balanceData.formatted).toFixed(
        token.symbol === "ETH" || token.symbol === "WBTC" ? 4 : 2
      )
    : "0.00";
    
  const balanceValue = price && balanceData?.formatted 
    ? (Number(balanceData.formatted) * price).toFixed(2) 
    : "0.00";

  return (
    <DropdownMenuItem
      onClick={onSelect}
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
        {isConnected && (
          <>
            <div className="text-sm font-medium">{formattedBalance}</div>
            {!isLoading && (
              <div className="text-xs text-gray-500">
                ${price?.toFixed(2) || "0.00"}
              </div>
            )}
            {!isLoading && Number(formattedBalance) > 0 && (
              <div className="text-xs text-[#BE3144]">${balanceValue}</div>
            )}
          </>
        )}
        {!isConnected && !isLoading && (
          <div className="text-xs text-gray-500">
            ${price?.toFixed(2) || "0.00"}
          </div>
        )}
      </div>
    </DropdownMenuItem>
  )
}
