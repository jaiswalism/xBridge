"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

// Blockchain symbols/logos
const symbols = [
  { id: 1, symbol: "₿", name: "Bitcoin", color: "#F7931A" },
  { id: 2, symbol: "Ξ", name: "Ethereum", color: "#627EEA" },
  { id: 3, symbol: "◎", name: "Solana", color: "#00FFA3" },
  { id: 4, symbol: "Ⓟ", name: "Polkadot", color: "#E6007A" },
  { id: 5, symbol: "Ⓐ", name: "Avalanche", color: "#E84142" },
  { id: 6, symbol: "₮", name: "USDT", color: "#26A17B" },
  { id: 7, symbol: "Ⓢ", name: "Sapolia", color: "#FF5A1F" },
  { id: 8, symbol: "Ⓜ", name: "Matic", color: "#8247E5" },
  { id: 9, symbol: "$", name: "USDC", color: "#2775CA" },
  { id: 10, symbol: "Ⓓ", name: "Dogecoin", color: "#C2A633" },
  { id: 11, symbol: "Ⓛ", name: "Litecoin", color: "#345D9D" },
  { id: 12, symbol: "Ⓑ", name: "Binance", color: "#F3BA2F" },
]

interface FloatingSymbol {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  symbol: string
  color: string
  name: string
}

export default function FloatingSymbols() {
  const [floatingSymbols, setFloatingSymbols] = useState<FloatingSymbol[]>([])

  useEffect(() => {
    // Create floating symbols based on viewport size
    const generateSymbols = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const symbolCount = windowWidth < 768 ? 8 : 15

      const newSymbols: FloatingSymbol[] = []

      for (let i = 0; i < symbolCount; i++) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        newSymbols.push({
          id: i,
          x: Math.random() * windowWidth,
          y: Math.random() * windowHeight,
          size: Math.random() * 20 + 20, // 20-40px
          duration: Math.random() * 100 + 100, // 100-200s
          delay: Math.random() * 2,
          symbol: randomSymbol.symbol,
          color: randomSymbol.color,
          name: randomSymbol.name,
        })
      }

      setFloatingSymbols(newSymbols)
    }

    generateSymbols()

    // Regenerate on window resize
    window.addEventListener("resize", generateSymbols)
    return () => window.removeEventListener("resize", generateSymbols)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {floatingSymbols.map((item) => (
        <motion.div
          key={item.id}
          className="absolute flex items-center justify-center font-bold opacity-10 select-none"
          initial={{
            x: item.x,
            y: item.y,
            scale: 0.5,
            opacity: 0,
          }}
          animate={{
            x: [item.x, item.x + 100, item.x - 100, item.x],
            y: [item.y, item.y - 100, item.y + 100, item.y],
            opacity: [0, 0.15, 0.1, 0],
            scale: [0.5, 1, 0.8, 0.5],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
          }}
          style={{
            fontSize: `${item.size}px`,
            color: item.color,
          }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  )
}

