import FloatingSymbols from "@/components/floating-symbols"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-6">About xBridge</h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <p className="mb-4">
            xBridge is a cutting-edge platform designed to simplify cross-chain transactions and token swaps. Our
            mission is to make blockchain interoperability accessible to everyone, regardless of their technical
            expertise.
          </p>
          <p className="mb-4">
            Founded in 2023, xBridge has quickly become a trusted name in the DeFi space, offering secure, fast, and
            cost-effective solutions for moving assets across different blockchain networks.
          </p>
          <p className="mb-4">
            Our platform supports a wide range of popular blockchains, including Ethereum, Solana, Avalanche, Polkadot,
            and many more, allowing users to seamlessly bridge their assets without the complexity traditionally
            associated with cross-chain operations.
          </p>
          <h2 className="text-2xl font-bold text-[#BE3144] mt-8 mb-4">Our Vision</h2>
          <p>
            We envision a future where blockchain networks are seamlessly connected, enabling a truly interoperable
            decentralized ecosystem. xBridge is committed to building the infrastructure that will make this vision a
            reality.
          </p>
        </div>
      </div>
    </main>
  )
}

