import FloatingSymbols from "@/components/floating-symbols"

const supportedChains = [
  { name: "Ethereum", symbol: "ETH", color: "#627EEA", description: "The original smart contract platform" },
  { name: "Bitcoin", symbol: "BTC", color: "#F7931A", description: "The first and most valuable cryptocurrency" },
  {
    name: "Solana",
    symbol: "SOL",
    color: "#00FFA3",
    description: "High-performance blockchain with fast transactions",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    color: "#E84142",
    description: "Platform for launching decentralized applications",
  },
  { name: "Polygon", symbol: "MATIC", color: "#8247E5", description: "Ethereum scaling solution with low fees" },
  {
    name: "Polkadot",
    symbol: "DOT",
    color: "#E6007A",
    description: "Multi-chain network connecting different blockchains",
  },
  {
    name: "Binance Smart Chain",
    symbol: "BNB",
    color: "#F3BA2F",
    description: "Binance's blockchain for DeFi applications",
  },
  { name: "Cardano", symbol: "ADA", color: "#0033AD", description: "Proof-of-stake blockchain platform" },
  { name: "Cosmos", symbol: "ATOM", color: "#2E3148", description: "Ecosystem of interoperable blockchains" },
  { name: "Arbitrum", symbol: "ARB", color: "#28A0F0", description: "Layer 2 scaling solution for Ethereum" },
  { name: "Optimism", symbol: "OP", color: "#FF0420", description: "Layer 2 scaling solution for Ethereum" },
  {
    name: "Fantom",
    symbol: "FTM",
    color: "#1969FF",
    description: "Fast, high-throughput open-source smart contract platform",
  },
]

export default function ChainsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-6 text-center">Supported Chains</h1>
        <p className="text-white text-center max-w-2xl mx-auto mb-10">
          xBridge supports a wide range of blockchain networks, allowing you to seamlessly move assets across different
          ecosystems.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedChains.map((chain) => (
            <div
              key={chain.name}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#BE3144]/50 transition-colors"
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: chain.color }}
                >
                  {chain.symbol.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{chain.name}</h2>
                  <p className="text-sm text-white/70">{chain.symbol}</p>
                </div>
              </div>
              <p className="text-white/80">{chain.description}</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-white/60">Average Fee: $0.25</span>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

